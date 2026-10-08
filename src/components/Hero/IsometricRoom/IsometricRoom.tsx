'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import RoomMeshes from './RoomMeshes';
import Hotspots, { type HotspotType } from './Hotspots';

interface IsometricRoomProps {
  onSelectHotspot: (type: HotspotType) => void;
  className?: string;
  profileImage?: string;
}

/**
 * ResponsiveCamera dynamically auto-adjusts FOV based on canvas width, height,
 * aspect ratio, and browser zoom level, guaranteeing that the entire 3D diorama
 * room is always 100% visible and NEVER clipped by div boundaries.
 */
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / Math.max(size.height, 1);
    const target = new THREE.Vector3(0, 1.2, 0);
    const D = camera.position.distanceTo(target) || 18.26;

    // Target visible bounds with comfortable padding so hotspot labels and diorama base never clip:
    // Vertical span: 11.2 units (pedestal base Y=-1.6 to top art Y=+5.8 + margin)
    // Horizontal span: 15.2 units (left plant corner to right shelf corner + margin)
    const vFactor = 11.2 / (2 * D);
    const hFactor = 15.2 / (2 * D * aspect);

    const maxTan = Math.max(vFactor, hFactor);
    const targetFov = 2 * Math.atan(maxTan) * (180 / Math.PI);

    // Clamp between comfortable limits
    const clampedFov = Math.min(Math.max(targetFov, 28), 56);

    if (Math.abs(camera.fov - clampedFov) > 0.05) {
      camera.fov = clampedFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  return null;
}

export default function IsometricRoom({
  onSelectHotspot,
  className = '',
  profileImage = '/image/profil.jpeg'
}: IsometricRoomProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`relative flex items-center justify-center ${className || 'w-full h-[500px] md:h-[650px]'}`}>
        <div className="w-64 h-80 rounded-3xl border border-border/60 bg-surface/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-semibold text-text/80">Memuat Isometric 3D Room...</p>
          <p className="text-xs text-text/50 mt-1">Interactive Studio Workspace</p>
        </div>
      </div>
    );
  }

  // Camera positioned at true isometric angle looking toward center
  const cameraPosition: [number, number, number] = [11.5, 9.5, 11.5];

  return (
    <div className={`relative w-full h-full select-none overflow-visible ${className}`}>
      <Canvas
        shadows
        camera={{
          position: cameraPosition,
          fov: 32,
          near: 0.1,
          far: 100
        }}
        dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0);
        }}
      >
        <Suspense fallback={null}>
          <ResponsiveCamera />

          <OrbitControls
            target={[0, 1.2, 0]}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4.5} // ~40 deg
            maxPolarAngle={Math.PI / 2.3} // ~78 deg
            minAzimuthAngle={Math.PI / 10} // ~18 deg
            maxAzimuthAngle={Math.PI / 2.1} // ~85 deg
            enableDamping
            dampingFactor={0.06}
            autoRotate
            autoRotateSpeed={0.4}
          />

          <RoomMeshes profileImage={profileImage} onSelectHotspot={onSelectHotspot} />
          <Hotspots onSelect={onSelectHotspot} />
        </Suspense>
      </Canvas>
    </div>
  );
}
