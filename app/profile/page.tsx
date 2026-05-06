'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import MasonryGrid from '@/components/MasonryGrid';
import { useAuth } from '@/context/AuthContext';
import { Settings, Share2, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Created' | 'Saved'>('Created');
  const [createdPins, setCreatedPins] = useState<any[]>([]);
  const [savedPins, setSavedPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
  const [showToast, setShowToast] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch Created Pins
      const createdRes = await fetch(`/api/pins?authorId=${user.uid}`);
      const createdData = await createdRes.json();
      setCreatedPins(createdData);

      // Fetch Saved Pins
      const savedRes = await fetch(`/api/user/${user.uid}/saved`);
      const savedData = await savedRes.json();
      setSavedPins(savedData);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleDeletePin = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await fetch(`/api/pins/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCreatedPins(prev => prev.filter((p: any) => p._id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: null });
      }
    } catch (error) {
      console.error("Failed to delete pin:", error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${user?.uid}`;
    navigator.clipboard.writeText(url);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!user) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold text-gray-800">Please login to view your profile</h2>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="flex flex-col items-center mt-10 mb-16 text-center">
        <div className="relative group">
          <img 
            src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
            className="w-32 h-32 rounded-full shadow-2xl border-4 border-white mb-6" 
            alt="Profile" 
          />
          <button className="absolute bottom-6 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-1">{user.displayName || "Creative User"}</h1>
        <p className="text-gray-500 font-medium mb-6">@{user.email?.split('@')[0] || 'user'}</p>
        
        <div className="flex items-center gap-4 mb-10">
          <span className="font-bold text-gray-800">1 following</span>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="px-6 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              Share profile
            </button>
            <button className="px-6 py-3 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
              Edit profile
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-8 border-b border-gray-100 w-full justify-center">
          {['Created', 'Saved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-2 font-bold transition-all relative ${
                activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-full" 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Section */}
      <div>
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
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {(activeTab === 'Created' ? createdPins : savedPins).length > 0 ? (
                <div className="relative">
                  <MasonryGrid pins={activeTab === 'Created' ? createdPins : savedPins} />
                  
                  {/* Delete overlay for own pins */}
                  {activeTab === 'Created' && (
                    <div className="absolute top-0 right-0 pointer-events-none">
                      {/* Note: This is a bit tricky with MasonryGrid, usually we'd add it to PinCard */}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-medium">Nothing to show yet! Pins you {activeTab.toLowerCase()} will live here.</p>
                  <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors">
                    Find ideas
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CUSTOM CONFIRMATION MODAL FOR PIN DELETION */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ show: false, id: null })}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete this Pin?</h3>
              <p className="text-gray-500 font-medium mb-8">This will permanently remove the pin from your profile and the community feed.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeletePin}
                  className="w-full bg-red-600 text-white py-4 rounded-full font-bold text-lg hover:bg-red-700 active:scale-95 transition-all"
                >
                  Delete permanently
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                  className="w-full bg-gray-100 text-gray-800 py-4 rounded-full font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-gray-800"
          >
            <Share2 size={20} className="text-red-500" />
            Profile link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
