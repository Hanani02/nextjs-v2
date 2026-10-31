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

// Native script characters for each language
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

// Accelerating intervals (ms)
const INTERVALS = [360, 300, 250, 200, 160, 130, 100, 260];

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

  // Viewport dimensions for the Dennis Snellenberg SVG curve
  const [dimension, setDimension] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Initial mount, resize listener & scroll lock
  useEffect(() => {
    setMounted(true);

    const updateDimension = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimension();
    window.addEventListener('resize', updateDimension);

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
      // Safe fallback
    }

    // Safety timeout: unlock after 4.5s maximum under any circumstance
    const safetyTimer = setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      setIsLoading(false);
      if (onFinishRef.current) onFinishRef.current();
    }, 4500);

    return () => {
      window.removeEventListener('resize', updateDimension);
      clearTimeout(safetyTimer);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionPersistence]);

  // Complete cleanup once Dennis Snellenberg curve exit completes
  const handleComplete = useCallback(() => {
    try {
      if (sessionPersistence) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    } catch {
      // ignore
    }

    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    setIsLoading(false);

    if (onFinishRef.current) {
      onFinishRef.current();
    }
  }, [sessionPersistence]);

  // Word cycling sequence with exponential acceleration
  useEffect(() => {
    if (!mounted || !isLoading || isExiting) return;

    const currentDuration = INTERVALS[currentIndex] || 150;

    timerRef.current = setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Last word finished: fade out text first
        setIsTextVisible(false);

        // Then trigger the Dennis Snellenberg SVG curve exit
        timerRef.current = setTimeout(() => {
          setIsExiting(true);
        }, 160);
      }
    }, currentDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, currentIndex, isLoading, isExiting, words.length]);

  if (!mounted || !isLoading) {
    return null;
  }

  // Curve height calculation (proportional sag)
  const curveHeight = Math.min(Math.max(dimension.width * 0.28, 160), 300);

  // Dennis Snellenberg SVG Paths:
  // initialPath: sags downward by curveHeight
  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + curveHeight} 0 ${dimension.height} L0 0`;
  // targetPath: straightens out flat along the bottom edge
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;

  const currentInterval = INTERVALS[currentIndex] || 150;
  const wordAnimDuration = Math.max((currentInterval * 0.35) / 1000, 0.08);

  return (
    <motion.div
      initial={{ top: 0 }}
      animate={{ top: isExiting ? `-${dimension.height + curveHeight}px` : 0 }}
      transition={{
        duration: 0.85,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={() => {
        if (isExiting) {
          handleComplete();
        }
      }}
      className="fixed inset-0 z-[999] select-none flex items-center justify-center bg-transparent pointer-events-auto"
      style={{
        width: '100vw',
        height: '100vh',
        willChange: 'transform',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. CENTER MINIMALIST GREETING TEXT
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {isTextVisible && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: wordAnimDuration,
                ease: [0.33, 1, 0.68, 1],
              }}
              style={{ willChange: 'transform, opacity' }}
              className="flex items-center text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white font-sans select-none"
            >
              {/* Dot bullet indicator */}
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white opacity-80 mr-3 sm:mr-4 shrink-0" />

              {/* Native Script Greeting */}
              <span>{words[currentIndex]}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DENNIS SNELLENBERG FULLSCREEN CURVE SVG
          The SVG covers the full screen + the curved bottom sag.
          As the wrapper slides up, the curve flattens and sweeps upward,
          creating the iconic smooth wave reveal where the center leaves last.
      ───────────────────────────────────────────────────────────── */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{
          width: '100vw',
          height: `calc(100vh + ${curveHeight}px)`,
        }}
        viewBox={`0 0 ${dimension.width} ${dimension.height + curveHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          initial={{ d: initialPath }}
          animate={{ d: isExiting ? targetPath : initialPath }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
          fill={backgroundColor}
        />
      </svg>
    </motion.div>
  );
}
