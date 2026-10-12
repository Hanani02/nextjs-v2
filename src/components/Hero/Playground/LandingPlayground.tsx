'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import toast from 'react-hot-toast';
import { LuChevronDown, LuSparkles } from 'react-icons/lu';
import NeonCircuitArena from './NeonCircuitArena';
import { MONZA_CHECKPOINTS } from './monzaTrack';
import FollowCamera from './FollowCamera';
import Minimap from './Minimap';
import RCCar from './RCCar';
import OtherPlayers from './OtherPlayers';
import RaceLeaderboard from './RaceLeaderboard';
import { useKeyboardControls } from './useKeyboardControls';
import PlaygroundHUD from './PlaygroundHUD';
import GarageMenu from './GarageMenu';
import { useMultiplayer } from './useMultiplayer';
import ArenaBloom from './ArenaBloom';
import type { DriftSlicknessMode } from './carPhysics';
import { playCheckpointChime, playFinishChime } from '@/lib/circuitAudio';
import type { LeaderboardEntry } from '@/types/vehicle';
import { saveRaceRecord } from '@/lib/circuitLeaderboard';

/**
 * Check if the car has passed or triggered the given Monza checkpoint gate.
 */
function checkMonzaGatePass(
  gateId: number,
  prevPos: THREE.Vector3,
  currPos: THREE.Vector3,
  cp: (typeof MONZA_CHECKPOINTS)[0]
): boolean {
  // 1. Proximity bounding radius check
  const dist = Math.hypot(currPos.x - cp.center[0], currPos.z - cp.center[1]);
  if (dist <= 4.2) {
    return true;
  }

  // 2. Continuous Collision Detection (CCD plane crossing)
  const prevDist = prevPos.distanceTo(currPos);
  if (prevDist > 12.0) return false; // Ignore teleport/reset

  const nx = cp.normal[0];
  const nz = cp.normal[1];

  const dotPrev = (prevPos.x - cp.center[0]) * nx + (prevPos.z - cp.center[1]) * nz;
  const dotCurr = (currPos.x - cp.center[0]) * nx + (currPos.z - cp.center[1]) * nz;

  if (dotPrev <= 0.25 && dotCurr >= -0.25 && dist <= 8.5) {
    return true;
  }

  return false;
}

/**
 * Real-time Lap & Checkpoint collision tracker running inside the R3F render loop.
 * Detects sequential clearance across all 6 Monza sector gates:
 * Gate 1 (Prima Variante) -> Gate 2 (Roggia) -> Gate 3 (Lesmo) -> Gate 4 (Ascari) -> Gate 5 (Parabolica) -> Gate 0 (Start/Finish)
 */
function MonzaRaceTracker({
  carPosRef,
  isAtPlayground,
  resetTrigger,
  onLapUpdate,
  onCheckpointTrigger,
  onTimerTick,
  isFinished,
}: {
  carPosRef: React.RefObject<THREE.Vector3>;
  isAtPlayground: boolean;
  resetTrigger: number;
  onLapUpdate: (lap: number, lapTime: number, totalTime: number, isFinalLap: boolean) => void;
  onCheckpointTrigger: (nextCp: number) => void;
  onTimerTick: (lapTime: number, totalTime: number) => void;
  isFinished: boolean;
}) {
  const currentLapRef = useRef(1);
  const targetCheckpointRef = useRef(1); // 0: Start/Finish, 1: Prima Variante, 2: Roggia, 3: Lesmo, 4: Ascari, 5: Parabolica
  const lapTimeRef = useRef(0);
  const totalRaceTimeRef = useRef(0);
  const lastTickTime = useRef(0);
  const lastCheckpointPassTime = useRef(0);
  const clearedCheckpointsRef = useRef<Set<number>>(new Set());
  const raceEndedRef = useRef(false);
  const prevCarPosRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    currentLapRef.current = 1;
    targetCheckpointRef.current = 1;
    lapTimeRef.current = 0;
    totalRaceTimeRef.current = 0;
    lastCheckpointPassTime.current = 0;
    clearedCheckpointsRef.current.clear();
    raceEndedRef.current = false;
    prevCarPosRef.current = null;
  }, [resetTrigger]);

  const totalGates = MONZA_CHECKPOINTS.length; // 6 gates

  // Update loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!raceEndedRef.current && !isFinished && isAtPlayground) {
        const carPos = carPosRef.current;
        if (carPos) {
          if (!prevCarPosRef.current) {
            prevCarPosRef.current = carPos.clone();
          } else {
            const prevPos = prevCarPosRef.current;

            lapTimeRef.current += dt;
            totalRaceTimeRef.current += dt;

            // Throttle UI timer state ticks to ~15 FPS
            if (now - lastTickTime.current > 65) {
              lastTickTime.current = now;
              onTimerTick(lapTimeRef.current, totalRaceTimeRef.current);
            }

            const currentTarget = targetCheckpointRef.current;
            if (currentTarget >= 0) {
              const cp = MONZA_CHECKPOINTS[currentTarget];
              if (cp) {
                const hit = checkMonzaGatePass(currentTarget, prevPos, carPos, cp);

                if (hit && now - lastCheckpointPassTime.current > 200) {
                  if (currentTarget === 0) {
                    // Check if all sectors 1 through 5 were cleared
                    let allCleared = true;
                    for (let g = 1; g < totalGates; g++) {
                      if (!clearedCheckpointsRef.current.has(g)) {
                        allCleared = false;
                        break;
                      }
                    }

                    if (allCleared && lapTimeRef.current >= 2.0) {
                      lastCheckpointPassTime.current = now;

                      const finishedLap = currentLapRef.current;
                      const lapTime = lapTimeRef.current;
                      const totalTime = totalRaceTimeRef.current;

                      if (finishedLap >= 3) {
                        raceEndedRef.current = true;
                        targetCheckpointRef.current = -1;
                        onLapUpdate(finishedLap, lapTime, totalTime, true);
                      } else {
                        currentLapRef.current += 1;
                        targetCheckpointRef.current = 1;
                        lapTimeRef.current = 0;
                        clearedCheckpointsRef.current.clear();
                        onLapUpdate(finishedLap, lapTime, totalTime, false);
                        onCheckpointTrigger(1);
                      }
                    }
                  } else {
                    lastCheckpointPassTime.current = now;
                    clearedCheckpointsRef.current.add(currentTarget);

                    const nextCp = (currentTarget + 1) % totalGates;
                    targetCheckpointRef.current = nextCp;
                    onCheckpointTrigger(nextCp);
                  }
                }
              }
            }

            prevPos.copy(carPos);
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    carPosRef,
    isAtPlayground,
    isFinished,
    totalGates,
    onLapUpdate,
    onCheckpointTrigger,
    onTimerTick,
  ]);

  return null;
}

export default function LandingPlayground() {
  const [mounted, setMounted] = useState(false);
  const [isAtPlayground, setIsAtPlayground] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handling & Sensitivity Settings State
  const [steeringSensitivity, setSteeringSensitivity] = useState<number>(1.0);
  const [driftSlickness, setDriftSlickness] = useState<DriftSlicknessMode>('slippery');

  // Monza Racing Circuit & Lap System State
  const [currentLap, setCurrentLap] = useState(1);
  const [activeCheckpoint, setActiveCheckpoint] = useState(1);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [totalRaceTime, setTotalRaceTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resetRaceTrigger, setResetRaceTrigger] = useState(0);

  // Start/Finish grid position on Rettifilo Straight: [0, 0.08, -25]
  const carPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.08, -25));
  const carHeadingRef = useRef<number>(Math.PI / 2);
  const carSpeedRef = useRef<number>(0);

  const { controls, setControlState, triggerReset } = useKeyboardControls(true);

  // Real-time multiplayer hook (Supabase Realtime Broadcast & Presence)
  const {
    playerId,
    username,
    setUsername,
    carModel,
    setCarModel,
    carColor,
    setCarColor,
    roomState,
    activePlayerIds,
    remotePlayersRef,
    broadcastCarState,
    getLeaderboard,
    selfEmote,
    activeEmotes,
    sendQuickEmote,
  } = useMultiplayer();

  useEffect(() => {
    setMounted(true);

    // Load saved handling and sensitivity preferences
    try {
      const savedSens = localStorage.getItem('playground_steering_sens');
      if (savedSens) {
        const val = parseFloat(savedSens);
        if (!isNaN(val) && val >= 0.5 && val <= 1.5) {
          setSteeringSensitivity(val);
        }
      }
      const savedDrift = localStorage.getItem('playground_drift_slickness') as DriftSlicknessMode;
      if (savedDrift && ['normal', 'slippery', 'hyper'].includes(savedDrift)) {
        setDriftSlickness(savedDrift);
      }
    } catch {
      // ignore
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsAtPlayground(scrollY < 80);
      const prog = Math.min(Math.max(scrollY / 450, 0), 1);
      setScrollProgress(prog);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdateSensitivity = useCallback((val: number) => {
    setSteeringSensitivity(val);
    try {
      localStorage.setItem('playground_steering_sens', String(val));
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateDriftSlickness = useCallback((mode: DriftSlicknessMode) => {
    setDriftSlickness(mode);
    try {
      localStorage.setItem('playground_drift_slickness', mode);
    } catch {
      // ignore
    }
  }, []);

  const handleCarPositionUpdate = useCallback(
    (pos: THREE.Vector3, heading?: number, speed?: number) => {
      carPositionRef.current.copy(pos);
      if (heading !== undefined) carHeadingRef.current = heading;
      if (speed !== undefined) carSpeedRef.current = speed;
    },
    []
  );

  // Lap progression and finish logic
  const handleLapUpdate = useCallback(
    (finishedLap: number, lapTime: number, totalTime: number, isFinalLap: boolean) => {
      const bestTime = bestLapTime === 0 || lapTime < bestLapTime ? lapTime : bestLapTime;
      setBestLapTime((prevBest) => (prevBest === 0 || lapTime < prevBest ? lapTime : prevBest));
      setTotalRaceTime(totalTime);

      const formatMinSec = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        const ms = Math.floor((sec % 1) * 100);
        return `${mins > 0 ? `${mins}m ` : ''}${s}.${ms.toString().padStart(2, '0')}s`;
      };

      if (isFinalLap) {
        setIsFinished(true);
        playFinishChime();

        saveRaceRecord({
          player_id: playerId || 'self',
          username,
          car_model: carModel,
          car_color: carColor,
          total_time: totalTime,
          best_lap_time: bestTime,
          lap_count: 3,
        }).then((res) => {
          if (res.success) {
            if (res.isNewBest === false) {
              toast('⏱️ Rekor Monza tercatat! (Rekor sebelumnya masih lebih cepat)', {
                id: 'db-saved',
                duration: 3500,
              });
            } else {
              toast.success('🏆 Rekor terbaik Monza berhasil disimpan!', {
                id: 'db-saved',
                duration: 3500,
              });
            }
          }
        });

        toast.success(
          `🎉 FINISH! 3 Lap Monza Selesai!\nTotal Waktu: ${formatMinSec(totalTime)} (Best: ${lapTime.toFixed(2)}s) 🏆`,
          { id: 'race-complete', duration: 5500 }
        );
      } else {
        setCurrentLap((prev) => Math.min(prev + 1, 3));
        playCheckpointChime();
        toast.success(
          `Lap ${finishedLap}/3 Monza Selesai! (${lapTime.toFixed(2)}s) ⏱️`,
          { id: 'lap-completed', duration: 2500 }
        );
      }
    },
    [playerId, username, carModel, carColor, bestLapTime]
  );

  const handleCheckpointTrigger = useCallback((nextCp: number) => {
    setActiveCheckpoint(nextCp);
    playCheckpointChime();
  }, []);

  const handleTimerTick = useCallback((lapTime: number, totalTime: number) => {
    setCurrentLapTime(lapTime);
    setTotalRaceTime(totalTime);
  }, []);

  const handleRestartRace = useCallback(() => {
    setCurrentLap(1);
    setActiveCheckpoint(1);
    setCurrentLapTime(0);
    setTotalRaceTime(0);
    setIsFinished(false);
    setResetRaceTrigger((prev) => prev + 1);
    triggerReset();
    toast('Balapan di-reset ke garis Start Monza! 🚦', { id: 'race-reset' });
  }, [triggerReset]);

  // Synchronize leaderboard with multiplayer room peers
  useEffect(() => {
    const updateLeaderboard = () => {
      const liveList = getLeaderboard({
        currentLap,
        checkpointIndex: activeCheckpoint,
        currentLapTime,
        bestLapTime,
        isFinished,
      });
      setLeaderboard(liveList);
    };

    updateLeaderboard();
    const interval = setInterval(updateLeaderboard, 250);
    return () => clearInterval(interval);
  }, [getLeaderboard, currentLap, activeCheckpoint, currentLapTime, bestLapTime, isFinished]);

  const handleScrollToHome = () => {
    const homeEl = document.getElementById('home');
    if (homeEl) {
      homeEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return (
      <section
        id="landing"
        className="w-full h-screen min-h-screen bg-black flex items-center justify-center select-none"
      >
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </section>
    );
  }

  return (
    <section
      id="landing"
      className="relative w-full h-[100dvh] min-h-[100dvh] bg-black overflow-hidden select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. 3D MULTIPLAYER RC CAR PLAYGROUND CANVAS
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          style={{ pointerEvents: 'none' }}
          shadows
          camera={{
            position: [0, 19, 0],
            fov: 48,
            near: 0.1,
            far: 240,
          }}
          dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.3,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x000000), 1);
          }}
        >
          <Suspense fallback={null}>
            {/* Elevated Wide Tracking Camera (Kamera Seperti Sebelumnya) */}
            <FollowCamera
              carPosRef={carPositionRef}
              carHeadingRef={carHeadingRef}
              carSpeedRef={carSpeedRef}
              scrollProgress={scrollProgress}
            />

            {/* Post-Processing Bloom for vibrant neon glow */}
            <ArenaBloom strength={0.65} radius={0.35} threshold={0.82} />

            {/* Ambient Stadium Lighting */}
            <ambientLight intensity={1.15} color="#334155" />

            {/* Main Floodlight */}
            <directionalLight
              position={[25, 45, -10]}
              intensity={2.4}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-near={0.5}
              shadow-camera-far={120}
              shadow-camera-left={-70}
              shadow-camera-right={70}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
              shadow-bias={-0.0005}
            />

            {/* Full 3D Autodromo Nazionale Monza Circuit */}
            <NeonCircuitArena activeCheckpoint={activeCheckpoint} />

            {/* Checkpoint & Lap Progress Tracker */}
            <MonzaRaceTracker
              carPosRef={carPositionRef}
              isAtPlayground={isAtPlayground}
              resetTrigger={resetRaceTrigger}
              onLapUpdate={handleLapUpdate}
              onCheckpointTrigger={handleCheckpointTrigger}
              onTimerTick={handleTimerTick}
              isFinished={isFinished}
            />

            {/* Remote Multiplayer Players */}
            <OtherPlayers
              activePlayerIds={activePlayerIds}
              remotePlayersRef={remotePlayersRef}
              activeEmotes={activeEmotes}
            />

            {/* The User's Customizable Stylized 3D RC Car with Drift Physics */}
            <RCCar
              controls={controls}
              isAutoParking={!isAtPlayground}
              model={carModel}
              color={carColor}
              username={username}
              activeEmote={selfEmote && selfEmote.expiresAt > Date.now() ? selfEmote.text : null}
              steeringSensitivity={steeringSensitivity}
              driftSlickness={driftSlickness}
              onPositionUpdate={handleCarPositionUpdate}
              onPhysicsBroadcast={broadcastCarState}
              raceTelemetry={{
                currentLap,
                checkpointIndex: activeCheckpoint,
                currentLapTime,
                bestLapTime,
                isFinished,
              }}
              parkingPosition={[12, 0.08, -20]}
              parkingAngle={Math.PI / 2}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. 2D RADAR MINIMAP HUD (Top Left Corner)
      ───────────────────────────────────────────────────────────── */}
      <Minimap
        carPosRef={carPositionRef}
        carHeadingRef={carHeadingRef}
        remotePlayersRef={remotePlayersRef}
        activePlayerIds={activePlayerIds}
        activeCheckpoint={activeCheckpoint}
        visible={isAtPlayground}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. RESPONSIVE HUD OVERLAY (Instructions, Keys, Mobile Controls, Tuning)
      ───────────────────────────────────────────────────────────── */}
      <PlaygroundHUD
        controls={controls}
        onResetCar={handleRestartRace}
        onSetControl={setControlState}
        onSendEmote={sendQuickEmote}
        steeringSensitivity={steeringSensitivity}
        onUpdateSensitivity={handleUpdateSensitivity}
        driftSlickness={driftSlickness}
        onUpdateDriftSlickness={handleUpdateDriftSlickness}
        visible={isAtPlayground}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. REAL-TIME MINI-LEADERBOARD & LAP TELEMETRY (Top Right Corner)
      ───────────────────────────────────────────────────────────── */}
      <RaceLeaderboard
        currentLap={currentLap}
        maxLaps={3}
        currentLapTime={currentLapTime}
        bestLapTime={bestLapTime}
        totalRaceTime={totalRaceTime}
        leaderboard={leaderboard}
        isFinished={isFinished}
        onRestartRace={handleRestartRace}
        visible={isAtPlayground}
      />

      {/* ─────────────────────────────────────────────────────────────
          5. GARAGE MENU UI (Vehicle Model, Neon Palette, Username, Handling)
      ───────────────────────────────────────────────────────────── */}
      <GarageMenu
        currentModel={carModel}
        currentColor={carColor}
        username={username}
        playerCount={roomState.playerCount}
        maxPlayers={roomState.maxPlayers}
        isSpectator={roomState.isSpectator}
        roomStatus={roomState.status}
        steeringSensitivity={steeringSensitivity}
        onUpdateSensitivity={handleUpdateSensitivity}
        driftSlickness={driftSlickness}
        onUpdateDriftSlickness={handleUpdateDriftSlickness}
        onSelectModel={setCarModel}
        onSelectColor={setCarColor}
        onUpdateUsername={setUsername}
        visible={isAtPlayground}
      />

      {/* ─────────────────────────────────────────────────────────────
          6. SCROLL DOWN TO HOME CTA BUTTON
      ───────────────────────────────────────────────────────────── */}
      <div
        className={`absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-500 ${
          isAtPlayground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <button
          onClick={handleScrollToHome}
          className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-neutral-950/90 hover:bg-neutral-900 border border-cyan-500/50 hover:border-cyan-400 text-white text-[11px] sm:text-xs md:text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <LuSparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin duration-3000" />
          <span>Masuk ke Portofolio (Home)</span>
          <LuChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}
