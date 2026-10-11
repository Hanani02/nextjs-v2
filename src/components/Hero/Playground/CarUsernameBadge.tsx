'use client';

import { Html } from '@react-three/drei';
import type { CarModelType } from '@/types/vehicle';

interface CarUsernameBadgeProps {
  username: string;
  isSelf: boolean;
  color: string;
  model: CarModelType;
  isDrifting?: boolean;
  speed?: number;
  activeEmote?: string | null;
}

export default function CarUsernameBadge({
  username,
  isSelf,
  color,
  model,
  isDrifting = false,
  speed = 0,
  activeEmote,
}: CarUsernameBadgeProps) {
  // Height offset above the car based on vehicle model
  const heightOffset = model === 'truck' ? 1.55 : model === 'buggy' ? 1.45 : 1.3;

  return (
    <Html
      position={[0, heightOffset, 0]}
      center
      distanceFactor={14}
      className="pointer-events-none select-none z-10"
      style={{
        transition: 'all 0.15s ease-out',
      }}
    >
      <div className="flex flex-col items-center gap-1 -translate-y-1">
        {/* Floating Quick Emote Reaction Bubble */}
        {activeEmote && (
          <div className="animate-in zoom-in-75 fade-in slide-in-from-bottom-2 duration-150 px-3.5 py-1.5 rounded-2xl bg-neutral-950/95 border-2 border-cyan-400 text-white font-black text-xs shadow-[0_0_25px_rgba(34,211,238,0.9)] backdrop-blur-xl flex items-center gap-1.5 whitespace-nowrap animate-bounce">
            <span className="text-sm drop-shadow">{activeEmote}</span>
          </div>
        )}

        {/* Drift Flame Tag */}
        {isDrifting && (
          <div className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[9px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-bounce flex items-center gap-1 border border-rose-400">
            <span>🔥</span>
            <span>DRIFT</span>
          </div>
        )}

        {/* Main Floating Glass Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xl transition-all duration-200 shadow-xl ${
            isSelf
              ? 'bg-neutral-950/90 border border-cyan-400/80 text-white shadow-[0_0_16px_rgba(6,182,212,0.4)]'
              : 'bg-neutral-950/85 border border-white/20 text-neutral-200'
          }`}
          style={{
            borderColor: isSelf ? '#22d3ee' : color,
            boxShadow: `0 0 14px ${color}40`,
          }}
        >
          {/* Online Pulsing Indicator Dot */}
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: color }}
            />
          </span>

          {/* Self Marker Tag */}
          {isSelf && (
            <span className="px-1.5 py-0.2 rounded-md bg-cyan-500 text-black text-[9px] font-extrabold tracking-wider uppercase">
              YOU
            </span>
          )}

          {/* Username Text */}
          <span className="tracking-tight max-w-[100px] truncate">
            {username || (isSelf ? 'Pilot_01' : 'Player')}
          </span>

          {/* Miniature Model Tag */}
          <span
            className="text-[9px] font-mono px-1 rounded uppercase tracking-tighter opacity-80"
            style={{ color }}
          >
            {model}
          </span>
        </div>
      </div>
    </Html>
  );
}
