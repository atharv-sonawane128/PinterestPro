'use client';

import React from 'react';
import PageContainer from '@/components/PageContainer';
import { User, Lock, Bell, Eye, ShieldCheck, HelpCircle, ChevronRight, LogOut, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const SETTING_GROUPS = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Edit Profile', desc: 'Public info, avatar, bio' },
      { icon: Lock, label: 'Security', desc: 'Password, two-factor auth' },
      { icon: Bell, label: 'Notifications', desc: 'Email, push, desktop' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Eye, label: 'Privacy & Data', desc: 'Visibility, search engine settings' },
      { icon: ShieldCheck, label: 'Personalization', desc: 'Ad preferences, site behavior' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', desc: 'Guides, contact support' },
    ]
  }
];

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-10">Settings</h1>

        {/* Profile Header */}
        <div className="bg-gray-50 rounded-[3rem] p-8 mb-10 flex flex-col md:flex-row items-center gap-8 border border-gray-100">
          <div className="relative group">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" alt="" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-3xl font-bold border-4 border-white shadow-xl">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user?.displayName || 'User'}</h2>
            <p className="text-gray-500 mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-600 border border-gray-200">Pro Member</span>
              <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-600 border border-gray-200">2.4k Pins</span>
            </div>
          </div>
          <button className="bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-3 rounded-full transition-all border border-gray-200 shadow-sm">
            Public Profile
          </button>
        </div>

        {/* Settings Groups */}
        <div className="space-y-12">
          {SETTING_GROUPS.map((group, i) => (
            <section key={i}>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">{group.title}</h3>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm divide-y divide-gray-50">
                {group.items.map((item, j) => (
                  <button 
                    key={j}
                    className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 first:rounded-t-[2.5rem] last:rounded-b-[2.5rem] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-gray-800">{item.label}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-black transition-colors" size={20} />
                  </button>
                ))}
              </div>
            </section>
          ))}

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 p-6 bg-red-50 text-red-600 rounded-[2.5rem] font-bold hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut size={20} />
            Logout from all devices
          </button>
        </div>

        <div className="py-20 text-center">
          <p className="text-gray-300 text-sm">Pinterest Pro Version 1.0.4 (Stable)</p>
        </div>
      </div>
    </PageContainer>
  );
}
