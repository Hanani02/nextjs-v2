'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import toast from 'react-hot-toast';
import { LuChevronDown, LuSparkles } from 'react-icons/lu';
import PlaygroundArena from './PlaygroundArena';
import RCCar from './RCCar';
import TechCoins, { INITIAL_TECH_COINS, type TechCoinItem } from './TechCoins';
import { useKeyboardControls } from './useKeyboardControls';
import PlaygroundHUD from './PlaygroundHUD';

/**
 * Responsive Camera Controller for the Expansive Arcade Playground:
 * Dynamically adjusts vertical FOV, elevation, and trailing distance
 * based on viewport aspect ratio so mobile portrait screens have a wide,
 * comfortable view without clipping the arena or the car.
 */
function WidePlaygroundCamera({
  carPosRef
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
    // so the horizontal framing captures the full breadth of the arena
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

export default function LandingPlayground() {
  const [mounted, setMounted] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const [resetCoinsTrigger, setResetCoinsTrigger] = useState(0);

  const carPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.08, 0));
  const { controls, setControlState, triggerReset } = useKeyboardControls(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCoinCollected = useCallback((coin: TechCoinItem, total: number) => {
    setCollectedCount(total);
    toast.success(`Dapat ${coin.name}! 💎`, { id: `gem-${coin.id}` });
  }, []);

  const handleRespawnCoins = useCallback(() => {
    setCollectedCount(0);
    setResetCoinsTrigger((prev) => prev + 1);
    toast.success('Semua Tech Gems di-respawn! ✨', { id: 'gems-respawn' });
  }, []);

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
          1. 3D RC CAR PLAYGROUND CANVAS (Full Black Backdrop)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          style={{ pointerEvents: 'none' }}
          shadows
          camera={{
            position: [0, 18, 19],
            fov: 46,
            near: 0.1,
            far: 140
          }}
          dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.3
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x000000), 1);
          }}
        >
          <Suspense fallback={null}>
            {/* Adaptive camera tracking car in wide arena */}
            <WidePlaygroundCamera carPosRef={carPositionRef} />

            {/* Ambient Lighting */}
            <ambientLight intensity={0.8} color="#1b1736" />

            {/* Sun Key Light */}
            <directionalLight
              position={[15, 25, 15]}
              intensity={1.8}
              color="#f8fafc"
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

            {/* Neon Cyan & Purple Point Lights */}
            <pointLight position={[-16, 8, -10]} color="#06b6d4" intensity={2.5} distance={30} />
            <pointLight position={[16, 8, 10]} color="#a855f7" intensity={2.5} distance={30} />
            <pointLight position={[0, 8, 0]} color="#38bdf8" intensity={1.5} distance={20} />

            {/* Expansive 48x32 Cyber Arena */}
            <PlaygroundArena boundsX={24} boundsZ={16} />

            {/* 6 Randomly Spawned Collectible Tech Gems */}
            <TechCoins
              carPositionRef={carPositionRef}
              onCoinCollected={handleCoinCollected}
              resetTrigger={resetCoinsTrigger}
            />

            {/* The Stylized 3D RC Car */}
            <RCCar
              controls={controls}
              isAutoParking={false}
              onPositionUpdate={(pos) => carPositionRef.current.copy(pos)}
              boundsX={24}
              boundsZ={16}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. RESPONSIVE HUD OVERLAY (Instructions, Keys, Mobile Controls)
      ───────────────────────────────────────────────────────────── */}
      <PlaygroundHUD
        controls={controls}
        collectedCount={collectedCount}
        totalCoins={INITIAL_TECH_COINS.length}
        onResetCar={triggerReset}
        onRespawnCoins={handleRespawnCoins}
        onSetControl={setControlState}
        visible={true}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. SCROLL DOWN TO HOME CTA BUTTON
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
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
