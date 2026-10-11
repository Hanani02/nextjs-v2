'use client';

import { useEffect } from 'react';
import { LuX, LuMonitor, LuBookOpen, LuCode, LuArrowRight, LuSparkles } from 'react-icons/lu';
import type { HotspotType } from './Hotspots';

interface HotspotModalProps {
  type: HotspotType | null;
  onClose: () => void;
}

interface HotspotContent {
  title: string;
  badge: string;
  icon: typeof LuMonitor;
  subtitle: string;
  description: string;
  techStack: string[];
  actionText: string;
  actionHref: string;
}

const HOTSPOT_DATA: Record<HotspotType, HotspotContent> = {
  about: {
    title: 'Workstation & Developer Setup',
    badge: 'Core Environment',
    icon: LuMonitor,
    subtitle: 'High-performance Fullstack Engineering Station',
    description:
      'Pusat kerja pengembangan aplikasi modern dengan arsitektur Next.js 16 App Router, React 19, TypeScript, dan Tailwind CSS. Dioptimalkan untuk performa tinggi, UI interaktif, dan arsitektur yang skalabel.',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Node.js', 'Vercel'],
    actionText: 'Lihat Profil & Bio',
    actionHref: '#about'
  },
  projects: {
    title: 'Showcase Proyek & Karya Nyata',
    badge: 'Production Apps',
    icon: LuCode,
    subtitle: 'Katalog Aplikasi Web & Solusi Digital',
    description:
      'Kumpulan proyek web interaktif, platform e-commerce, dashboard analitik, dan tools kustom yang dibangun dengan fokus pada user experience (UX) memukau dan clean code.',
    techStack: ['Fullstack Apps', 'E-Commerce', 'Interactive 3D', 'Supabase', 'REST / GraphQL'],
    actionText: 'Jelajahi Semua Proyek',
    actionHref: '#projects'
  },
  tech: {
    title: 'Tech Stack & Perpustakaan Digital',
    badge: 'Skills & Tools',
    icon: LuBookOpen,
    subtitle: 'Alat & Framework Pilihan',
    description:
      'Eksplorasi ekosistem teknologi yang digunakan sehari-hari, mencakup 3D graphics (Three.js/R3F), animasi fluid (GSAP/Framer Motion), database relasional (PostgreSQL/Supabase), dan modern DevOps.',
    techStack: ['Three.js', 'React Three Fiber', 'GSAP', 'Framer Motion', 'PostgreSQL', 'Docker'],
    actionText: 'Lihat Pengalaman & Keahlian',
    actionHref: '#experience'
  }
};

export default function HotspotModal({ type, onClose }: HotspotModalProps) {
  useEffect(() => {
    if (!type) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  if (!type) return null;

  const data = HOTSPOT_DATA[type];
  if (!data) return null;

  const Icon = data.icon;

  const handleAction = () => {
    onClose();
    const el = document.querySelector(data.actionHref);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-neutral-950/95 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-text backdrop-blur-2xl transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Tutup jendela info hotspot"
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center bg-surface/80 border border-border/80 text-text/70 hover:text-white hover:border-cyan-400 hover:bg-neutral-900 transition cursor-pointer"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Header with Icon and Badge */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-400 shadow-md">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                {data.badge}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <LuSparkles className="w-3 h-3 text-purple-400" /> 3D Hotspot
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {data.title}
            </h3>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-semibold text-cyan-300 mb-3">
          {data.subtitle}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-5">
          {data.description}
        </p>

        {/* Tech Stack Tags */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Teknologi & Fitur Terkait:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-xl bg-surface/80 border border-border/70 text-xs text-text/90 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>{data.actionText}</span>
            <LuArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
