'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LuMapPin, LuMinimize2, LuCompass } from 'react-icons/lu';
import {
  MONZA_SAMPLED_POINTS,
  MONZA_BOUNDS,
  MONZA_CHECKPOINTS,
} from './monzaTrack';
import type { PlayerVehicleState } from '@/types/vehicle';

interface MinimapProps {
  carPosRef: React.RefObject<THREE.Vector3>;
  carHeadingRef: React.RefObject<number>;
  remotePlayersRef?: React.RefObject<Record<string, PlayerVehicleState>>;
  activePlayerIds?: string[];
  activeCheckpoint?: number;
  visible?: boolean;
}

export default function Minimap({
  carPosRef,
  carHeadingRef,
  remotePlayersRef,
  activePlayerIds = [],
  activeCheckpoint = 0,
  visible = true,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMinimized(true);
    }
  }, []);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark transparent radar background
      ctx.clearRect(0, 0, width, height);

      // Radar Grid Background
      ctx.fillStyle = 'rgba(8, 12, 22, 0.95)';
      ctx.fillRect(0, 0, width, height);

      // Subtle Radar Coordinate Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridStep = 24;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // World-to-Minimap transformation parameters
      const { minX, maxX, minZ, maxZ } = MONZA_BOUNDS;
      const padding = 14;

      const scaleX = (width - padding * 2) / (maxX - minX);
      const scaleZ = (height - padding * 2) / (maxZ - minZ);
      const scale = Math.min(scaleX, scaleZ);

      const offsetX = (width - (maxX - minX) * scale) / 2;
      const offsetY = (height - (maxZ - minZ) * scale) / 2;

      // Project 3D World (X, Z) into 2D Canvas (px, py)
      // Z=-25 (Rettifilo) is at the bottom, Z=42 (Lesmo) is at the top
      const worldToCanvas = (wx: number, wz: number): [number, number] => {
        const px = offsetX + (wx - minX) * scale;
        const py = height - (offsetY + (wz - minZ) * scale);
        return [px, py];
      };

      const points = MONZA_SAMPLED_POINTS;
      if (points.length < 2) {
        animId = requestAnimationFrame(render);
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // 1. DRAW MONZA TRACK BED (Broad Asphalt Silhouette)
      // ─────────────────────────────────────────────────────────────
      ctx.beginPath();
      const [startX, startY] = worldToCanvas(points[0].x, points[0].z);
      ctx.moveTo(startX, startY);
      for (let i = 1; i < points.length; i++) {
        const [px, py] = worldToCanvas(points[i].x, points[i].z);
        ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Outer track curb casing
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 0;
      ctx.stroke();

      // ─────────────────────────────────────────────────────────────
      // 2. DRAW NEON RACING LINE (Cyan Glow Outline)
      // ─────────────────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let i = 1; i < points.length; i++) {
        const [px, py] = worldToCanvas(points[i].x, points[i].z);
        ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ─────────────────────────────────────────────────────────────
      // 3. START / FINISH LINE MARKER (Rettifilo Straight at X=0, Z=-25)
      // ─────────────────────────────────────────────────────────────
      const [sfX, sfY] = worldToCanvas(0, -25);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sfX, sfY - 4);
      ctx.lineTo(sfX, sfY + 4);
      ctx.stroke();

      // ─────────────────────────────────────────────────────────────
      // 4. CHECKPOINT GATES ON RADAR
      // ─────────────────────────────────────────────────────────────
      for (const cp of MONZA_CHECKPOINTS) {
        const [cpx, cpy] = worldToCanvas(cp.center[0], cp.center[1]);
        const isCurrent = cp.id === activeCheckpoint;

        ctx.beginPath();
        ctx.arc(cpx, cpy, isCurrent ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#22d3ee' : 'rgba(168, 85, 247, 0.7)';
        ctx.shadowColor = isCurrent ? '#22d3ee' : 'transparent';
        ctx.shadowBlur = isCurrent ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─────────────────────────────────────────────────────────────
      // 5. OTHER REMOTE MULTIPLAYER PLAYERS
      // ─────────────────────────────────────────────────────────────
      if (remotePlayersRef?.current && activePlayerIds.length > 0) {
        const remotes = remotePlayersRef.current;
        for (const id of activePlayerIds) {
          const p = remotes[id];
          if (!p || typeof p.x !== 'number' || typeof p.z !== 'number') continue;

          const [rpx, rpy] = worldToCanvas(p.x, p.z);

          // Dot
          ctx.beginPath();
          ctx.arc(rpx, rpy, 3.8, 0, Math.PI * 2);
          ctx.fillStyle = p.color || '#a855f7';
          ctx.shadowColor = p.color || '#a855f7';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Tiny Heading pointer
          if (typeof p.heading === 'number') {
            const hx = Math.sin(p.heading) * 6;
            const hy = -Math.cos(p.heading) * 6;
            ctx.beginPath();
            ctx.moveTo(rpx, rpy);
            ctx.lineTo(rpx + hx, rpy + hy);
            ctx.strokeStyle = p.color || '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 6. PLAYER CAR (Neon Pulsing Dot & Heading Pointer)
      // ─────────────────────────────────────────────────────────────
      const playerPos = carPosRef.current;
      const playerHeading = carHeadingRef.current ?? Math.PI / 2;

      if (playerPos) {
        const [ppx, ppy] = worldToCanvas(playerPos.x, playerPos.z);

        // Blinking pulse beacon
        const now = performance.now();
        const pulse = Math.sin(now * 0.008) * 0.35 + 0.65; // 0.3 to 1.0

        // Outer Glow Halo
        ctx.beginPath();
        ctx.arc(ppx, ppy, 6.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fill();

        // Core Solid Dot (Neon Green / Cyan)
        ctx.beginPath();
        ctx.arc(ppx, ppy, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Heading Direction Indicator Line
        // In Three.js: +X is right, +Z is down. Canvas Y is inverted relative to world Z
        const hx = Math.sin(playerHeading) * 11;
        const hy = -Math.cos(playerHeading) * 11;

        ctx.beginPath();
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(ppx + hx, ppy + hy);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [carPosRef, carHeadingRef, remotePlayersRef, activePlayerIds, activeCheckpoint]);

  if (!visible) return null;

  return (
    <div className="absolute top-16 sm:top-20 left-3 sm:left-6 z-40 select-none pointer-events-auto transition-all duration-300">
      {minimized ? (
        /* Minimized Pill Button */
        <button
          onClick={() => setMinimized(false)}
          title="Buka Minimap Monza"
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-950/85 hover:bg-neutral-900 border border-cyan-500/40 text-white backdrop-blur-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <LuCompass className="w-3.5 h-3.5 text-cyan-400 animate-spin duration-3000" />
          <span className="text-xs font-mono font-bold text-cyan-300">MONZA RADAR</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      ) : (
        /* Expanded Minimap HUD Card */
        <div className="w-[195px] sm:w-[220px] rounded-2xl bg-neutral-950/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/80 border-b border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white tracking-wider font-mono">
                MONZA RADAR
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                LIVE
              </span>
              <button
                onClick={() => setMinimized(true)}
                title="Minimize Radar"
                className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <LuMinimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2D Canvas Radar Screen */}
          <div className="relative p-1.5 bg-black/40 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={210}
              height={115}
              className="w-full h-auto rounded-lg border border-cyan-950/60 block"
            />

            {/* Corner Sector Legend Labels */}
            <div className="absolute bottom-2.5 left-3 text-[8px] font-mono text-cyan-400/80 pointer-events-none drop-shadow">
              Parabolica
            </div>
            <div className="absolute top-2.5 right-3 text-[8px] font-mono text-cyan-400/80 pointer-events-none drop-shadow">
              Lesmo
            </div>
            <div className="absolute bottom-2.5 right-3 text-[8px] font-mono text-cyan-400/80 pointer-events-none drop-shadow">
              Prima Variante
            </div>
          </div>

          {/* Footer Telemetry Legend */}
          <div className="flex items-center justify-between px-2.5 py-1 bg-neutral-900/50 border-t border-border/30 text-[9px] font-mono text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Pemain</span>
            </div>
            {activePlayerIds.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                <span>Rival ({activePlayerIds.length})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-yellow-400 inline-block" />
              <span>Start</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
