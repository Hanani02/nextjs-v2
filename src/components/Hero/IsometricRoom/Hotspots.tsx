'use client';

import { Html } from '@react-three/drei';
import { useState } from 'react';

export type HotspotType = 'projects' | 'about' | 'tech';

interface HotspotProps {
  position: [number, number, number];
  title: string;
  subtitle?: string;
  type: HotspotType;
  onSelect: (type: HotspotType) => void;
}

function HotspotMarker({ position, title, subtitle, type, onSelect }: HotspotProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Html position={position} center distanceFactor={18} zIndexRange={[100, 0]}>
      <div
        className="group relative flex items-center select-none cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(type);
        }}
      >
        {/* Compact Pulsing Pin Dot */}
        <div className="relative flex items-center justify-center w-4 h-4 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex items-center justify-center rounded-full h-2.5 w-2.5 bg-cyan-400 border border-white shadow-[0_0_8px_rgba(34,211,238,0.9)]">
            <span className="w-0.5 h-0.5 rounded-full bg-white" />
          </span>
        </div>

        {/* Small Sleek Floating Label Pill */}
        <div className="flex flex-col bg-neutral-950/85 hover:bg-neutral-900/95 border border-cyan-400/40 hover:border-cyan-400 backdrop-blur-md px-2 py-0.5 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.5),0_0_10px_rgba(6,182,212,0.25)] transition-all duration-200">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-white tracking-tight">
              {title}
            </span>
            <span className="text-[9px] text-cyan-300 font-bold opacity-80 group-hover:opacity-100">
              ↗
            </span>
          </div>
          {hovered && subtitle && (
            <span className="text-[9px] text-gray-300 whitespace-nowrap pt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </Html>
  );
}

interface HotspotsProps {
  onSelect: (type: HotspotType) => void;
}

export default function Hotspots({ onSelect }: HotspotsProps) {
  return (
    <>
      {/* 1. Projects Hotspot (On the Left Wall Bookshelf / Rak Buku) */}
      <HotspotMarker
        position={[-3.1, 4.2, -0.6]}
        title="Projects"
        subtitle="Rak Buku • Klik untuk lihat proyek"
        type="projects"
        onSelect={onSelect}
      />

      {/* 2. About Me Hotspot (On the Desk / Center Workspace) */}
      <HotspotMarker
        position={[-0.6, 2.5, -0.6]}
        title="About Me"
        subtitle="Workspace • Klik untuk profil"
        type="about"
        onSelect={onSelect}
      />

      {/* 3. Tech Stack Hotspot (On the Upper Right Wall Shelf) */}
      <HotspotMarker
        position={[2.0, 4.6, -3.2]}
        title="Tech Stack"
        subtitle="Tech Shelf • Klik untuk keahlian"
        type="tech"
        onSelect={onSelect}
      />
    </>
  );
}
