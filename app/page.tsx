'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import MasonryGrid from '../components/MasonryGrid';
import { Wifi, WifiOff, Sparkles, TrendingUp, Layers, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';

export default function Home() {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = async (search: string | null = null) => {
    setLoading(true);
    try {
      let url = `/api/pins?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPins(data);
      }
    } catch (error) {
      console.error("Failed to fetch pins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOfflineMode) {
      fetchPins(searchQuery);
    } else {
      const savedPins = pins.filter((pin: any) => pin.privateNote);
      setPins(savedPins);
    }
  }, [isOfflineMode, searchQuery]);

  return (
    <PageContainer>
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              isOfflineMode 
                ? 'bg-blue-600 text-white shadow-inner' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isOfflineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
            {isOfflineMode ? 'Offline Mode Active' : 'Go Offline'}
          </button>
        </div>
      </div>
    </div>

      {/* Masonry Grid */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <Loader2 className="animate-spin text-red-600 w-10 h-10" />
              <p className="text-gray-500 font-medium">Curating your feed...</p>
            </motion.div>
          ) : pins.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isOfflineMode && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4">
                  <WifiOff className="text-blue-600" />
                  <div>
                    <p className="font-bold">Browsing Offline</p>
                    <p className="text-sm">Showing saved pins with private notes.</p>
                  </div>
                </div>
              )}
              <MasonryGrid pins={pins} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Sparkles className="mx-auto text-gray-300 w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">No pins found here yet</h3>
              <p className="text-gray-500 mt-2">Be the first to save something amazing!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </PageContainer>
  );
}
