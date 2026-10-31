'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PreloaderProps {
  onFinish?: () => void;
  words?: string[];
  backgroundColor?: string;
  sessionPersistence?: boolean;
}

const SESSION_KEY = 'hasVisitedPreloader';

const DEFAULT_WORDS = [
  'Hello',       // English
  'Bonjour',     // French
  'Ciao',        // Italian
  'Olá',         // Portuguese
  'Nǐ Hǎo',      // Mandarin
  'Konnichiwa',  // Japanese
  'Guten Tag',   // German
  'Halo',        // Indonesian
];

// Accelerating intervals (ms): starts relaxed (~380ms) and accelerates
// to ~100ms on the final few words, with a brief readable hold on the finale.
const INTERVALS = [380, 320, 260, 210, 160, 120, 100, 260];

// SVG Curve Path States for ViewBox 0 0 1000 1000:
// 1. Initial: Full flat rectangle covering the screen
const initialPath = 'M 0 0 L 1000 0 L 1000 1000 Q 500 1000 0 1000 Z';
// 2. Mid: Outer sides lift to the top (0) while center dips down (700) in a parabolic wave
const midPath = 'M 0 0 L 1000 0 L 1000 0 Q 500 700 0 0 Z';
// 3. Target: Center pulls all the way above top edge (-20), fully revealing page underneath
const targetPath = 'M 0 0 L 1000 0 L 1000 0 Q 500 -20 0 0 Z';

export default function Preloader({
  onFinish,
  words = DEFAULT_WORDS,
  backgroundColor = '#141516',
  sessionPersistence = false,
}: PreloaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Initial mount, session persistence check & scroll-lock
  useEffect(() => {
    setMounted(true);

    try {
      const forcePreloader =
        typeof window !== 'undefined' &&
        window.location.search.includes('splash=true');
      const skipPreloader =
        typeof window !== 'undefined' &&
        window.location.search.includes('splash=false');

      if (skipPreloader) {
        setIsLoading(false);
        if (onFinishRef.current) onFinishRef.current();
        return;
      }

      if (sessionPersistence && !forcePreloader) {
        const hasVisited = sessionStorage.getItem(SESSION_KEY);
        if (hasVisited === 'true') {
          setIsLoading(false);
          if (onFinishRef.current) onFinishRef.current();
          return;
        }
      }

      // Lock body scroll during preloader
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } catch {
      // Safe fallback if sessionStorage is restricted
    }

    return () => {
      // Safety unlock on unmount
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = '';
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionPersistence]);

  // Handle complete exit animation
  const handleAnimationComplete = useCallback(() => {
    try {
      if (sessionPersistence) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    } catch {
      // ignore
    }

    // Unlock body scroll
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = '';

    setIsLoading(false);

    if (onFinishRef.current) {
      onFinishRef.current();
    }
  }, [sessionPersistence]);

  // Multilingual word cycling sequence with exponential acceleration
  useEffect(() => {
    if (!mounted || !isLoading || isExiting) return;

    const currentDuration = INTERVALS[currentIndex] || 150;

    timerRef.current = setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Last word finished: immediately fade out text
        setIsTextVisible(false);

        // Start curved SVG wave exit reveal
        timerRef.current = setTimeout(() => {
          setIsExiting(true);
        }, 180);
      }
    }, currentDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, currentIndex, isLoading, isExiting, words.length]);

  // If not mounted yet (SSR) or lifecycle complete, unmount from DOM
  if (!mounted || !isLoading) {
    return null;
  }

  const currentInterval = INTERVALS[currentIndex] || 150;
  const wordAnimDuration = Math.max((currentInterval * 0.4) / 1000, 0.08);

  return (
    <div
      aria-hidden={isExiting}
      className={`fixed inset-0 z-[999] select-none overflow-hidden ${
        isExiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. FULLSCREEN SVG CURVE MORPHING (DENNIS SNELLENBERG STYLE)
          Curved wave exit where outer sides lift up first and
          bottom center curve is the last to exit.
      ───────────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          initial={{ d: initialPath }}
          animate={{
            d: isExiting ? [initialPath, midPath, targetPath] : initialPath,
          }}
          transition={{
            duration: 0.85,
            times: [0, 0.48, 1],
            ease: [0.76, 0, 0.24, 1], // Smooth custom cubic bezier
          }}
          onAnimationComplete={() => {
            if (isExiting) {
              handleAnimationComplete();
            }
          }}
          fill={backgroundColor}
        />
      </svg>

      {/* ─────────────────────────────────────────────────────────────
          2. MINIMALIST CENTER GREETING TEXT
          Clean white font with bullet/dot and blur-fade swap.
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-6">
        <AnimatePresence mode="wait">
          {isTextVisible && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{
                duration: wordAnimDuration,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white font-sans select-none"
            >
              {/* Bullet/dot indicator */}
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white opacity-80 mr-3.5 sm:mr-4 shrink-0" />

              {/* Greeting word */}
              <span>{words[currentIndex]}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

