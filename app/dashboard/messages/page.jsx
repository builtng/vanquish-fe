"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PageGuard from "@/components/PageGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/lib/toast";
import apiService from "@/lib/api";
import {
  Search,
  Plus,
  Send,
  User,
  MoreVertical,
  Paperclip,
  ArrowLeft,
  X,
  RefreshCw,
  MoreHorizontal,
  Smile,
  Mic,
} from "lucide-react";

export default function DashboardChatPage() {
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
  
  const scrollRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [authUser]);

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
      setConversations(res || []);
    } catch (err) {
      console.error(err);
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
      setMessages((res.data || []).reverse());
    } catch (err) {
      showError("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const messageText = newMessage;
      setNewMessage(""); // Optimistic clear

      // Determine which endpoint to call based on peer type
      if (activeChat.type === 'tc') {
        await apiService.sendMessageToCounsellor({
          tc_ids: [activeChat.id],
          subject: "Chat Message",
          message: messageText,
        });
      } else {
        await apiService.sendMessageToStaff({
          to_user_ids: [activeChat.id],
          subject: "Chat Message",
          message: messageText,
        });
      }

      // Refresh messages
      loadMessages(activeChat.id, activeChat.type);
      loadConversations();
    } catch (err) {
      showError("Failed to send");
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
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
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground transition-colors duration-300">
          
          {/* ────── SIDEBAR: Chats ────── */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeChat ? "hidden md:flex" : "flex"} bg-card/30`}>
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
                  type="text"
                  placeholder={showSearchUsers ? "Find people..." : "Search chats..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-input border-input-border border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-accent transition-all text-foreground"
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
                    filteredUsers.map(user => (
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
                  filteredConversations.map((conv) => (
                    <div
                      key={`${conv.peer_type}_${conv.peer_id}`}
                      onClick={() => setActiveChat({ id: conv.peer_id, type: conv.peer_type, name: conv.peer_name })}
                      className={`px-4 py-4 cursor-pointer transition-all flex gap-3 border-l-4 ${
                        activeChat?.id === conv.peer_id && activeChat?.type === conv.peer_type
                          ? "bg-accent/10 border-l-accent"
                          : "hover:bg-accent/5 border-l-transparent"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {conv.peer_name?.[0]}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold truncate">{conv.peer_name}</h4>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate line-clamp-1">
                          {conv.last_message.from_user_id === authUser?.id ? <span className="text-accent mr-1">You:</span> : ""}
                          {conv.last_message.message?.replace(/<[^>]+>/g, '')}
                        </p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* ────── CHAT WINDOW ────── */}
          <div className={`flex-1 flex flex-col min-w-0 ${!activeChat ? "hidden md:flex" : "flex"}`}>
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
                    <button className="p-2 hover:bg-accent/10 rounded-full text-muted-foreground">
                      <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-accent/10 rounded-full text-muted-foreground">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
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
                      const isMe = msg.from_user_id === authUser?.id;
                      const showDate = idx === 0 || 
                        new Date(messages[idx-1].created_at).toDateString() !== new Date(msg.created_at).toDateString();

                      return (
                        <div key={msg.id} className="space-y-4">
                          {showDate && (
                            <div className="flex justify-center my-6">
                              <span className="px-3 py-1 rounded-full bg-accent/10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? "justify-end" : "justify-start animate-in slide-in-from-left-2 duration-300"}`}>
                            <div className={`max-w-[80%] md:max-w-[70%] group relative`}>
                              <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm transition-all ${
                                isMe 
                                  ? "bg-accent text-white rounded-tr-none" 
                                  : "bg-card text-foreground rounded-tl-none border border-border"
                              }`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                                <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? "text-white/70" : "text-muted-foreground"} text-[9px]`}>
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isMe && <span className="ml-1 opacity-50">✓✓</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-background border-t border-border relative">
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
                    <button 
                      type="button" 
                      onClick={() => showError("File attachments are coming soon!")}
                      className="p-2 hover:bg-accent/10 rounded-xl text-muted-foreground transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
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
                      disabled={!newMessage.trim()}
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <Send className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-xl font-bold">Vanquish Messenger</h2>
                <p className="text-sm mt-2 text-center max-w-xs">
                  Select a chat or find someone new to start messaging. 
                  Quick, secure, and intuitive.
                </p>
              </div>
            )}
          </div>

        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
