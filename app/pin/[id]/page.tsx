'use client';

import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import MasonryGrid from '@/components/MasonryGrid';
import { Heart, MessageSquare, Share2, MoreHorizontal, ArrowLeft, ChevronDown, Smile, StickyNote, Image as ImageIcon, Sparkles, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function PinDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { user } = useAuth();
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
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [showBoardPicker, setShowBoardPicker] = useState(false);

  const fetchBoards = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/boards?email=${user.email}`);
      const data = await res.json();
      setBoards(data);
      if (data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
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
        setIsSaved(true);
        setShowBoardPicker(false);
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
      const res = await fetch(`/api/pins/${params.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await res.json();
      setIsSaved(data.saved);
    } catch (error) {
      console.error("Failed to save pin:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!user || !params.id) return;
      try {
        const res = await fetch(`/api/pins/${params.id}/save?userId=${user.uid}`);
        const data = await res.json();
        setIsSaved(data.saved);
      } catch (error) {
        console.error("Failed to check save status:", error);
      }
    };
    checkSaveStatus();
  }, [params.id, user]);

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
                <div className="flex gap-4">
                  <button 
                    onClick={handleLike}
                    className={`p-3 rounded-full hover:bg-gray-100 transition-all flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-700'}`}
                  >
                    <Heart size={24} fill={liked ? "currentColor" : "none"} />
                    {likesCount > 0 && <span className="font-bold text-sm">{likesCount}</span>}
                  </button>
                  <button className="p-3 hover:bg-gray-100 rounded-full transition-all">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative">
                {/* Desktop View: Profile and Save */}
                <div className="flex items-center gap-2 relative">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition-all"
                    onClick={() => setShowBoardPicker(!showBoardPicker)}
                  >
                    <span className="font-bold text-gray-800">
                      {boards.find(b => b._id === selectedBoardId)?.name || "Select Board"}
                    </span>
                    <ChevronDown size={16} />
                  </div>

                  {showBoardPicker && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-4 animate-in slide-in-from-top-2 duration-200">
                      <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Save to board</p>
                      <div className="max-h-60 overflow-y-auto no-scrollbar">
                        {boards.length > 0 ? boards.map(board => (
                          <div 
                            key={board._id}
                            onClick={() => {
                              setSelectedBoardId(board._id);
                              setShowBoardPicker(false);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer group"
                          >
                            <span className="font-semibold text-gray-700">{board.name}</span>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-white flex items-center justify-center">
                              {board.isPrivate && <X size={12} className="text-gray-400" />}
                            </div>
                          </div>
                        )) : (
                          <p className="px-4 py-2 text-sm text-gray-500">No boards yet.</p>
                        )}
                      </div>
                      <div className="border-t border-gray-50 mt-2 pt-2 px-2">
                        <button 
                          onClick={async () => {
                            const name = prompt("Enter board name:");
                            if (name) {
                              const res = await fetch('/api/boards', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, userEmail: user?.email })
                              });
                              if (res.ok) fetchBoards();
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors font-bold text-gray-800"
                        >
                          <Plus size={18} /> Create board
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => selectedBoardId ? saveToBoard(selectedBoardId) : handleSave()}
                    disabled={saving}
                    className={`${isSaved ? 'bg-black text-white' : 'bg-red-600 text-white hover:bg-red-700'} px-10 py-3.5 rounded-full font-bold shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center gap-2`}
                  >
                    {isSaved ? <Check size={20} /> : null}
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
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in zoom-in duration-200">
                        <div className="md:hidden border-b border-gray-50 mb-1">
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 font-bold flex items-center justify-between">
                            Profile <ChevronDown size={14} />
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold">
                            Save Pin
                          </button>
                        </div>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 transition-colors">Share</button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 transition-colors">Edit Pin</button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 transition-colors">Report</button>
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
    </PageContainer>
  );
}
