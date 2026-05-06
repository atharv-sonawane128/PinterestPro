'use client';

import React, { useState, useRef } from 'react';
import PageContainer from '@/components/PageContainer';
import { Image as ImageIcon, Plus, X, Upload, ChevronDown, ChevronUp, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function CreatePinPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('Design');
  const [privateNote, setPrivateNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0 || !title) {
      alert("Please add at least one image and a title.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images to Firebase Storage first to avoid 413 error
      const imageUrls = await Promise.all(
        images.map(async (base64, index) => {
          // If it's already a URL (e.g. from a retry), skip upload
          if (base64.startsWith('http')) return base64;

          const storageRef = ref(storage, `pins/${user?.uid || 'anon'}/${Date.now()}-${index}.jpg`);
          await uploadString(storageRef, base64, 'data_url');
          return await getDownloadURL(storageRef);
        })
      );

      // 2. Send the URLs to your database
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          images: imageUrls,
          link,
          category,
          privateNote,
          author: {
            name: user?.displayName || "Anonymous",
            avatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            id: user?.uid || "anonymous"
          }
        }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.error || 'Server error'}`);
      }
    } catch (error: any) {
      console.error("Failed to create pin:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">Create Pin</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-full font-bold hover:bg-gray-100 transition-colors text-sm md:text-base border border-gray-100 sm:border-none"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-red-600 text-white px-8 md:px-10 py-2.5 md:py-3 rounded-full font-bold hover:bg-red-700 shadow-lg shadow-red-100 active:scale-95 transition-all disabled:opacity-50 text-sm md:text-base"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]">
          {/* UPLOAD SECTION */}
          <div className="w-full md:w-[45%] bg-gray-50/50 p-8 flex flex-col border-r border-gray-100">
            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[300px] border-4 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 md:gap-6 p-4 cursor-pointer hover:border-red-200 hover:bg-red-50/30 transition-all group text-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                  <Upload size={28} className="md:w-8 md:h-8" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-base md:text-lg px-2">Click to upload or drag and drop</p>
                  <p className="text-[10px] md:text-sm text-gray-400 mt-2 max-w-[200px] md:max-w-none mx-auto">Recommendation: Use high-quality .jpg files less than 20MB</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  className="hidden"
                  accept="image/*"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6">
                <div className="relative aspect-[3/4] w-full bg-white rounded-[2rem] shadow-xl overflow-hidden group">
                  <img src={images[0]} className="w-full h-full object-cover" alt="Preview" />
                  <button
                    onClick={() => removeImage(0)}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Carousel Preview (if multi-image) */}
                {images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {images.slice(1).map((img, i) => (
                      <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-md group">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button
                          onClick={() => removeImage(i + 1)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-400 transition-all"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  className="hidden"
                  accept="image/*"
                />
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Sparkles className="text-blue-500" size={20} />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                <span className="font-bold">Pro Tip:</span> Pins with high-quality images and descriptive titles get 3x more engagement.
              </p>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="flex-1 p-6 sm:p-10 md:p-14 flex flex-col gap-8 md:gap-10">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Add your title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl md:text-4xl font-black border-b-2 border-transparent focus:border-gray-200 outline-none placeholder:text-gray-200 pb-2 transition-all"
              />
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-gray-50">
              <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} className="w-10 h-10 rounded-full" alt="" />
              <span className="font-bold text-gray-800">{user?.displayName || "Creative User"}</span>
            </div>

            <div className="space-y-2">
              <textarea
                placeholder="Tell everyone what your Pin is about"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-lg border-b-2 border-transparent focus:border-gray-200 outline-none placeholder:text-gray-300 resize-none transition-all pb-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Lock size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Private Note (Only you can see this)</span>
              </div>
              <input
                type="text"
                placeholder="Why are you saving this? (e.g. Reference for hike)"
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                className="w-full text-base bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 outline-none placeholder:text-yellow-200 focus:bg-yellow-50 transition-all italic"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-auto">
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Link</span>
                <input
                  type="text"
                  placeholder="Add a destination link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full py-3 border-b-2 border-gray-100 focus:border-black outline-none placeholder:text-gray-200 transition-all"
                />
              </div>
              <div className="w-full md:w-48 space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</span>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-3 bg-white border-b-2 border-gray-100 outline-none appearance-none font-bold text-gray-700 cursor-pointer focus:border-black transition-all"
                  >
                    <option>Design</option>
                    <option>Art</option>
                    <option>Travel</option>
                    <option>Tech</option>
                    <option>Home</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
