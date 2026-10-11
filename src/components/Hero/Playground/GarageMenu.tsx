'use client';

import { useState } from 'react';
import {
  LuCar,
  LuSparkles,
  LuUsers,
  LuChevronDown,
  LuChevronUp,
  LuDice5,
  LuShieldAlert,
  LuWrench,
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
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'model' | 'color' | 'pilot'>('model');

  const handleRandomizeName = () => {
    const randomPick = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const uniqueSuffix = Math.floor(Math.random() * 90 + 10);
    const generated = `${randomPick.split('_')[0]}_${uniqueSuffix}`;
    onUpdateUsername(generated);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-24 sm:bottom-6 right-3 sm:right-6 z-40 transition-all duration-500 ease-out pointer-events-auto ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      <div className="w-[310px] sm:w-[350px] rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-300">
        {/* ─────────────────────────────────────────────────────────────
            HEADER BAR (Garage Title, Room Status, Collapse Button)
        ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/60 border-b border-border/40 select-none">
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
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  v2.0
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                    <span className="text-amber-300">Spectator ({playerCount}/{maxPlayers})</span>
                  ) : (
                    <span>{playerCount}/{maxPlayers} Online</span>
                  )
                ) : roomStatus === 'offline' ? (
                  'Solo'
                ) : (
                  'Connecting...'
                )}
              </span>
            </div>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Buka Garage' : 'Kecilkan Garage'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              {collapsed ? <LuChevronUp className="w-4 h-4" /> : <LuChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            BODY CONTENT (Visible when not collapsed)
        ───────────────────────────────────────────────────────────── */}
        {!collapsed && (
          <div className="p-3.5 space-y-3.5 select-none">
            {/* Spectator Notice if room is full */}
            {isSpectator && (
              <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-tight">
                <LuShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Room penuh ({maxPlayers} pemain). Kamu masuk sebagai <strong>Penonton</strong>! Mobilmu aktif di sesi lokal.
                </p>
              </div>
            )}

            {/* Navigation Tabs (Model | Color | Pilot) */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-neutral-900/80 border border-border/50 text-[11px] font-semibold text-center">
              <button
                onClick={() => setActiveTab('model')}
                className={`py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'model'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Model
              </button>
              <button
                onClick={() => setActiveTab('color')}
                className={`py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'color'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Warna
              </button>
              <button
                onClick={() => setActiveTab('pilot')}
                className={`py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'pilot'
                    ? 'bg-neutral-800 text-white shadow-sm border border-border/60'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pilot
              </button>
            </div>

            {/* ─────────────────────────────────────────────────────────
                TAB 1: 3 CAR MODELS SELECTION
            ───────────────────────────────────────────────────────── */}
            {activeTab === 'model' && (
              <div className="space-y-2">
                {CAR_MODEL_CONFIGS.map((car) => {
                  const isSelected = currentModel === car.id;
                  return (
                    <button
                      key={car.id}
                      onClick={() => onSelectModel(car.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)]'
                          : 'bg-neutral-950/70 border-border/50 hover:bg-neutral-900 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition ${
                            isSelected ? 'text-black' : 'text-gray-400 bg-neutral-800'
                          }`}
                          style={{
                            backgroundColor: isSelected ? currentColor : undefined,
                          }}
                        >
                          <LuCar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{car.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-gray-300">
                              {car.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                            {car.desc}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-md"
                          style={{ backgroundColor: currentColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 2: NEON PALETTE SELECTION
            ───────────────────────────────────────────────────────── */}
            {activeTab === 'color' && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-400 font-medium">
                  Pilih warna bodi & underglow neon mobil:
                </p>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {CAR_COLORS.map((c) => {
                    const isSelected = currentColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelectColor(c.hex)}
                        title={c.name}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 border-white shadow-lg scale-105'
                            : 'bg-neutral-950/60 border-border/50 hover:border-border hover:scale-102'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-xl shadow-md transition-transform group-hover:scale-110 flex items-center justify-center"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: isSelected ? `0 0 14px ${c.hex}` : undefined,
                          }}
                        >
                          {isSelected && <span className="text-black text-xs font-black">✓</span>}
                        </div>
                        <span className="text-[9px] font-medium text-gray-300 truncate max-w-[50px]">
                          {c.name.split(' ')[1] || c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                TAB 3: PILOT USERNAME CUSTOMIZATION
            ───────────────────────────────────────────────────────── */}
            {activeTab === 'pilot' && (
              <div className="space-y-2.5">
                <label className="text-[11px] text-gray-400 font-medium block">
                  Username Pilot (Tampil di atas mobil):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={username}
                    maxLength={14}
                    onChange={(e) => onUpdateUsername(e.target.value)}
                    placeholder="Nama Pilot..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-border/80 focus:border-cyan-400 text-white text-xs font-semibold placeholder-gray-500 outline-none transition"
                  />
                  <button
                    onClick={handleRandomizeName}
                    title="Acak nama pilot"
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-cyan-300 border border-border/80 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <LuDice5 className="w-4 h-4" />
                    <span>Acak</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  Nama otomatis tersinkron ke mobil pemain lain secara real-time.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
