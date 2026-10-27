'use client';

/**
 * Lightweight, zero-dependency procedural Web Audio API sound synthesizer
 * for Neon Circuit racing arcade experience.
 * Synthesizes engine revs, tire drift screeches, boost whooshes, and checkpoint chimes
 * without loading external audio asset files.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Engine sound nodes
let engineOsc1: OscillatorNode | null = null;
let engineOsc2: OscillatorNode | null = null;
let engineFilter: BiquadFilterNode | null = null;
let engineGain: GainNode | null = null;
let isEngineRunning = false;

// Tire screech nodes
let screechSource: AudioBufferSourceNode | null = null;
let screechFilter: BiquadFilterNode | null = null;
let screechGain: GainNode | null = null;
let isScreeching = false;

// Mute state
let muted = false;
const muteListeners = new Set<(isMuted: boolean) => void>();

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('circuit_sound_muted');
    if (saved !== null) {
      muted = saved === 'true';
    }
  } catch {
    // Ignore storage errors
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(muted ? 0 : 0.65, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioMuted(): boolean {
  return muted;
}

export function setAudioMuted(val: boolean) {
  muted = val;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(muted ? 0 : 0.65, audioCtx.currentTime);
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('circuit_sound_muted', String(val));
    } catch {
      // Ignore
    }
  }
  muteListeners.forEach((fn) => fn(muted));
}

export function toggleAudioMute(): boolean {
  setAudioMuted(!muted);
  return muted;
}

export function subscribeAudioMute(fn: (isMuted: boolean) => void): () => void {
  muteListeners.add(fn);
  return () => {
    muteListeners.delete(fn);
  };
}

/**
 * Creates noise buffer for procedural tire screeching
 */
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Initializes and loops the continuous synthesized engine oscillator
 */
function initEngine() {
  const ctx = getAudioContext();
  if (!ctx || !masterGain || isEngineRunning) return;

  try {
    // Dual detuned oscillators for authentic throaty engine rumble
    engineOsc1 = ctx.createOscillator();
    engineOsc2 = ctx.createOscillator();
    engineOsc1.type = 'sawtooth';
    engineOsc2.type = 'triangle';

    engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(140, ctx.currentTime);
    engineFilter.Q.setValueAtTime(2.5, ctx.currentTime);

    engineGain = ctx.createGain();
    engineGain.gain.setValueAtTime(0.08, ctx.currentTime);

    engineOsc1.connect(engineFilter);
    engineOsc2.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(masterGain);

    engineOsc1.start();
    engineOsc2.start();
    isEngineRunning = true;
  } catch {
    // Ignore audio init errors
  }
}

/**
 * Updates dynamic engine pitch and filter cutoff following car velocity
 */
export function updateEngineSound(speed: number, isAccelerating: boolean) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!isEngineRunning) initEngine();

  if (!engineOsc1 || !engineOsc2 || !engineFilter || !engineGain) return;

  const now = ctx.currentTime;
  const clampedSpeed = Math.min(Math.max(speed, 0), 35);
  const speedRatio = clampedSpeed / 30; // 0 to 1+

  // Base idle: 48Hz -> Redline: 230Hz
  const targetFreq = 48 + speedRatio * 175 + (isAccelerating ? 24 : 0);
  engineOsc1.frequency.setTargetAtTime(targetFreq, now, 0.08);
  engineOsc2.frequency.setTargetAtTime(targetFreq * 0.51, now, 0.08);

  // Filter opens up as throttle is applied
  const filterFreq = 160 + speedRatio * 750 + (isAccelerating ? 300 : 0);
  engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.09);

  // Slight gain boost under full acceleration
  const targetGain = isAccelerating ? 0.16 : 0.09 + speedRatio * 0.06;
  engineGain.gain.setTargetAtTime(targetGain, now, 0.1);
}

/**
 * Starts or stops the synthesized tire screech on drift/hard brake
 */
export function setTireScreech(active: boolean) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  if (active) {
    if (isScreeching) return;
    try {
      screechSource = ctx.createBufferSource();
      screechSource.buffer = createNoiseBuffer(ctx);
      screechSource.loop = true;

      screechFilter = ctx.createBiquadFilter();
      screechFilter.type = 'bandpass';
      screechFilter.frequency.setValueAtTime(2400, ctx.currentTime);
      screechFilter.Q.setValueAtTime(4.0, ctx.currentTime);

      screechGain = ctx.createGain();
      screechGain.gain.setValueAtTime(0.001, ctx.currentTime);
      screechGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08);

      screechSource.connect(screechFilter);
      screechFilter.connect(screechGain);
      screechGain.connect(masterGain);

      screechSource.start();
      isScreeching = true;
    } catch {
      // Ignore
    }
  } else {
    if (!isScreeching || !screechGain) return;
    try {
      screechGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      setTimeout(() => {
        try {
          screechSource?.stop();
          screechSource?.disconnect();
        } catch {}
        isScreeching = false;
        screechSource = null;
        screechGain = null;
      }, 120);
    } catch {
      isScreeching = false;
    }
  }
}

/**
 * Plays short futuristic whoosh / warp sound when hitting a boost pad
 */
export function playBoostSfx() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.4);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch {
    // Ignore
  }
}

/**
 * Plays futuristic two-tone chime when passing checkpoint gate
 */
export function playCheckpointChime() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  try {
    const now = ctx.currentTime;
    // Tone 1: 587.33 Hz (D5) -> Tone 2: 880 Hz (A5)
    [587.33, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.42);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch {
    // Ignore
  }
}

/**
 * Plays celebratory multi-tone victory chime on race finish
 */
export function playFinishChime() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  try {
    const now = ctx.currentTime;
    // C5, E5, G5, C6 triumph arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  } catch {
    // Ignore
  }
}

/**
 * Plays a subtle, gentle click sound on UI tab or language switch
 */
export function playTabClickSound() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // Ignore
  }
}

