'use client';

import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import RCCar from './Playground/RCCar';
import PlaygroundArena from './Playground/PlaygroundArena';
import TechCoins, { type TechCoinItem } from './Playground/TechCoins';
import type { CarControls } from './Playground/useKeyboardControls';
import RoomMeshes from './IsometricRoom/RoomMeshes';
import Hotspots, { type HotspotType } from './IsometricRoom/Hotspots';

interface InteractiveHeroCanvasProps {
  scrollProgress: number; // 0 (Playground) to 1 (Hero Room)
  controls: CarControls;
  onSelectHotspot: (type: HotspotType) => void;
  profileImage?: string;
  onCoinCollected?: (coin: TechCoinItem, total: number) => void;
  resetCoinsTrigger?: number;
  className?: string;
}

/**
 * HeroCameraController smoothly interpolates camera position, target, and FOV
 * from the top-down Arcade Playground view to the Isometric 3D Room view
 * as the user scrolls down through the hero section.
 */
function HeroCameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera, size } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 13.5, 11));
  const currentTarget = useRef(new THREE.Vector3(0, 0.3, 0));

  // Base camera targets
  const camPlayground = useMemo(() => new THREE.Vector3(0, 13.5, 11), []);
  const camIsometric = useMemo(() => new THREE.Vector3(11.5, 9.5, 11.5), []);
  const targetPlayground = useMemo(() => new THREE.Vector3(0, 0.3, 0), []);
  const targetIsometric = useMemo(() => new THREE.Vector3(0, 1.2, 0), []);

  useFrame((state, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // Smoothstep interpolation between 0.15 and 0.85
    const clampedProgress = Math.min(Math.max((scrollProgress - 0.15) / 0.7, 0), 1);
    const t = clampedProgress * clampedProgress * (3 - 2 * clampedProgress);

    // Responsive FOV based on aspect ratio
    const aspect = size.width / Math.max(size.height, 1);
    const baseFov = aspect < 1 ? 46 : 34;
    const targetFov = THREE.MathUtils.lerp(baseFov + 8, baseFov, t);

    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    // Target positions
    const desiredPos = new THREE.Vector3().lerpVectors(camPlayground, camIsometric, t);
    const desiredTarget = new THREE.Vector3().lerpVectors(targetPlayground, targetIsometric, t);

    // Subtle cursor mouse parallax when in isometric room mode
    if (t > 0.6) {
      const mouseFactor = (t - 0.6) / 0.4;
      desiredPos.x += state.pointer.x * 0.4 * mouseFactor;
      desiredPos.y += state.pointer.y * 0.25 * mouseFactor;
    }

    // Smooth camera damping
    currentPos.current.lerp(desiredPos, delta * 6);
    currentTarget.current.lerp(desiredTarget, delta * 6);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}

export default function InteractiveHeroCanvas({
  scrollProgress,
  controls,
  onSelectHotspot,
  profileImage = '/image/profil.jpeg',
  onCoinCollected,
  resetCoinsTrigger = 0,
  className = ''
}: InteractiveHeroCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const carPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.08, 0));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCarPositionUpdate = (pos: THREE.Vector3) => {
    carPositionRef.current.copy(pos);
  };

  if (!mounted) {
    // Safe SSR fallback with subtle cyber backdrop
    return (
      <div className={`relative w-full h-full bg-[#0a0718] flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // RC car auto-parking activates when scroll enters Hero Room (> 0.45)
  const isAutoParking = scrollProgress >= 0.45;
  // Hotspots are rendered when transitioning to Room (> 0.35)
  const showHotspots = scrollProgress >= 0.35;

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
      <Canvas
        shadows
        camera={{
          position: [0, 13.5, 11],
          fov: 38,
          near: 0.1,
          far: 100
        }}
        dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x080614), 1);
        }}
      >
        <Suspense fallback={null}>
          {/* Dynamic Scroll & Aspect Ratio Camera Controller */}
          <HeroCameraController scrollProgress={scrollProgress} />

          {/* ─────────────────────────────────────────────────────────
              LIGHTING SETUP
          ───────────────────────────────────────────────────────── */}
          <ambientLight intensity={0.85} color="#2e264f" />

          {/* Key Directional Sunlight with Shadows */}
          <directionalLight
            position={[10, 18, 10]}
            intensity={1.6}
            color="#f1f5f9"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={45}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0005}
          />

          {/* Cyan Neon Fill Light */}
          <pointLight
            position={[-7, 6, -5]}
            color="#06b6d4"
            intensity={2.2}
            distance={22}
          />

          {/* Purple Neon Rim Light */}
          <pointLight
            position={[7, 5, 6]}
            color="#a855f7"
            intensity={1.8}
            distance={20}
          />

          {/* ─────────────────────────────────────────────────────────
              3D SCENE OBJECTS
          ───────────────────────────────────────────────────────── */}
          {/* 1. Cyber Playground Arena Floor & Boundaries */}
          <PlaygroundArena
            boundsX={11.5}
            boundsZ={8.0}
            scrollProgress={scrollProgress}
          />

          {/* 2. Collectible Tech Coins */}
          <TechCoins
            carPositionRef={carPositionRef}
            onCoinCollected={onCoinCollected}
            resetTrigger={resetCoinsTrigger}
          />

          {/* 3. The Stylized 3D RC Car */}
          <RCCar
            controls={controls}
            isAutoParking={isAutoParking}
            onPositionUpdate={handleCarPositionUpdate}
            parkingPosition={[2.6, 0.08, 2.2]}
            parkingAngle={Math.PI * 0.25}
            boundsX={11.5}
            boundsZ={8.0}
          />

          {/* 4. Cyberpunk Developer Room Workspace */}
          <RoomMeshes
            profileImage={profileImage}
            onSelectHotspot={onSelectHotspot}
          />

          {/* 5. Hotspot Pins (Active in Room view) */}
          {showHotspots && <Hotspots onSelect={onSelectHotspot} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
