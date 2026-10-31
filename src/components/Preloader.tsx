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

// Native characters for each language (Hiragana for Japanese, Hanzi for Chinese, Cyrillic for Russian, etc.)
const DEFAULT_WORDS = [
  'Hello',         // English
  'Bonjour',       // French
  'こんにちは',     // Japanese (Hiragana)
  '你好',          // Chinese (Hanzi)
  'Привет',        // Russian (Cyrillic)
  'Ciao',          // Italian
  'Guten Tag',     // German
  'Halo',          // Indonesian
];

// Accelerating intervals (ms): starts relaxed (~360ms) and accelerates
// to ~100ms on the final few words, with a brief readable hold on the finale.
const INTERVALS = [360, 300, 250, 200, 160, 130, 100, 260];

// Dennis Snellenberg curved wave exit paths (viewBox 0 0 1000 250)
const initialCurve = 'M 0 0 L 1000 0 Q 500 250 0 0 Z';
const flatCurve = 'M 0 0 L 1000 0 Q 500 0 0 0 Z';

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

    // Restore body scroll
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

        // Trigger Dennis Snellenberg curved slide-up exit
        timerRef.current = setTimeout(() => {
          setIsExiting(true);
        }, 150);
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
  // Dynamic duration for snappy text swaps without costly filters
  const wordAnimDuration = Math.max((currentInterval * 0.35) / 1000, 0.07);

  return (
    <motion.div
      aria-hidden={isExiting}
      initial={{ y: '0%' }}
      animate={{ y: isExiting ? '-100%' : '0%' }}
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1], // Custom smooth cubic bezier
      }}
      onAnimationComplete={() => {
        if (isExiting) {
          handleAnimationComplete();
        }
      }}
      style={{
        backgroundColor,
        willChange: 'transform',
      }}
      className={`fixed inset-0 z-[999] select-none flex items-center justify-center ${
        isExiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. MINIMALIST CENTER GREETING TEXT
          High-performance opacity + transform animation (no blur filters).
          Includes bullet/dot and native script characters (Hiragana, Hanzi, Cyrillic).
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {isTextVisible && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: wordAnimDuration,
                ease: [0.33, 1, 0.68, 1],
              }}
              style={{ willChange: 'transform, opacity' }}
              className="flex items-center text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white font-sans select-none"
            >
              {/* Bullet/dot indicator */}
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white opacity-80 mr-3 sm:mr-4 shrink-0" />

              {/* Native Script Greeting */}
              <span>{words[currentIndex]}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SVG CURVE EXIT (DENNIS SNELLENBERG STYLE)
          Hangs below the bottom edge. As the container slides up,
          the curve flattens out, creating a smooth parabolic wave reveal
          where the center bottom is the last to exit.
      ───────────────────────────────────────────────────────────── */}
      <svg
        className="absolute top-full left-0 w-full h-[150px] sm:h-[220px] pointer-events-none overflow-visible"
        viewBox="0 0 1000 250"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ fill: backgroundColor }}
      >
        <motion.path
          initial={{ d: initialCurve }}
          animate={{ d: isExiting ? flatCurve : initialCurve }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      </svg>
    </motion.div>
  );
}
