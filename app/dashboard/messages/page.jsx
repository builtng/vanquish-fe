"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PageGuard from "@/components/PageGuard";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/lib/toast";
import apiService from "@/lib/api";
import {
  Search,
  Plus,
  Send,
  User,
  MoreHorizontal,
  Paperclip,
  ArrowLeft,
  X,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Download,
  RefreshCw,
} from "lucide-react";
import { getEcho } from "@/lib/echo";

export default function DashboardChatPage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { id, type, name }
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, message, senderName }
  
  const scrollRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const moreMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const sidebarSearchRef = useRef(null);
  
  const [attachment, setAttachment] = useState(null); // { file, name, size }

  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", 
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", 
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", 
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", 
    "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", 
    "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", 
    "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", 
    "🤖", "🎃", "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", 
    "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", 
    "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", 
    "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", 
    "👣", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄"
  ];

  useEffect(() => {
    if (authUser) {
      loadConversations();
      loadAvailableUsers();
    }

    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // ────── EBHO (REAL-TIME) ──────
    const echo = getEcho();
    if (echo && authUser?.id) {
      const channel = echo.private(`messages.${authUser.id}`);
      channel.listen(".message.sent", (e) => {
        const newMsg = e.message;
        // Add to thread if it's from the active peer
        setMessages((prev) => {
          // Check if it already exists to avoid duplicates
          if (prev.find(m => m.id === newMsg.id)) return prev;
          
          // Only add if it belongs to current active chat
          // Check both peer_id and peer_type
          // We need access to activeChat, but this effect runs once.
          // Better to use a separate effect for Echo.
          return prev;
        });
        loadConversations();
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (echo && authUser?.id) {
        echo.leave(`messages.${authUser.id}`);
      }
    };
  }, [authUser]);

  // Separate effect for Echo listener to handle activeChat correctly
  useEffect(() => {
    const echo = getEcho();
    if (!echo || !authUser?.id || !activeChat) return;

    // ────── STAFF GROUP LISTENER ──────
    let staffGroupChannel = null;
    if (authUser.role !== 'counsellor') {
      staffGroupChannel = echo.private(`messages.staff_group`);
      staffGroupChannel.listen(".message.sent", (e) => {
        const newMsg = e.message;
        const isForThisChat = activeChat && activeChat.type === 'tc' && (
          String(newMsg.to_tc_id) === String(activeChat.id) || 
          String(newMsg.fromUser?.training_counsellor_id) === String(activeChat.id)
        );

        if (isForThisChat) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
        loadConversations();
      });
    }

    const channel = echo.private(`messages.${authUser.id}`);
    channel.listen(".message.sent", (e) => {
      const newMsg = e.message;
      
      // Determine if this message is from the currently active peer
      let isFromActivePeer = false;
      if (activeChat.type === 'tc') {
        // Handled by staffGroupChannel or this one if it's direct.
        // Actually, for TC chat, staffGroupChannel is more reliable for "group" feel.
        isFromActivePeer = String(newMsg.to_tc_id) === String(activeChat.id) || 
                           String(newMsg.fromUser?.training_counsellor_id) === String(activeChat.id);
      } else {
        // Standard user-to-user check
        isFromActivePeer = String(newMsg.from_user_id) === String(activeChat.id) || 
                           (String(newMsg.to_user_id) === String(activeChat.id) && String(newMsg.from_user_id) === String(authUser.id));
      }

      if (isFromActivePeer) {
         setMessages(prev => {
           if (prev.find(m => m.id === newMsg.id)) return prev;
           return [...prev, newMsg];
         });
         // Mark as read and refresh sidebar count
         apiService.markMessageAsRead(newMsg.id)
          .then(() => window.dispatchEvent(new CustomEvent("refresh-sidebar-data")))
          .catch(() => {});
      }
      loadConversations();
    });

    return () => {
      if (staffGroupChannel) echo.leave(`messages.staff_group`);
    };
  }, [authUser, activeChat]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id, activeChat.type);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await apiService.request("/messages/conversations");
      // Hardening: check if res is an array or has a data property (standardizing across API versions)
      setConversations(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error(err);
      showError("Failed to load conversations. Please check if your database is updated.");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const res = await apiService.getUserList();
      const users = Array.isArray(res) ? res : res.data || [];
      // Use authUser?.id to be safe
      setAvailableUsers(users.filter(u => u.id !== authUser?.id));
    } catch (err) {}
  };

  const loadMessages = async (peerId, peerType) => {
    try {
      setMessagesLoading(true);
      const res = await apiService.getMessages({ peer_id: peerId, peer_type: peerType });
      // Chat should be chronologically ascending: oldest at top, newest at bottom
      const msgs = (res.data || []).reverse();
      setMessages(msgs);

      // Check for unread messages in the thread and mark them as read
      // We check for any unread message addressed to us
      const unreadCount = msgs.filter(m => !m.is_read && String(m.to_user_id) === String(authUser?.id)).length;
      
      if (unreadCount > 0) {
        apiService.markConversationAsRead(peerType, peerId)
          .then(() => {
            window.dispatchEvent(new CustomEvent("refresh-sidebar-data"));
            // Update local state to show items as read immediately
            setMessages(prev => prev.map(m => (!m.is_read && String(m.to_user_id) === String(authUser?.id)) ? { ...m, is_read: true } : m));
            // Update conversation list item to clear its unread status
            setConversations(prev => prev.map(conv => 
              (conv.peer_id === peerId && conv.peer_type === peerType) 
              ? { ...conv, unread_for_user: false, last_message: { ...conv.last_message, is_read: true } } 
              : conv
            ));
          })
          .catch(() => {});
      }
    } catch (err) {
      showError("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeChat) return;

    try {
      const body = new FormData();
      body.append("message", newMessage);
      body.append("subject", "Chat Message");
      if (attachment?.file) {
        body.append("attachment", attachment.file);
      }

      if (replyingTo) {
        body.append("reply_to_id", replyingTo.id);
      }

      // Determine which endpoint to call based on peer type
      if (activeChat.type === "tc") {
        body.append("tc_ids[]", activeChat.id);
        await apiService.sendMessageToCounsellor(body);
      } else {
        body.append("to_user_ids[]", activeChat.id);
        await apiService.sendMessageToStaff(body);
      }

      setNewMessage(""); // Clear text
      setAttachment(null); // Clear attachment
      setReplyingTo(null); // Clear reply state

      // Refresh messages
      loadMessages(activeChat.id, activeChat.type);
      loadConversations();
    } catch (err) {
      showError("Failed to send");
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeChat) return;
    if (!confirm(`Are you sure you want to permanently delete your conversation with ${activeChat.name}? This action cannot be undone.`)) return;

    try {
      await apiService.deleteConversation(activeChat.type, activeChat.id);
      success("Conversation deleted successfully");
      setIsMoreMenuOpen(false);
      setActiveChat(null);
      loadConversations();
    } catch (err) {
      showError("Failed to delete conversation");
    }
  };

  const handleViewProfile = () => {
    if (!activeChat) return;
    
    if (activeChat.type === 'tc') {
      // For TCs, navigate to their detail page using UUID
      router.push(`/dashboard/training-counsellors/details/${activeChat.peer_uuid || activeChat.id}`);
    } else {
      // For general users, go to the user management page
      router.push(`/dashboard/users`);
    }
    setIsMoreMenuOpen(false);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError("File is too large (max 10MB)");
      return;
    }

    setAttachment({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    });
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.peer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const filteredUsers = useMemo(() => {
    return availableUsers.filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableUsers, searchQuery]);

  // If auth is loading or user is not found, let PageGuard handle it.
  // We return the PageGuard/Layout structure but empty to avoid accessing authUser.id.
  if (authLoading || !authUser) {
    return (
      <PageGuard menuId="messages">
        <DashboardLayout>
           <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background">
             <RefreshCw className="w-6 h-6 animate-spin text-accent" />
           </div>
        </DashboardLayout>
      </PageGuard>
    );
  }

  return (
    <PageGuard menuId="messages">
      <DashboardLayout>
        <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground transition-colors duration-300">
          
          {/* ────── SIDEBAR: Chats ────── */}
          <div 
            className={`w-full md:w-80 shrink-0 border-r border-border flex-col bg-background dark:bg-card/10 ${
              activeChat ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chats</h2>
                <button 
                  onClick={() => setShowSearchUsers(!showSearchUsers)}
                  className="p-2 hover:bg-accent/10 rounded-full text-accent transition-all"
                >
                  {showSearchUsers ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={sidebarSearchRef}
                  type="text"
                  placeholder={showSearchUsers ? "Find people..." : "Search chats..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-input border-input-border border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-accent focus:border-accent transition-all text-foreground outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {showSearchUsers ? (
                /* USER SEARCH LIST */
                <div className="py-2">
                  <p className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available People</p>
                  {filteredUsers.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm italic">No users found</div>
                  ) : (
                    filteredUsers.filter(u => u).map(user => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setActiveChat({ id: user.id, type: 'user', name: user.name });
                          setShowSearchUsers(false);
                          setSearchQuery("");
                        }}
                        className="px-4 py-3 hover:bg-accent/5 cursor-pointer flex items-center gap-3 transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                          {user.name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{user.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* ACTIVE CONVERSATIONS */
                loading ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30 px-10 text-center">
                    <User className="w-16 h-16 mb-2" />
                    <p className="text-sm">No active conversations</p>
                    <button 
                      onClick={() => setShowSearchUsers(true)}
                      className="mt-4 text-accent font-bold text-xs hover:underline"
                    >
                      Start a new chat
                    </button>
                  </div>
                ) : (
                  filteredConversations.filter(c => c).map((conv) => {
                    const isActive = activeChat?.id === conv.peer_id && activeChat?.type === conv.peer_type;
                    const isUnread = !!conv.unread_for_user || (!conv.last_message.is_read && String(conv.last_message.to_user_id) === String(authUser?.id));

                    return (
                      <div
                        key={`${conv.peer_type}_${conv.peer_id}`}
                        onClick={() => setActiveChat({ id: conv.peer_id, type: conv.peer_type, name: conv.peer_name })}
                        className={`px-4 py-4 cursor-pointer transition-all flex gap-3 border-l-4 ${
                          isActive
                            ? "bg-accent/10 border-l-accent"
                            : "hover:bg-accent/5 border-l-transparent"
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white font-bold text-lg shadow-lg ${isUnread ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}>
                            {conv.peer_name?.[0]}
                          </div>
                          {isUnread ? (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-background rounded-full animate-pulse shadow-md" />
                          ) : (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm truncate ${isUnread ? "font-bold text-accent" : "font-bold"}`}>{conv.peer_name}</h4>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-xs truncate line-clamp-1 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {conv.last_message.from_user_id === authUser?.id ? <span className="text-accent mr-1">You:</span> : ""}
                            {conv.last_message.message?.replace(/<[^>]+>/g, '')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* ────── CHAT WINDOW ────── */}
          <div className={`flex-1 min-w-0 flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md z-10 transition-colors">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-muted-foreground">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                      {activeChat.name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{activeChat.name}</h3>
                      <p className="text-[10px] text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => sidebarSearchRef.current?.focus()}
                      className="p-2 hover:bg-accent/10 rounded-full text-muted-foreground transition-all hover:text-accent"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    
                    <div className="relative" ref={moreMenuRef}>
                      <button 
                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                        className={`p-2 hover:bg-accent/10 rounded-full transition-all ${isMoreMenuOpen ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-accent"}`}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {isMoreMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={handleViewProfile}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-accent/5 flex items-center gap-2 transition-colors"
                          >
                            <User className="w-4 h-4 text-muted-foreground" /> View Profile
                          </button>
                          <button 
                            onClick={() => {
                              loadMessages(activeChat.id, activeChat.type);
                              setIsMoreMenuOpen(false);
                              success("Chat refreshed");
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-accent/5 flex items-center gap-2 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 text-muted-foreground" /> Refresh Chat
                          </button>
                          <div className="h-px bg-border my-1" />
                          <button 
                            onClick={handleDeleteConversation}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                          >
                            <X className="w-4 h-4" /> Delete Conversation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Thread */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
                >
                  {messagesLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="w-6 h-6 animate-spin text-accent/50" />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = String(msg.from_user_id) === String(authUser?.id);
                      const showDate = idx === 0 || 
                        new Date(messages[idx-1]?.created_at).toDateString() !== new Date(msg.created_at).toDateString();
                      
                      const senderRole = msg.from_user?.role || msg.fromUser?.role;
                      const senderName = msg.from_user?.name || msg.fromUser?.name || "User";
                      const firstName = senderName.split(' ')[0];
                      const isSuperAdmin = senderRole === 'super_admin';
                      
                      // For group chat feel, we show names if it's a TC chat and sender is a staff member
                      const shouldShowStaffName = activeChat?.type === 'tc' && !isMe;

                      return (
                        <div key={msg.id} className="space-y-4">
                          {showDate && (
                            <div className="flex justify-center my-6">
                              <span className="px-5 py-1.5 rounded-full bg-background/95 shadow-md border border-border/50 text-[11px] font-black text-foreground uppercase tracking-[0.2em] backdrop-blur-md">
                                • {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }).replace(',', '')} •
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? "justify-end" : "justify-start animate-in slide-in-from-left-2 duration-300"}`}>
                            {!isMe && (
                              <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 mr-2 flex items-center justify-center text-white text-[10px] font-bold self-end mb-1">
                                {isSuperAdmin ? "A" : firstName[0]}
                              </div>
                            )}
                            <div className={`max-w-[80%] md:max-w-[75%] group relative`}>
                              {shouldShowStaffName && (
                                <p className="text-[10px] font-bold mb-1 ml-1 text-muted-foreground uppercase tracking-tight">
                                  {isSuperAdmin ? "" : firstName}
                                </p>
                              )}
                              
                              <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm transition-all ${
                                isMe 
                                  ? "bg-accent text-white rounded-br-none" 
                                  : "bg-card text-foreground rounded-bl-none border border-border"
                              }`}>
                                {/* Reply Context */}
                                {msg.parent_message && (
                                  <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${isMe ? "bg-white/10 border-white/40" : "bg-accent/5 border-accent"}`}>
                                    <p className="font-bold opacity-70 mb-0.5">
                                      {String(msg.parent_message.from_user_id) === String(authUser.id) ? "You" : (msg.parent_message.from_user?.name || "User")}
                                    </p>
                                    <p className="truncate opacity-90 italic">
                                      {msg.parent_message.message?.replace(/<[^>]+>/g, '')}
                                    </p>
                                  </div>
                                )}

                                <div dangerouslySetInnerHTML={{ __html: msg.message || '' }} />
                                
                                {msg.attachment_path && (
                                  <div className={`mt-2 p-2 rounded-lg border ${isMe ? 'bg-white/10 border-white/20' : 'bg-accent/5 border-border'} flex items-center gap-2 group/file`}>
                                    <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-accent/10'}`}>
                                      <Paperclip className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold truncate">{msg.attachment_name}</p>
                                      <p className="text-[9px] opacity-70">Attachment</p>
                                    </div>
                                    <a 
                                      href={apiService.getStorageUrl(msg.attachment_path)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`p-1.5 rounded-lg ${isMe ? 'hover:bg-white/20' : 'hover:bg-accent/10'} transition-all`}
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                )}
                                <div className={`flex items-center gap-1 mt-1.5 justify-end ${isMe ? "text-white/80" : "text-muted-foreground"} text-[10px] font-medium`}>
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isMe && (
                                    <span className="ml-1">
                                      {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                    </span>
                                  )}
                                </div>

                                {/* Reply Button on Hover */}
                                <button 
                                  onClick={() => setReplyingTo({ id: msg.id, message: msg.message, senderName: isMe ? "You" : (isSuperAdmin ? "Admin" : firstName) })}
                                  className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-10" : "-right-10"} p-2 rounded-full bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-white`}
                                >
                                  <div className="rotate-180 scale-x-[-1]"><Send className="w-3.5 h-3.5" /></div>
                                </button>
                              </div>
                            </div>
                            {isMe && (
                               <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-card flex-shrink-0 ml-2 flex items-center justify-center text-[10px] font-bold self-end mb-1 border border-border">
                                 {authUser.name?.[0]}
                               </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-background border-t border-border relative">
                  {replyingTo && (
                    <div className="absolute bottom-full left-0 right-0 p-3 bg-accent text-white flex items-center justify-between border-b border-white/10 animate-in slide-in-from-bottom-full duration-300">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-1 h-8 bg-white/40 rounded-full shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Replying to {replyingTo.senderName}</p>
                          <p className="text-xs truncate italic opacity-90">{replyingTo.message?.replace(/<[^>]+>/g, '')}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setReplyingTo(null)}
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute bottom-full left-4 mb-2 p-2 bg-card border border-border rounded-xl shadow-xl w-64 h-48 overflow-y-auto grid grid-cols-8 gap-1 z-50 custom-scrollbar"
                    >
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="hover:bg-accent/10 p-1 rounded transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-input border border-input-border rounded-2xl p-2 focus-within:ring-1 focus-within:ring-accent transition-all">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 hover:bg-accent/10 rounded-xl transition-colors ${showEmojiPicker ? "text-accent bg-accent/10" : "text-muted-foreground"}`}
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelect} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 hover:bg-accent/10 rounded-xl transition-colors ${attachment ? "text-accent bg-accent/10" : "text-muted-foreground"}`}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    {attachment && (
                      <div className="absolute bottom-full left-4 right-4 mb-2 p-2 bg-accent rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 text-white">
                          <Paperclip className="w-4 h-4" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate max-w-[200px]">{attachment.name}</p>
                            <p className="text-[10px] opacity-70">{attachment.size}</p>
                          </div>
                        </div>
                        <button onClick={removeAttachment} className="p-1 hover:bg-white/20 rounded-full text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <textarea
                      rows={1}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none custom-scrollbar min-h-[38px] max-h-32 text-foreground"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() && !attachment}
                      className="p-2.5 bg-accent hover:brightness-110 disabled:opacity-30 text-white rounded-xl transition-all shadow-lg active:scale-95 flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-[10px] text-muted-foreground px-4 pt-2 text-center">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-0" />
                <div className="z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Send className="w-10 h-10 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold opacity-80">Vanquish Messenger</h2>
                  <p className="text-sm mt-2 text-center max-w-xs text-muted-foreground">
                    Select a chat or find someone new to start messaging. 
                    Quick, secure, and intuitive.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
