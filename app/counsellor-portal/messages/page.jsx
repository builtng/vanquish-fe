"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import CounsellorLayout from "@/components/CounsellorLayout";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
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
  CheckCircle,
  Check,
  CheckCheck,
  Download,
  Mail,
  Smile,
  MessageSquare,
} from "lucide-react";
import { getEcho } from "@/lib/echo";

export default function CounsellorChatPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { success, error: showError } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { id, user_id, name }
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showSearchStaff, setShowSearchStaff] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const scrollRef = useRef(null);
  const sidebarSearchRef = useRef(null);
  const moreMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [attachment, setAttachment] = useState(null); // { file, name, size }

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await apiService.getUnreadMessageCount();
      setUnreadCount(res.count || 0);
    } catch (err) {}
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.request("/messages/conversations");
      const convs = res || [];
      setConversations(convs);
      // Auto-select admin group if not already selected
      const adminConv = convs.find(c => c.peer_id === 'admin_group' && c.peer_type === 'group');
      if (adminConv && !activeChat) {
        setActiveChat({ id: 'admin_group', type: 'group', name: 'Admin Support' });
      } else if (convs.length > 0 && !activeChat) {
        const first = convs[0];
        setActiveChat({ id: first.peer_id, type: first.peer_type, name: first.peer_name });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await apiService.getMessageStaffList();
      setStaffList(Array.isArray(res) ? res : []);
    } catch (err) {}
  }, []);

  const loadMessages = useCallback(async (peerId, peerType) => {
    try {
      setMessagesLoading(true);
      const res = await apiService.getMessages({ peer_id: peerId, peer_type: peerType });
      const msgs = (res.data || []).reverse();
      setMessages(msgs);

      // Check for unread messages in the thread and mark them as read
      const myTcId = authUser?.training_counsellor_id;
      const unreadCount = msgs.filter(m => !m.is_read && (String(m.to_user_id) === String(authUser?.id) || (myTcId && String(m.to_tc_id) === String(myTcId)))).length;
      
      if (unreadCount > 0) {
        apiService.markConversationAsRead(peerType, peerId)
          .then(() => {
            loadUnreadCount();
            loadConversations();
            // Show as read immediately in UI
            setMessages(prev => prev.map(m => (!m.is_read && (String(m.to_user_id) === String(authUser?.id) || (myTcId && String(m.to_tc_id) === String(myTcId)))) ? { ...m, is_read: true } : m));
          })
          .catch(() => {});
      }
    } catch (err) {
      showError("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [showError, loadUnreadCount, loadConversations]);

  useEffect(() => {
    if (authUser) {
      loadConversations();
      loadStaff();
      loadUnreadCount();
    }

    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // ────── ECHO (REAL-TIME) ──────
    const echo = getEcho();
    if (echo && authUser?.id) {
       const channel = echo.private(`messages.${authUser.id}`);
       channel.listen(".message.sent", () => {
         loadConversations();
         loadUnreadCount();
       });

       // Also listen on staff_group for replies from admin
       const staffChannel = echo.private(`messages.staff_group`);
       staffChannel.listen(".message.sent", (e) => {
         const newMsg = e.message;
         // Only relevant if it's addressed to this counsellor's TC
         if (newMsg.type === 'staff_to_counsellor' && String(newMsg.to_tc_id) === String(authUser?.training_counsellor_id)) {
           loadConversations();
           loadUnreadCount();
         }
       });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (echo && authUser?.id) {
        echo.leave(`messages.${authUser.id}`);
        echo.leave(`messages.staff_group`);
      }
    };
  }, [authUser, loadConversations, loadUnreadCount]);

  // Separate effect for Echo listener to handle thread updates
  useEffect(() => {
    const echo = getEcho();
    if (!echo || !authUser?.id || !activeChat) return;

    const channel = echo.private(`messages.${authUser.id}`);
    channel.listen(".message.sent", (e) => {
      const newMsg = e.message;
      
      let isForCurrentChat = false;
      if (activeChat.type === 'group' && activeChat.id === 'admin_group') {
        // Staff reply to this counsellor's TC
        isForCurrentChat = newMsg.type === 'staff_to_counsellor' &&
          String(newMsg.to_tc_id) === String(authUser?.training_counsellor_id);
      } else if (activeChat.type === 'user') {
        isForCurrentChat = newMsg.from_user_id === activeChat.id || (newMsg.to_user_id === activeChat.id && newMsg.from_user_id === authUser.id);
      }

      if (isForCurrentChat) {
         setMessages(prev => {
           if (prev.find(m => m.id === newMsg.id)) return prev;
           return [...prev, newMsg];
         });
         apiService.markMessageAsRead(newMsg.id)
            .then(() => {
              loadUnreadCount();
              loadConversations();
            })
            .catch(() => {});
      }
    });

    // Also listen on staff_group for staff replies
    let staffGroupChannel = null;
    if (activeChat.type === 'group' && activeChat.id === 'admin_group') {
      staffGroupChannel = echo.private(`messages.staff_group`);
      staffGroupChannel.listen(".message.sent", (e) => {
        const newMsg = e.message;
        if (newMsg.type === 'staff_to_counsellor' && String(newMsg.to_tc_id) === String(authUser?.training_counsellor_id)) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
        loadConversations();
      });
    }

    return () => {
      if (staffGroupChannel) echo.leave(`messages.staff_group`);
    };
  }, [authUser, activeChat]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id, activeChat.type);
    }
  }, [activeChat, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeChat) return;

    try {
      const body = new FormData();
      body.append("message", newMessage);
      body.append("subject", "Admin Support");
      if (attachment?.file) {
        body.append("attachment", attachment.file);
      }

      // Always send to admin_group for counsellors
      if (activeChat.type === 'group' && activeChat.id === 'admin_group') {
        body.append("to_group", "admin_group");
      } else {
        body.append("to_user_ids[]", activeChat.id);
      }

      setNewMessage("");
      setAttachment(null);

      await apiService.sendMessageToStaff(body);

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
    // In counsellor portal, we don't have staff details pages, 
    // so we can either go to a placeholder or stay on the page.
    // However, if the user was talking to themselves, they could go to their own profile.
    router.push('/counsellor-portal/profile');
    setIsMoreMenuOpen(false);
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

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staffList, searchQuery]);

  const adminNames = useMemo(() => {
    return staffList
      .filter(s => s.role === 'admin' || s.role === 'super_admin')
      .map(s => s.name.split(' ')[0])
      .slice(0, 3)
      .join(', ');
  }, [staffList]);

  return (
    <CounsellorLayout unreadCount={unreadCount}>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-[var(--background)] text-gray-900 dark:text-gray-200">
        
        {/* SIDEBAR: Chats */}
        <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Messages</h2>
              <button 
                onClick={() => setShowSearchStaff(!showSearchStaff)}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-accent transition-all border border-gray-200 dark:border-transparent"
              >
                {showSearchStaff ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={sidebarSearchRef}
                type="text"
                placeholder={showSearchStaff ? "Find staff member..." : "Search chats..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1a1b23] border border-gray-100 dark:border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-accent transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {showSearchStaff ? (
              <div className="py-2">
                <p className="px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Office Team</p>
                {filteredStaff.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm italic">No staff members found</div>
                ) : (
                  filteredStaff.map(staff => (
                    <div
                      key={staff.id}
                      onClick={() => {
                        setActiveChat({ id: staff.id, type: 'user', name: staff.name });
                        setShowSearchStaff(false);
                        setSearchQuery("");
                      }}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-all"
                    >
                      <div className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
                        {staff.name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{staff.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                          {staff.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-300" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 px-10 text-center">
                  <Mail className="w-16 h-16 mb-4" />
                  <p className="text-sm font-medium">No active messages</p>
                  <button 
                    onClick={() => setShowSearchStaff(true)}
                    className="mt-6 text-accent font-bold text-xs hover:underline"
                  >
                    Start your first chat
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeChat?.id === conv.peer_id && activeChat?.type === conv.peer_type;
                  const myTcId = authUser?.training_counsellor_id;
                const isUnread = !!conv.unread_for_user || (!conv.last_message.is_read && (String(conv.last_message.to_user_id) === String(authUser?.id) || (myTcId && String(conv.last_message.to_tc_id) === String(myTcId))));
                  
                  return (
                    <div
                      key={`${conv.peer_type}_${conv.peer_id}`}
                      onClick={() => setActiveChat({ id: conv.peer_id, type: conv.peer_type, name: conv.peer_name })}
                      className={`px-6 py-5 cursor-pointer transition-all flex gap-4 border-l-4 ${
                        isActive
                          ? "bg-accent/5 dark:bg-accent/10 border-l-accent"
                          : "hover:bg-gray-50 dark:hover:bg-white/5 border-l-transparent"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform duration-300 ${isActive ? 'scale-110 shadow-accent/20' : ''}`} style={{ backgroundColor: "var(--accent-color)" }}>
                          {conv.peer_name?.[0]}
                        </div>
                        {isUnread && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 border-2 border-white dark:border-[#0d0e12] rounded-full animate-bounce shadow-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm truncate ${isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>{conv.peer_name}</h4>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-xs truncate line-clamp-1 italic ${isUnread ? "text-accent font-medium" : "text-gray-400"}`}>
                          {conv.last_message.from_user_id === authUser.id ? <span className="opacity-60 mr-1">You:</span> : ""}
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

        {/* CHAT WINDOW */}
        <div className={`flex-1 flex flex-col min-w-0 ${!activeChat ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-transparent backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
                    {activeChat.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{activeChat.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      {activeChat.id === 'admin_group'
                        ? `Group Chat${adminNames ? ` (${adminNames})` : ' with Admin Team'}`
                        : 'Staff Support'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => sidebarSearchRef.current?.focus()}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
                  >
                     <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </button>
                   
                   <div className="relative" ref={moreMenuRef}>
                      <button 
                         onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                         className={`p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors ${isMoreMenuOpen ? "bg-accent/5 text-accent" : ""}`}
                      >
                         <MoreVertical className="w-5 h-5" />
                      </button>

                      {isMoreMenuOpen && (
                         <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1a1b23] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in duration-200">
                            <button 
                              onClick={handleViewProfile}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                               <User className="w-4 h-4 text-gray-400" /> View Profile
                            </button>
                            <button 
                               onClick={() => {
                                  loadMessages(activeChat.id, activeChat.type);
                                  setIsMoreMenuOpen(false);
                                  success("Chat refreshed");
                               }}
                               className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                               <RefreshCw className="w-4 h-4 text-gray-400" /> Refresh Chat
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                            <button 
                              onClick={handleDeleteConversation}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 flex items-center gap-2 transition-colors"
                            >
                               <X className="w-4 h-4" /> Delete Conversation
                            </button>
                         </div>
                      )}
                   </div>
                </div>
              </div>

              {/* Thread */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-white dark:bg-transparent custom-scrollbar"
              >
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#6f1d56]/30" />
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = String(msg.from_user_id) === String(authUser.id);
                    const showDate = idx === 0 || 
                      new Date(messages[idx-1]?.created_at).toDateString() !== new Date(msg.created_at).toDateString();
                    
                    const senderName = msg.from_user?.name || msg.fromUser?.name || "Admin";
                    const senderRole = msg.from_user?.role || msg.fromUser?.role;
                    const initial = senderName[0]?.toUpperCase() || "A";
                    const shouldShowAdminName = activeChat?.type === 'group' && !isMe;

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-8">
                            <span className="px-4 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] shadow-sm">
                              {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          {!isMe && (
                             <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 mr-2 flex items-center justify-center text-white text-[10px] font-bold self-end mb-1">
                               {initial}
                             </div>
                          )}
                          <div className={`max-w-[85%] md:max-w-[75%] animate-in slide-in-from-${isMe ? 'right' : 'left'}-2 duration-300`}>
                            {shouldShowAdminName && (
                              <p className="text-[10px] font-bold mb-1 ml-1 text-muted-foreground uppercase tracking-tight">
                                {senderName} {senderRole === 'super_admin' ? '(Super Admin)' : (senderRole === 'admin' ? '(Admin)' : '')}
                              </p>
                            )}
                            <div className={`px-5 py-3.5 rounded-2xl text-[14px] shadow-sm leading-relaxed ${
                              isMe 
                                ? "bg-accent text-white rounded-br-none shadow-xl shadow-accent/20" 
                                : "bg-white dark:bg-[#1a1b23] text-gray-700 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-800"
                            }`}>
                              <div dangerouslySetInnerHTML={{ __html: msg.message || '' }} />
                              {msg.attachment_path && (
                                <div className={`mt-2 p-2 rounded-lg border ${isMe ? 'bg-white/10 border-white/20' : 'bg-accent/5 border-accent/10'} flex items-center gap-2 group/file`}>
                                  <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-accent/10'}`}>
                                    <Paperclip className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold truncate">{msg.attachment_name}</p>
                                    <p className="text-[8px] opacity-70 uppercase tracking-tighter">Attachment</p>
                                  </div>
                                  <a 
                                    href={apiService.getStorageUrl(msg.attachment_path)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`p-1.5 rounded-lg ${isMe ? 'hover:bg-white/20' : 'hover:bg-accent/10'} transition-all`}
                                  >
                                    <Download className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                              <div className={`flex items-center gap-1.5 mt-2 justify-end ${isMe ? "text-white/60" : "text-gray-400"} text-[9px] font-bold`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && (
                                   <span className="opacity-80">
                                     {msg.is_read ? <CheckCheck className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                                   </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isMe && (
                             <div className="w-8 h-8 rounded-full bg-accent/10 flex-shrink-0 ml-2 flex items-center justify-center text-accent text-[10px] font-bold self-end mb-1 border border-accent/20">
                               {authUser.name?.[0]}
                             </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="p-6 bg-white dark:bg-transparent border-t border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-gray-50 dark:bg-[#1a1b23] rounded-2xl p-2 border border-gray-100 dark:border-white/5 focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/5 transition-all duration-300">
                  <div className="flex items-center">
                    <button type="button" className="p-2.5 hover:bg-white dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors shadow-sm">
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
                      className={`p-2.5 hover:bg-white dark:hover:bg-white/5 rounded-xl transition-colors shadow-sm ${attachment ? "text-accent bg-accent/5" : "text-gray-400"}`}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  {attachment && (
                    <div className="absolute bottom-full left-6 right-6 mb-3 p-3 bg-accent rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-3 duration-300">
                      <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate max-w-[200px]">{attachment.name}</p>
                          <p className="text-[10px] opacity-70 uppercase tracking-widest">{attachment.size}</p>
                        </div>
                      </div>
                      <button onClick={removeAttachment} className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors">
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
                    placeholder="Describe your needs or reply here..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-1 resize-none no-scrollbar min-h-[44px] max-h-32 text-gray-800 dark:text-white"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() && !attachment}
                    className="p-3.5 bg-accent hover:opacity-90 disabled:opacity-30 text-white rounded-xl transition-all shadow-xl shadow-accent/20 active:scale-95 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <div className="flex items-center justify-center gap-3 mt-3 opacity-30">
                   <div className="h-px w-8 bg-gray-400" />
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">Secured by Vanquish-Shield</p>
                   <div className="h-px w-8 bg-gray-400" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
              <div className="w-24 h-24 rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-8 border border-gray-200 dark:border-transparent">
                <MessageSquare className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Internal Support Hub</h2>
              <p className="text-sm max-w-sm leading-relaxed">
                Connect directly with our administration team. 
                Choose a conversation to begin your consultation.
              </p>
            </div>
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
}
