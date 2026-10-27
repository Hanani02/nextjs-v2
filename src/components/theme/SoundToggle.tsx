'use client';

import { useState, useEffect } from 'react';
import { LuVolume2, LuVolumeX } from 'react-icons/lu';
import { isAudioMuted, toggleAudioMute, subscribeAudioMute } from '@/lib/circuitAudio';

interface SoundToggleProps {
  className?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function SoundToggle({
  className = '',
  size = 'md',
  showLabel = false,
}: SoundToggleProps) {
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMuted(isAudioMuted());
    const unsub = subscribeAudioMute((val) => setMuted(val));
    return unsub;
  }, []);

  const sizeClasses = size === 'sm' ? 'w-9 h-9 text-base' : 'w-10 h-10 text-lg';

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Sound FX toggle"
        className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface/60 text-text/60 opacity-70 transition ${sizeClasses} ${className}`}
      >
        <LuVolume2 className="w-4 h-4" />
      </button>
    );
  }

  const tooltipText = muted ? 'Aktifkan Suara SFX (Unmute)' : 'Matikan Suara SFX (Mute)';

  return (
    <button
      type="button"
      onClick={() => toggleAudioMute()}
      aria-label={tooltipText}
      title={tooltipText}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 text-text backdrop-blur-md transition-all duration-300 ease-out transform hover:scale-105 hover:border-cyan-400/50 hover:bg-surface hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95 cursor-pointer ${
        showLabel ? 'px-3.5 py-2 w-auto' : sizeClasses
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {muted ? (
          <LuVolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-400 transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <LuVolume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">
          {muted ? 'SFX Muted' : 'SFX On'}
        </span>
      )}
    </button>
  );
}
