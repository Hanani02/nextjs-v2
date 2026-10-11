'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { LuArrowRight, LuSparkles, LuChevronUp, LuMonitor, LuBookOpen, LuCode } from 'react-icons/lu';
import LinkButton from '@/components/ui/LinkButton';
import InteractiveHeroCanvas from './InteractiveHeroCanvas';
import { useKeyboardControls } from './Playground/useKeyboardControls';
import PlaygroundHUD from './Playground/PlaygroundHUD';
import { INITIAL_TECH_COINS, type TechCoinItem } from './Playground/TechCoins';
import HotspotModal from './IsometricRoom/HotspotModal';
import type { HotspotType } from './IsometricRoom/Hotspots';
import type { SiteConfig } from '@/types/admin';

interface HeroSectionClientProps {
  hero: SiteConfig['hero'];
}

export default function HeroSectionClient({ hero }: HeroSectionClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Hotspot modal state
  const [activeHotspot, setActiveHotspot] = useState<HotspotType | null>(null);

  // Tech Coins tracker
  const [collectedCount, setCollectedCount] = useState(0);
  const [resetCoinsTrigger, setResetCoinsTrigger] = useState(0);

  // Active driving controls (active in Screen 1 / playground phase)
  const isPlaygroundActive = scrollProgress < 0.45;
  const { controls, setControlState, triggerReset } = useKeyboardControls(isPlaygroundActive);

  // Scroll mapping listener
  useEffect(() => {
    let animationFrameId: number;

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) {
        setScrollProgress(0);
      } else {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
        setScrollProgress(progress);
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollProgress();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCoinCollected = useCallback((coin: TechCoinItem, total: number) => {
    setCollectedCount(total);
    toast.success(`Dapat ${coin.name}! ⚡`, { id: `coin-${coin.id}` });
  }, []);

  const handleRespawnCoins = useCallback(() => {
    setCollectedCount(0);
    setResetCoinsTrigger((prev) => prev + 1);
    toast.success('Semua Tech Gems di-respawn! 💎', { id: 'coin-respawn' });
  }, []);

  const handleSelectHotspot = useCallback((type: HotspotType) => {
    setActiveHotspot(type);
  }, []);

  const handleScrollToTopPlayground = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Visibility states
  const showPlaygroundHUD = scrollProgress <= 0.42;
  const showHeroContent = scrollProgress >= 0.52;

  return (
    <div
      ref={containerRef}
      id="home"
      className="relative w-full h-[220vh] bg-[#080614]"
    >
      {/* ─────────────────────────────────────────────────────────────
          STICKY FULLSCREEN VIEWPORT (Fixed 3D Canvas + Overlays)
      ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/15 blur-[140px] pointer-events-none -z-10" />

        {/* ─────────────────────────────────────────────────────────────
            SINGLE UNIFIED 3D CANVAS (Playground + RC Car + Room)
        ───────────────────────────────────────────────────────────── */}
        <div className="absolute inset-0 z-10">
          <InteractiveHeroCanvas
            scrollProgress={scrollProgress}
            controls={controls}
            onSelectHotspot={handleSelectHotspot}
            profileImage={hero.profileImage}
            onCoinCollected={handleCoinCollected}
            resetCoinsTrigger={resetCoinsTrigger}
            className="w-full h-full"
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SCREEN 1: PRE-HERO PLAYGROUND HUD (0% - 40% Scroll)
        ───────────────────────────────────────────────────────────── */}
        <PlaygroundHUD
          controls={controls}
          collectedCount={collectedCount}
          totalCoins={INITIAL_TECH_COINS.length}
          onResetCar={triggerReset}
          onRespawnCoins={handleRespawnCoins}
          onSetControl={setControlState}
          visible={showPlaygroundHUD}
        />

        {/* ─────────────────────────────────────────────────────────────
            SCREEN 2: HERO SECTION TEXT OVERLAY (60% - 100% Scroll)
        ───────────────────────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 z-20 pointer-events-none flex items-center transition-all duration-700 ease-out ${
            showHeroContent
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12 pointer-events-none'
          }`}
        >
          <div className="w-[92%] lg:w-[88%] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Text Content */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-5 sm:space-y-6 pointer-events-auto bg-neutral-950/70 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 sm:p-8 lg:p-0 rounded-3xl border border-cyan-500/20 lg:border-none shadow-2xl lg:shadow-none">
              {/* Roles Badge & Live status */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  {hero.roles || 'Fullstack & Web Developer'}
                </span>

                <button
                  onClick={handleScrollToTopPlayground}
                  title="Scroll kembali ke RC Car Playground"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface/70 hover:bg-neutral-900 border border-border/80 hover:border-cyan-400 text-[11px] font-semibold text-gray-400 hover:text-cyan-300 transition backdrop-blur-md cursor-pointer"
                >
                  <LuChevronUp className="w-3.5 h-3.5" />
                  <span>Main RC Car Lagi</span>
                </button>
              </div>

              {/* Greeting & Headline */}
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-medium text-gray-300/90">
                  {hero.greeting || "Halo, saya Hanan 👋"}
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.12]">
                  {hero.headline || 'Crafting Modern'}{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
                    {hero.headlineHighlight || 'Web Experiences'}
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg">
                {hero.description ||
                  'Software developer yang berfokus pada ekosistem web modern, performa tinggi, desain antarmuka responsif, dan rekayasa fullstack dengan Next.js, React, serta Three.js.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <LinkButton
                  text={hero.ctaContactText || 'Hubungi Saya'}
                  href="#contact"
                  rounded
                  icon={LuArrowRight}
                />
                <LinkButton
                  text={hero.ctaProjectsText || 'Lihat Proyek'}
                  href="#projects"
                  rounded
                  variant="outline"
                />
              </div>

              {/* 3D Hotspot Quick Jump Pills */}
              <div className="pt-2 border-t border-border/40">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Jelajahi Workspace 3D:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectHotspot('about')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-cyan-500/30 hover:border-cyan-400 text-xs text-cyan-300 font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <LuMonitor className="w-3.5 h-3.5" />
                    <span>Workstation</span>
                  </button>
                  <button
                    onClick={() => handleSelectHotspot('tech')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-500/30 hover:border-purple-400 text-xs text-purple-300 font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <LuBookOpen className="w-3.5 h-3.5" />
                    <span>Tech Shelf</span>
                  </button>
                  <button
                    onClick={() => handleSelectHotspot('projects')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-blue-500/30 hover:border-blue-400 text-xs text-blue-300 font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <LuCode className="w-3.5 h-3.5" />
                    <span>Showcase</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Left clear to view & interact with the 3D Isometric Developer Room */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 h-full items-center justify-end pointer-events-none">
              <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-neutral-950/60 border border-cyan-500/30 backdrop-blur-md text-[11px] font-semibold text-gray-300 flex items-center gap-2 shadow-lg">
                <LuSparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin duration-3000" />
                <span>Klik Pin Melayang pada Ruangan 3D untuk Detail</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            HOTSPOT DETAIL POPUP / MODAL
        ───────────────────────────────────────────────────────────── */}
        <HotspotModal
          type={activeHotspot}
          onClose={() => setActiveHotspot(null)}
        />
      </div>
    </div>
  );
}
