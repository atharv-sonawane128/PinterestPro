'use client';

import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import MasonryGrid from '@/components/MasonryGrid';
import { Heart, MessageSquare, Share2, MoreHorizontal, ArrowLeft, ChevronDown, Smile, StickyNote, Image as ImageIcon, Sparkles, Search, X, Check, Plus, Lock, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSaved } from '@/context/SavedContext';

export default function PinDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { user } = useAuth();
  const { isPinSaved, toggleSave, refreshSaved } = useSaved();
  const [pin, setPin] = useState<any>(null);
  const [relatedPins, setRelatedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
  const isSaved = isPinSaved(params.id);
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [newBoardData, setNewBoardData] = useState({ name: '', isPrivate: false });
  const [showToast, setShowToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  const fetchBoards = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/boards?email=${user.email}`);
      const data = await res.json();
      setBoards(data);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardData.name.trim() || !user) return;
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newBoardData.name, 
          isPrivate: newBoardData.isPrivate,
          userEmail: user.email,
          userId: user.uid 
        })
      });
      if (res.ok) {
        fetchBoards();
        setShowCreateBoardModal(false);
        setNewBoardData({ name: '', isPrivate: false });
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  useEffect(() => {
    if (user) fetchBoards();
  }, [user]);

  const saveToBoard = async (boardId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/add-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId: params.id })
      });
      if (res.ok) {
        setShowBoardPicker(false);
        // Refresh boards to get updated pin lists
        fetchBoards();
      }
    } catch (error) {
      console.error("Failed to save to board:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (pin && user) {
      setLiked(pin.likes?.includes(user.uid) || false);
      setLikesCount(pin.likes?.length || 0);
    }
  }, [pin, user]);

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like pins");
      return;
    }
    
    // Optimistic UI
    const prevLiked = liked;
    setLiked(!liked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/pins/${params.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likes.length);
    } catch (error) {
      console.error("Failed to like pin:", error);
      // Revert on error
      setLiked(prevLiked);
      setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please login to save pins");
      return;
    }
    setSaving(true);
    try {
      await toggleSave(params.id);
    } finally {
      setSaving(false);
    }
  };

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handlePinShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    triggerToast("Pin link copied to clipboard!");
    setShowMoreMenu(false);
  };

  useEffect(() => {
    refreshSaved();
  }, [params.id, user]);

  // Derived state: Is pin in the currently selected board?
  const isInSelectedBoard = selectedBoardId && boards.length > 0 && boards.find(b => b._id === selectedBoardId)?.pins.some((p: any) => (p._id || p).toString() === params.id);

  const EMOJIS = ['❤️', '😂', '🔥', '👏', '😍', '✨', '🙌', '💯', '🤔', '🎉', '🌟', '🌈', '🍕', '🍔', '🎈', '🎨'];
  const DEMO_GIFS = [
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndzZqcHgzZnc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx4ZK8fL05O/giphy.gif', tags: 'happy' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndzZqcHgzZnc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0ExkOvh7qBnrgSg8/giphy.gif', tags: 'love' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndzZqcHgzZnc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26gsjCZpPolPr3sBy/giphy.gif', tags: 'party' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndzZqcHgzZnc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6Znc5Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKSj0Ew5D6D5uoc/giphy.gif', tags: 'sad' },
  ];

  const filteredGifs = DEMO_GIFS.filter(gif => 
    gif.tags.toLowerCase().includes(gifSearch.toLowerCase()) || gifSearch === ''
  );

  const addEmoji = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  const addGif = async (gifUrl: string) => {
    if (!user) return;
    setIsPosting(true);
    try {
      const response = await fetch(`/api/pins/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gifUrl,
          content: '',
          author: {
            name: user.displayName || "User",
            avatar: user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            id: user.uid
          }
        }),
      });

      if (response.ok) {
        setShowGifPicker(false);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to post GIF:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const deleteComment = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await fetch(`/api/pins/${params.id}/comments/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchComments();
        setDeleteConfirm({ show: false, id: null });
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/pins/${params.id}/comments`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    const fetchPinData = async () => {
      try {
        const pinRes = await fetch(`/api/pins/${params.id}`);
        if (!pinRes.ok) throw new Error('Not found');
        const pinData = await pinRes.json();
        setPin(pinData);

        const relatedRes = await fetch(`/api/pins?category=${pinData.category || 'All'}`);
        const relatedData = await relatedRes.json();
        setRelatedPins(relatedData.filter((p: any) => p._id !== params.id));
        
        fetchComments();
      } catch (error) {
        console.error("Failed to fetch pin details:", error);
        setPin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPinData();

    // Real-time: Refresh when window regained focus
    const handleFocus = () => fetchPinData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [params.id]);

  const handlePostComment = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newComment.trim() && !isPosting && user) {
      setIsPosting(true);
      try {
        const response = await fetch(`/api/pins/${params.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newComment,
            author: {
              name: user.displayName || "User",
              avatar: user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
              id: user.uid
            }
          }),
        });

        if (response.ok) {
          setNewComment('');
          fetchComments();
        }
      } catch (error) {
        console.error("Failed to post comment:", error);
      } finally {
        setIsPosting(false);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex flex-col lg:flex-row gap-6 px-2 md:px-4">
        {/* LEFT COLUMN: Main Pin Card */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <div className="flex items-center gap-1 md:gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <div className="hidden md:flex gap-4">
                  <button 
                    onClick={handleLike}
                    className={`p-3 rounded-full hover:bg-gray-100 transition-all flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-700'}`}
                  >
                    <Heart size={24} fill={liked ? "currentColor" : "none"} />
                    {likesCount > 0 && <span className="font-bold text-sm">{likesCount}</span>}
                  </button>
                  <button className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-700">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative">
                {/* Desktop View: Board and Save */}
                <div className="hidden md:flex items-center gap-2 relative">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 px-3 rounded-xl transition-all"
                    onClick={() => setShowBoardPicker(!showBoardPicker)}
                  >
                    <span className="font-bold text-gray-800">
                      {selectedBoardId ? (boards.find(b => b._id === selectedBoardId)?.name) : "Add to board"}
                    </span>
                    {isInSelectedBoard && <Check size={16} className="text-red-600" />}
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>

                  {showBoardPicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBoardPicker(false);
                        }}
                      />
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 py-4 animate-in slide-in-from-top-2 duration-200">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Save to board</p>
                        <div className="max-h-80 overflow-y-auto no-scrollbar">
                          {boards.length > 0 ? boards.map(board => (
                            <div 
                              key={board._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBoardId(board._id);
                                saveToBoard(board._id);
                              }}
                              className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer group transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-50">
                                  {board.pins && board.pins.length > 0 ? (
                                    <img 
                                      src={board.pins[0].images?.[0] || board.pins[0].imageUrl} 
                                      className="w-full h-full object-cover" 
                                      alt="" 
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                                      <LayoutGrid size={16} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <span className="font-bold text-gray-700">{board.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {board.isPrivate && <Lock size={14} className="text-gray-400" />}
                                {board.pins?.some((p: any) => (p._id || p).toString() === params.id) && (
                                  <Check size={18} className="text-red-600" />
                                )}
                              </div>
                            </div>
                          )) : (
                            <div className="px-6 py-8 text-center">
                              <p className="text-sm text-gray-500 mb-4">No boards yet.</p>
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-50 mt-2 pt-2 px-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCreateBoardModal(true);
                              setShowBoardPicker(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-3 hover:bg-gray-100 rounded-2xl transition-colors font-bold text-gray-800"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Plus size={18} />
                            </div>
                            Create board
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`${isSaved ? 'bg-black text-white' : 'bg-red-600 text-white hover:bg-red-700'} px-10 py-3.5 rounded-full font-bold shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center gap-2`}
                  >
                    {isSaved ? <Check size={20} /> : null}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Mobile View: Save only */}
                <div className="md:hidden">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`${isSaved ? 'bg-black text-white' : 'bg-red-600 text-white hover:bg-red-700'} px-6 py-2.5 rounded-full font-bold shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center gap-2`}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* Mobile View: More menu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreHorizontal size={20} className="text-gray-700" />
                  </button>
                  {/* Dropdown with state control */}
                  {showMoreMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMoreMenu(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-3xl shadow-2xl py-3 z-20 animate-in fade-in zoom-in duration-200">
                        <div className="md:hidden border-b border-gray-100 pb-2 mb-2">
                          <button 
                            onClick={handleLike}
                            className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 font-bold flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Heart size={20} className={liked ? 'text-red-500' : 'text-gray-400'} fill={liked ? 'currentColor' : 'none'} />
                              {liked ? 'Liked' : 'Like'}
                            </div>
                            {likesCount > 0 && <span className="text-xs text-gray-400">{likesCount}</span>}
                          </button>
                          <button 
                            onClick={handlePinShare}
                            className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 font-bold flex items-center gap-3"
                          >
                            <Share2 size={20} className="text-gray-400" />
                            Share
                          </button>
                          <button 
                            onClick={() => {
                              setShowBoardPicker(true);
                              setShowMoreMenu(false);
                            }}
                            className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 font-bold flex items-center gap-3"
                          >
                            <LayoutGrid size={20} className="text-gray-400" />
                            {selectedBoardId ? (boards.find(b => b._id === selectedBoardId)?.name) : "Add to board"}
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            triggerToast("Edit coming soon!");
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-gray-50 text-gray-800 transition-colors font-medium"
                        >
                          Edit Pin
                        </button>
                        <button 
                          onClick={() => {
                            triggerToast("Pin reported. Thank you!");
                            setShowMoreMenu(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-gray-50 text-red-600 transition-colors font-medium"
                        >
                          Report Pin
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Area */}
            <div className="bg-[#fff9c4]/10 p-6 flex flex-col items-center">
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={pin?.images?.[0] || undefined} 
                className="max-w-full h-auto rounded-xl shadow-sm"
                alt={pin?.title}
              />
              {/* Scan Icon like in image */}
              <div className="mt-4 self-end">
                <div className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                  <Search size={18} />
                </div>
              </div>
            </div>

            {/* Author Section - NEW */}
            <div className="px-6 py-6 border-t border-gray-50 flex items-center justify-between">
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => pin?.author?.id && router.push(`/profile/${pin.author.id}`)}
              >
                <img 
                  src={pin?.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                  className="w-12 h-12 rounded-full border border-gray-100 group-hover:scale-110 transition-transform" 
                  alt={pin?.author?.name} 
                />
                <div>
                  <h4 className="font-black text-gray-900 group-hover:text-red-600 transition-colors">{pin?.author?.name || "Pinterest User"}</h4>
                  <p className="text-sm text-gray-500 font-medium">Author</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  pin?.author?.id && router.push(`/profile/${pin.author.id}`);
                }}
                className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-full font-bold text-gray-800 transition-all active:scale-95"
              >
                View Profile
              </button>
            </div>

            {/* Comments Section */}
            <div className="p-6 border-t border-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">{comments.length} comments</h3>
                <ChevronDown size={18} className="text-gray-500" />
              </div>

              {/* Real Comments */}
              <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-6 mb-6">
                {comments.length > 0 ? comments.map((comment: any) => (
                  <div key={comment._id} className="flex gap-3 group">
                    <img src={comment.author.avatar} className="w-8 h-8 rounded-full shadow-sm" alt="" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-800">
                          <span className="font-bold mr-2">{comment.author.name}</span>
                          {comment.content}
                        </p>
                        {user?.uid === comment.author.id && (
                          <button 
                            onClick={() => setDeleteConfirm({ show: true, id: comment._id })}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      
                      {comment.gifUrl && (
                        <div className="mt-2 rounded-2xl overflow-hidden shadow-sm max-w-[200px]">
                          <img src={comment.gifUrl} className="w-full h-auto" alt="Comment GIF" />
                        </div>
                      )}

                      <div className="flex gap-4 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <button className="hover:text-black transition-colors">Reply</button>
                        <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                          <Heart size={12} /> {comment.likes || 0}
                        </button>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>

              {/* Comment Input Box */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img 
                  src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                  className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" 
                  alt="" 
                />
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-red-100 focus-within:bg-white transition-all border border-transparent relative">
                  <input 
                    type="text" 
                    placeholder={user ? "Add a comment" : "Log in to comment"} 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handlePostComment}
                    disabled={!user || isPosting}
                    className="bg-transparent border-none outline-none w-full text-sm text-gray-800 placeholder-gray-500 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Smile 
                        size={18} 
                        className="text-gray-400 cursor-pointer hover:text-black transition-colors" 
                        onClick={() => {
                          setShowEmojiPicker(!showEmojiPicker);
                          setShowGifPicker(false);
                        }}
                      />
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-4 p-4 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-30 w-48 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="grid grid-cols-4 gap-3">
                            {EMOJIS.map(emoji => (
                              <button key={emoji} onClick={() => addEmoji(emoji)} className="text-2xl hover:scale-125 active:scale-95 transition-transform">{emoji}</button>
                            ))}
                          </div>
                          <div className="absolute bottom-[-10px] right-4 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100" />
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <ImageIcon 
                        size={18} 
                        className="text-gray-400 cursor-pointer hover:text-black transition-colors" 
                        onClick={() => {
                          setShowGifPicker(!showGifPicker);
                          setShowEmojiPicker(false);
                        }}
                      />
                      {showGifPicker && (
                        <div className="absolute bottom-full right-0 mb-4 p-4 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-30 w-72 h-80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 duration-300">
                          <div className="mb-4 bg-gray-50 rounded-full px-4 py-2 flex items-center gap-2 border border-gray-100 focus-within:border-red-200 transition-all">
                            <Search size={14} className="text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Search GIFs" 
                              value={gifSearch}
                              onChange={(e) => setGifSearch(e.target.value)}
                              className="bg-transparent border-none outline-none text-xs w-full"
                            />
                          </div>
                          <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-2 gap-2">
                              {filteredGifs.map((gif, i) => (
                                <img 
                                  key={i} 
                                  src={gif.url} 
                                  onClick={() => addGif(gif.url)} 
                                  className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 active:scale-95 transition-all" 
                                  alt="" 
                                />
                              ))}
                            </div>
                          </div>
                          <div className="absolute bottom-[-10px] right-4 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BELOW THE POST: Additional Grid */}
          <div className="mt-12">
            <h3 className="font-bold text-xl text-gray-800 mb-8 px-2">More like this</h3>
            <MasonryGrid pins={relatedPins} columns={{ default: 3, 1100: 2, 700: 2, 500: 1 }} />
          </div>
        </div>

        {/* RIGHT COLUMN: Related Grid */}
        <div className="hidden lg:block flex-1">
          <MasonryGrid pins={relatedPins} columns={{ default: 2, 1100: 2 }} />
        </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
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
                <X size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete comment?</h3>
              <p className="text-gray-500 font-medium mb-8">This action cannot be undone. Are you sure you want to remove this thought?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={deleteComment}
                  className="w-full bg-red-600 text-white py-4 rounded-full font-bold text-lg hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100"
                >
                  Yes, delete it
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
      {/* CREATE BOARD MODAL */}
      <AnimatePresence>
        {showCreateBoardModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateBoardModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden"
            >
              <h2 className="text-3xl font-black mb-8 text-center text-gray-900">Create board</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-3 ml-1">Name</label>
                  <input 
                    type="text" 
                    placeholder='Like "Places to Go" or "Recipes"'
                    className="w-full px-6 py-4 rounded-[1.25rem] border-2 border-gray-100 focus:border-black outline-none transition-all text-lg font-medium placeholder-gray-300"
                    value={newBoardData.name}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, name: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-4 p-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-100">
                  <input 
                    type="checkbox" 
                    id="secret-board"
                    className="w-6 h-6 rounded-md border-gray-300 text-black focus:ring-black cursor-pointer"
                    checked={newBoardData.isPrivate}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  />
                  <label htmlFor="secret-board" className="cursor-pointer">
                    <span className="block font-bold text-gray-800 text-lg">Keep this board secret</span>
                    <span className="block text-sm text-gray-500">Only you can see this board.</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    onClick={() => setShowCreateBoardModal(false)}
                    className="px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all text-gray-800"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateBoard}
                    disabled={!newBoardData.name.trim()}
                    className="bg-red-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-gray-800"
          >
            <Sparkles size={20} className="text-red-500" />
            {showToast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
