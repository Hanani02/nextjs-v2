'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SiHtml5,
  SiTypescript,
  SiReact,
  SiTailwindcss,
  SiNextdotjs,
} from 'react-icons/si';
import { LuSparkles, LuZap, LuCode } from 'react-icons/lu';
import { useTheme } from '@/context/ThemeContext';
import { playTabClickSound } from '@/lib/circuitAudio';

export interface SplashScreenProps {
  onFinish?: () => void;
}

const SESSION_KEY = 'hasVisited';
const NUM_SHUTTERS = 10;

interface TechCharacter {
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  badgeBgDark: string;
  badgeBgLight: string;
  badgeBorder: string;
  message: string;
  face: string;
  threshold: number;
}

const TECH_STACK: TechCharacter[] = [
  {
    name: 'HTML5',
    icon: SiHtml5,
    color: '#E34F26',
    badgeBgDark: 'rgba(227, 79, 38, 0.15)',
    badgeBgLight: 'rgba(227, 79, 38, 0.12)',
    badgeBorder: 'rgba(227, 79, 38, 0.4)',
    message: 'Menata kerangka HTML5...',
    face: '( •̀ᴗ•́ )و',
    threshold: 20,
  },
  {
    name: 'TypeScript',
    icon: SiTypescript,
    color: '#3178C6',
    badgeBgDark: 'rgba(49, 120, 198, 0.15)',
    badgeBgLight: 'rgba(49, 120, 198, 0.12)',
    badgeBorder: 'rgba(49, 120, 198, 0.4)',
    message: 'Memeriksa tipe TypeScript...',
    face: '( ˘ ³˘)♥',
    threshold: 40,
  },
  {
    name: 'React',
    icon: SiReact,
    color: '#06B6D4',
    badgeBgDark: 'rgba(6, 182, 212, 0.15)',
    badgeBgLight: 'rgba(6, 182, 212, 0.12)',
    badgeBorder: 'rgba(6, 182, 212, 0.4)',
    message: 'Merakit komponen React...',
    face: '( ˶ˆᗜˆ˵ )',
    threshold: 60,
  },
  {
    name: 'Tailwind CSS',
    icon: SiTailwindcss,
    color: '#38BDF8',
    badgeBgDark: 'rgba(56, 189, 248, 0.15)',
    badgeBgLight: 'rgba(56, 189, 248, 0.12)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
    message: 'Memoles styling Tailwind CSS...',
    face: '(✧ω✧)',
    threshold: 80,
  },
  {
    name: 'Next.js',
    icon: SiNextdotjs,
    color: '#3B82F6',
    badgeBgDark: 'rgba(59, 130, 246, 0.15)',
    badgeBgLight: 'rgba(59, 130, 246, 0.12)',
    badgeBorder: 'rgba(59, 130, 246, 0.4)',
    message: 'Menyalakan Next.js engine...',
    face: '( ◕‿◕ )✨',
    threshold: 100,
  },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [collectedIndices, setCollectedIndices] = useState<number[]>([]);
  const [clickCount, setClickCount] = useState(0);

  // Track current character based on progress
  const activeCharIndex = Math.min(
    Math.floor((progress / 100) * TECH_STACK.length),
    TECH_STACK.length - 1
  );
  const activeChar = TECH_STACK[activeCharIndex];

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Check session persistence
  useEffect(() => {
    setMounted(true);
    try {
      const forceSplash = typeof window !== 'undefined' && window.location.search.includes('splash=true');
      const hasVisited = sessionStorage.getItem(SESSION_KEY);
      if (hasVisited === 'true' && !forceSplash) {
        setShowSplash(false);
        if (onFinishRef.current) onFinishRef.current();
        return;
      }

      setShowSplash(true);

      // Lock body scroll and prevent touch bounce
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } catch {
      // If sessionStorage fails (e.g. private mode blocked)
      setShowSplash(false);
      if (onFinishRef.current) onFinishRef.current();
    }
  }, []);

  // Progress simulation loop
  useEffect(() => {
    if (!showSplash || isExiting) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        // Variable speed: fast start, pauses slightly at milestones, quick finish
        const step = prev > 85 ? 3 : prev > 50 ? 2 : 1.5;
        const next = Math.min(prev + step, 100);

        // Check if a character threshold was reached
        TECH_STACK.forEach((char, idx) => {
          if (next >= char.threshold) {
            setCollectedIndices((collected) =>
              collected.includes(idx) ? collected : [...collected, idx]
            );
          }
        });

        return next;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [showSplash, isExiting]);

  // When progress hits 100, wait briefly then trigger curtain shutter exit
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 350);

      return () => clearTimeout(exitTimer);
    }
  }, [progress, isExiting]);

  // Complete cleanup once all shutter curtains have slid up
  const handleShutterExitComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setShowSplash(false);
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    if (onFinishRef.current) {
      onFinishRef.current();
    }
  }, []);

  // Fallback to guarantee complete unmount even under background tab throttling
  useEffect(() => {
    if (isExiting) {
      const safetyTimer = setTimeout(() => {
        handleShutterExitComplete();
      }, 1200);

      return () => clearTimeout(safetyTimer);
    }
  }, [isExiting, handleShutterExitComplete]);

  // Interactive Easter egg: clicking screen accelerates loading and pops character
  const handleInteractionBoost = () => {
    if (progress >= 100 || isExiting) return;
    try {
      playTabClickSound();
    } catch {
      // ignore
    }
    setClickCount((c) => c + 1);
    setProgress((p) => Math.min(p + 6, 100));
  };

  if (!mounted || !showSplash) return null;

  return (
    <div
      onClick={handleInteractionBoost}
      className={`fixed inset-0 z-[99999] overflow-hidden select-none transition-colors duration-200 ${
        isExiting ? 'pointer-events-none cursor-default' : 'pointer-events-auto cursor-pointer'
      }`}
      style={{
        backgroundColor: isExiting ? 'transparent' : isDark ? '#0b0f19' : '#f8fafc',
      }}
      title="Klik untuk mempercepat loading! ⚡"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. VERTICAL SHUTTER CURTAIN PANELS (Opens from center outward)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {Array.from({ length: NUM_SHUTTERS }).map((_, i) => {
          // Center is index 4.5. Distance from center:
          const distFromCenter = Math.abs(i - 4.5);
          // Columns in the center slide up first; outer columns follow with delay
          const delay = distFromCenter * 0.055;

          return (
            <motion.div
              key={i}
              initial={{ y: '0%' }}
              animate={isExiting ? { y: '-100%' } : { y: '0%' }}
              transition={{
                duration: 0.7,
                delay: delay,
                ease: [0.76, 0, 0.24, 1], // Crisp mechanical shutter curve
              }}
              onAnimationComplete={() => {
                // When the furthest outer panels (0 and 9) finish, complete the splash
                if (i === 0 && isExiting) {
                  handleShutterExitComplete();
                }
              }}
              style={{
                left: `${i * (100 / NUM_SHUTTERS)}%`,
                width: `${100 / NUM_SHUTTERS + 0.2}%`, // slight overlap to prevent subpixel hairline gap
              }}
              className={`absolute top-0 h-full shadow-2xl ${
                isDark
                  ? 'bg-[#0b0f19] border-r border-cyan-500/10'
                  : 'bg-[#f8fafc] border-r border-blue-500/10'
              }`}
            />
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BACKGROUND AMBIENT GLOW (Matches Theme)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
      >
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[140px] opacity-35 transition-all duration-700 ${
            isDark ? 'bg-cyan-500/25' : 'bg-blue-500/20'
          }`}
          style={{
            transform: `translate(-50%, -50%) scale(${1 + (progress / 100) * 0.25})`,
          }}
        />
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[100px] opacity-25 transition-all duration-500 ${
            isDark ? 'bg-blue-600/30' : 'bg-indigo-400/25'
          }`}
        />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT: LOGO, POPPING TECH CHARACTERS, PROGRESS BAR
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        animate={
          isExiting
            ? { opacity: 0, scale: 0.9, y: -24, filter: 'blur(8px)' }
            : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
        }
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-30 flex flex-col items-center justify-center min-h-screen p-6 text-center"
      >
        {/* Studio Branding */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex items-center gap-3 mb-8"
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/25'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
            }`}
          >
            <LuCode className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Kanagara Studio
            </h1>
            <p
              className={`text-[11px] sm:text-xs font-medium tracking-wide ${
                isDark ? 'text-cyan-400/80' : 'text-blue-600/80'
              }`}
            >
              Muhammad Akbar Hanani
            </p>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            ACTIVE TECH CHARACTER POPPING & BOUNCING
        ───────────────────────────────────────────────────────────── */}
        <div className="h-28 flex flex-col items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeChar.name}-${clickCount}`}
              initial={{ scale: 0.5, y: 20, opacity: 0, rotate: -10 }}
              animate={{
                scale: [1, 1.12, 1],
                y: [0, -10, 0],
                opacity: 1,
                rotate: [0, -4, 4, 0],
              }}
              exit={{
                scale: 0.35,
                y: 35,
                opacity: 0,
                rotate: 15,
                transition: { duration: 0.2 },
              }}
              transition={{
                scale: { duration: 0.35, ease: 'easeOut' },
                rotate: { duration: 0.35, ease: 'easeInOut' },
                y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
                opacity: { duration: 0.25 },
              }}
              className="flex flex-col items-center"
            >
              {/* Cute Character Avatar Bubble */}
              <div
                className="relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-3xl backdrop-blur-xl shadow-2xl transition-transform"
                style={{
                  backgroundColor: isDark ? activeChar.badgeBgDark : activeChar.badgeBgLight,
                  borderColor: activeChar.badgeBorder,
                  borderWidth: 1.5,
                  boxShadow: `0 8px 30px ${activeChar.color}35`,
                }}
              >
                <activeChar.icon
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  style={{ color: activeChar.color }}
                />

                {/* Cute mini face bubble tag */}
                <span
                  className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-sm whitespace-nowrap"
                  style={{
                    backgroundColor: activeChar.color,
                    color: isDark && activeChar.color === '#FFFFFF' ? '#000000' : '#FFFFFF',
                  }}
                >
                  {activeChar.face}
                </span>
              </div>

              {/* Character Name Tag */}
              <span
                className={`mt-2.5 text-xs font-bold tracking-wider uppercase font-mono ${
                  isDark ? 'text-gray-200' : 'text-slate-800'
                }`}
              >
                {activeChar.name}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            HORIZONTAL ROUNDED PILL LOADING BAR
        ───────────────────────────────────────────────────────────── */}
        <div className="w-72 sm:w-88 flex flex-col items-center">
          {/* Track container */}
          <div
            className={`w-full h-3.5 sm:h-4 p-0.5 rounded-full relative overflow-hidden backdrop-blur-md shadow-inner transition-colors ${
              isDark
                ? 'bg-white/10 border border-white/15'
                : 'bg-black/5 border border-black/10'
            }`}
          >
            {/* Animated Progress Fill */}
            <motion.div
              className={`h-full rounded-full relative overflow-hidden shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500'
                  : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600'
              }`}
              style={{
                width: `${progress}%`,
                boxShadow: isDark
                  ? '0 0 18px rgba(6, 182, 212, 0.65)'
                  : '0 0 16px rgba(59, 130, 246, 0.5)',
              }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            >
              {/* Shimmer bar highlight */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </motion.div>
          </div>

          {/* Dynamic Percentage & Status Message */}
          <div className="w-full flex items-center justify-between mt-3 text-xs sm:text-sm font-semibold">
            <span
              className={`font-medium text-xs sm:text-[13px] flex items-center gap-1.5 transition-colors ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}
            >
              <LuSparkles
                className={`w-3.5 h-3.5 animate-spin ${
                  isDark ? 'text-cyan-400' : 'text-blue-600'
                }`}
                style={{ animationDuration: '3s' }}
              />
              <span>{progress >= 100 ? 'Semua sistem siap! ' : activeChar.message}</span>
            </span>

            {/* Percentage Counter */}
            <span
              className={`font-mono font-bold text-sm sm:text-base tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-blue-600'
              }`}
            >
              {Math.floor(progress)}%
            </span>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              COLLECTED TECH CHARACTERS ROW (Filled as progress increases)
          ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {TECH_STACK.map((tech, idx) => {
              const isCollected = collectedIndices.includes(idx);
              const IconComp = tech.icon;

              return (
                <motion.div
                  key={tech.name}
                  initial={false}
                  animate={
                    isCollected
                      ? {
                          scale: [1.3, 1],
                          opacity: 1,
                          y: 0,
                        }
                      : {
                          scale: 0.85,
                          opacity: 0.25,
                          y: 4,
                        }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isCollected
                      ? 'shadow-md border'
                      : 'border border-dashed border-gray-500/20'
                  }`}
                  style={{
                    backgroundColor: isCollected
                      ? isDark
                        ? tech.badgeBgDark
                        : tech.badgeBgLight
                      : 'transparent',
                    borderColor: isCollected ? tech.badgeBorder : 'transparent',
                  }}
                  title={tech.name}
                >
                  <IconComp
                    className="w-4 h-4 transition-colors"
                    style={{
                      color: isCollected ? tech.color : isDark ? '#64748b' : '#94a3b8',
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Boost Prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border transition-all ${
              isDark
                ? 'bg-surface/50 border-white/10 text-gray-400 hover:text-cyan-300 hover:border-cyan-500/30'
                : 'bg-white/70 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-400/30'
            }`}
          >
            <LuZap className="w-3 h-3 text-amber-400 animate-bounce" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
