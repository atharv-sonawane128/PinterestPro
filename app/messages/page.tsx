'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageContainer from '@/components/PageContainer';
import { MessageCircle, Search, Edit, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function MessagesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const isOnline = (lastActive: string | Date) => {
    if (!lastActive) return false;
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60);
    return diffInMinutes < 5;
  };

  const formatLastSeen = (lastActive: string | Date) => {
    if (!lastActive) return "Offline";
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return lastActiveDate.toLocaleDateString();
  };

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/conversations?userId=${user.uid}`);
      const data = await res.json();
      setConversations(data);
      
      if (initialConvId && !selectedConv) {
        const found = data.find((c: any) => c._id === initialConvId);
        if (found) setSelectedConv(found);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.filter((u: any) => u.uid !== user?.uid));
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const startConversation = async (targetUser: any) => {
    if (!user) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          participants: [user.uid, targetUser.uid],
          lastMessage: "Started a conversation"
        })
      });
      const conv = await res.json();
      setSearchQuery('');
      setSearchResults([]);
      fetchConversations();
      setSelectedConv({ ...conv, otherUser: targetUser });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user || isSending) return;

    setIsSending(true);
    const content = newMessage;
    setNewMessage('');

    try {
      await fetch(`/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.uid, content })
      });
      fetchMessages(selectedConv._id);
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv._id);
      const interval = setInterval(() => fetchMessages(selectedConv._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-120px)] bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
        <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col transition-all ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 pb-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-gray-900">Messages</h1>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-all active:scale-95">
                <Edit size={24} />
              </button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search people to message" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-100/50 transition-all border border-transparent focus:border-gray-100"
              />
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 py-4 max-h-96 overflow-y-auto"
                  >
                    {searchResults.map(u => (
                      <div 
                        key={u.uid} 
                        onClick={() => startConversation(u)}
                        className="px-6 py-4 hover:bg-gray-50 flex items-center gap-4 cursor-pointer transition-colors"
                      >
                        <img src={u.avatar} className="w-12 h-12 rounded-full border border-gray-100" alt="" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-500">@{u.email.split('@')[0]}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
            {conversations.map((conv) => (
              <div 
                key={conv._id}
                onClick={() => setSelectedConv(conv)}
                className={`flex items-center gap-4 p-5 rounded-[2rem] cursor-pointer transition-all active:scale-98 ${selectedConv?._id === conv._id ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'hover:bg-gray-50'}`}
              >
                <div className="relative">
                  <img 
                    src={conv.otherUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                    className="w-14 h-14 rounded-full border-2 border-white shadow-sm" 
                    alt="" 
                  />
                  {isOnline(conv.otherUser?.lastActive) && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold truncate text-lg">{conv.otherUser?.name}</h3>
                    <span className={`text-[10px] uppercase font-black tracking-widest ${selectedConv?._id === conv._id ? 'text-gray-400' : 'text-gray-300'}`}>
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${selectedConv?._id === conv._id ? 'text-gray-300' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
            {!loading && conversations.length === 0 && (
              <div className="text-center py-20 px-8">
                <p className="text-gray-400 font-medium italic">No conversations yet. Search for someone to start chatting!</p>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col bg-gray-50/20 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              <div className="p-6 md:p-8 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                  </button>
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push(`/profile/${selectedConv.otherUser.uid}`)}>
                    <img 
                      src={selectedConv.otherUser?.avatar} 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform" 
                      alt="" 
                    />
                    <div>
                      <h2 className="text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors">{selectedConv.otherUser?.name}</h2>
                      {isOnline(selectedConv.otherUser?.lastActive) ? (
                        <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online now
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 font-medium">
                          Last seen {formatLastSeen(selectedConv.otherUser?.lastActive)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-6">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg._id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-5 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed ${
                        isMe 
                        ? 'bg-red-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                      }`}>
                        {msg.content}
                        <p className={`text-[10px] mt-2 font-bold opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              <div className="p-6 md:p-8 bg-white border-t border-gray-100">
                <form onSubmit={sendMessage} className="flex gap-4 items-center">
                  <div className="flex-1 bg-gray-50 rounded-[2rem] px-6 py-4 flex items-center focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-100/50 transition-all border-2 border-transparent focus-within:border-gray-100">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="bg-transparent border-none outline-none w-full font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95 disabled:opacity-50"
                  >
                    <Send size={24} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                <MessageCircle className="text-gray-200" size={64} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Your Inbox</h2>
              <p className="text-gray-500 mt-2 max-w-sm text-lg font-medium leading-relaxed">
                Send private messages and shared inspirations with other creators on Pinterest Pro.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-red-600 w-10 h-10" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

