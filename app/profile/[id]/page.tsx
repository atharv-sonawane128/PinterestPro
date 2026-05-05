'use client';

import React, { useState, useEffect, use } from 'react';
import PageContainer from '@/components/PageContainer';
import MasonryGrid from '@/components/MasonryGrid';
import { useAuth } from '@/context/AuthContext';
import { Share2, Plus, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [createdPins, setCreatedPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch User Info
      const userRes = await fetch(`/api/users/${params.id}`);
      if (!userRes.ok) throw new Error("User not found");
      const userData = await userRes.json();
      setProfileUser(userData);
      
      if (currentUser) {
        setIsFollowing(userData.followers?.includes(currentUser.uid));
      }

      // Fetch Created Pins
      const createdRes = await fetch(`/api/pins?authorId=${params.id}`);
      const createdData = await createdRes.json();
      setCreatedPins(createdData);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [params.id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      alert("Please login to follow users");
      return;
    }
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/user/${params.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerUid: currentUser.uid })
      });
      const data = await res.json();
      setIsFollowing(data.following);
      // Refresh user data for counts
      const updatedUserRes = await fetch(`/api/users/${params.id}`);
      const updatedUserData = await updatedUserRes.json();
      setProfileUser(updatedUserData);
    } catch (error) {
      console.error("Follow failed:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${params.id}`;
    navigator.clipboard.writeText(url);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-red-600 w-12 h-12" />
    </div>
  );

  if (!profileUser) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">User not found</h2>
    </div>
  );

  return (
    <PageContainer>
      <div className="flex flex-col items-center mt-10 mb-16 text-center">
        <img 
          src={profileUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
          className="w-32 h-32 rounded-full shadow-2xl border-4 border-white mb-6" 
          alt="Profile" 
        />
        <h1 className="text-4xl font-black text-gray-900 mb-1">{profileUser.name}</h1>
        <p className="text-gray-500 font-medium mb-6">@{profileUser.email?.split('@')[0]}</p>
        
        <div className="flex items-center gap-6 mb-10">
          <div className="flex flex-col">
            <span className="font-black text-xl text-gray-900">{profileUser.followers?.length || 0}</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Followers</span>
          </div>
          <div className="flex flex-col border-l border-gray-100 pl-6">
            <span className="font-black text-xl text-gray-900">{profileUser.following?.length || 0}</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Following</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser?.uid !== params.id && (
            <button 
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 ${
                isFollowing 
                ? 'bg-gray-900 text-white hover:bg-black' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-100'
              }`}
            >
              {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          <button 
            onClick={handleShare}
            className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-bold text-xl text-gray-800 mb-8 text-center">Pins created by {profileUser.name}</h3>
        <MasonryGrid pins={createdPins} />
      </div>

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
