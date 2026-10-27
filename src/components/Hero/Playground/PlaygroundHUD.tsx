'use client';

import { useState, useEffect } from 'react';
import { CarControls } from './useKeyboardControls';
import SoundToggle from '@/components/theme/SoundToggle';
import type { DriftSlicknessMode } from './carPhysics';
import type { GraphicsQuality } from '@/types/vehicle';
import {
  LuRotateCcw,
  LuGamepad2,
  LuMinimize2,
  LuSlidersHorizontal,
  LuX,
  LuFlame,
  LuGauge,
  LuMonitor,
} from 'react-icons/lu';

export const QUICK_EMOTES = [
  { key: '1', text: 'GG! 🏁', label: 'GG! 🏁' },
  { key: '2', text: 'Beep Beep! 🚗', label: 'Beep! 🚗' },
  { key: '3', text: '🔥', label: '🔥' },
  { key: '4', text: '💨', label: '💨' },
];

interface PlaygroundHUDProps {
  controls: CarControls;
  collectedCount?: number;
  totalCoins?: number;
  onResetCar: () => void;
  onRespawnCoins?: () => void;
  onSetControl: (key: keyof CarControls, val: boolean) => void;
  onSendEmote?: (emote: string) => void;
  steeringSensitivity?: number;
  onUpdateSensitivity?: (val: number) => void;
  driftSlickness?: DriftSlicknessMode;
  onUpdateDriftSlickness?: (mode: DriftSlicknessMode) => void;
  graphicsQuality?: GraphicsQuality;
  onUpdateGraphicsQuality?: (quality: GraphicsQuality) => void;
  visible: boolean;
}

export default function PlaygroundHUD({
  controls,
  onResetCar,
  onSetControl,
  onSendEmote,
  steeringSensitivity = 1.0,
  onUpdateSensitivity,
  driftSlickness = 'slippery',
  onUpdateDriftSlickness,
  graphicsQuality = 'medium',
  onUpdateGraphicsQuality,
  visible,
}: PlaygroundHUDProps) {
  // Drive instruction badge can be minimized into a compact icon button
  const [driveGuideMinimized, setDriveGuideMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Listen to keyboard shortcut keys 1-4 for quick reactions
  useEffect(() => {
    if (!visible || !onSendEmote) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const found = QUICK_EMOTES.find((item) => item.key === e.key);
      if (found) {
        e.preventDefault();
        onSendEmote(found.text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onSendEmote]);

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
        {/* Left: Minimizable driving & drift instruction badge + Reset + Tuning Settings + Sound */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
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
                    SPACE
                  </span>
                  <span className="mx-0.5 text-gray-500">•</span>
                  <span>Emotes:</span>
                  <span className="font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 text-xs">
                    1-4
                  </span>
                  <span className="mx-0.5 text-gray-500">•</span>
                  <span>Chat:</span>
                  <span className="font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 text-xs">
                    T / Enter
                  </span>
                </div>
                {/* Mobile compact prompt */}
                <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-cyan-300">
                  <span>Autodromo Monza • Drift</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block">
                  Monza Circuit • Drift licin & selesaikan 3 lap!
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

          {/* Quick Tuning / Sensitivity Settings Modal Trigger */}
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            title="Pengaturan Sensitivitas Kemudi & Kelicinan Drift"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border text-[11px] sm:text-xs font-semibold backdrop-blur-xl shadow-lg transition active:scale-95 cursor-pointer ${
              showSettings
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-neutral-950/85 hover:bg-neutral-900 border-border/80 hover:border-cyan-400 text-gray-300 hover:text-cyan-400'
            }`}
          >
            <LuSlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tuning ({Math.round(steeringSensitivity * 100)}%)</span>
          </button>

          {/* Reset Car Position */}
          <button
            onClick={onResetCar}
            title="Reset posisi mobil ke garis Start/Finish Monza"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-border/80 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 text-[11px] sm:text-xs font-semibold backdrop-blur-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Sound Toggle Button inside HUD */}
          <SoundToggle size="sm" />
        </div>

        {/* Right side spacer */}
        <div className="w-1" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TUNING & SENSITIVITY FLOATING SETTINGS MODAL
      ───────────────────────────────────────────────────────────── */}
      {showSettings && (
        <div className="absolute top-28 sm:top-32 left-3 sm:left-6 z-50 pointer-events-auto w-[290px] sm:w-[320px] rounded-2xl bg-neutral-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-3.5 space-y-3.5 animate-in fade-in zoom-in-95 duration-200 select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <LuGauge className="w-4 h-4 text-cyan-400" />
              <span>Handling & Sensitivitas</span>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <LuX className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Steering Sensitivity Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-300 font-medium">Sensitivitas Kemudi:</span>
              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {Math.round(steeringSensitivity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={steeringSensitivity}
              onChange={(e) => onUpdateSensitivity?.(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {/* Quick preset chips */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[
                { label: 'Santai', val: 0.75 },
                { label: 'Normal', val: 1.0 },
                { label: 'Agresif', val: 1.35 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onUpdateSensitivity?.(p.val)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border transition ${
                    Math.abs(steeringSensitivity - p.val) < 0.05
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-neutral-900 border-border/40 text-gray-400 hover:text-white'
                  }`}
                >
                  {p.label} ({Math.round(p.val * 100)}%)
                </button>
              ))}
            </div>
          </div>

          {/* Drift Slickness Mode (Kelicinan Drift) */}
          <div className="space-y-1.5 border-t border-border/40 pt-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-300 font-medium flex items-center gap-1">
                <LuFlame className="w-3 h-3 text-rose-400" />
                <span>Kelicinan Drift (Spacebar):</span>
              </span>
              <span className="font-mono text-[10px] text-rose-300 capitalize font-bold">
                {driftSlickness === 'hyper'
                  ? 'Hyper Slick'
                  : driftSlickness === 'slippery'
                  ? 'Licin (Default)'
                  : 'Standar'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'normal' as DriftSlicknessMode, label: 'Standar' },
                { id: 'slippery' as DriftSlicknessMode, label: 'Licin' },
                { id: 'hyper' as DriftSlicknessMode, label: 'Hyper Licin' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onUpdateDriftSlickness?.(mode.id)}
                  className={`py-1.5 rounded-xl text-[10px] font-bold border transition ${
                    driftSlickness === mode.id
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                      : 'bg-neutral-900 border-border/40 text-gray-400 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 leading-tight pt-0.5">
              💡 Tekan <strong>Spacebar</strong> di tikungan untuk mengepot licin dan menjaga kecepatan!
            </p>
          </div>

          {/* Graphics Quality (Grafis: Low, Medium, High) */}
          <div className="space-y-1.5 border-t border-border/40 pt-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-300 font-medium flex items-center gap-1">
                <LuMonitor className="w-3 h-3 text-emerald-400" />
                <span>Kualitas Grafis:</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-300 uppercase font-bold">
                {graphicsQuality}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'low' as GraphicsQuality, label: 'Low', sub: 'Hemat FPS' },
                { id: 'medium' as GraphicsQuality, label: 'Medium', sub: 'Seimbang' },
                { id: 'high' as GraphicsQuality, label: 'High', sub: 'Ultra Detail' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => onUpdateGraphicsQuality?.(g.id)}
                  className={`py-1.5 rounded-xl text-[10px] font-bold border transition flex flex-col items-center cursor-pointer ${
                    graphicsQuality === g.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                      : 'bg-neutral-900 border-border/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{g.label}</span>
                  <span className="text-[8px] font-normal opacity-75">{g.sub}</span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 leading-tight pt-0.5">
              {graphicsQuality === 'low'
                ? '⚡ Low: Partikel sedikit & asap tipis.'
                : graphicsQuality === 'medium'
                ? '⚖️ Medium: Refleksi cahaya lembut & seimbang.'
                : '✨ High: Tekstur ultra tajam, partikel padat & pantulan wet-track.'}
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUICK CHAT & EMOTES BAR (Desktop only, hidden on mobile to avoid covering pedals)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto z-30 items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-2xl">
        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mr-1">
          Emotes:
        </span>
        {QUICK_EMOTES.map((item) => (
          <button
            key={item.key}
            onClick={() => onSendEmote?.(item.text)}
            title={`Tekan [${item.key}] untuk kirim ${item.label}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-border/50 hover:border-cyan-400 text-xs text-gray-200 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm select-none"
          >
            <span className="flex w-3.5 h-3.5 rounded-full bg-cyan-950/70 text-[9px] font-mono font-bold text-cyan-400 items-center justify-center border border-cyan-500/30">
              {item.key}
            </span>
            <span className="font-semibold text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP KEYBOARD VISUALIZER (Positioned Bottom-Left on desktop)
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

          <div className="h-9 w-px bg-border/40 mx-1" />

          {/* Spacebar for Drift */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`px-3 py-1.5 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] tracking-wider border transition-all ${
                controls.brake
                  ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.9)] scale-95'
                  : 'bg-neutral-900 text-gray-300 border-border/60'
              }`}
            >
              SPACE DRIFT
            </span>
            <span className="text-[9px] text-gray-400 font-mono">Rem Tangan</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE ON-SCREEN TOUCH CONTROLS (D-Pad Left, Gas & Drift Right)
          Unobstructed, high-priority z-50 with comfortable touch zones
      ───────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden items-end justify-between w-full pointer-events-auto select-none touch-none pb-3 px-1 z-50">
        {/* Left Touch Pad: Steer Left & Right */}
        <div className="flex items-center gap-2">
          <button
            {...bindTouchHandlers('left')}
            aria-label="Belok Kiri"
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black backdrop-blur-xl border transition-all active:scale-90 select-none touch-none shadow-lg ${
              controls.left
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.85)] scale-95'
                : 'bg-neutral-950/85 border-cyan-500/40 text-cyan-300'
            }`}
          >
            ◀
          </button>
          <button
            {...bindTouchHandlers('right')}
            aria-label="Belok Kanan"
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black backdrop-blur-xl border transition-all active:scale-90 select-none touch-none shadow-lg ${
              controls.right
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.85)] scale-95'
                : 'bg-neutral-950/85 border-cyan-500/40 text-cyan-300'
            }`}
          >
            ▶
          </button>
        </div>

        {/* Right Touch Pad: Gas (▲), Reverse (▼), and Handbrake (DRIFT) */}
        <div className="flex items-center gap-2">
          {/* Handbrake Drift Button */}
          <button
            {...bindTouchHandlers('brake')}
            aria-label="Rem Tangan Drift"
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-[10px] backdrop-blur-xl border transition-all active:scale-90 select-none touch-none shadow-lg ${
              controls.brake
                ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.9)] scale-95'
                : 'bg-neutral-950/85 border-rose-500/40 text-rose-400'
            }`}
          >
            <LuFlame className="w-4 h-4 mb-0.5" />
            <span>DRIFT</span>
          </button>

          {/* Reverse Button */}
          <button
            {...bindTouchHandlers('backward')}
            aria-label="Mundur"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black backdrop-blur-xl border transition-all active:scale-90 select-none touch-none shadow-lg ${
              controls.backward
                ? 'bg-neutral-600 text-white border-white shadow-lg scale-95'
                : 'bg-neutral-950/85 border-border/70 text-gray-400'
            }`}
          >
            ▼
          </button>

          {/* Gas Button (Primary accelerator) */}
          <button
            {...bindTouchHandlers('forward')}
            aria-label="Gas Maju"
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black backdrop-blur-xl border transition-all active:scale-90 select-none touch-none shadow-xl ${
              controls.forward
                ? 'bg-cyan-400 text-black border-cyan-200 shadow-[0_0_28px_rgba(6,182,212,0.95)] scale-95'
                : 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            ▲
          </button>
        </div>
      </div>
    </div>
  );
}
