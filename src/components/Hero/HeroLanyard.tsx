"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LuSparkles, LuRotateCw, LuHand } from "react-icons/lu";

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
      <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
      <p className="text-sm font-semibold text-text/80">Memuat Lanyard 3D...</p>
      <p className="text-xs text-text/50 mt-1">Interaktif &amp; Realistis</p>
    </div>
  ),
});

interface HeroLanyardProps {
  frontImage?: string | null;
  backImage?: string | null;
}

export default function HeroLanyard({ frontImage, backImage }: HeroLanyardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full flex items-center justify-center py-2 select-none">
      {/* Background ambient lighting aura */}
      <div className="absolute w-[340px] h-[340px] md:w-[460px] md:h-[460px] rounded-full bg-primary/20 blur-[100px] pointer-events-none -z-10 animate-pulse duration-1000" />

      {/* Bingkai / Card Timbul Showcase Container */}
      <div className="relative w-full max-w-[420px] sm:max-w-[450px] md:max-w-[470px] h-[640px] sm:h-[680px] md:h-[710px] rounded-[38px] p-4 sm:p-5 flex flex-col justify-between backdrop-blur-2xl bg-gradient-to-b from-surface/85 via-surface/60 to-surface/90 border border-border/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_35px_-10px_rgba(var(--primary-rgb),0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(var(--primary-rgb),0.3)] ring-1 ring-white/10 dark:ring-white/10 transition-all duration-300 group hover:border-primary/40">
        
        {/* Top Header inside Bingkai */}
        <div className="relative z-20 flex items-center justify-between w-full px-2 pt-1 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-text/80">
              Hanani Badge 3D
            </span>
          </div>

          {/* Sleek central metallic mounting notch */}
          <div className="hidden sm:flex items-center justify-center">
            <div className="w-12 h-2.5 rounded-full bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-400 dark:from-neutral-700 dark:via-neutral-300 dark:to-neutral-700 border border-white/30 dark:border-white/10 shadow-inner" />
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
            <LuSparkles className="w-3 h-3" />
            <span>Interactive</span>
          </div>
        </div>

        {/* 3D Lanyard Canvas with Fully Visible Strap and Card */}
        <div className="relative w-full flex-1 flex items-center justify-center overflow-visible">
          <Lanyard
            position={[0, 0.35, 12]}
            gravity={[0, -40, 0]}
            fov={20.5}
            transparent={true}
            frontImage={frontImage || "/image/profil.jpeg"}
            backImage={backImage || "/image/card-back.png"}
            imageFit="cover"
            lanyardWidth={1.8}
            anchorY={2.4}
            segmentLength={0.5}
            className="w-full h-full"
            showFlipButton={false} // integrated into the showcase frame
            isFlippedProp={isFlipped}
            onFlipToggle={() => setIsFlipped(f => !f)}
          />
        </div>

        {/* Bottom Interactive Controls & Tips inside Bingkai */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full px-2 pt-2.5 border-t border-border/40">
          <button
            type="button"
            onClick={() => setIsFlipped(f => !f)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <LuRotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? "rotate-180" : ""}`} />
            <span>{isFlipped ? "Lihat Sisi Depan" : "Lihat Sisi Belakang"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-text/50 font-medium">
            <LuHand className="w-3 h-3 text-primary/70" />
            <span>Tarik &amp; ayunkan kartu 3D</span>
          </div>
        </div>
      </div>
    </div>
  );
}
