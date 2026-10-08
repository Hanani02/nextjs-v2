'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { LuRotate3D } from 'react-icons/lu';
import type { HotspotType } from './Hotspots';

const IsometricRoom = dynamic(() => import('./IsometricRoom'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
      <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
      <p className="text-sm font-semibold text-text/80">Memuat Isometric 3D Room...</p>
      <p className="text-xs text-text/50 mt-1">Interactive Studio Workspace</p>
    </div>
  )
});

interface HeroRoomProps {
  profileImage?: string;
}

export default function HeroRoom({ profileImage = '/image/profil.jpeg' }: HeroRoomProps) {
  const handleSelectHotspot = useCallback((type: HotspotType) => {
    if (type === 'projects') {
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      toast.success('Navigasi ke Projects dari Rak Buku 3D! 📚', { id: 'room-nav' });
    } else if (type === 'about') {
      const el = document.getElementById('about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      toast.success('Navigasi ke Profil & About Me! 💻', { id: 'room-nav' });
    } else if (type === 'tech') {
      const el = document.getElementById('experience');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      toast.success('Navigasi ke Tech Stack & Keahlian! ⚡', { id: 'room-nav' });
    }
  }, []);

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] lg:h-[660px] xl:h-[720px] max-h-[85vh] flex items-center justify-center select-none overflow-visible">
      {/* Background Neon Atmosphere Aura */}
      <div className="absolute w-[360px] h-[360px] md:w-[520px] md:h-[520px] rounded-full bg-cyan-500/15 dark:bg-cyan-500/15 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute w-[300px] h-[300px] md:w-[460px] md:h-[460px] rounded-full bg-purple-500/15 dark:bg-purple-500/20 blur-[110px] pointer-events-none -z-10 translate-x-12 translate-y-8" />

      {/* Top Floating Badge */}
      <div className="absolute top-2 right-2 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/70 dark:bg-surface/80 border border-border/60 backdrop-blur-md shadow-md text-cyan-400 text-[10px] font-semibold tracking-wider uppercase">
        <LuRotate3D className="w-3.5 h-3.5 animate-spin duration-3000" />
        <span>Isometric 3D Room</span>
      </div>

      {/* Direct Seamless 3D Canvas Area */}
      <div className="relative w-full h-full flex items-center justify-center overflow-visible">
        <IsometricRoom
          profileImage={profileImage}
          onSelectHotspot={handleSelectHotspot}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
