'use client';

import { useState, useEffect } from 'react';
import {
  LuCar,
  LuDice5,
  LuShieldAlert,
  LuWrench,
  LuMinimize2,
  LuPalette,
  LuUser,
  LuSlidersHorizontal,
  LuFlame,
  LuGauge,
  LuMonitor,
} from 'react-icons/lu';
import { CAR_COLORS, type CarModelType, type GraphicsQuality } from '@/types/vehicle';
import type { DriftSlicknessMode } from './carPhysics';

interface GarageMenuProps {
  currentModel: CarModelType;
  currentColor: string;
  username: string;
  playerCount: number;
  maxPlayers: number;
  isSpectator: boolean;
  roomStatus: 'connecting' | 'connected' | 'offline' | 'full';
  steeringSensitivity?: number;
  onUpdateSensitivity?: (val: number) => void;
  driftSlickness?: DriftSlicknessMode;
  onUpdateDriftSlickness?: (mode: DriftSlicknessMode) => void;
  graphicsQuality?: GraphicsQuality;
  onUpdateGraphicsQuality?: (quality: GraphicsQuality) => void;
  onSelectModel: (model: CarModelType) => void;
  onSelectColor: (color: string) => void;
  onUpdateUsername: (name: string) => void;
  visible: boolean;
}

const CAR_MODEL_CONFIGS: {
  id: CarModelType;
  name: string;
  tag: string;
  desc: string;
}[] = [
  {
    id: 'sport',
    name: 'Cyber Sport',
    tag: 'GT Wing',
    desc: 'Bodi ceper aerodinamis & spoiler belakang.',
  },
  {
    id: 'truck',
    name: 'Rover Truck',
    tag: 'Lightbar',
    desc: 'Bodi kotak tangguh, ban besar & roof lightbar.',
  },
  {
    id: 'buggy',
    name: 'Dune Buggy',
    tag: 'Neon Whip',
    desc: 'Roll-cage kompak mini & antena neon lincah.',
  },
];

const RANDOM_NAMES = [
  'Pilot_01',
  'Drift_99',
  'Neon_42',
  'Vortex_07',
  'Apex_88',
  'Cyber_13',
  'Speed_55',
  'Turbo_21',
  'Monza_77',
];

export default function GarageMenu({
  currentModel,
  currentColor,
  username,
  playerCount,
  maxPlayers,
  isSpectator,
  roomStatus,
  steeringSensitivity = 1.0,
  onUpdateSensitivity,
  driftSlickness = 'slippery',
  onUpdateDriftSlickness,
  graphicsQuality = 'medium',
  onUpdateGraphicsQuality,
  onSelectModel,
  onSelectColor,
  onUpdateUsername,
  visible,
}: GarageMenuProps) {
  const [minimized, setMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<'model' | 'color' | 'pilot' | 'handling'>('model');

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('garage_minimized');
      if (saved !== null) {
        setMinimized(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleMinimized = (val: boolean) => {
    setMinimized(val);
    try {
      sessionStorage.setItem('garage_minimized', String(val));
    } catch {
      // ignore
    }
  };

  const handleRandomizeName = () => {
    const randomPick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const uniqueSuffix = Math.floor(Math.random() * 90 + 10);
    const generated = `${randomPick.split('_')[0]}_${uniqueSuffix}`;
    onUpdateUsername(generated);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 transition-all duration-500 ease-out pointer-events-auto ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. MINIMIZED STATE: COMPACT FLOATING ICON BUTTON
      ───────────────────────────────────────────────────────────── */}
      {minimized ? (
        <button
          onClick={() => toggleMinimized(false)}
          aria-label="Buka Cyber Garage Kustomisasi"
          className="group relative flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-neutral-950/90 hover:bg-neutral-900 border border-cyan-500/40 hover:border-cyan-400 text-white shadow-[0_0_24px_rgba(6,182,212,0.35)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
        >
          {/* Glowing Wrench Icon with user's selected neon color */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-black font-black text-xs sm:text-sm shadow-md transition-transform duration-300 group-hover:rotate-12"
            style={{
              backgroundColor: currentColor,
              boxShadow: `0 0 14px ${currentColor}90`,
            }}
          >
            <LuWrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>

          {/* Text Info */}
          <div className="flex flex-col text-left pr-0.5 sm:pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Garage</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  roomStatus === 'connected'
                    ? isSpectator
                      ? 'bg-amber-400'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-mono leading-tight">
              {roomStatus === 'connected'
                ? isSpectator
                  ? 'Spectator'
                  : `${playerCount}/${maxPlayers} Online`
                : 'Solo Mode'}
            </span>
          </div>
        </button>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. EXPANDED STATE: FULL GARAGE MODAL WITH 4 TABS
        ───────────────────────────────────────────────────────────── */
        <div className="w-[300px] sm:w-[340px] rounded-3xl bg-neutral-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-900/80 border-b border-border/40 select-none">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-black font-black shadow-sm"
                style={{ backgroundColor: currentColor }}
              >
                <LuWrench className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Cyber Garage</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    v2.5
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-border/60 text-[10px] font-semibold">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    roomStatus === 'connected'
                      ? isSpectator
                        ? 'bg-amber-400'
                        : 'bg-emerald-400 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-gray-300">
                  {roomStatus === 'connected'
                    ? isSpectator
                      ? `Spec (${playerCount}/${maxPlayers})`
                      : `${playerCount}/${maxPlayers}`
                    : 'Solo'}
                </span>
              </div>

              <button
                onClick={() => toggleMinimized(true)}
                title="Minimize ke bentuk icon"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-300 hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
              >
                <LuMinimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-3 space-y-3 select-none max-h-[70vh] overflow-y-auto">
            {isSpectator && (
              <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[10px] leading-tight">
                <LuShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Room penuh ({maxPlayers} pemain). Kamu masuk sebagai <strong>Penonton</strong>! Mobilmu aktif di sesi lokal.
                </p>
              </div>
            )}

            {/* Navigation Tabs (Model | Warna | Pilot | Handling) */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-neutral-900/80 border border-border/50 text-[10px] font-semibold text-center">
              <button
                onClick={() => setActiveTab('model')}
                className={`py-1 rounded-xl transition flex items-center justify-center gap-0.5 cursor-pointer ${
                  activeTab === 'model'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LuCar className="w-3 h-3" />
                <span>Model</span>
              </button>
              <button
                onClick={() => setActiveTab('color')}
                className={`py-1 rounded-xl transition flex items-center justify-center gap-0.5 cursor-pointer ${
                  activeTab === 'color'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LuPalette className="w-3 h-3" />
                <span>Warna</span>
              </button>
              <button
                onClick={() => setActiveTab('pilot')}
                className={`py-1 rounded-xl transition flex items-center justify-center gap-0.5 cursor-pointer ${
                  activeTab === 'pilot'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LuUser className="w-3 h-3" />
                <span>Pilot</span>
              </button>
              <button
                onClick={() => setActiveTab('handling')}
                className={`py-1 rounded-xl transition flex items-center justify-center gap-0.5 cursor-pointer ${
                  activeTab === 'handling'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LuGauge className="w-3 h-3 text-cyan-400" />
                <span>Handling</span>
              </button>
            </div>

            {/* TAB 1: MODEL */}
            {activeTab === 'model' && (
              <div className="space-y-1.5">
                {CAR_MODEL_CONFIGS.map((cfg) => {
                  const isSelected = currentModel === cfg.id;
                  return (
                    <button
                      key={cfg.id}
                      onClick={() => onSelectModel(cfg.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)]'
                          : 'bg-neutral-900/60 border-border/60 hover:bg-neutral-900 hover:border-border'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{cfg.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                            {cfg.tag}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5">{cfg.desc}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-gray-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: COLOR */}
            {activeTab === 'color' && (
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-medium block">
                  Pilih Palet Cat Neon:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {CAR_COLORS.map((c) => {
                    const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelectColor(c.hex)}
                        title={c.name}
                        className={`group flex flex-col items-center gap-1 p-1.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 border-white shadow-md scale-105'
                            : 'bg-neutral-950/60 border-border/50 hover:border-border hover:scale-102'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-xl shadow-md transition-transform group-hover:scale-110 flex items-center justify-center"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: isSelected ? `0 0 12px ${c.hex}` : undefined,
                          }}
                        >
                          {isSelected && <span className="text-black text-[10px] font-black">✓</span>}
                        </div>
                        <span className="text-[8px] font-medium text-gray-300 truncate max-w-[42px]">
                          {c.name.split(' ')[1] || c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PILOT USERNAME */}
            {activeTab === 'pilot' && (
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-medium block">
                  Username Pilot (Tampil di atas mobil):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={username}
                    maxLength={14}
                    onChange={(e) => onUpdateUsername(e.target.value)}
                    placeholder="Nama Pilot..."
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-border/80 focus:border-cyan-400 text-white text-xs font-semibold placeholder-gray-500 outline-none transition"
                  />
                  <button
                    onClick={handleRandomizeName}
                    title="Acak nama pilot"
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-cyan-300 border border-border/80 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <LuDice5 className="w-3.5 h-3.5" />
                    <span>Acak</span>
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 leading-tight">
                  Tersinkron otomatis ke mobil pemain lain via Realtime.
                </p>
              </div>
            )}

            {/* TAB 4: HANDLING & SENSITIVITY TUNING */}
            {activeTab === 'handling' && (
              <div className="space-y-3">
                {/* Steering Sensitivity */}
                <div className="space-y-1">
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
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    {[
                      { label: 'Santai', val: 0.75 },
                      { label: 'Normal', val: 1.0 },
                      { label: 'Agresif', val: 1.35 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => onUpdateSensitivity?.(p.val)}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-semibold border transition ${
                          Math.abs(steeringSensitivity - p.val) < 0.05
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-neutral-900 border-border/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drift Slickness */}
                <div className="space-y-1.5 border-t border-border/40 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-300 font-medium flex items-center gap-1">
                      <LuFlame className="w-3 h-3 text-rose-400" />
                      <span>Kelicinan Drift:</span>
                    </span>
                    <span className="font-mono text-[9px] text-rose-300 capitalize font-bold">
                      {driftSlickness === 'hyper'
                        ? 'Hyper Slick'
                        : driftSlickness === 'slippery'
                        ? 'Licin'
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
                        className={`py-1 rounded-lg text-[9px] font-bold border transition ${
                          driftSlickness === mode.id
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                            : 'bg-neutral-900 border-border/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kualitas Grafis (Graphics Quality: Low, Medium, High) */}
                <div className="space-y-1.5 border-t border-border/40 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-300 font-medium flex items-center gap-1">
                      <LuMonitor className="w-3 h-3 text-emerald-400" />
                      <span>Kualitas Grafis:</span>
                    </span>
                    <span className="font-mono text-[9px] text-emerald-300 uppercase font-bold">
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
                        className={`py-1 rounded-lg text-[9px] font-bold border transition flex flex-col items-center cursor-pointer ${
                          graphicsQuality === g.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-neutral-900 border-border/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{g.label}</span>
                        <span className="text-[7.5px] font-normal opacity-75">{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Minimize Action Button at bottom */}
            <div className="pt-1 border-t border-border/30">
              <button
                onClick={() => toggleMinimized(true)}
                className="w-full py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-border/50 text-gray-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LuMinimize2 className="w-3 h-3 text-cyan-400" />
                <span>Minimize ke Icon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
