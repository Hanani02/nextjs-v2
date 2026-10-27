"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LuLanguages } from "react-icons/lu";
import { useEffect, useState } from "react";
import { playTabClickSound } from "@/lib/circuitAudio";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function LanguageToggle({
  className = "",
  size = "md",
  showLabel = false,
}: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, isId } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses =
    size === "sm"
      ? "h-9 px-2.5 text-xs"
      : "h-10 px-3 text-xs";

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Pilih Bahasa / Select Language"
        className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface/60 text-text/60 opacity-70 transition ${sizeClasses} ${className}`}
      >
        <LuLanguages className="w-4 h-4" />
        <span className="ml-1.5 font-bold font-mono">ID</span>
      </button>
    );
  }

  const handleToggle = () => {
    try {
      playTabClickSound();
    } catch {
      // ignore
    }
    toggleLanguage();
  };

  const tooltipText = isId ? "Ganti ke Bahasa Inggris (EN)" : "Switch to Indonesian (ID)";

  if (showLabel) {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border ${className}`}>
        <button
          type="button"
          onClick={() => {
            try { playTabClickSound(); } catch {}
            setLanguage('id');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            isId
              ? "bg-primary text-white shadow-sm font-bold scale-[1.02]"
              : "text-text/70 hover:text-text hover:bg-surface/80"
          }`}
        >
          <span className="text-sm">🇮🇩</span>
          <span>Indonesia</span>
        </button>

        <button
          type="button"
          onClick={() => {
            try { playTabClickSound(); } catch {}
            setLanguage('en');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            !isId
              ? "bg-primary text-white shadow-sm font-bold scale-[1.02]"
              : "text-text/70 hover:text-text hover:bg-surface/80"
          }`}
        >
          <span className="text-sm">🇬🇧</span>
          <span>English</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      id="language-toggle-btn"
      onClick={handleToggle}
      aria-label={tooltipText}
      title={tooltipText}
      className={`group relative inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface/70 text-text backdrop-blur-md transition-all duration-300 ease-out transform hover:scale-105 hover:border-primary/50 hover:bg-surface hover:text-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] active:scale-95 cursor-pointer font-mono font-bold select-none ${sizeClasses} ${className}`}
    >
      <LuLanguages className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
      <span className="tracking-wider">
        {language.toUpperCase()}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" />
    </button>
  );
}
