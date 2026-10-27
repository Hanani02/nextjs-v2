"use client";

import Link from "next/link";
import { LuGamepad2 } from "react-icons/lu";

export default function FloatingGameButton() {
  return (
    <aside
      aria-label="Akses Cepat Game Balapan"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 select-none"
    >
      <Link
        href="/game"
        className="group relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-950/90 hover:bg-neutral-900 border-2 border-cyan-500/60 hover:border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Main Game Balapan Monza 3D"
      >
        {/* Pulsing 3D live indicator badge */}
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-neutral-950 text-[8px] text-neutral-950 font-black items-center justify-center">
            3D
          </span>
        </span>

        {/* Gamepad Icon with neon glow on hover */}
        <LuGamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all duration-300" />
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-300 tracking-wider uppercase mt-0.5">
          GAME
        </span>

        {/* Hover Tooltip (Left of the button) */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-neutral-950/95 border border-cyan-500/50 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md flex items-center gap-1.5">
          <span>Main Game Monza 3D</span>
          <span className="text-sm">🏎️</span>
          {/* Arrow pointing right */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-cyan-500/50" />
        </div>
      </Link>
    </aside>
  );
}
