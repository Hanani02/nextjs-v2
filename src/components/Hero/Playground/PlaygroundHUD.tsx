'use client';

import { useState, useEffect } from 'react';
import { CarControls } from './useKeyboardControls';
import {
  LuRotateCcw,
  LuSparkles,
  LuGamepad2,
  LuFlame,
  LuMinimize2,
} from 'react-icons/lu';

interface PlaygroundHUDProps {
  controls: CarControls;
  collectedCount?: number;
  totalCoins?: number;
  onResetCar: () => void;
  onRespawnCoins?: () => void;
  onSetControl: (key: keyof CarControls, val: boolean) => void;
  visible: boolean;
}

export default function PlaygroundHUD({
  controls,
  onResetCar,
  onSetControl,
  visible,
}: PlaygroundHUDProps) {
  // Drive instruction badge can be minimized into a compact icon button
  const [driveGuideMinimized, setDriveGuideMinimized] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('drive_guide_minimized');
      if (saved !== null) {
        setDriveGuideMinimized(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleDriveGuide = (val: boolean) => {
    setDriveGuideMinimized(val);
    try {
      sessionStorage.setItem('drive_guide_minimized', String(val));
    } catch {
      // ignore
    }
  };

  /**
   * Helper to bind touch and mouse events safely with multi-touch support
   * and prevent default browser zooming/scrolling behavior.
   */
  const bindTouchHandlers = (key: keyof CarControls) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onSetControl(key, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onSetControl(key, false);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      onSetControl(key, false);
    },
    onMouseDown: () => onSetControl(key, true),
    onMouseUp: () => onSetControl(key, false),
    onMouseLeave: () => onSetControl(key, false),
  });

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-30 transition-all duration-500 ease-out flex flex-col justify-between p-3 sm:p-6 md:p-8 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-6 pointer-events-none'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HUD BAR: Responsive Header on both mobile and desktop
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between gap-2 pt-16 sm:pt-18 select-none">
        {/* Left: Minimizable driving & drift instruction badge + Reset button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {driveGuideMinimized ? (
            /* Minimized Icon Button */
            <button
              onClick={() => toggleDriveGuide(false)}
              title="Tampilkan Panduan Kontrol"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 hover:text-white backdrop-blur-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-xl bg-cyan-500/20 text-cyan-400">
                <LuGamepad2 className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-gray-300">Controls</span>
            </button>
          ) : (
            /* Expanded Instruction Card with Minimize button */
            <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-neutral-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                <LuGamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
              </div>
              <div>
                {/* Desktop prompt */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white tracking-wide">
                  <span>Drive:</span>
                  <span className="font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 text-xs">
                    WASD / Arrows
                  </span>
                  <span className="mx-0.5 text-gray-500">•</span>
                  <span>Drift:</span>
                  <span className="font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30 text-xs">
                    SPACEBAR
                  </span>
                </div>
                {/* Mobile compact prompt */}
                <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-cyan-300">
                  <span>Neon Circuit • RC Drift</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block">
                  Mini Circuit • 3 Laps • Scroll ke bawah untuk pit stop & masuk ke portofolio
                </p>
              </div>

              {/* Minimize button */}
              <button
                onClick={() => toggleDriveGuide(true)}
                title="Minimize panduan kontrol"
                className="ml-1 sm:ml-2 p-1 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-neutral-800 transition cursor-pointer"
              >
                <LuMinimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reset Car Position */}
          <button
            onClick={onResetCar}
            title="Reset posisi mobil ke garis Start/Finish"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-border/80 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 text-[11px] sm:text-xs font-semibold backdrop-blur-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

        {/* Right side is reserved for the live transparent Race Leaderboard */}
        <div className="w-1" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP KEYBOARD VISUALIZER (Positioned Bottom-Left on desktop)
             Leaves the center of the screen clean and unobstructed!
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex absolute bottom-6 left-6 pointer-events-none select-none z-30">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-950/80 border border-border/50 backdrop-blur-xl shadow-2xl pointer-events-auto">
          {/* W / Up */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                controls.forward
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                  : 'bg-neutral-900 text-gray-300 border-border/60'
              }`}
            >
              W
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  controls.left
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                    : 'bg-neutral-900 text-gray-300 border-border/60'
                }`}
              >
                A
              </span>
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  controls.backward
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                    : 'bg-neutral-900 text-gray-300 border-border/60'
                }`}
              >
                S
              </span>
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  controls.right
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                    : 'bg-neutral-900 text-gray-300 border-border/60'
                }`}
              >
                D
              </span>
            </div>
          </div>

          <div className="w-[1px] h-9 bg-border/40 mx-1.5" />

          {/* Space / Drift Handbrake */}
          <span
            className={`px-3 h-7 rounded-lg flex items-center justify-center font-mono font-semibold text-[11px] border transition-all whitespace-nowrap ${
              controls.brake
                ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.9)] scale-95'
                : 'bg-neutral-900 text-gray-300 border-border/60'
            }`}
          >
            SPACE [Drift]
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ERGONOMIC MOBILE DUAL-THUMB GAMEPAD CONTROLLER
             - Left Thumb: Kemudi Belok Kiri & Belok Kanan
             - Right Thumb: Pedal GAS (Maju), Pedal MUNDUR / REM, & Pedal HANDBRAKE DRIFT
      ───────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden w-full items-end justify-between px-2 pb-14 sm:pb-16 pointer-events-none select-none">
        {/* Left Thumb Cluster: Steering Rocker */}
        <div className="flex items-center gap-2 p-1.5 rounded-3xl bg-neutral-950/70 border border-cyan-500/30 backdrop-blur-md shadow-2xl pointer-events-auto touch-none">
          {/* Turn Left Button */}
          <button
            {...bindTouchHandlers('left')}
            aria-label="Kemudi Kiri"
            className={`w-13 h-14 sm:w-15 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
              controls.left
                ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.9)] scale-95'
                : 'bg-neutral-900/90 text-cyan-400 border border-cyan-500/40 active:bg-cyan-400 active:text-black'
            }`}
          >
            <span>◀</span>
            <span className="text-[8px] uppercase tracking-wider font-bold">Kiri</span>
          </button>

          {/* Turn Right Button */}
          <button
            {...bindTouchHandlers('right')}
            aria-label="Kemudi Kanan"
            className={`w-13 h-14 sm:w-15 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
              controls.right
                ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.9)] scale-95'
                : 'bg-neutral-900/90 text-cyan-400 border border-cyan-500/40 active:bg-cyan-400 active:text-black'
            }`}
          >
            <span>▶</span>
            <span className="text-[8px] uppercase tracking-wider font-bold">Kanan</span>
          </button>
        </div>

        {/* Right Thumb Cluster: Handbrake Drift + Accelerator + Brake/Reverse */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-3xl bg-neutral-950/70 border border-purple-500/30 backdrop-blur-md shadow-2xl pointer-events-auto touch-none">
          {/* Handbrake Drift Button */}
          <button
            {...bindTouchHandlers('brake')}
            aria-label="Handbrake Drift"
            className={`w-11 h-14 sm:w-13 sm:h-16 rounded-2xl font-black text-xs flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
              controls.brake
                ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.9)] scale-95'
                : 'bg-neutral-900/90 text-rose-400 border border-rose-500/40 active:bg-rose-500 active:text-white'
            }`}
          >
            <span>🔥</span>
            <span className="text-[7px] uppercase tracking-wider font-extrabold">Drift</span>
          </button>

          {/* Brake / Reverse Button */}
          <button
            {...bindTouchHandlers('backward')}
            aria-label="Rem dan Mundur"
            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl font-black text-lg flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
              controls.backward
                ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.9)] scale-95'
                : 'bg-neutral-900/90 text-rose-400 border border-rose-500/40 active:bg-rose-500 active:text-white'
            }`}
          >
            <span>▼</span>
            <span className="text-[8px] uppercase tracking-wider font-bold">Mundur</span>
          </button>

          {/* Gas / Forward Accelerator Button */}
          <button
            {...bindTouchHandlers('forward')}
            aria-label="Pedal Gas Maju"
            className={`w-13 h-14 sm:w-15 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
              controls.forward
                ? 'bg-cyan-400 text-black shadow-[0_0_24px_rgba(6,182,212,1.0)] scale-95'
                : 'bg-gradient-to-br from-cyan-500/90 to-blue-600/90 text-white border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:bg-cyan-400 active:text-black'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <span>▲</span>
              <LuFlame className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold">Gas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
