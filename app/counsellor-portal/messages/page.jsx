"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import CounsellorLayout from "@/components/CounsellorLayout";
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
  MoreHorizontal,
  Smile,
  Mic,
  Mail,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

export default function CounsellorChatPage() {
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
  
  const scrollRef = useRef(null);

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
      setConversations(res || []);
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
      setMessages((res.data || []).reverse());
    } catch (err) {
      showError("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (authUser) {
      loadConversations();
      loadStaff();
      loadUnreadCount();
    }
  }, [authUser, loadConversations, loadStaff, loadUnreadCount]);

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
    if (!newMessage.trim() || !activeChat) return;

    try {
      const messageText = newMessage;
      setNewMessage("");

      await apiService.sendMessageToStaff({
        to_user_ids: [activeChat.id],
        subject: "Quick Chat",
        message: messageText,
      });

      loadMessages(activeChat.id, activeChat.type);
      loadConversations();
    } catch (err) {
      showError("Failed to send");
    }
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
                className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-[#6f1d56] transition-all border border-gray-200 dark:border-transparent"
              >
                {showSearchStaff ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={showSearchStaff ? "Find staff member..." : "Search chats..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1a1b23] border border-gray-100 dark:border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-[#6f1d56] transition-all outline-none"
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
                      <div className="w-11 h-11 rounded-full bg-[#6f1d56]/10 text-[#6f1d56] flex items-center justify-center font-bold text-lg">
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
                    className="mt-6 text-[#6f1d56] font-bold text-xs hover:underline"
                  >
                    Start your first chat
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeChat?.id === conv.peer_id && activeChat?.type === conv.peer_type;
                  const isUnread = !conv.last_message.is_read && conv.last_message.from_user_id !== authUser.id;
                  
                  return (
                    <div
                      key={`${conv.peer_type}_${conv.peer_id}`}
                      onClick={() => setActiveChat({ id: conv.peer_id, type: conv.peer_type, name: conv.peer_name })}
                      className={`px-6 py-5 cursor-pointer transition-all flex gap-4 border-l-4 ${
                        isActive
                          ? "bg-[#6f1d56]/5 dark:bg-[#6f1d56]/10 border-l-[#6f1d56]"
                          : "hover:bg-gray-50 dark:hover:bg-white/5 border-l-transparent"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform duration-300 ${isActive ? 'scale-110 shadow-[#6f1d56]/20' : ''}`} style={{ backgroundColor: "#6f1d56" }}>
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
                        <p className={`text-xs truncate line-clamp-1 italic ${isUnread ? "text-[#6f1d56] font-medium" : "text-gray-400"}`}>
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
                  <div className="w-10 h-10 rounded-xl bg-[#6f1d56] flex items-center justify-center text-white font-bold">
                    {activeChat.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{activeChat.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Staff Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
                      <Search className="w-5 h-5" />
                   </button>
                   <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Thread */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-gray-50/50 dark:bg-transparent custom-scrollbar"
              >
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#6f1d56]/30" />
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.from_user_id === authUser.id;
                    const showDate = idx === 0 || 
                      new Date(messages[idx-1].created_at).toDateString() !== new Date(msg.created_at).toDateString();

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
                          <div className={`max-w-[85%] md:max-w-[75%] animate-in slide-in-from-${isMe ? 'right' : 'left'}-2 duration-300`}>
                            <div className={`px-5 py-3.5 rounded-2xl text-[14px] shadow-sm leading-relaxed ${
                              isMe 
                                ? "bg-[#6f1d56] text-white rounded-tr-none shadow-xl shadow-[#6f1d56]/20" 
                                : "bg-white dark:bg-[#1a1b23] text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800"
                            }`}>
                              <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                              <div className={`flex items-center gap-1.5 mt-2 justify-end ${isMe ? "text-white/60" : "text-gray-400"} text-[9px] font-bold`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && <CheckCircle className="w-2.5 h-2.5 opacity-60" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="p-6 bg-white dark:bg-transparent border-t border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-gray-50 dark:bg-[#1a1b23] rounded-2xl p-2 border border-gray-100 dark:border-white/5 focus-within:border-[#6f1d56]/40 focus-within:ring-4 focus-within:ring-[#6f1d56]/5 transition-all duration-300">
                  <div className="flex items-center">
                    <button type="button" className="p-2.5 hover:bg-white dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors shadow-sm">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2.5 hover:bg-white dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors shadow-sm">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
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
                    disabled={!newMessage.trim()}
                    className="p-3.5 bg-[#6f1d56] hover:opacity-90 disabled:opacity-30 text-white rounded-xl transition-all shadow-xl shadow-[#6f1d56]/20 active:scale-95 flex items-center justify-center"
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
                <MessageSquare className="w-10 h-10 text-[#6f1d56]" />
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
