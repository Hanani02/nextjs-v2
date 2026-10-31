'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SplashScreenProps {
  onFinish?: () => void;
  sessionPersistence?: boolean;
}

const SESSION_KEY = 'hasVisitedSplash';

// Multilingual greetings array ending with "Selamat Datang"
const GREETINGS = [
  'Hello',          // English
  'Bonjour',        // French
  'Hola',           // Spanish
  'Ciao',           // Italian
  'Konnichiwa',     // Japanese
  'Guten Tag',      // German
  'Olá',            // Portuguese
  'Namaste',        // Hindi
  'Nǐ Hǎo',         // Mandarin
  'Selamat Datang', // Indonesian (Grand Finale)
];

// Exponentially accelerating display intervals (ms) from ~560ms down to ~90ms,
// with a brief readable hold on the final welcoming phrase before fade-out.
const INTERVALS = [560, 440, 350, 270, 210, 160, 125, 100, 90, 320];

export default function SplashScreen({
  onFinish,
  sessionPersistence = false,
}: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Handle Session Persistence & Scroll Lock
  useEffect(() => {
    setMounted(true);

    try {
      const forceSplash =
        typeof window !== 'undefined' &&
        window.location.search.includes('splash=true');
      const skipSplash =
        typeof window !== 'undefined' &&
        window.location.search.includes('splash=false');

      if (skipSplash) {
        setIsComplete(true);
        if (onFinishRef.current) onFinishRef.current();
        return;
      }

      if (sessionPersistence && !forceSplash) {
        const hasVisited = sessionStorage.getItem(SESSION_KEY);
        if (hasVisited === 'true') {
          setIsComplete(true);
          if (onFinishRef.current) onFinishRef.current();
          return;
        }
      }

      // Lock body scroll during splash screen
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } catch {
      // In case sessionStorage is blocked (e.g. strict private mode)
    }

    return () => {
      // Safety unlock on unmount
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionPersistence]);

  // Complete cleanup once curtain exit animation finishes
  const handleComplete = useCallback(() => {
    try {
      if (sessionPersistence) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    } catch {
      // ignore
    }

    // Restore body scroll completely
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    setIsComplete(true);

    if (onFinishRef.current) {
      onFinishRef.current();
    }
  }, [sessionPersistence]);

  // Word cycling sequence with exponential acceleration
  useEffect(() => {
    if (!mounted || isComplete || isExiting) return;

    const currentDuration = INTERVALS[currentIndex] || 150;

    timerRef.current = setTimeout(() => {
      if (currentIndex < GREETINGS.length - 1) {
        // Move to the next greeting with accelerated tempo
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Last greeting finished: Fade out text immediately
        setIsTextVisible(false);

        // Once text fades out (200ms), start the dual curtain exit reveal
        timerRef.current = setTimeout(() => {
          setIsExiting(true);
        }, 220);
      }
    }, currentDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted, currentIndex, isComplete, isExiting]);

  // If not mounted yet (SSR) or lifecycle complete, unmount from DOM
  if (!mounted || isComplete) {
    return null;
  }

  // Calculate dynamic transition speed for current word
  const currentInterval = INTERVALS[currentIndex] || 150;
  const wordAnimDuration = Math.max(currentInterval * 0.4 / 1000, 0.08);

  return (
    <div
      aria-hidden={isExiting}
      className={`fixed inset-0 z-[9999] select-none overflow-hidden ${
        isExiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. SPLIT CURTAINS / DUAL PANELS (EXIT REVEAL)
          Opens from outer flanks (left & right) moving inward toward center.
          The center vertical line is the last area to disappear.
      ───────────────────────────────────────────────────────────── */}
      {/* Left Panel (0% to 50%) */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-[calc(50%+1px)] bg-[#000000] z-10"
        style={{ originX: 1 }} // transform-origin: right center (anchored at center line)
        initial={{ scaleX: 1 }}
        animate={{ scaleX: isExiting ? 0 : 1 }}
        transition={{
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1], // Smooth cinematic bezier
        }}
      />

      {/* Right Panel (50% to 100%) */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-[calc(50%+1px)] bg-[#000000] z-10"
        style={{ originX: 0 }} // transform-origin: left center (anchored at center line)
        initial={{ scaleX: 1 }}
        animate={{ scaleX: isExiting ? 0 : 1 }}
        transition={{
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1], // Smooth cinematic bezier
        }}
        onAnimationComplete={() => {
          if (isExiting) {
            handleComplete();
          }
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. MINIMALIST CENTER GREETING TEXT
          Centered white modern text with fade/blur transitions.
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-6">
        <AnimatePresence mode="wait">
          {isTextVisible && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
              transition={{
                duration: wordAnimDuration,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center gap-3 sm:gap-4.5"
            >
              {/* Minimalist dot indicator */}
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white opacity-80 shrink-0" />

              {/* Multilingual Text */}
              <span className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white font-sans whitespace-nowrap">
                {GREETINGS[currentIndex]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
