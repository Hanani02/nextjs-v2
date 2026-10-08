"use client";

import { useTheme } from "@/context/ThemeContext";
import { LuSun, LuMoon } from "react-icons/lu";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  size = "md",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses =
    size === "sm"
      ? "w-9 h-9 text-base"
      : "w-10 h-10 text-lg";

  // Prevent hydration mismatch by rendering a stable placeholder state
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Toggle theme"
        className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface/60 text-text/60 opacity-70 transition ${sizeClasses} ${className}`}
      >
        <LuMoon className="w-4 h-4" />
      </button>
    );
  }

  const tooltipText = isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={tooltipText}
      title={tooltipText}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 text-text backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-surface hover:text-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] active:scale-95 cursor-pointer ${
        showLabel ? "px-3.5 py-2 w-auto" : sizeClasses
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun Icon */}
        <span
          className={`transition-all duration-500 ease-out transform ${
            isDark
              ? "rotate-90 scale-0 opacity-0 absolute pointer-events-none"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        >
          <LuSun className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </span>

        {/* Moon Icon */}
        <span
          className={`transition-all duration-500 ease-out transform ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-blue-400"
              : "-rotate-90 scale-0 opacity-0 absolute pointer-events-none"
          }`}
        >
          <LuMoon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </span>
      </div>

      {showLabel && (
        <span className="text-xs font-medium tracking-wide">
          {isDark ? "Mode Gelap" : "Mode Terang"}
        </span>
      )}
    </button>
  );
}
