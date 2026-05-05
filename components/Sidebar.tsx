'use client';

import React from 'react';
import { Home, Compass, LayoutGrid, Plus, Bell, MessageCircle, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: LayoutGrid, label: 'Boards', href: '/boards' },
    { icon: Plus, label: 'Create', href: '/create' },
    { icon: Bell, label: 'Alerts', href: '/notifications' },
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-20 md:w-24 bg-white border-r border-gray-100 flex flex-col items-center py-8 z-40">
      <div className="flex flex-col gap-8 flex-1">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`p-3 rounded-2xl transition-all relative group flex items-center justify-center ${
                isActive ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <item.icon size={24} />
              <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute -left-1 w-1 h-8 bg-black rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-6 mt-auto pb-4">
        <Link href="/settings" className={`p-3 rounded-2xl transition-all group relative flex items-center justify-center ${pathname === '/settings' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Settings size={24} />
          <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Settings
          </span>
        </Link>
        <button className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors group relative flex items-center justify-center">
          <LogOut size={24} />
          <span className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
