'use client';

import React from 'react';
import PageContainer from '@/components/PageContainer';
import { Bell, Heart, UserPlus, Save, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: 'Sarah Miller',
    content: 'liked your pin "Aesthetic Workspace"',
    time: '2m ago',
    icon: Heart,
    iconColor: 'text-red-500',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop'
  },
  {
    id: 2,
    type: 'save',
    user: 'Design Enthusiast',
    content: 'saved your pin to "Dream Home"',
    time: '15m ago',
    icon: Save,
    iconColor: 'text-blue-500',
    img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&auto=format&fit=crop'
  },
  {
    id: 3,
    type: 'follow',
    user: 'Alex Rivera',
    content: 'started following you',
    time: '1h ago',
    icon: UserPlus,
    iconColor: 'text-purple-500',
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: 4,
    type: 'system',
    user: 'Pinterest Pro',
    content: 'Trending: "Minimalist Posters" are popular today!',
    time: '3h ago',
    icon: Sparkles,
    iconColor: 'text-yellow-500',
  }
];

export default function NotificationsPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <button className="text-sm font-bold text-gray-500 hover:text-black">Mark all as read</button>
        </div>

        <div className="space-y-1">
          {NOTIFICATIONS.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group"
            >
              <div className="relative">
                {notif.img ? (
                  <img src={notif.img} className="w-12 h-12 rounded-full object-cover border border-gray-100" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <notif.icon className={notif.iconColor} size={20} />
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-50`}>
                  <notif.icon className={notif.iconColor} size={12} />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-bold">{notif.user}</span> {notif.content}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
              </div>

              <div className="w-2 h-2 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center py-10 border-t border-gray-50">
          <p className="text-gray-400 text-sm">You're all caught up!</p>
        </div>
      </div>
    </PageContainer>
  );
}
