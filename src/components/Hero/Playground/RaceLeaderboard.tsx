'use client';

import { useState } from 'react';
import {
  LuTrophy,
  LuTimer,
  LuFlag,
  LuMinimize2,
  LuMaximize2,
  LuRotateCcw,
} from 'react-icons/lu';
import type { LeaderboardEntry } from '@/types/vehicle';

interface RaceLeaderboardProps {
  currentLap: number;
  maxLaps?: number;
  currentLapTime: number;
  bestLapTime: number;
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
  leaderboard,
  isFinished,
  onRestartRace,
  visible,
}: RaceLeaderboardProps) {
  const [minimized, setMinimized] = useState(false);

  if (!visible) return null;

  return (
    <div className="absolute top-16 sm:top-20 right-3 sm:right-6 z-40 select-none pointer-events-auto transition-all duration-300">
      {minimized ? (
        /* ─────────────────────────────────────────────────────────────
            MINIMIZED PILL: Lap & Current Time Badge
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
          <span className="text-gray-400 text-xs font-mono">
            {formatTime(currentLapTime)}
          </span>
          <LuTrophy className="w-3.5 h-3.5 text-amber-400" />
        </button>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            EXPANDED LEADERBOARD CARD
        ───────────────────────────────────────────────────────────── */
        <div className="w-[260px] sm:w-[290px] rounded-2xl bg-neutral-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
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

          {/* Timers Bar */}
          <div className="grid grid-cols-2 gap-1.5 px-3 py-2 bg-neutral-900/40 border-b border-border/30 text-xs font-mono">
            <div className="flex items-center gap-1 text-gray-300">
              <LuTimer className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-gray-400">Current</span>
                <span className="font-bold text-cyan-300">{formatTime(currentLapTime)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-300">
              <LuTrophy className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-gray-400">Best Lap</span>
                <span className="font-bold text-amber-300">{formatTime(bestLapTime)}</span>
              </div>
            </div>
          </div>

          {/* Race Finished Banner */}
          {isFinished && (
            <div className="px-3 py-1.5 bg-emerald-500/20 border-b border-emerald-500/40 flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-300">
                🎉 RACE COMPLETED!
              </span>
              <button
                onClick={onRestartRace}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[10px] font-bold transition active:scale-95 cursor-pointer"
              >
                <LuRotateCcw className="w-3 h-3" />
                <span>Restart</span>
              </button>
            </div>
          )}

          {/* Standings List */}
          <div className="p-2 space-y-1 max-h-[160px] overflow-y-auto">
            {leaderboard.map((entry, idx) => {
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
                    <span className="truncate max-w-[85px] sm:max-w-[100px]">
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
