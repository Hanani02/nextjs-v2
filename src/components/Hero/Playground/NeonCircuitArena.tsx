'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface NeonCircuitArenaProps {
  boundsX?: number;
  boundsZ?: number;
  activeCheckpoint?: number;
}

export const RACE_CHECKPOINTS = [
  { id: 0, name: 'Start / Finish', center: [0, -9.2] as [number, number], width: 2.0, depth: 9.0 },
  { id: 1, name: 'Turn 1 Apex', center: [16.8, 0] as [number, number], width: 9.0, depth: 3.5 },
  { id: 2, name: 'Chicane Entry', center: [0, 9.5] as [number, number], width: 2.5, depth: 9.0 },
  { id: 3, name: 'Hairpin Apex', center: [-16.8, 0] as [number, number], width: 9.0, depth: 3.5 },
];

export default function NeonCircuitArena({
  boundsX = 22.2,
  boundsZ = 14.0,
  activeCheckpoint = 0,
}: NeonCircuitArenaProps) {
  // 1. Procedural Asphalt Track Texture with grid and racing lines
  const asphaltTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Deep cyber asphalt dark backdrop
      ctx.fillStyle = '#06060c';
      ctx.fillRect(0, 0, 1024, 1024);

      // Fine grid texture
      ctx.strokeStyle = '#0f1020';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x <= 1024; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y <= 1024; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Checkered grid accents
      ctx.strokeStyle = '#181938';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 1024; x += step * 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y <= 1024; y += step * 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 12);
    return tex;
  }, []);

  return (
    <group position={[0, -0.01, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. CIRCUIT ASPHALT FLOOR
      ───────────────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[boundsX * 2 + 12, boundsZ * 2 + 12]} />
        <meshStandardMaterial
          map={asphaltTexture || undefined}
          color="#06060c"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. OUTER PERIMETER TECH BARRIERS (Enclosed Circuit Walls)
      ───────────────────────────────────────────────────────────── */}
      {/* North Outer Wall */}
      <mesh position={[0, 0.45, boundsZ]} castShadow receiveShadow>
        <boxGeometry args={[boundsX * 2, 0.9, 0.4]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* North Wall Glowing Neon Strip */}
      <mesh position={[0, 0.65, boundsZ - 0.21]}>
        <boxGeometry args={[boundsX * 2, 0.08, 0.02]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* South Outer Wall */}
      <mesh position={[0, 0.45, -boundsZ]} castShadow receiveShadow>
        <boxGeometry args={[boundsX * 2, 0.9, 0.4]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* South Wall Glowing Neon Strip */}
      <mesh position={[0, 0.65, -boundsZ + 0.21]}>
        <boxGeometry args={[boundsX * 2, 0.08, 0.02]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* East Outer Wall (Right) */}
      <mesh position={[boundsX, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.9, boundsZ * 2]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* East Wall Glowing Neon Strip */}
      <mesh position={[boundsX - 0.21, 0.65, 0]}>
        <boxGeometry args={[0.02, 0.08, boundsZ * 2]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>

      {/* West Outer Wall (Left) */}
      <mesh position={[-boundsX, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.9, boundsZ * 2]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* West Wall Glowing Neon Strip */}
      <mesh position={[-boundsX + 0.21, 0.65, 0]}>
        <boxGeometry args={[0.02, 0.08, boundsZ * 2]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          3. INFIELD CENTRAL ISLAND BARRIERS (Closed Loop Circuit)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0.45, 0]}>
        {/* Main Center Barrier Block */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[22.0, 0.9, 8.4]} />
          <meshStandardMaterial color="#0d111d" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Neon Border Lining around Center Island */}
        <mesh position={[0, 0.2, 4.22]}>
          <boxGeometry args={[22.0, 0.08, 0.02]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <mesh position={[0, 0.2, -4.22]}>
          <boxGeometry args={[22.0, 0.08, 0.02]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[11.02, 0.2, 0]}>
          <boxGeometry args={[0.02, 0.08, 8.4]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <mesh position={[-11.02, 0.2, 0]}>
          <boxGeometry args={[0.02, 0.08, 8.4]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>

        {/* Center Paddock Tower / Neon Core */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.6, 1.8, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.1, 0]}>
          <ringGeometry args={[1.8, 2.3, 32]} />
          <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          4. CHICANE OBSTACLE ISLAND (Technical S-Curve Drift Challenge)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0.45, 9.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.6, 0.9, 3.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Chicane Chevron Neon Accents */}
        <mesh position={[0, 0.2, -1.92]}>
          <boxGeometry args={[5.6, 0.08, 0.02]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
        <mesh position={[0, 0.2, 1.92]}>
          <boxGeometry args={[5.6, 0.08, 0.02]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. HOLOGRAM START / FINISH GANTRY ARCH & CHECKERED LINE
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, -9.2]}>
        {/* Left Truss Pillar */}
        <mesh position={[0, 1.8, -4.5]} castShadow>
          <boxGeometry args={[0.3, 3.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Truss Pillar */}
        <mesh position={[0, 1.8, 4.5]} castShadow>
          <boxGeometry args={[0.3, 3.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Overhead Arch Crossbeam */}
        <mesh position={[0, 3.6, 0]} castShadow>
          <boxGeometry args={[0.4, 0.35, 9.3]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        {/* Overhead Glowing Hologram Sign Banner */}
        <mesh position={[0, 3.25, 0]}>
          <boxGeometry args={[0.08, 0.5, 7.8]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Overhead Gantry Downlights */}
        <pointLight position={[0, 3.2, 0]} color="#38bdf8" intensity={2.5} distance={8} />

        {/* Checkered Hologram Finish Line on Asphalt Surface */}
        {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((z, idx) => (
          <group key={idx} position={[0, 0.015, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.55]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#f8fafc' : '#0284c7'} />
            </mesh>
            <mesh position={[0.45, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.55]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#0284c7' : '#f8fafc'} />
            </mesh>
          </group>
        ))}

        {/* Start / Finish Glowing Hologram Line Projection */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 8.8]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          6. TRANSPARENT HOLOGRAPHIC CHECKPOINT GATES
      ───────────────────────────────────────────────────────────── */}
      {RACE_CHECKPOINTS.map((cp) => {
        const isCurrentTarget = activeCheckpoint === cp.id;
        const beamColor = isCurrentTarget ? '#22d3ee' : '#a855f7';
        return (
          <group key={cp.id} position={[cp.center[0], 0.015, cp.center[1]]}>
            {/* Ground Checkpoint Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.2, 1.45, 32]} />
              <meshBasicMaterial
                color={beamColor}
                transparent
                opacity={isCurrentTarget ? 0.9 : 0.4}
                depthWrite={false}
              />
            </mesh>

            {/* Vertical Hologram Laser Beacon Beam */}
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 3.0, 12]} />
              <meshBasicMaterial
                color={beamColor}
                transparent
                opacity={isCurrentTarget ? 0.85 : 0.3}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          7. RACETRACK APEX DRIFT CURBS (Alternating Kerbs)
      ───────────────────────────────────────────────────────────── */}
      {/* Turn 1 Outer Curbs (East Curve) */}
      {[5, 7, 9, 11, -5, -7, -9, -11].map((z, idx) => (
        <mesh key={idx} position={[boundsX - 0.5, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 1.4]} />
          <meshBasicMaterial
            color={idx % 2 === 0 ? '#06b6d4' : '#1e1b4b'}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Turn 3 Outer Curbs (West Hairpin) */}
      {[5, 7, 9, 11, -5, -7, -9, -11].map((z, idx) => (
        <mesh key={idx} position={[-boundsX + 0.5, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 1.4]} />
          <meshBasicMaterial
            color={idx % 2 === 0 ? '#a855f7' : '#1e1b4b'}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* ─────────────────────────────────────────────────────────────
          8. PIT STOP ENTRY LANE & PADDOCK MARKERS
      ───────────────────────────────────────────────────────────── */}
      <group position={[12.5, 0.015, -4.5]}>
        {/* Yellow/Cyan Pit Lane Entrance Stripes */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 0.12]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>
    </group>
  );
}
