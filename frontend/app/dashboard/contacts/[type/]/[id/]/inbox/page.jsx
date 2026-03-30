"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Inbox,
  Send,
  Trash2,
  Star,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowLeft,
  SearchIcon,
  Archive,
  Mail,
  MailOpen,
  Filter,
  CheckSquare,
  Square,
  Clock,
  User,
  MoreHorizontal
} from "lucide-react";
import apiService from "@/lib/api";
import { format } from "date-fns";
import PageGuard from "@/components/PageGuard";
import { toast } from "react-toastify";

export default function ContactInboxPage() {
  const { type, id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeFolder, setActiveFolder] = useState("inbox"); // inbox, sent, trash
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);
  const [contact, setContact] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ subject: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const fetchContact = useCallback(async () => {
    try {
      let data;
      if (type === "tc") {
        data = await apiService.getTrainingCounsellorDetails(id);
      } else if (type === "client") {
        const clients = await apiService.getClients({ search: id });
        data = clients.data?.[0];
      }
      setContact(data);
    } catch (err) {
      console.error(err);
    }
  }, [type, id]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      // For contact-specific inbox, we use peer_id and peer_type
      // and filter by folder manually if needed, or use history
      const res = await apiService.getMessages({ 
        peer_id: id, 
        peer_type: type === 'tc' ? 'tc' : 'user', // Clients might be 'user' peer_type if they have accounts
        folder: activeFolder
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [id, type, activeFolder]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => 
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const toggleSelect = (id) => {
    setSelectedMessages(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCompose = async (e) => {
    e.preventDefault();
    if (!composeData.message.trim()) return;

    try {
      setIsSending(true);
      if (type === 'tc') {
        await apiService.sendMessageToCounsellor({
          tc_ids: [contact.id],
          subject: composeData.subject || "No Subject",
          message: composeData.message
        });
      } else if (type === 'client') {
        await apiService.sendClientEmail(id, composeData.subject || "No Subject", composeData.message);
      }
      toast.success("Message sent");
      setComposeData({ subject: "", message: "" });
      setShowCompose(false);
      fetchMessages();
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleTrash = async (msgId) => {
    try {
      await apiService.request(`/messages/${msgId}/trash`, { method: "POST" });
      fetchMessages();
      if (activeMessage?.id === msgId) setActiveMessage(null);
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleMarkRead = async (msgId) => {
    try {
      await apiService.request(`/messages/${msgId}/mark-read`, { method: "POST" });
      fetchMessages();
    } catch (err) {}
  };

  const openMessage = (msg) => {
    setActiveMessage(msg);
    if (!msg.is_read) handleMarkRead(msg.id);
  };

  return (
    <PageGuard allowedRoles={["admin", "staff", "super_admin"]}>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-6">
            <button 
              onClick={() => setShowCompose(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95"
            >
              <Plus size={18} />
              Compose
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            <SidebarItem 
              icon={Inbox} 
              label="Inbox" 
              active={activeFolder === "inbox"} 
              count={messages.filter(m => !m.is_read && m.to_user_id).length}
              onClick={() => setActiveFolder("inbox")} 
            />
            <SidebarItem 
              icon={Send} 
              label="Sent" 
              active={activeFolder === "sent"} 
              onClick={() => setActiveFolder("sent")} 
            />
            <SidebarItem 
              icon={Trash2} 
              label="Trash" 
              active={activeFolder === "trash"} 
              onClick={() => setActiveFolder("trash")} 
            />
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4 mx-3" />
            <SidebarItem 
              icon={Star} 
              label="Starred" 
              active={activeFolder === "starred"} 
              onClick={() => setActiveFolder("starred")} 
            />
          </nav>

          <div className="p-6">
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-800/30">
              <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Live Connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className={`flex-1 flex flex-col min-w-0 ${activeMessage ? "hidden lg:flex" : "flex"}`}>
          {/* List Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search in messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={fetchMessages}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-10">
                <Mail size={48} className="mb-4" />
                <p className="font-bold">No messages found</p>
                <p className="text-sm">Your conversation with {contact?.name || "this contact"} is empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-purple-50/30 dark:hover:bg-purple-900/5 transition-all group ${!msg.is_read ? "bg-white dark:bg-gray-900 border-l-4 border-l-purple-600" : "bg-gray-50/20 dark:bg-gray-900/20 border-l-4 border-l-transparent"}`}
                  >
                    <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(msg.id)} className="text-gray-300 hover:text-purple-600 transition-colors">
                        {selectedMessages.includes(msg.id) ? <CheckSquare size={18} className="text-purple-600" /> : <Square size={18} />}
                      </button>
                      <button className="text-gray-300 hover:text-amber-400 transition-colors">
                        <Star size={18} />
                      </button>
                    </div>

                    <div className="w-32 flex-shrink-0">
                      <p className={`text-sm truncate ${!msg.is_read ? "font-black text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                        {msg.from_user?.name || "Recipient"}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!msg.is_read ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                          {msg.subject || "(No Subject)"}
                        </p>
                        <span className="text-xs text-gray-400 truncate opacity-60">— {msg.message?.replace(/<[^>]+>/g, '').substring(0, 100)}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-4">
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTrash(msg.id); }}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-all">
                          <Archive size={16} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-gray-400 w-16 text-right">
                        {format(new Date(msg.created_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message View Panel */}
        {activeMessage && (
          <div className="w-full lg:w-[600px] xl:w-[800px] border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-right duration-300">
            {/* View Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveMessage(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:hidden text-gray-500"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleTrash(activeMessage.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500" title="Delete">
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500" title="Archive">
                    <Archive size={18} />
                  </button>
                  <button onClick={() => handleMarkRead(activeMessage.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500" title="Mark Unread">
                    <Mail size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500"><ChevronLeft size={18}/></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500"><ChevronRight size={18}/></button>
              </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">{activeMessage.subject || "(No Subject)"}</h2>
              
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                    {activeMessage.from_user?.name?.[0] || "R"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">{activeMessage.from_user?.name}</p>
                      <span className="text-xs text-gray-400 font-medium">‹{activeMessage.from_user?.email}›</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">to me</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 mb-1">{format(new Date(activeMessage.created_at), 'MMMM d, yyyy h:mm a')}</p>
                  <div className="flex justify-end gap-1">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><Star size={14} /></button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><MoreHorizontal size={14} /></button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                <div 
                  className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: activeMessage.message }} 
                />
              </div>

              {/* Reply Section */}
              <div className="mt-12">
                <div className="flex items-center gap-3">
                  <button className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                    <RefreshCw size={14} className="scale-x-[-1]" />
                    Reply
                  </button>
                  <button className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
                    <ChevronRight size={14} />
                    Forward
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20">
                    <Send size={18} />
                  </div>
                  New Message
                </h3>
                <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCompose}>
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4 py-2 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest w-12 text-right">To</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-bold flex items-center gap-2">
                        {contact?.name}
                        <span className="opacity-50 font-normal">‹{contact?.email}›</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 py-2 border-b border-gray-50 dark:border-gray-800 focus-within:border-purple-500 transition-all">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest w-12 text-right">Sub</span>
                    <input 
                      type="text" 
                      placeholder="Enter subject..."
                      required
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white"
                      value={composeData.subject}
                      onChange={e => setComposeData({...composeData, subject: e.target.value})}
                    />
                  </div>

                  <textarea 
                    rows="12"
                    required
                    placeholder="Write your message here..."
                    className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white resize-none"
                    value={composeData.message}
                    onChange={e => setComposeData({...composeData, message: e.target.value})}
                  />
                </div>

                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-purple-600 transition-colors"><Plus size={20} /></button>
                    <button type="button" className="p-2 text-gray-400 hover:text-purple-600 transition-colors"><Paperclip size={20} /></button>
                    <button type="button" className="p-2 text-gray-400 hover:text-purple-600 transition-colors"><Clock size={20} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowCompose(false)} 
                      className="px-6 py-2.5 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={isSending || !composeData.message.trim()}
                      className="flex items-center gap-2 px-8 py-2.5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/25 active:scale-95 disabled:opacity-50"
                    >
                      {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                      {isSending ? "Sending..." : "Send Now"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageGuard>
  );
}

function SidebarItem({ icon: Icon, label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
        active 
          ? "bg-purple-100/50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? "text-purple-600 dark:text-purple-400" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
        <span className={`text-sm font-bold ${active ? "font-black" : ""}`}>{label}</span>
      </div>
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function X({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function Paperclip({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
