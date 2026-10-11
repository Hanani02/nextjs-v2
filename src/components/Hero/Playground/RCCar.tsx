'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { CarControls } from './useKeyboardControls';

interface RCCarProps {
  controls: CarControls;
  isAutoParking: boolean;
  onPositionUpdate?: (pos: THREE.Vector3) => void;
  parkingPosition?: [number, number, number];
  parkingAngle?: number;
  boundsX?: number;
  boundsZ?: number;
}

export default function RCCar({
  controls,
  isAutoParking,
  onPositionUpdate,
  parkingPosition = [0, 0.08, 0],
  parkingAngle = 0,
  boundsX = 24,
  boundsZ = 16
}: RCCarProps) {
  const carGroup = useRef<THREE.Group>(null!);
  const carBody = useRef<THREE.Group>(null!);

  // Wheel refs for steering and spin
  const frontLeftWheel = useRef<THREE.Group>(null!);
  const frontRightWheel = useRef<THREE.Group>(null!);
  const rearLeftWheel = useRef<THREE.Mesh>(null!);
  const rearRightWheel = useRef<THREE.Mesh>(null!);
  const brakeLightLeft = useRef<THREE.MeshStandardMaterial>(null!);
  const brakeLightRight = useRef<THREE.MeshStandardMaterial>(null!);
  const headlightBeam = useRef<THREE.SpotLight>(null!);

  // Physics state stored in mutable ref
  const physics = useRef({
    position: new THREE.Vector3(0, 0.08, 0),
    speed: 0,
    heading: 0, // In radians
    steerAngle: 0,
    wheelSpin: 0,
    pitch: 0,
    roll: 0,
    wrapCooldown: 0
  });

  // Exhaust particles pool
  const maxParticles = 24;
  const particlesRef = useRef<THREE.InstancedMesh>(null!);
  const particleData = useMemo(() => {
    return Array.from({ length: maxParticles }, () => ({
      pos: new THREE.Vector3(0, -100, 0),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 0.5,
      size: 0.1
    }));
  }, [maxParticles]);
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Handle reset signal
  useEffect(() => {
    if (controls.reset) {
      physics.current.position.set(0, 0.08, 0);
      physics.current.speed = 0;
      physics.current.heading = 0;
      physics.current.steerAngle = 0;
      if (carGroup.current) {
        carGroup.current.position.set(0, 0.08, 0);
        carGroup.current.rotation.y = 0;
      }
    }
  }, [controls.reset]);

  useFrame((_, delta) => {
    // Clamp delta to prevent huge jumps on tab switch
    const dt = Math.min(delta, 0.05);
    const p = physics.current;

    // ─────────────────────────────────────────────────────────────
    // 1. AUTO-PARKING MODE (When scrolled to Hero Room)
    // ─────────────────────────────────────────────────────────────
    if (isAutoParking) {
      const targetPos = new THREE.Vector3(...parkingPosition);
      p.position.lerp(targetPos, dt * 3.5);
      
      // Smooth angle interpolation
      let angleDiff = parkingAngle - p.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      p.heading += angleDiff * dt * 4.0;

      p.speed = THREE.MathUtils.lerp(p.speed, 0, dt * 5);
      p.steerAngle = THREE.MathUtils.lerp(p.steerAngle, 0, dt * 6);
      p.pitch = THREE.MathUtils.lerp(p.pitch, 0, dt * 8);
      p.roll = THREE.MathUtils.lerp(p.roll, 0, dt * 8);

      if (brakeLightLeft.current && brakeLightRight.current) {
        brakeLightLeft.current.emissiveIntensity = 0.5;
        brakeLightRight.current.emissiveIntensity = 0.5;
      }
    } else {
      // ─────────────────────────────────────────────────────────────
      // 2. MANUAL PLAYGROUND DRIVING MODE
      // ─────────────────────────────────────────────────────────────
      const ACCELERATION = 25.0;
      const MAX_SPEED = 18.0;
      const REVERSE_ACCEL = 12.0;
      const MAX_REVERSE = -8.0;
      const TURN_SPEED = 3.6;
      const FRICTION = 0.94;
      const MAX_STEER = 0.58;

      const isBraking =
        controls.brake ||
        (controls.backward && p.speed > 0.5) ||
        (controls.forward && p.speed < -0.5);

      // Throttle & Acceleration
      if (controls.forward && !controls.backward) {
        p.speed += ACCELERATION * dt;
        if (p.speed > MAX_SPEED) p.speed = MAX_SPEED;
      } else if (controls.backward && !controls.forward) {
        if (p.speed > 0.3) {
          // Braking while moving forward
          p.speed -= ACCELERATION * 1.8 * dt;
        } else {
          // Reverse
          p.speed -= REVERSE_ACCEL * dt;
          if (p.speed < MAX_REVERSE) p.speed = MAX_REVERSE;
        }
      } else {
        // Natural friction/drag
        p.speed *= Math.pow(FRICTION, dt * 60);
        if (Math.abs(p.speed) < 0.03) p.speed = 0;
      }

      // Handbrake
      if (controls.brake) {
        p.speed *= Math.pow(0.85, dt * 60);
      }

      // Steering input
      let targetSteer = 0;
      if (controls.left) targetSteer += MAX_STEER;
      if (controls.right) targetSteer -= MAX_STEER;

      // Smooth steering response
      p.steerAngle = THREE.MathUtils.lerp(p.steerAngle, targetSteer, dt * 14);

      // Turning rotation (only turn when moving)
      if (Math.abs(p.speed) > 0.05) {
        const speedRatio = Math.min(Math.abs(p.speed) / MAX_SPEED, 1);
        // Reverse steering logic when going backward
        const dir = p.speed >= 0 ? 1 : -1;
        p.heading += p.steerAngle * TURN_SPEED * speedRatio * dir * dt;
      }

      // Update position based on heading
      const vx = Math.sin(p.heading) * p.speed;
      const vz = Math.cos(p.heading) * p.speed;
      p.position.x += vx * dt;
      p.position.z += vz * dt;

      // ─────────────────────────────────────────────────────────────
      // SCREEN WRAP (Pac-Man Effect)
      // ─────────────────────────────────────────────────────────────
      p.wrapCooldown -= dt;
      let didWrap = false;

      if (p.position.x > boundsX) {
        p.position.x = -boundsX + 0.35;
        didWrap = true;
      } else if (p.position.x < -boundsX) {
        p.position.x = boundsX - 0.35;
        didWrap = true;
      }

      if (p.position.z > boundsZ) {
        p.position.z = -boundsZ + 0.35;
        didWrap = true;
      } else if (p.position.z < -boundsZ) {
        p.position.z = boundsZ - 0.35;
        didWrap = true;
      }

      if (didWrap && p.wrapCooldown <= 0) {
        p.wrapCooldown = 0.2;
      }

      // Dynamic suspension pitch & roll
      const targetPitch = (p.speed / MAX_SPEED) * -0.06;
      const targetRoll = (p.steerAngle * (p.speed / MAX_SPEED)) * 0.12;
      p.pitch = THREE.MathUtils.lerp(p.pitch, targetPitch, dt * 8);
      p.roll = THREE.MathUtils.lerp(p.roll, targetRoll, dt * 8);

      // Brake light glow intensity
      if (brakeLightLeft.current && brakeLightRight.current) {
        const glow = isBraking ? 2.5 : p.speed < -0.1 ? 1.8 : 0.4;
        brakeLightLeft.current.emissiveIntensity = glow;
        brakeLightRight.current.emissiveIntensity = glow;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. APPLY TRANSFORMS TO MESHES
    // ─────────────────────────────────────────────────────────────
    if (carGroup.current) {
      carGroup.current.position.copy(p.position);
      carGroup.current.rotation.y = p.heading;
    }

    if (carBody.current) {
      carBody.current.rotation.x = p.pitch;
      carBody.current.rotation.z = p.roll;
    }

    // Front wheel steering angle
    if (frontLeftWheel.current) frontLeftWheel.current.rotation.y = p.steerAngle;
    if (frontRightWheel.current) frontRightWheel.current.rotation.y = p.steerAngle;

    // Wheel spin rotation
    const wheelRadius = 0.22;
    p.wheelSpin += (p.speed / wheelRadius) * dt;

    if (rearLeftWheel.current) rearLeftWheel.current.rotation.x = p.wheelSpin;
    if (rearRightWheel.current) rearRightWheel.current.rotation.x = p.wheelSpin;

    // Forward position to parent for coin collision detection
    if (onPositionUpdate) {
      onPositionUpdate(p.position);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. EXHAUST DUST & TRAIL PARTICLES
    // ─────────────────────────────────────────────────────────────
    if (particlesRef.current) {
      const isMovingFast = Math.abs(p.speed) > 2.5;
      for (let i = 0; i < maxParticles; i++) {
        const pt = particleData[i];
        if (pt.life > 0) {
          pt.life -= dt;
          pt.pos.addScaledVector(pt.vel, dt);
          const progress = 1 - pt.life / pt.maxLife;
          const scale = pt.size * (1 - progress * 0.6);
          dummyMatrix.makeScale(scale, scale, scale);
          dummyMatrix.setPosition(pt.pos);
          particlesRef.current.setMatrixAt(i, dummyMatrix);
        } else if (isMovingFast && Math.random() < 0.25) {
          // Spawn new exhaust puff behind car
          pt.life = pt.maxLife;
          const rearOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.4,
            0.1,
            -0.85
          ).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.heading);

          pt.pos.copy(p.position).add(rearOffset);
          pt.vel.set(
            (Math.random() - 0.5) * 0.8 - Math.sin(p.heading) * 0.5,
            Math.random() * 0.6 + 0.2,
            (Math.random() - 0.5) * 0.8 - Math.cos(p.heading) * 0.5
          );
          dummyMatrix.makeScale(pt.size, pt.size, pt.size);
          dummyMatrix.setPosition(pt.pos);
          particlesRef.current.setMatrixAt(i, dummyMatrix);
        } else {
          // Hidden offscreen
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
      <group ref={carGroup} position={[0, 0.08, 0]}>
        {/* Tilting car body */}
        <group ref={carBody}>
          {/* Main Lower Chassis */}
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.14, 1.8]} />
            <meshStandardMaterial
              color="#090d16"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Aerodynamic Cockpit & Hood (Cyber Cyan) */}
          <mesh position={[0, 0.32, -0.05]} castShadow>
            <boxGeometry args={[0.74, 0.18, 1.15]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#0891b2"
              emissiveIntensity={0.25}
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>

          {/* Tinted Cabin Windshield Glass */}
          <mesh position={[0, 0.38, 0.05]}>
            <boxGeometry args={[0.66, 0.15, 0.65]} />
            <meshStandardMaterial
              color="#0f172a"
              metalness={0.95}
              roughness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Front Bumper / Splitter */}
          <mesh position={[0, 0.14, 0.95]} castShadow>
            <boxGeometry args={[0.96, 0.08, 0.2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Dual Front LED Headlights */}
          <mesh position={[-0.32, 0.22, 0.96]}>
            <boxGeometry args={[0.18, 0.07, 0.04]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={3.0}
            />
          </mesh>
          <mesh position={[0.32, 0.22, 0.96]}>
            <boxGeometry args={[0.18, 0.07, 0.04]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={3.0}
            />
          </mesh>

          {/* Front Headlight Light Beam */}
          <spotLight
            ref={headlightBeam}
            position={[0, 0.3, 1.0]}
            target-position={[0, 0, 4.0]}
            color="#38bdf8"
            intensity={2.8}
            angle={0.55}
            penumbra={0.6}
            distance={7.0}
          />

          {/* Rear Dual Fin Spoiler Wing */}
          <group position={[0, 0.42, -0.82]}>
            {/* Wing Top Blade */}
            <mesh position={[0, 0.12, 0]} castShadow>
              <boxGeometry args={[0.98, 0.04, 0.22]} />
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Wing Left Strut */}
            <mesh position={[-0.38, 0.05, 0]}>
              <boxGeometry args={[0.04, 0.16, 0.14]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Wing Right Strut */}
            <mesh position={[0.38, 0.05, 0]}>
              <boxGeometry args={[0.04, 0.16, 0.14]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>

          {/* Rear LED Brake Light Strips */}
          <mesh position={[-0.32, 0.22, -0.92]}>
            <boxGeometry args={[0.2, 0.06, 0.03]} />
            <meshStandardMaterial
              ref={brakeLightLeft}
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0.32, 0.22, -0.92]}>
            <boxGeometry args={[0.2, 0.06, 0.03]} />
            <meshStandardMaterial
              ref={brakeLightRight}
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* RC Remote Control Flexible Antenna */}
          <group position={[-0.26, 0.45, -0.3]}>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.012, 0.016, 0.48, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            {/* Glowing Antenna Tip LED */}
            <mesh position={[0, 0.46, 0]}>
              <sphereGeometry args={[0.038, 12, 12]} />
              <meshStandardMaterial
                color="#f43f5e"
                emissive="#f43f5e"
                emissiveIntensity={3.5}
              />
            </mesh>
          </group>

          {/* Neon Underglow Floor Ring */}
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 2.0]} />
            <meshBasicMaterial
              color="#06b6d4"
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* ─────────────────────────────────────────────────────────────
            WHEELS (Front wheels steer, rear wheels rotate)
        ───────────────────────────────────────────────────────────── */}
        {/* Front Left Wheel Assembly */}
        <group ref={frontLeftWheel} position={[-0.52, 0.18, 0.6]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.14, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Wheel Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.145, 12]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.7} />
          </mesh>
        </group>

        {/* Front Right Wheel Assembly */}
        <group ref={frontRightWheel} position={[0.52, 0.18, 0.6]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.14, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.145, 12]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.7} />
          </mesh>
        </group>

        {/* Rear Left Wheel */}
        <mesh
          ref={rearLeftWheel}
          position={[-0.52, 0.2, -0.6]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.2, 0.2, 0.16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Rear Right Wheel */}
        <mesh
          ref={rearRightWheel}
          position={[0.52, 0.2, -0.6]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.2, 0.2, 0.16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* Instanced Exhaust Particles */}
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, maxParticles]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} depthWrite={false} />
      </instancedMesh>
    </>
  );
}
