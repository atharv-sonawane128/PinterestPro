'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import { Plus, Lock, LayoutGrid, Loader2, Search, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const BoardCard = ({ board }: { board: any }) => {
  const coverImages = board.pins?.slice(0, 3).map((p: any) => p.images[0]) || [];
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden mb-3 grid grid-cols-3 gap-0.5">
        {coverImages.length > 0 ? (
          <>
            <div className="col-span-2 h-full">
              <img src={coverImages[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-0.5 h-full">
              <div className="flex-1 bg-gray-200">
                {coverImages[1] && <img src={coverImages[1]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 bg-gray-300">
                {coverImages[2] && <img src={coverImages[2]} alt="" className="w-full h-full object-cover" />}
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-3 flex items-center justify-center bg-gray-100">
            <LayoutGrid className="text-gray-300" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {board.name}
            {board.isPrivate && <Lock size={14} className="text-gray-500" />}
          </h3>
          <p className="text-sm text-gray-500">{board.pins?.length || 0} Pins</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const fetchBoards = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/boards?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBoards(data);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !user?.email) return;

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBoardName,
          userEmail: user.email,
          isPrivate
        })
      });
      if (res.ok) {
        setShowModal(false);
        setNewBoardName('');
        setIsPrivate(false);
        fetchBoards();
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchBoards();
    }
  }, [user, authLoading]);

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your Boards</h1>
          <p className="text-gray-500 mt-1">Organize your inspirations into collections</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Create Board
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading || authLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="animate-spin text-red-600 w-10 h-10" />
            <p className="text-gray-500 font-medium">Loading your collections...</p>
          </motion.div>
        ) : !user ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
          >
            <Lock className="mx-auto text-gray-300 w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Please login to see your boards</h3>
            <p className="text-gray-500 mt-2 mb-6">Your private collections will appear here.</p>
          </motion.div>
        ) : boards.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {boards.map((board: any) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
          >
            <LayoutGrid className="mx-auto text-gray-300 w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No boards yet</h3>
            <p className="text-gray-500 mt-2">Start organizing your ideas by creating your first board!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Board Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Create board</h2>
              <form onSubmit={handleCreateBoard} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    placeholder='Like "Places to Go" or "Recipes"'
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <input 
                    type="checkbox" 
                    id="private"
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <label htmlFor="private" className="cursor-pointer">
                    <span className="block font-bold text-gray-800">Keep this board secret</span>
                    <span className="block text-xs text-gray-500">Only you can see this board.</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg active:scale-95"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
