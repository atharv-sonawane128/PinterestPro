'use client';

import React from 'react';
import PageContainer from '@/components/PageContainer';
import { MessageCircle, Search, Edit, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const MESSAGES = [
  {
    id: 1,
    user: 'Creative Studio',
    lastMessage: 'Hey! Are you open for collaborations?',
    time: '1h',
    unread: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=studio'
  },
  {
    id: 2,
    user: 'John Doe',
    lastMessage: 'Thanks for the pin! Really helped my project.',
    time: '3h',
    unread: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    id: 3,
    user: 'Interior Ideas',
    lastMessage: 'Did you see the new board I shared?',
    time: 'Yesterday',
    unread: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=interior'
  }
];

export default function MessagesPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto flex h-[calc(100vh-160px)] bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Messages</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Edit size={20} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search messages" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {MESSAGES.map((msg) => (
              <div 
                key={msg.id}
                className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${msg.unread ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <img src={msg.avatar} className="w-12 h-12 rounded-full border border-gray-100" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-bold truncate ${msg.unread ? 'text-black' : 'text-gray-700'}`}>{msg.user}</h3>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{msg.time}</span>
                  </div>
                  <p className={`text-xs truncate ${msg.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {msg.lastMessage}
                  </p>
                </div>
                {msg.unread && <div className="w-2 h-2 rounded-full bg-red-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Empty State / Chat Placeholder */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/30 p-10 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="text-gray-300" size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Your Inbox</h2>
          <p className="text-gray-500 mt-2 max-w-xs">Send private messages to friends and other creators to share ideas.</p>
          <button className="mt-8 bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95">
            New Message
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
