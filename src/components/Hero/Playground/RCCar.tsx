'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { CarControls } from './useKeyboardControls';
import type { CarModelType } from '@/types/vehicle';
import CarBodyMesh from './CarBodyMesh';
import CarWheels from './CarWheels';
import CarUsernameBadge from './CarUsernameBadge';
import {
  createInitialPhysicsState,
  stepCarPhysics,
  type CarPhysicsState,
} from './carPhysics';

interface RCCarProps {
  controls: CarControls;
  isAutoParking: boolean;
  model?: CarModelType;
  color?: string;
  username?: string;
  onPositionUpdate?: (pos: THREE.Vector3) => void;
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
  onPositionUpdate,
  onPhysicsBroadcast,
  raceTelemetry,
  parkingPosition = [12.5, 0.08, -4.5],
  parkingAngle = -Math.PI / 2,
  boundsX = 22.2,
  boundsZ = 14.0,
}: RCCarProps) {
  const carGroup = useRef<THREE.Group>(null!);
  const carBody = useRef<THREE.Group>(null!);

  // Physics simulation state stored in mutable ref
  const physics = useRef<CarPhysicsState>(createInitialPhysicsState([0, 0.08, -9.2]));

  // Drift and exhaust particle system
  const maxParticles = 32;
  const particlesRef = useRef<THREE.InstancedMesh>(null!);
  const particleData = useMemo(() => {
    return Array.from({ length: maxParticles }, () => ({
      pos: new THREE.Vector3(0, -100, 0),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 0.6,
      size: 0.12,
      isDriftSmoke: false,
    }));
  }, [maxParticles]);
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Handle manual reset signal from HUD or Key R (teleport to Start/Finish line facing East)
  useEffect(() => {
    if (controls.reset) {
      const p = physics.current;
      p.position.set(0, 0.08, -9.2);
      p.vx = 0;
      p.vz = 0;
      p.speed = 0;
      p.heading = Math.PI / 2;
      p.steerAngle = 0;
      p.pitch = 0;
      p.roll = 0;
      p.isDrifting = false;
      if (carGroup.current) {
        carGroup.current.position.set(0, 0.08, -9.2);
        carGroup.current.rotation.y = Math.PI / 2;
      }
    }
  }, [controls.reset]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = physics.current;

    // ─────────────────────────────────────────────────────────────
    // 1. AUTO-PARKING MODE (When user scrolls into Hero Room)
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
    } else {
      // ─────────────────────────────────────────────────────────────
      // 2. ACTIVE DRIFT PLAYGROUND PHYSICS STEP
      // ─────────────────────────────────────────────────────────────
      stepCarPhysics(p, controls, dt, boundsX, boundsZ);
    }

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

    // Forward position to parent for camera tracking and gem pickup
    if (onPositionUpdate) {
      onPositionUpdate(p.position);
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
    // 4. DRIFT TIRE SMOKE & EXHAUST PARTICLES SYSTEM
    // ─────────────────────────────────────────────────────────────
    if (particlesRef.current) {
      const isEmitting = p.isDrifting || (Math.abs(p.speed) > 4.0 && Math.random() < 0.35);

      for (let i = 0; i < maxParticles; i++) {
        const pt = particleData[i];

        if (pt.life > 0) {
          pt.life -= dt;
          pt.pos.addScaledVector(pt.vel, dt);
          const progress = 1 - pt.life / pt.maxLife;
          const currentScale = pt.isDriftSmoke
            ? pt.size * (1 + progress * 2.2)
            : pt.size * (1 - progress * 0.7);

          dummyMatrix.makeScale(currentScale, currentScale, currentScale);
          dummyMatrix.setPosition(pt.pos);
          particlesRef.current.setMatrixAt(i, dummyMatrix);
        } else if (isEmitting && Math.random() < (p.isDrifting ? 0.7 : 0.25)) {
          // Spawn new drift cloud from rear tires
          pt.isDriftSmoke = p.isDrifting;
          pt.life = pt.maxLife;
          pt.size = p.isDrifting ? 0.2 : 0.1;

          const sideOffset = (Math.random() > 0.5 ? 1 : -1) * 0.45;
          const rearOffset = new THREE.Vector3(
            sideOffset,
            0.08,
            -0.75
          ).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.heading);

          pt.pos.copy(p.position).add(rearOffset);
          pt.vel.set(
            (Math.random() - 0.5) * 1.5 - p.vx * 0.15,
            Math.random() * 0.8 + 0.3,
            (Math.random() - 0.5) * 1.5 - p.vz * 0.15
          );

          dummyMatrix.makeScale(pt.size, pt.size, pt.size);
          dummyMatrix.setPosition(pt.pos);
          particlesRef.current.setMatrixAt(i, dummyMatrix);
        } else {
          // Park particle far below arena
          dummyMatrix.makeScale(0, 0, 0);
          dummyMatrix.setPosition(0, -100, 0);
          particlesRef.current.setMatrixAt(i, dummyMatrix);
        }
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={carGroup} position={[0, 0.08, -9.2]} rotation={[0, Math.PI / 2, 0]}>
        {/* Floating Username & Status Badge */}
        <CarUsernameBadge
          username={username}
          isSelf={true}
          color={color}
          model={model}
          isDrifting={physics.current.isDrifting}
          speed={physics.current.speed}
        />

        {/* Dynamic Tilting Car Body Mesh */}
        <group ref={carBody}>
          <CarBodyMesh
            model={model}
            color={color}
            isDrifting={physics.current.isDrifting}
            isBraking={physics.current.isBraking}
          />
        </group>

        {/* Wheel Assembly with Steer Pivot & Wheel Spin */}
        <CarWheels
          model={model}
          color={color}
          steerAngle={physics.current.steerAngle}
          wheelSpin={physics.current.wheelSpin}
        />

        {/* Front Headlight Spotlight Beam */}
        <spotLight
          position={[0, 0.3, 1.0]}
          target-position={[0, 0, 5.0]}
          color="#38bdf8"
          intensity={2.8}
          angle={0.55}
          penumbra={0.6}
          distance={7.5}
        />
      </group>

      {/* Instanced Drift Smoke & Tire Dust Particles */}
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, maxParticles]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
