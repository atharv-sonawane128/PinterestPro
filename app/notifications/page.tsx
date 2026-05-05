'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import { Bell, Heart, UserPlus, Save, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.uid}`);
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow': return { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' };
      case 'message': return { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'like': return { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' };
      default: return { icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-gray-900">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-full transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-red-600 w-10 h-10" />
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.length > 0 ? notifications.map((notif, i) => {
                const { icon: Icon, color, bg } = getIcon(notif.type);
                return (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(notif.link || '#')}
                    className={`flex items-center gap-5 p-6 rounded-[2rem] cursor-pointer transition-all border border-transparent hover:border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 group ${notif.isRead ? 'bg-white opacity-70' : 'bg-gray-50/50'}`}
                  >
                    <div className="relative">
                      <img 
                        src={notif.senderAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" 
                        alt="" 
                      />
                      <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-white`}>
                        <Icon className={color} size={14} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-gray-900 text-lg">
                        <span className="font-black">{notif.senderName}</span> {notif.content}
                      </p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                    )}
                  </motion.div>
                );
              }) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <Bell className="mx-auto text-gray-300 w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">No notifications yet</h3>
                  <p className="text-gray-500 mt-2 font-medium">When you get likes, follows, or messages, they'll appear here.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
