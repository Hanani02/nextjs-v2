'use client';

import { CarControls } from './useKeyboardControls';
import { LuRotateCcw, LuSparkles, LuGamepad2, LuFlame } from 'react-icons/lu';

interface PlaygroundHUDProps {
  controls: CarControls;
  collectedCount: number;
  totalCoins: number;
  onResetCar: () => void;
  onRespawnCoins: () => void;
  onSetControl: (key: keyof CarControls, val: boolean) => void;
  visible: boolean;
}

export default function PlaygroundHUD({
  controls,
  collectedCount,
  totalCoins,
  onResetCar,
  onRespawnCoins,
  onSetControl,
  visible
}: PlaygroundHUDProps) {
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
    onMouseLeave: () => onSetControl(key, false)
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
        {/* Left: Minimalist driving instruction badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-neutral-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-lg pointer-events-auto">
          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-cyan-500/20 text-cyan-400">
            <LuGamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          </div>
          <div>
            {/* Desktop prompt */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white tracking-wide">
              <span>Drive with</span>
              <span className="font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 text-xs">
                WASD
              </span>
              <span>or</span>
              <span className="font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 text-xs">
                Arrows
              </span>
            </div>
            {/* Mobile compact prompt */}
            <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-cyan-300">
              <span>RC Car Arena</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block">
              Screen wrap active • Scroll down to enter portfolio
            </p>
          </div>
        </div>

        {/* Right: Gem counter & Reset car button */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Tech Gems Counter */}
          <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-neutral-950/85 border border-purple-500/30 backdrop-blur-xl shadow-lg">
            <LuSparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 animate-spin duration-3000" />
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-white tracking-tight whitespace-nowrap">
              Gems: <span className="text-cyan-400">{collectedCount}</span>/{totalCoins}
            </span>
            {collectedCount === totalCoins && (
              <button
                onClick={onRespawnCoins}
                title="Respawn all gems"
                className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] sm:text-[11px] font-semibold border border-purple-500/40 transition cursor-pointer"
              >
                Respawn
              </button>
            )}
          </div>

          {/* Reset Car Position */}
          <button
            onClick={onResetCar}
            title="Reset posisi mobil"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-border/80 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 text-[11px] sm:text-xs font-semibold backdrop-blur-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP KEYBOARD VISUALIZER (Hidden on mobile)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-full justify-center pb-12 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-950/70 border border-border/40 backdrop-blur-md">
          {/* W / Up */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                controls.forward
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                  : 'bg-neutral-900 text-gray-300 border-border/60'
              }`}
            >
              W
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  controls.left
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                    : 'bg-neutral-900 text-gray-300 border-border/60'
                }`}
              >
                A
              </span>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  controls.backward
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                    : 'bg-neutral-900 text-gray-300 border-border/60'
                }`}
              >
                S
              </span>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                  controls.right
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-95'
                    : 'bg-neutral-900 text-gray-300 border-border/60'
                }`}
              >
                D
              </span>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-border/40 mx-2" />

          {/* Space / Brake */}
          <span
            className={`px-3.5 h-8 rounded-lg flex items-center justify-center font-mono font-semibold text-xs border transition-all ${
              controls.brake
                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-95'
                : 'bg-neutral-900 text-gray-300 border-border/60'
            }`}
          >
            SPACE [Brake]
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ERGONOMIC MOBILE DUAL-THUMB GAMEPAD CONTROLLER
             - Left Thumb: Kemudi Belok Kiri & Belok Kanan
             - Right Thumb: Pedal GAS (Maju) & Pedal MUNDUR / REM
             - Multi-touch enabled, no input lag, zero page gesture conflict
      ───────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden w-full items-end justify-between px-2 pb-14 sm:pb-16 pointer-events-auto touch-none select-none">
        {/* Left Thumb Cluster: Steering Rocker */}
        <div className="flex items-center gap-2.5 p-1.5 rounded-3xl bg-neutral-950/70 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
          {/* Turn Left Button */}
          <button
            {...bindTouchHandlers('left')}
            aria-label="Kemudi Kiri"
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
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
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
              controls.right
                ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.9)] scale-95'
                : 'bg-neutral-900/90 text-cyan-400 border border-cyan-500/40 active:bg-cyan-400 active:text-black'
            }`}
          >
            <span>▶</span>
            <span className="text-[8px] uppercase tracking-wider font-bold">Kanan</span>
          </button>
        </div>

        {/* Right Thumb Cluster: Accelerator & Brake/Reverse */}
        <div className="flex items-center gap-2.5 p-1.5 rounded-3xl bg-neutral-950/70 border border-purple-500/30 backdrop-blur-md shadow-2xl">
          {/* Brake / Reverse Button */}
          <button
            {...bindTouchHandlers('backward')}
            aria-label="Rem dan Mundur"
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-lg flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
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
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-none select-none ${
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
