'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { CarControls } from './useKeyboardControls';
import type { CarModelType, GraphicsQuality } from '@/types/vehicle';
import CarBodyMesh from './CarBodyMesh';
import CarWheels from './CarWheels';
import CarUsernameBadge from './CarUsernameBadge';
import TireSkidmarks from './TireSkidmarks';
import {
  createInitialPhysicsState,
  stepCarPhysics,
  type CarPhysicsState,
  type DriftSlicknessMode,
} from './carPhysics';
import { updateEngineSound, setTireScreech } from '@/lib/circuitAudio';

interface RCCarProps {
  controls: CarControls;
  isAutoParking: boolean;
  model?: CarModelType;
  color?: string;
  username?: string;
  activeEmote?: string | null;
  steeringSensitivity?: number;
  driftSlickness?: DriftSlicknessMode;
  graphicsQuality?: GraphicsQuality;
  onPositionUpdate?: (pos: THREE.Vector3, heading?: number, speed?: number) => void;
  onPhysicsBroadcast?: (state: {
    x: number;
    z: number;
    heading: number;
    speed: number;
    steerAngle: number;
    isDrifting: boolean;
    isBraking: boolean;
    currentLap?: number;
    checkpointIndex?: number;
    currentLapTime?: number;
    bestLapTime?: number;
    isFinished?: boolean;
  }) => void;
  raceTelemetry?: {
    currentLap?: number;
    checkpointIndex?: number;
    currentLapTime?: number;
    bestLapTime?: number;
    isFinished?: boolean;
  };
  parkingPosition?: [number, number, number];
  parkingAngle?: number;
  boundsX?: number;
  boundsZ?: number;
}

export default function RCCar({
  controls,
  isAutoParking,
  model = 'sport',
  color = '#06b6d4',
  username = 'Pilot_01',
  activeEmote,
  steeringSensitivity = 1.0,
  driftSlickness = 'slippery',
  graphicsQuality = 'medium',
  onPositionUpdate,
  onPhysicsBroadcast,
  raceTelemetry,
  parkingPosition = [12, 0.08, -20],
  parkingAngle = Math.PI / 2,
}: RCCarProps) {
  const carGroup = useRef<THREE.Group>(null!);
  const carBody = useRef<THREE.Group>(null!);

  // Physics simulation state initialized on Monza Start/Finish Line facing East (+X)
  const physics = useRef<CarPhysicsState>(createInitialPhysicsState([0, 0.08, -25]));

  // Refs for TireSkidmarks
  const carPosRef = useRef(new THREE.Vector3(0, 0.08, -25));
  const headingRef = useRef(Math.PI / 2);
  const speedRef = useRef(0);
  const isDriftingRef = useRef(false);

  // Particles system scaled by Graphics Quality (Low: 14 minimal, Med: 44, High: 72 dense)
  const maxParticles = graphicsQuality === 'high' ? 72 : graphicsQuality === 'medium' ? 44 : 14;
  const particlesRef = useRef<THREE.InstancedMesh>(null!);
  const particleData = useMemo(() => {
    return Array.from({ length: maxParticles }, () => ({
      pos: new THREE.Vector3(0, -100, 0),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 0.6,
      size: 0.12,
      type: 'smoke' as 'smoke' | 'spark',
    }));
  }, [maxParticles]);
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyColor = useMemo(() => new THREE.Color(), []);

  // Handle manual reset signal from HUD or Key R (teleport to Monza Rettifilo Start/Finish)
  useEffect(() => {
    if (controls.reset) {
      const p = physics.current;
      p.position.set(0, 0.08, -25);
      p.vx = 0;
      p.vz = 0;
      p.speed = 0;
      p.heading = Math.PI / 2;
      p.steerAngle = 0;
      p.pitch = 0;
      p.roll = 0;
      p.isDrifting = false;
      p.hintIndex = 0;
      if (carGroup.current) {
        carGroup.current.position.set(0, 0.08, -25);
        carGroup.current.rotation.y = Math.PI / 2;
      }
      setTireScreech(false);
    }
  }, [controls.reset]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      setTireScreech(false);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = physics.current;

    // ─────────────────────────────────────────────────────────────
    // 1. AUTO-PARKING MODE (When user scrolls down into Hero Room)
    // ─────────────────────────────────────────────────────────────
    if (isAutoParking) {
      const targetPos = new THREE.Vector3(...parkingPosition);
      p.position.lerp(targetPos, dt * 3.5);

      let angleDiff = parkingAngle - p.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      p.heading += angleDiff * dt * 4.0;

      p.vx = THREE.MathUtils.lerp(p.vx, 0, dt * 6);
      p.vz = THREE.MathUtils.lerp(p.vz, 0, dt * 6);
      p.speed = THREE.MathUtils.lerp(p.speed, 0, dt * 6);
      p.steerAngle = THREE.MathUtils.lerp(p.steerAngle, 0, dt * 6);
      p.pitch = THREE.MathUtils.lerp(p.pitch, 0, dt * 8);
      p.roll = THREE.MathUtils.lerp(p.roll, 0, dt * 8);
      p.isDrifting = false;
      p.isBraking = true;

      setTireScreech(false);
    } else {
      // ─────────────────────────────────────────────────────────────
      // 2. ACTIVE DRIFT PLAYGROUND PHYSICS STEP
      // ─────────────────────────────────────────────────────────────
      stepCarPhysics(p, controls, dt, steeringSensitivity, driftSlickness);

      // Procedural Web Audio engine sound and drift tire screech
      updateEngineSound(p.speed, controls.forward);
      setTireScreech(p.isDrifting && p.speed > 2.5);
    }

    // Update telemetry refs for TireSkidmarks
    carPosRef.current.copy(p.position);
    headingRef.current = p.heading;
    speedRef.current = p.speed;
    isDriftingRef.current = p.isDrifting;

    // ─────────────────────────────────────────────────────────────
    // 3. APPLY TRANSFORMS TO THREE.JS MESH GROUPS
    // ─────────────────────────────────────────────────────────────
    if (carGroup.current) {
      carGroup.current.position.copy(p.position);
      carGroup.current.rotation.y = p.heading;
    }

    if (carBody.current) {
      carBody.current.rotation.x = p.pitch;
      carBody.current.rotation.z = p.roll;
    }

    // Forward position and heading to parent for camera tracking and radar
    if (onPositionUpdate) {
      onPositionUpdate(p.position, p.heading, p.speed);
    }

    // Broadcast state to multiplayer peers
    if (onPhysicsBroadcast) {
      onPhysicsBroadcast({
        x: p.position.x,
        z: p.position.z,
        heading: p.heading,
        speed: p.speed,
        steerAngle: p.steerAngle,
        isDrifting: p.isDrifting,
        isBraking: p.isBraking,
        currentLap: raceTelemetry?.currentLap,
        checkpointIndex: raceTelemetry?.checkpointIndex,
        currentLapTime: raceTelemetry?.currentLapTime,
        bestLapTime: raceTelemetry?.bestLapTime,
        isFinished: raceTelemetry?.isFinished,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. MULTI-LAYER PARTICLES: DRIFT SMOKE & SPARKS
    // ─────────────────────────────────────────────────────────────
    if (particlesRef.current) {
      const isEmitting = p.isDrifting || (Math.abs(p.speed) > 4.5 && Math.random() < 0.35);

      for (let i = 0; i < maxParticles; i++) {
        const pt = particleData[i];

        if (pt.life > 0) {
          pt.life -= dt;
          pt.pos.addScaledVector(pt.vel, dt);
          const progress = 1 - pt.life / pt.maxLife;

          const currentScale =
            pt.type === 'spark'
              ? pt.size * (1 - progress * 0.9)
              : pt.size * (1 + progress * 2.2);

          dummyMatrix.makeScale(currentScale, currentScale, currentScale);
          dummyMatrix.setPosition(pt.pos);
          particlesRef.current.setMatrixAt(i, dummyMatrix);

          // Update dynamic particle color
          if (pt.type === 'spark') {
            dummyColor.setRGB(1.0, 0.7, 0.1);
          } else {
            dummyColor.set(color);
          }
          particlesRef.current.setColorAt(i, dummyColor);
        } else if (isEmitting) {
          const driftSpawnChance =
            graphicsQuality === 'high' ? 0.90 : graphicsQuality === 'medium' ? 0.70 : 0.32;
          const sparkChance =
            graphicsQuality === 'high' ? 0.45 : graphicsQuality === 'medium' ? 0.30 : 0.0;
          const smokeBaseSize =
            graphicsQuality === 'high' ? 0.28 : graphicsQuality === 'medium' ? 0.22 : 0.10;
          const smokeBaseLife =
            graphicsQuality === 'high' ? 0.75 : graphicsQuality === 'medium' ? 0.60 : 0.35;

          if (p.isDrifting && Math.random() < driftSpawnChance) {
            // Spawn drift smoke or neon sparks
            const isSpark = sparkChance > 0 && Math.random() < sparkChance;
            pt.type = isSpark ? 'spark' : 'smoke';
            pt.life = isSpark ? 0.3 : smokeBaseLife;
            pt.maxLife = pt.life;
            pt.size = isSpark ? 0.08 : smokeBaseSize;

            const sideOffset = (Math.random() > 0.5 ? 1 : -1) * 0.45;
            const rearOffset = new THREE.Vector3(
              sideOffset,
              0.08,
              -0.75
            ).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.heading);

            pt.pos.copy(p.position).add(rearOffset);
            pt.vel.set(
              (Math.random() - 0.5) * 2.2 - p.vx * 0.15,
              isSpark ? Math.random() * 1.2 + 0.4 : Math.random() * 0.8 + 0.3,
              (Math.random() - 0.5) * 2.2 - p.vz * 0.15
            );

            dummyMatrix.makeScale(pt.size, pt.size, pt.size);
            dummyMatrix.setPosition(pt.pos);
            particlesRef.current.setMatrixAt(i, dummyMatrix);
            dummyColor.set(isSpark ? '#f59e0b' : color);
            particlesRef.current.setColorAt(i, dummyColor);
          } else if (Math.random() < (graphicsQuality === 'low' ? 0.08 : 0.25)) {
            // Gentle standard tire dust
            pt.type = 'smoke';
            pt.life = smokeBaseLife * 0.8;
            pt.maxLife = pt.life;
            pt.size = smokeBaseSize * 0.6;

            const sideOffset = (Math.random() > 0.5 ? 1 : -1) * 0.4;
            const rearOffset = new THREE.Vector3(
              sideOffset,
              0.08,
              -0.75
            ).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.heading);

            pt.pos.copy(p.position).add(rearOffset);
            pt.vel.set(
              (Math.random() - 0.5) * 1.0 - p.vx * 0.1,
              Math.random() * 0.5 + 0.2,
              (Math.random() - 0.5) * 1.0 - p.vz * 0.1
            );

            dummyMatrix.makeScale(pt.size, pt.size, pt.size);
            dummyMatrix.setPosition(pt.pos);
            particlesRef.current.setMatrixAt(i, dummyMatrix);
            dummyColor.set('#94a3b8');
            particlesRef.current.setColorAt(i, dummyColor);
          }
        } else {
          // Park particle far below arena
          dummyMatrix.makeScale(0, 0, 0);
          dummyMatrix.setPosition(0, -100, 0);
          particlesRef.current.setMatrixAt(i, dummyMatrix);
        }
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
      if (particlesRef.current.instanceColor) {
        particlesRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  const particleOpacity =
    graphicsQuality === 'high' ? 0.78 : graphicsQuality === 'medium' ? 0.52 : 0.22;

  return (
    <>
      <group ref={carGroup} position={[0, 0.08, -25]} rotation={[0, Math.PI / 2, 0]}>
        {/* Floating Username, Drift Status, & Emote Badge */}
        <CarUsernameBadge
          username={username}
          isSelf={true}
          color={color}
          model={model}
          isDrifting={physics.current.isDrifting}
          speed={physics.current.speed}
          activeEmote={activeEmote}
        />

        {/* Dynamic Tilting Car Body Mesh */}
        <group ref={carBody}>
          <CarBodyMesh
            model={model}
            color={color}
            isDrifting={physics.current.isDrifting}
            isBraking={physics.current.isBraking}
            graphicsQuality={graphicsQuality}
          />
        </group>

        {/* Wheel Assembly with Steer Pivot & Wheel Spin */}
        <CarWheels
          model={model}
          color={color}
          steerAngle={physics.current.steerAngle}
          wheelSpin={physics.current.wheelSpin}
        />

        {/* Dynamic Dual Headlight Spotlights */}
        <spotLight
          position={[-0.32, 0.28, 0.85]}
          target-position={[-0.15, 0, 8.5]}
          color="#f0f9ff"
          intensity={graphicsQuality === 'high' ? 3.2 : 2.5}
          angle={0.52}
          penumbra={0.65}
          distance={10.0}
        />
        <spotLight
          position={[0.32, 0.28, 0.85]}
          target-position={[0.15, 0, 8.5]}
          color="#f0f9ff"
          intensity={graphicsQuality === 'high' ? 3.2 : 2.5}
          angle={0.52}
          penumbra={0.65}
          distance={10.0}
        />
      </group>

      {/* Dynamic Tire Skidmarks (Fading Rubber Trails on Monza Asphalt) */}
      <TireSkidmarks
        carPosRef={carPosRef}
        headingRef={headingRef}
        speedRef={speedRef}
        isDriftingRef={isDriftingRef}
        graphicsQuality={graphicsQuality}
      />

      {/* Instanced Drift Smoke & Sparks */}
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, maxParticles]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          transparent
          opacity={particleOpacity}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
