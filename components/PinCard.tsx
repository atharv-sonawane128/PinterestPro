'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bookmark, Share2, MoreHorizontal, MessageSquareText, Download, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

interface PinCardProps {
  id: string;
  images: string[];
  title: string;
  description?: string;
  privateNote?: string;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
}

const PinCard = ({ id, images, title, privateNote: initialNote, author }: PinCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [privateNote, setPrivateNote] = useState(initialNote || '');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/pins/${id}/save?userId=${user.uid}`);
        const data = await res.json();
        setIsSaved(data.saved);
      } catch (error) {
        console.error("Failed to check save status:", error);
      }
    };
    checkSaveStatus();
  }, [id, user]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Please login to save pins");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/pins/${id}/save`, {
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/pin/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = images[currentImageIndex];
    link.download = `${title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="mb-6 break-inside-avoid group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={title}
            initial={{ opacity: 0.8, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.8, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full h-auto object-cover min-h-[200px]"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/pin/${id}`);
            }}
          />
        </AnimatePresence>

        {/* Carousel Indicators & Controls */}
        {images.length > 1 && isHovered && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full">
              {images.map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Overlays */}
        <div className={`absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
        
        <div className={`absolute top-4 right-4 z-10 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`${isSaved ? 'bg-black text-white' : 'bg-red-600 text-white hover:bg-red-700'} px-5 py-2.5 rounded-full font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2`}
          >
            {isSaved ? <Check size={18} /> : null}
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className={`absolute bottom-4 right-4 left-4 flex justify-between items-center z-10 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors"
            >
              <Share2 size={18} />
            </button>
            <button 
              className={`p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors ${privateNote ? 'text-blue-600' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowNoteInput(!showNoteInput);
              }}
            >
              <MessageSquareText size={18} />
            </button>
          </div>
          <button 
            onClick={handleDownload}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-colors"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Pin Info */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-black transition-colors">{title}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full" />
          <span className="text-xs text-gray-600 hover:underline">{author.name}</span>
        </div>
        
        {/* Private Note Display */}
        {privateNote && !showNoteInput && (
          <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-100 italic">
            Note: {privateNote}
          </div>
        )}

        {/* Private Note Input */}
        <AnimatePresence>
          {showNoteInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 overflow-hidden"
            >
              <textarea
                autoFocus
                className="w-full text-xs p-2 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-blue-300"
                placeholder="Add a private note..."
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setShowNoteInput(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PinCard;
