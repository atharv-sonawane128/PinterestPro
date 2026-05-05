'use client';

import React from 'react';
import PageContainer from '@/components/PageContainer';
import { Compass, Sparkles } from 'lucide-react';

export default function ExplorePage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto text-center py-20">
        <Compass className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Discover New Ideas</h1>
        <p className="text-gray-500 text-lg mb-8">We're curating the best content for you. Check back soon for personalized recommendations!</p>
        <div className="flex justify-center gap-4">
          <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all">
            Browse Popular
          </button>
          <button className="bg-gray-100 text-gray-800 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all">
            Trending Now
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
