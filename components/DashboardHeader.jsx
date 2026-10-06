"use client";

import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { Volume2, VolumeX } from 'lucide-react';
import { isAudioMuted, toggleAudioMuted } from '@/lib/audio';

export default function DashboardHeader({ children, actions }) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isAudioMuted());
    const handler = (e) => setMuted(!!e.detail?.muted);
    window.addEventListener('vqt-audio-mute-changed', handler);
    return () => window.removeEventListener('vqt-audio-mute-changed', handler);
  }, []);

  return (
    <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] shadow-sm sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {children}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <button
              type="button"
              onClick={() => toggleAudioMuted()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={muted ? "Unmute message sounds" : "Mute message sounds"}
              aria-label={muted ? "Unmute message sounds" : "Mute message sounds"}
            >
              {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

