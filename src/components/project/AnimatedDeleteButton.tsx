"use client";

import React, { useState, useRef, useEffect } from "react";

interface AnimatedDeleteButtonProps {
  onClear: () => void;
  className?: string;
}

type DeleteStage = "idle" | "throwing" | "processing" | "restoring";

export default function AnimatedDeleteButton({
  onClear,
  className = "",
}: AnimatedDeleteButtonProps) {
  const [stage, setStage] = useState<DeleteStage>("idle");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup any timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stage !== "idle") return;

    // 1. Throwing Phase (0ms - 320ms):
    //    - Tempat sampah terbuka (lid rotates open)
    //    - Tulisan "Delete" terbang/masuk ke dalam tong sampah
    //    - Tombol sedikit lonjong berubah mengecil menjadi lingkaran
    setStage("throwing");

    // 2. Processing Phase (320ms - 780ms):
    //    - Tutup tong sampah kembali tertutup
    //    - Tombol berbentuk lingkaran penuh dengan spinner melingkar (menunjukkan proses penghapusan)
    const t1 = setTimeout(() => {
      setStage("processing");
    }, 320);

    // 3. Restoring & Fading Phase (780ms - 1080ms):
    //    - Proses selesai
    //    - Tombol kembali ke bentuk awal (lonjong) dan perlahan memudar (fading out)
    const t2 = setTimeout(() => {
      setStage("restoring");
    }, 780);

    // 4. Final: Clear search value and reset state
    const t3 = setTimeout(() => {
      onClear();
      setStage("idle");
    }, 1080);

    timersRef.current = [t1, t2, t3];
  };

  const isThrowing = stage === "throwing";
  const isProcessing = stage === "processing";
  const isRestoring = stage === "restoring";
  const isCircular = isThrowing || isProcessing;
  const isLidOpen = isThrowing;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={stage !== "idle"}
      aria-label="Hapus pencarian project"
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:bg-red-500/25 transition-all duration-300 select-none cursor-pointer ${
        isCircular
          ? "w-8 h-8 min-w-8 p-0"
          : "h-8 px-2.5 min-w-[84px] gap-1.5"
      } ${
        isRestoring
          ? "opacity-0 scale-95 pointer-events-none transition-all duration-300 ease-out"
          : "opacity-100 scale-100"
      } ${className}`}
    >
      {/* Circular Processing Ring Spinner (Aktif saat tombol menjadi lingkaran) */}
      {isProcessing && (
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 animate-spin pointer-events-none"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="13.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="65"
            strokeDashoffset="20"
            className="text-red-500"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* SVG Tempat Sampah (Lid dan Can Body terpisah agar tutupnya bisa terbuka) */}
      <span className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="overflow-visible"
        >
          {/* Tutup Tong Sampah (Terbuka saat teks Delete dilempar masuk) */}
          <g
            style={{
              transformOrigin: "4px 6px",
              transform: isLidOpen
                ? "rotate(-45deg) translateY(-2px)"
                : "rotate(0deg) translateY(0px)",
              transition: isLidOpen
                ? "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "transform 0.18s ease-in-out",
            }}
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </g>

          {/* Badan Tong Sampah */}
          <g>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </g>
        </svg>
      </span>

      {/* Tulisan "Delete" yang masuk ke tong sampah saat tombol diklik */}
      <span
        style={{
          transform: isThrowing
            ? "translate(-18px, 4px) scale(0.12) rotate(-20deg)"
            : isProcessing
            ? "translate(-18px, 6px) scale(0) opacity(0)"
            : "translate(0px, 0px) scale(1) rotate(0deg)",
          opacity: isThrowing || isProcessing ? 0 : 1,
          transition: isThrowing
            ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.24s ease-in"
            : isRestoring
            ? "transform 0.3s ease-out, opacity 0.3s ease-out"
            : "none",
        }}
        className={`relative z-10 text-[11px] font-semibold tracking-wide text-red-500 whitespace-nowrap ${
          isCircular ? "w-0 overflow-hidden" : "w-auto"
        }`}
      >
        Delete
      </span>
    </button>
  );
}
