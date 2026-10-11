'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import toast from 'react-hot-toast';
import { LuChevronDown, LuSparkles } from 'react-icons/lu';
import NeonCircuitArena, { RACE_CHECKPOINTS } from './NeonCircuitArena';
import RCCar from './RCCar';
import OtherPlayers from './OtherPlayers';
import RaceLeaderboard from './RaceLeaderboard';
import { useKeyboardControls } from './useKeyboardControls';
import PlaygroundHUD from './PlaygroundHUD';
import GarageMenu from './GarageMenu';
import { useMultiplayer } from './useMultiplayer';
import type { LeaderboardEntry } from '@/types/vehicle';
import { saveRaceRecord } from '@/lib/circuitLeaderboard';

/**
 * Responsive Camera Controller for the Expansive Arcade Playground:
 * Dynamically adjusts vertical FOV, elevation, and trailing distance
 * based on viewport aspect ratio so mobile portrait screens have a wide,
 * comfortable view without clipping the arena or the car.
 */
function WidePlaygroundCamera({
  carPosRef,
}: {
  carPosRef: React.RefObject<THREE.Vector3>;
}) {
  const { camera, size } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const carPos = carPosRef.current;
    if (!carPos) return;

    // Detect aspect ratio: mobile portrait (< 1) vs desktop landscape (>= 1)
    const aspect = size.width / Math.max(size.height, 1);
    const isPortrait = aspect < 1;

    // Responsive FOV: on portrait screens, widen vertical FOV to 68deg
    const targetFov = isPortrait ? 68 : 46;
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - targetFov) > 0.4) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }
    }

    // Camera height & distance dynamically tailored for mobile
    const targetCamY = isPortrait ? 25 : 18;
    const targetCamZOffset = isPortrait ? 22 : 19;
    const trackingFactor = isPortrait ? 0.6 : 0.45;

    const targetCamX = carPos.x * trackingFactor;
    const targetCamZ = carPos.z * trackingFactor + targetCamZOffset;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, dt * 3.8);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, dt * 3.8);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, dt * 3.8);

    const targetLookX = carPos.x * 0.7;
    const targetLookZ = carPos.z * 0.7;
    currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, targetLookX, dt * 4.5);
    currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, targetLookZ, dt * 4.5);
    currentLookAt.current.y = 0.2;

    camera.lookAt(currentLookAt.current);
  });

  return null;
}

/**
 * Real-time Lap & Checkpoint collision tracker running inside the R3F render loop.
 * Detects checkpoint passes (1 -> 2 -> 3 -> 0) with strict sequential clearance,
 * accumulates both current lap time and total race time across all 3 laps.
 */
function CircuitRaceTracker({
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
  const targetCheckpointRef = useRef(1); // 0: Start/Finish, 1: Turn 1, 2: Chicane, 3: Hairpin
  const lapTimeRef = useRef(0);
  const totalRaceTimeRef = useRef(0);
  const lastTickTime = useRef(0);
  const lastCheckpointPassTime = useRef(0);
  const clearedCheckpointsRef = useRef<Set<number>>(new Set());
  const raceEndedRef = useRef(false);

  useEffect(() => {
    currentLapRef.current = 1;
    targetCheckpointRef.current = 1;
    lapTimeRef.current = 0;
    totalRaceTimeRef.current = 0;
    lastCheckpointPassTime.current = 0;
    clearedCheckpointsRef.current.clear();
    raceEndedRef.current = false;
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (raceEndedRef.current || isFinished || !isAtPlayground) return;
    const dt = Math.min(delta, 0.05);
    const carPos = carPosRef.current;
    if (!carPos) return;

    // Accumulate lap timer and total race timer
    lapTimeRef.current += dt;
    totalRaceTimeRef.current += dt;

    // Throttle React timer state update to ~15 FPS for smooth UI
    const now = performance.now();
    if (now - lastTickTime.current > 65) {
      lastTickTime.current = now;
      onTimerTick(lapTimeRef.current, totalRaceTimeRef.current);
    }

    const currentTarget = targetCheckpointRef.current;
    if (currentTarget < 0) return;

    const cp = RACE_CHECKPOINTS[currentTarget];
    if (!cp) return;

    // Check hit radius against target checkpoint gate
    const dx = Math.abs(carPos.x - cp.center[0]);
    const dz = Math.abs(carPos.z - cp.center[1]);

    const hit = dx <= cp.width * 0.9 && dz <= cp.depth * 0.85;

    // Checkpoint hit with 1.0s debouncing cooldown to prevent repeat triggers
    if (hit && now - lastCheckpointPassTime.current > 1000) {
      lastCheckpointPassTime.current = now;

      if (currentTarget === 0) {
        // Enforce that Gates 1, 2, and 3 MUST have been cleared on this lap
        const hasClearedAllGates =
          clearedCheckpointsRef.current.has(1) &&
          clearedCheckpointsRef.current.has(2) &&
          clearedCheckpointsRef.current.has(3);

        // Enforce minimum lap duration (at least 5.5s) to prevent zero-second glitches
        if (!hasClearedAllGates || lapTimeRef.current < 5.5) {
          return;
        }

        // Lap Completed!
        const finishedLap = currentLapRef.current;
        const lapTime = lapTimeRef.current;
        const totalTime = totalRaceTimeRef.current;

        if (finishedLap >= 3) {
          // Immediately set synchronous lock so subsequent frames cannot re-trigger
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
      } else {
        // Mark this intermediate checkpoint as cleared
        clearedCheckpointsRef.current.add(currentTarget);

        // Advance to next checkpoint: 1 -> 2, 2 -> 3, 3 -> 0
        const nextCp = (currentTarget + 1) % 4;
        targetCheckpointRef.current = nextCp;
        onCheckpointTrigger(nextCp);
      }
    }
  });

  return null;
}

export default function LandingPlayground() {
  const [mounted, setMounted] = useState(false);
  const [isAtPlayground, setIsAtPlayground] = useState(true);

  // Mini Racing Circuit & Lap System State
  const [currentLap, setCurrentLap] = useState(1);
  const [activeCheckpoint, setActiveCheckpoint] = useState(1);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [totalRaceTime, setTotalRaceTime] = useState(0);
  const [bestLapTime, setBestLapTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resetRaceTrigger, setResetRaceTrigger] = useState(0);

  // Start/Finish grid position: [0, 0.08, -9.2]
  const carPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.08, -9.2));
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
  } = useMultiplayer();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      // Playground HUD & Garage UI only visible at Scroll = 0 (Pre-hero phase)
      setIsAtPlayground(window.scrollY < 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        // Catat rekor balapan secara permanen ke Supabase database
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
            toast.success('🏆 Catatan balapan berhasil disimpan ke Supabase!', {
              id: 'db-saved',
              duration: 3500,
            });
          }
        });

        toast.success(
          `🎉 FINISH! 3 Lap Selesai!\nTotal Waktu: ${formatMinSec(totalTime)} (Best: ${lapTime.toFixed(2)}s) 🏆`,
          { id: 'race-complete', duration: 5500 }
        );
      } else {
        setCurrentLap((prev) => Math.min(prev + 1, 3));
        toast.success(
          `Lap ${finishedLap}/3 Selesai! (${lapTime.toFixed(2)}s) ⏱️`,
          { id: 'lap-completed', duration: 2500 }
        );
      }
    },
    [playerId, username, carModel, carColor, bestLapTime]
  );

  const handleCheckpointTrigger = useCallback((nextCp: number) => {
    setActiveCheckpoint(nextCp);
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
    toast('Balapan di-reset ke garis Start! 🚦', { id: 'race-reset' });
  }, [triggerReset]);

  // Real-time synchronization of leaderboard with multiplayer room peers
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
            position: [0, 18, 19],
            fov: 46,
            near: 0.1,
            far: 140,
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
            {/* Adaptive camera tracking car in wide arena */}
            <WidePlaygroundCamera carPosRef={carPositionRef} />

            {/* Ambient Lighting - bright enough to see track and barriers clearly */}
            <ambientLight intensity={1.1} color="#334155" />

            {/* Stadium Key Floodlight */}
            <directionalLight
              position={[15, 28, 15]}
              intensity={2.2}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-near={0.5}
              shadow-camera-far={60}
              shadow-camera-left={-26}
              shadow-camera-right={26}
              shadow-camera-top={18}
              shadow-camera-bottom={-18}
              shadow-bias={-0.0005}
            />

            {/* Stadium Spotlights: Corners, Chicane & Straightaways */}
            <pointLight position={[-16, 9, -10]} color="#38bdf8" intensity={2.8} distance={32} />
            <pointLight position={[16, 9, 10]} color="#a855f7" intensity={2.8} distance={32} />
            <pointLight position={[0, 9, 9.5]} color="#ffffff" intensity={3.2} distance={25} />
            <pointLight position={[0, 9, -9.2]} color="#ffffff" intensity={2.8} distance={25} />
            <pointLight position={[0, 9, 0]} color="#38bdf8" intensity={2.0} distance={22} />

            {/* Enclosed Neon Circuit Racetrack with Hologram Gantry & Barriers */}
            <NeonCircuitArena
              boundsX={22.2}
              boundsZ={14.0}
              activeCheckpoint={activeCheckpoint}
            />

            {/* Checkpoint & Lap Progress Tracker */}
            <CircuitRaceTracker
              carPosRef={carPositionRef}
              isAtPlayground={isAtPlayground}
              resetTrigger={resetRaceTrigger}
              onLapUpdate={handleLapUpdate}
              onCheckpointTrigger={handleCheckpointTrigger}
              onTimerTick={handleTimerTick}
              isFinished={isFinished}
            />

            {/* Other Remote Multiplayer Players */}
            <OtherPlayers
              activePlayerIds={activePlayerIds}
              remotePlayersRef={remotePlayersRef}
            />

            {/* The User's Customizable Stylized 3D RC Car with Drift Physics */}
            <RCCar
              controls={controls}
              isAutoParking={!isAtPlayground}
              model={carModel}
              color={carColor}
              username={username}
              onPositionUpdate={(pos) => carPositionRef.current.copy(pos)}
              onPhysicsBroadcast={broadcastCarState}
              raceTelemetry={{
                currentLap,
                checkpointIndex: activeCheckpoint,
                currentLapTime,
                bestLapTime,
                isFinished,
              }}
              parkingPosition={[12.5, 0.08, -4.5]}
              parkingAngle={-Math.PI / 2}
              boundsX={22.2}
              boundsZ={14.0}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. RESPONSIVE HUD OVERLAY (Instructions, Keys, Mobile Controls)
      ───────────────────────────────────────────────────────────── */}
      <PlaygroundHUD
        controls={controls}
        onResetCar={handleRestartRace}
        onSetControl={setControlState}
        visible={isAtPlayground}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. REAL-TIME MINI-LEADERBOARD & LAP TELEMETRY (Top Right)
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
          3. GARAGE MENU UI (Vehicle Model, Neon Palette, Username)
             Only visible in Pre-Hero phase (Scroll = 0)
      ───────────────────────────────────────────────────────────── */}
      <GarageMenu
        currentModel={carModel}
        currentColor={carColor}
        username={username}
        playerCount={roomState.playerCount}
        maxPlayers={roomState.maxPlayers}
        isSpectator={roomState.isSpectator}
        roomStatus={roomState.status}
        onSelectModel={setCarModel}
        onSelectColor={setCarColor}
        onUpdateUsername={setUsername}
        visible={isAtPlayground}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. SCROLL DOWN TO HOME CTA BUTTON
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
