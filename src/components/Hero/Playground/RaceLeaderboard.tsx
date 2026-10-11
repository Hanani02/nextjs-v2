'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LuTrophy,
  LuTimer,
  LuFlag,
  LuMinimize2,
  LuRotateCcw,
  LuRefreshCw,
  LuUsers,
} from 'react-icons/lu';
import type { LeaderboardEntry } from '@/types/vehicle';
import {
  fetchGlobalLeaderboard,
  type CircuitLeaderboardRecord,
} from '@/lib/circuitLeaderboard';

interface RaceLeaderboardProps {
  currentLap: number;
  maxLaps?: number;
  currentLapTime: number;
  bestLapTime: number;
  totalRaceTime?: number;
  leaderboard: LeaderboardEntry[];
  isFinished: boolean;
  onRestartRace: () => void;
  visible: boolean;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '--:--.--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins > 0 ? `${mins}:` : ''}${secs.toString().padStart(2, '0')}.${ms
    .toString()
    .padStart(2, '0')}`;
}

export default function RaceLeaderboard({
  currentLap,
  maxLaps = 3,
  currentLapTime,
  bestLapTime,
  totalRaceTime = 0,
  leaderboard,
  isFinished,
  onRestartRace,
  visible,
}: RaceLeaderboardProps) {
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'room' | 'global'>('room');
  const [globalRecords, setGlobalRecords] = useState<CircuitLeaderboardRecord[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  // Mengambil daftar top rekor dari Supabase
  const loadGlobalRecords = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const records = await fetchGlobalLeaderboard(10);
      setGlobalRecords(records);
    } catch {
      // Ignored
    } finally {
      setIsLoadingGlobal(false);
    }
  }, []);

  // Fetch pertama saat render dan auto-refresh saat race selesai
  useEffect(() => {
    loadGlobalRecords();
  }, [loadGlobalRecords, isFinished]);

  if (!visible) return null;

  return (
    <div className="absolute top-16 sm:top-20 right-3 sm:right-6 z-40 select-none pointer-events-auto transition-all duration-300">
      {minimized ? (
        /* ─────────────────────────────────────────────────────────────
            MINIMIZED PILL: Lap & Total / Current Time Badge
        ───────────────────────────────────────────────────────────── */
        <button
          onClick={() => setMinimized(false)}
          title="Buka Leaderboard Balapan"
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-cyan-500/40 text-white backdrop-blur-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="flex items-center gap-1 text-cyan-400 font-mono text-xs font-bold">
            <LuFlag className="w-3.5 h-3.5" />
            <span>
              {isFinished ? 'FINISH' : `LAP ${Math.min(currentLap, maxLaps)}/${maxLaps}`}
            </span>
          </div>
          <span className="text-amber-400 text-xs font-mono font-semibold">
            {formatTime(totalRaceTime > 0 ? totalRaceTime : currentLapTime)}
          </span>
          <LuTrophy className="w-3.5 h-3.5 text-amber-400" />
        </button>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            EXPANDED LEADERBOARD CARD
        ───────────────────────────────────────────────────────────── */
        <div className="w-[280px] sm:w-[310px] rounded-2xl bg-neutral-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900/80 border-b border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🏁</span>
              <span className="text-xs font-bold text-white tracking-wide">
                Neon Circuit
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {isFinished ? '3/3 FINISH' : `Lap ${Math.min(currentLap, maxLaps)}/${maxLaps}`}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(true)}
                title="Minimize Leaderboard"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <LuMinimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timers Bar: 3 Metrics (Total, Current Lap, Best Lap) */}
          <div className="grid grid-cols-3 gap-1 px-3 py-2 bg-neutral-900/50 border-b border-border/30 text-xs font-mono">
            {/* Total Race Time */}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-amber-400/90 font-semibold">Total</span>
              <span className="font-bold text-amber-300 text-[11px] truncate">{formatTime(totalRaceTime)}</span>
            </div>

            {/* Current Lap Time */}
            <div className="flex flex-col border-l border-border/30 pl-2">
              <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-semibold">Lap Ini</span>
              <span className="font-bold text-cyan-300 text-[11px] truncate">{formatTime(currentLapTime)}</span>
            </div>

            {/* Best Lap */}
            <div className="flex flex-col border-l border-border/30 pl-2">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">Best</span>
              <span className="font-bold text-emerald-300 text-[11px] truncate">{formatTime(bestLapTime)}</span>
            </div>
          </div>

          {/* Race Finished Banner */}
          {isFinished && (
            <div className="px-3 py-1.5 bg-emerald-500/20 border-b border-emerald-500/40 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-emerald-300">
                  🎉 FINISH 3 LAP!
                </span>
                <span className="text-[9px] font-mono text-emerald-400">
                  Total: {formatTime(totalRaceTime)}
                </span>
              </div>
              <button
                onClick={onRestartRace}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[10px] font-bold transition active:scale-95 cursor-pointer"
              >
                <LuRotateCcw className="w-3 h-3" />
                <span>Ulang</span>
              </button>
            </div>
          )}

          {/* Tab Navigation: Live Room vs Rekor Supabase */}
          <div className="flex border-b border-border/30 bg-neutral-900/50 text-[10px] font-semibold">
            <button
              onClick={() => setActiveTab('room')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'room'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LuUsers className="w-3 h-3" />
              <span>Room ({leaderboard.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('global');
                loadGlobalRecords();
              }}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'global'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-950/20 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LuTrophy className="w-3 h-3 text-amber-400" />
              <span>Rekor Supabase</span>
            </button>
          </div>

          {/* Standings List Container */}
          <div className="p-2 space-y-1 max-h-[160px] overflow-y-auto">
            {activeTab === 'room' ? (
              /* TAB 1: Live Multiplayer Room Standings */
              leaderboard.map((entry, idx) => {
                const rank = idx + 1;
                const medal =
                  rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-2 py-1 rounded-xl text-xs transition-colors ${
                      entry.isSelf
                        ? 'bg-cyan-950/50 border border-cyan-500/40 text-white font-semibold'
                        : 'bg-neutral-900/50 text-gray-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs shrink-0">{medal}</span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate max-w-[90px] sm:max-w-[110px]">
                        {entry.username}
                        {entry.isSelf && <span className="text-[9px] text-cyan-400 ml-1 font-bold">[YOU]</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                      <span className="text-gray-400">
                        {entry.isFinished
                          ? 'FIN'
                          : `L${Math.min(entry.currentLap, maxLaps)}`}
                      </span>
                      <span className="text-amber-300/90 font-bold">
                        {entry.bestLapTime > 0 ? `${entry.bestLapTime.toFixed(1)}s` : '--'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* TAB 2: Supabase Global Hall of Fame */
              <div>
                <div className="flex items-center justify-between px-1 pb-1 text-[9px] text-gray-400 font-mono uppercase tracking-wider border-b border-border/20 mb-1">
                  <span>Pembalap</span>
                  <div className="flex items-center gap-2">
                    <span>Total</span>
                    <button
                      onClick={loadGlobalRecords}
                      title="Refresh Rekor Supabase"
                      className="text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      <LuRefreshCw className={`w-2.5 h-2.5 ${isLoadingGlobal ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {isLoadingGlobal && globalRecords.length === 0 ? (
                  <div className="py-4 text-center text-gray-400 text-xs">
                    Memuat rekor Supabase...
                  </div>
                ) : globalRecords.length === 0 ? (
                  <div className="py-4 text-center text-gray-400 text-[11px]">
                    Belum ada rekor di database.<br />
                    <span className="text-[9px] text-gray-500">Jadilah yang pertama finis 3 lap!</span>
                  </div>
                ) : (
                  globalRecords.map((rec, idx) => {
                    const rank = idx + 1;
                    const medal =
                      rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

                    return (
                      <div
                        key={rec.id || idx}
                        className="flex items-center justify-between px-2 py-1 rounded-xl text-xs bg-neutral-900/50 text-gray-200 hover:bg-neutral-900/80 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs shrink-0">{medal}</span>
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: rec.car_color || '#06b6d4' }}
                          />
                          <span className="truncate max-w-[95px] sm:max-w-[115px] font-medium">
                            {rec.username}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                          <span className="text-amber-300 font-bold">
                            {formatTime(rec.total_time)}
                          </span>
                          <span className="text-gray-500 text-[10px]">
                            ({rec.best_lap_time.toFixed(1)}s)
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
