'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Sidebar />
      <div className="pt-24 pl-24 pr-8 md:pl-32 pb-12">
        {children}
      </div>
    </main>
  );
};

export default PageContainer;
