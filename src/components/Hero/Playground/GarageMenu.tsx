'use client';

import { useState, useEffect } from 'react';
import {
  LuCar,
  LuDice5,
  LuShieldAlert,
  LuWrench,
  LuMinimize2,
  LuX,
  LuPalette,
  LuUser,
} from 'react-icons/lu';
import { CAR_COLORS, type CarModelType } from '@/types/vehicle';

interface GarageMenuProps {
  currentModel: CarModelType;
  currentColor: string;
  username: string;
  playerCount: number;
  maxPlayers: number;
  isSpectator: boolean;
  roomStatus: 'connecting' | 'connected' | 'offline' | 'full';
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
  'Pulse_11',
  'Echo_23',
  'Nitro_88',
  'Apex_05',
];

export default function GarageMenu({
  currentModel,
  currentColor,
  username,
  playerCount,
  maxPlayers,
  isSpectator,
  roomStatus,
  onSelectModel,
  onSelectColor,
  onUpdateUsername,
  visible,
}: GarageMenuProps) {
  // Start minimized by default so it doesn't crowd the screen
  const [minimized, setMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<'model' | 'color' | 'pilot'>('model');

  // Load user minimize preference if saved
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('garage_menu_minimized');
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
      sessionStorage.setItem('garage_menu_minimized', String(val));
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
          Doesn't clutter the screen, glowing neon accent, 1-click expand
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
              {/* Online pulse indicator */}
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
                : 'Kustomisasi'}
            </span>
          </div>

          {/* Model Tag Pill */}
          <span
            className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-neutral-900 border border-white/10 text-gray-300"
            style={{ color: currentColor }}
          >
            {currentModel}
          </span>
        </button>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. EXPANDED STATE: FULL GARAGE CUSTOMIZATION PANEL
            With minimize icon button in top-right corner
        ───────────────────────────────────────────────────────────── */
        <div className="w-[300px] sm:w-[340px] rounded-3xl bg-neutral-950/90 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-neutral-900/70 border-b border-border/40 select-none">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-black font-black text-xs shadow-md"
                style={{ backgroundColor: currentColor }}
              >
                <LuWrench className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>Cyber Garage</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    v2.0
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Multiplayer Room Status Pill */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-border/60 text-[10px] font-semibold">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    roomStatus === 'connected'
                      ? isSpectator
                        ? 'bg-amber-400'
                        : 'bg-emerald-400 animate-pulse'
                      : roomStatus === 'connecting'
                      ? 'bg-cyan-400 animate-ping'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-gray-300">
                  {roomStatus === 'connected' ? (
                    isSpectator ? (
                      <span className="text-amber-300">Spec ({playerCount}/{maxPlayers})</span>
                    ) : (
                      <span>{playerCount}/{maxPlayers}</span>
                    )
                  ) : roomStatus === 'offline' ? (
                    'Solo'
                  ) : (
                    '...'
                  )}
                </span>
              </div>

              {/* Minimize to Icon Button */}
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
            {/* Spectator Notice if room is full */}
            {isSpectator && (
              <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[10px] leading-tight">
                <LuShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Room penuh ({maxPlayers} pemain). Kamu masuk sebagai <strong>Penonton</strong>! Mobilmu aktif di sesi lokal.
                </p>
              </div>
            )}

            {/* Navigation Tabs (Model | Warna | Pilot) */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-neutral-900/80 border border-border/50 text-[11px] font-semibold text-center">
              <button
                onClick={() => setActiveTab('model')}
                className={`py-1 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
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
                className={`py-1 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
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
                className={`py-1 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'pilot'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LuUser className="w-3 h-3" />
                <span>Pilot</span>
              </button>
            </div>

            {/* TAB 1: 3 CAR MODELS */}
            {activeTab === 'model' && (
              <div className="space-y-1.5">
                {CAR_MODEL_CONFIGS.map((car) => {
                  const isSelected = currentModel === car.id;
                  return (
                    <button
                      key={car.id}
                      onClick={() => onSelectModel(car.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.25)]'
                          : 'bg-neutral-950/70 border-border/50 hover:bg-neutral-900 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition ${
                            isSelected ? 'text-black' : 'text-gray-400 bg-neutral-800'
                          }`}
                          style={{
                            backgroundColor: isSelected ? currentColor : undefined,
                          }}
                        >
                          <LuCar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white">{car.name}</span>
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-gray-300">
                              {car.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-tight">
                            {car.desc}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full shadow-md"
                          style={{ backgroundColor: currentColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: NEON PALETTE */}
            {activeTab === 'color' && (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 font-medium">
                  Pilih warna bodi & underglow neon:
                </p>
                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
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
