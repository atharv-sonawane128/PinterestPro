'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface SavedContextType {
  savedPinIds: Set<string>;
  toggleSave: (pinId: string) => Promise<boolean>;
  isPinSaved: (pinId: string) => boolean;
  refreshSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [savedPinIds, setSavedPinIds] = useState<Set<string>>(new Set());

  const fetchSavedIds = async () => {
    if (!user) {
      setSavedPinIds(new Set());
      return;
    }
    try {
      // We'll create a new lightweight API for just IDs if needed, 
      // but for now we'll fetch from the user's saved collection
      const res = await fetch(`/api/user/${user.uid}/saved-ids`);
      if (res.ok) {
        const ids = await res.json();
        setSavedPinIds(new Set(ids));
      }
    } catch (error) {
      console.error("Failed to fetch saved IDs:", error);
    }
  };

  useEffect(() => {
    fetchSavedIds();
  }, [user]);

  const toggleSave = async (pinId: string): Promise<boolean> => {
    if (!user) return false;

    // Optimistic Update
    const newSaved = new Set(savedPinIds);
    const wasSaved = newSaved.has(pinId);
    if (wasSaved) newSaved.delete(pinId);
    else newSaved.add(pinId);
    setSavedPinIds(newSaved);

    try {
      const res = await fetch(`/api/pins/${pinId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const data = await res.json();
      
      // Sync with server response
      const syncSaved = new Set(savedPinIds);
      if (data.saved) syncSaved.add(pinId);
      else syncSaved.delete(pinId);
      setSavedPinIds(syncSaved);
      
      return data.saved;
    } catch (error) {
      console.error("Toggle save failed:", error);
      // Revert on error
      const revertSaved = new Set(savedPinIds);
      if (wasSaved) revertSaved.add(pinId);
      else revertSaved.delete(pinId);
      setSavedPinIds(revertSaved);
      return wasSaved;
    }
  };

  const isPinSaved = (pinId: string) => savedPinIds.has(pinId);

  return (
    <SavedContext.Provider value={{ savedPinIds, toggleSave, isPinSaved, refreshSaved: fetchSavedIds }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (context === undefined) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};
