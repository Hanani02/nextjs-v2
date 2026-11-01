'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import RoomMeshes from './RoomMeshes';
import Hotspots, { type HotspotType } from './Hotspots';

interface IsometricRoomProps {
  onSelectHotspot: (type: HotspotType) => void;
  className?: string;
  profileImage?: string;
  activeModal?: HotspotType | null;
}

/**
 * ResponsiveCamera dynamically auto-adjusts FOV based on canvas width, height,
 * aspect ratio, guaranteeing that the entire 3D diorama room and all hotspot
 * tags are 100% visible with comfortable breathing room on all screens.
 */
function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / Math.max(size.height, 1);
    const target = new THREE.Vector3(0, 0.9, 0);
    const D = camera.position.distanceTo(target) || 18.35;

    // Target visible bounds with comfortable padding so hotspot labels and diorama base never clip:
    // Vertical span: 11.6 units
    // Horizontal span: 18.5 units (covering left wall, pot, right shelf + hotspot markers + comfortable margin)
    const vFactor = 11.6 / (2 * D);
    const hFactor = 18.5 / (2 * D * aspect);

    const maxTan = Math.max(vFactor, hFactor);
    const targetFov = 2 * Math.atan(maxTan) * (180 / Math.PI);

    // Dynamic clamp: allow wider FOV on narrow/portrait screens (up to 75 deg) so diorama never clips
    const maxFov = aspect < 1 ? 75 : 54;
    const clampedFov = Math.min(Math.max(targetFov, 28), maxFov);

    if (Math.abs(camera.fov - clampedFov) > 0.05) {
      camera.fov = clampedFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  return null;
}

/**
 * PingPongControls manages OrbitControls autoRotate so it smoothly reverses
 * direction upon reaching the azimuth limits, keeping the room centered
 * while preserving full mouse and touch left/right steering!
 */
function PingPongControls({
  controlsRef,
  activeModal,
  isInView,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  activeModal: HotspotType | null;
  isInView: boolean;
}) {
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || activeModal || !isInView) return;

    const currentAngle = controls.getAzimuthalAngle();
    const minAngle = controls.minAzimuthAngle;
    const maxAngle = controls.maxAzimuthAngle;

    // Smoothly bounce/reverse auto-rotation near horizontal boundaries
    if (currentAngle >= maxAngle - 0.04) {
      controls.autoRotateSpeed = -Math.abs(controls.autoRotateSpeed || 0.35);
    } else if (currentAngle <= minAngle + 0.04) {
      controls.autoRotateSpeed = Math.abs(controls.autoRotateSpeed || 0.35);
    }
  });

  return null;
}

export default function IsometricRoom({
  onSelectHotspot,
  className = '',
  profileImage = '/image/profil.jpeg',
  activeModal = null,
}: IsometricRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Performance optimization: Stop Three.js render loop when out of viewport or tab is hidden
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setIsInView(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const visible = rect.bottom > -100 && rect.top < window.innerHeight + 100;
        setIsInView(visible);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && !document.hidden);
      },
      {
        rootMargin: '120px 0px 120px 0px',
        threshold: 0,
      }
    );

    observer.observe(containerRef.current);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [mounted]);

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

  // Camera positioned at true isometric diagonal angle looking toward center
  const cameraPosition: [number, number, number] = [11.5, 9.5, 11.5];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-visible ${className}`}
    >
      <Canvas
        frameloop={isInView ? 'always' : 'never'}
        shadows
        camera={{
          position: cameraPosition,
          fov: 32,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0);
        }}
      >
        <Suspense fallback={null}>
          <ResponsiveCamera />
          <PingPongControls
            controlsRef={controlsRef}
            activeModal={activeModal}
            isInView={isInView}
          />

          <OrbitControls
            ref={controlsRef}
            target={[0, 0.9, 0]}
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minPolarAngle={Math.PI / 4.5} // ~40 deg
            maxPolarAngle={Math.PI / 2.3} // ~78 deg
            minAzimuthAngle={Math.PI / 12} // ~15 deg (far left)
            maxAzimuthAngle={Math.PI / 2.15} // ~83.7 deg (far right)
            enableDamping
            dampingFactor={0.06}
            autoRotate={!activeModal && isInView}
            autoRotateSpeed={0.35}
          />

          <RoomMeshes profileImage={profileImage} onSelectHotspot={onSelectHotspot} />
          <Hotspots onSelect={onSelectHotspot} isModalOpen={!!activeModal} />
        </Suspense>
      </Canvas>
    </div>
  );
}
