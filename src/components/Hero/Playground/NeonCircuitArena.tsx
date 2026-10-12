'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import {
  MONZA_SAMPLED_POINTS,
  MONZA_CHECKPOINTS,
  MONZA_TRACK_WIDTH,
  type TrackPoint,
} from './monzaTrack';

interface NeonCircuitArenaProps {
  boundsX?: number;
  boundsZ?: number;
  activeCheckpoint?: number;
}

// Re-export checkpoints from the canonical Monza model
export const RACE_CHECKPOINTS = MONZA_CHECKPOINTS;

// All nitro boost pads removed per specification
export const NITRO_BOOST_PADS: Array<{
  id: string;
  x: number;
  z: number;
  rotationY: number;
  width: number;
  length: number;
  name: string;
}> = [];

/**
 * Autodromo Nazionale Monza - Full Scale 3D Racing Circuit
 * Features:
 * - Rettifilo Straight (Long high-speed straight with Start/Finish line)
 * - Variante del Rettifilo (Prima Variante Chicane)
 * - Curva Grande (Biassono high-speed sweeper)
 * - Variante della Roggia (Left-Right chicane)
 * - Curve di Lesmo (Lesmo 1 & Lesmo 2)
 * - Curva del Serraglio straight towards Ascari
 * - Variante Ascari (Turns 8, 9, 10 chicane complex)
 * - Back straight sprint towards Parabolica
 * - Curva Parabolica (Alboreto 180° long sweeping right curve)
 * - F1 Red & White kerbs on corners, Tecpro barriers, and hologram Start/Finish gantry.
 */
export default function NeonCircuitArena({
  activeCheckpoint = 0,
}: NeonCircuitArenaProps) {
  const points = MONZA_SAMPLED_POINTS;
  const halfWidth = MONZA_TRACK_WIDTH / 2; // 2.8 units

  // ─────────────────────────────────────────────────────────────
  // 1. PROCEDURAL ASPHALT TEXTURE (Dark, high-grip racing surface)
  // ─────────────────────────────────────────────────────────────
  const asphaltTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 1024, 1024);

      // Fine asphalt pebble noise and racing groove
      ctx.strokeStyle = '#121824';
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

      // Rubber racing line streaks
      ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
      ctx.fillRect(256, 0, 512, 1024);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 48);
    return tex;
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 2. MONZA ASPHALT ROAD RIBBON GEOMETRY
  // ─────────────────────────────────────────────────────────────
  const roadGeometry = useMemo(() => {
    const N = points.length;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= N; i++) {
      const pt = points[i % N];
      // Left edge
      const lx = pt.x + pt.nx * halfWidth;
      const lz = pt.z + pt.nz * halfWidth;
      // Right edge
      const rx = pt.x - pt.nx * halfWidth;
      const rz = pt.z - pt.nz * halfWidth;

      const v = (pt.distanceAlongTrack || i * 0.95) * 0.25;

      positions.push(lx, 0.005, lz);
      uvs.push(0, v);

      positions.push(rx, 0.005, rz);
      uvs.push(1, v);

      if (i < N) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [points, halfWidth]);

  // ─────────────────────────────────────────────────────────────
  // 3. WHITE BOUNDARY LINES GEOMETRY
  // ─────────────────────────────────────────────────────────────
  const boundaryLinesGeom = useMemo(() => {
    const N = points.length;
    const positions: number[] = [];
    const indices: number[] = [];
    const lineWidth = 0.14;

    let vIdx = 0;

    // Outer Left white line
    for (let i = 0; i <= N; i++) {
      const pt = points[i % N];
      const offsetL = halfWidth - 0.16;
      const x1 = pt.x + pt.nx * offsetL;
      const z1 = pt.z + pt.nz * offsetL;
      const x2 = pt.x + pt.nx * (offsetL - lineWidth);
      const z2 = pt.z + pt.nz * (offsetL - lineWidth);

      positions.push(x1, 0.012, z1);
      positions.push(x2, 0.012, z2);

      if (i < N) {
        indices.push(vIdx, vIdx + 1, vIdx + 2);
        indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
      }
      vIdx += 2;
    }

    // Outer Right white line
    for (let i = 0; i <= N; i++) {
      const pt = points[i % N];
      const offsetR = -halfWidth + 0.16;
      const x1 = pt.x + pt.nx * offsetR;
      const z1 = pt.z + pt.nz * offsetR;
      const x2 = pt.x + pt.nx * (offsetR + lineWidth);
      const z2 = pt.z + pt.nz * (offsetR + lineWidth);

      positions.push(x1, 0.012, z1);
      positions.push(x2, 0.012, z2);

      if (i < N) {
        indices.push(vIdx, vIdx + 1, vIdx + 2);
        indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
      }
      vIdx += 2;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [points, halfWidth]);

  // ─────────────────────────────────────────────────────────────
  // 4. F1 RED & WHITE ALTERNATING KERBS ON CORNERS
  // ─────────────────────────────────────────────────────────────
  const kerbsGeom = useMemo(() => {
    const N = points.length;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const kerbWidth = 0.75;
    const kerbHeight = 0.04;

    let vIdx = 0;

    for (let i = 0; i < N; i++) {
      const pt = points[i];
      const nextPt = points[(i + 1) % N];

      // Place kerbs wherever track is curving (chicanes, Lesmos, Parabolica)
      if (pt.isCorner || nextPt.isCorner) {
        // Red and white alternating pattern every 1.1 meters
        const isRed = Math.floor(pt.distanceAlongTrack / 1.1) % 2 === 0;
        const color = isRed ? [0.86, 0.15, 0.15] : [0.98, 0.98, 0.98];

        // Inner Left Apex kerb
        const lx1 = pt.x + pt.nx * halfWidth;
        const lz1 = pt.z + pt.nz * halfWidth;
        const lx2 = pt.x + pt.nx * (halfWidth + kerbWidth);
        const lz2 = pt.z + pt.nz * (halfWidth + kerbWidth);

        const nlx1 = nextPt.x + nextPt.nx * halfWidth;
        const nlz1 = nextPt.z + nextPt.nz * halfWidth;
        const nlx2 = nextPt.x + nextPt.nx * (halfWidth + kerbWidth);
        const nlz2 = nextPt.z + nextPt.nz * (halfWidth + kerbWidth);

        positions.push(lx1, kerbHeight, lz1, lx2, kerbHeight, lz2, nlx1, kerbHeight, nlz1, nlx2, kerbHeight, nlz2);
        colors.push(...color, ...color, ...color, ...color);

        indices.push(vIdx, vIdx + 1, vIdx + 2);
        indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
        vIdx += 4;

        // Inner Right Apex kerb
        const rx1 = pt.x - pt.nx * halfWidth;
        const rz1 = pt.z - pt.nz * halfWidth;
        const rx2 = pt.x - pt.nx * (halfWidth + kerbWidth);
        const rz2 = pt.z - pt.nz * (halfWidth + kerbWidth);

        const nrx1 = nextPt.x - nextPt.nx * halfWidth;
        const nrz1 = nextPt.z - nextPt.nz * halfWidth;
        const nrx2 = nextPt.x - nextPt.nx * (halfWidth + kerbWidth);
        const nrz2 = nextPt.z - nextPt.nz * (halfWidth + kerbWidth);

        positions.push(rx1, kerbHeight, rz1, rx2, kerbHeight, rz2, nrx1, kerbHeight, nrz1, nrx2, kerbHeight, nrz2);
        colors.push(...color, ...color, ...color, ...color);

        indices.push(vIdx, vIdx + 1, vIdx + 2);
        indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
        vIdx += 4;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [points, halfWidth]);

  // ─────────────────────────────────────────────────────────────
  // 5. TECPRO SAFETY BARRIERS (Continuous F1 Safety Walls)
  // ─────────────────────────────────────────────────────────────
  const barriersGeom = useMemo(() => {
    const N = points.length;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const barrierHeight = 0.88;
    const barrierOffset = halfWidth + 0.55;

    let vIdx = 0;

    // Step every 2 points along track to generate barrier wall
    const step = 2;
    for (let i = 0; i < N; i += step) {
      const pt = points[i];
      const nextPt = points[(i + step) % N];

      const isRed = Math.floor(pt.distanceAlongTrack / 2.2) % 2 === 0;
      const wallColor = isRed ? [0.86, 0.15, 0.15] : [0.95, 0.95, 0.98];

      // 1. Left Barrier Wall
      const p1x = pt.x + pt.nx * barrierOffset;
      const p1z = pt.z + pt.nz * barrierOffset;
      const p2x = nextPt.x + nextPt.nx * barrierOffset;
      const p2z = nextPt.z + nextPt.nz * barrierOffset;

      // Bottom 2 vertices, Top 2 vertices
      positions.push(p1x, 0, p1z, p2x, 0, p2z, p1x, barrierHeight, p1z, p2x, barrierHeight, p2z);
      colors.push(...wallColor, ...wallColor, ...wallColor, ...wallColor);

      indices.push(vIdx, vIdx + 2, vIdx + 1);
      indices.push(vIdx + 1, vIdx + 2, vIdx + 3);
      vIdx += 4;

      // 2. Right Barrier Wall
      const rp1x = pt.x - pt.nx * barrierOffset;
      const rp1z = pt.z - pt.nz * barrierOffset;
      const rp2x = nextPt.x - nextPt.nx * barrierOffset;
      const rp2z = nextPt.z - nextPt.nz * barrierOffset;

      positions.push(rp1x, 0, rp1z, rp2x, 0, rp2z, rp1x, barrierHeight, rp1z, rp2x, barrierHeight, rp2z);
      colors.push(...wallColor, ...wallColor, ...wallColor, ...wallColor);

      indices.push(vIdx, vIdx + 1, vIdx + 2);
      indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
      vIdx += 4;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [points, halfWidth]);

  return (
    <group position={[0, -0.01, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. CIRCUIT ASPHALT SURFACE & ARENA GROUND
      ───────────────────────────────────────────────────────────── */}
      {/* Expansive Surrounding Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 5]}>
        <planeGeometry args={[180, 110]} />
        <meshStandardMaterial color="#050811" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Monza Dark Asphalt Ribbon */}
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          map={asphaltTexture || undefined}
          color="#0c101a"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      {/* White Painted Boundary Track Lines */}
      <mesh geometry={boundaryLinesGeom}>
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* F1 Red & White Alternating Kerbs */}
      <mesh geometry={kerbsGeom} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Continuous Tecpro Barriers */}
      <mesh geometry={barriersGeom} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0.2} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. RETTIFILO START / FINISH GANTRY ARCH & CHECKERED LINE
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, -25]}>
        {/* Left Truss Pillar */}
        <mesh position={[0, 2.0, -halfWidth - 0.6]} castShadow>
          <boxGeometry args={[0.35, 4.0, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Truss Pillar */}
        <mesh position={[0, 2.0, halfWidth + 0.6]} castShadow>
          <boxGeometry args={[0.35, 4.0, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Overhead Gantry Crossbeam */}
        <mesh position={[0, 3.8, 0]} castShadow>
          <boxGeometry args={[0.45, 0.4, MONZA_TRACK_WIDTH + 2.0]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>

        {/* Glowing Hologram Monza Signboard */}
        <mesh position={[0, 3.3, 0]}>
          <boxGeometry args={[0.08, 0.65, MONZA_TRACK_WIDTH + 0.5]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2.8}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Gantry Overhead Lighting */}
        <pointLight position={[0, 3.4, 0]} color="#ffffff" intensity={4.2} distance={16} />

        {/* Checkered Hologram Finish Line on Asphalt Surface */}
        {[-2.0, -1.0, 0, 1.0, 2.0].map((offsetZ, idx) => (
          <group key={idx} position={[0, 0.016, offsetZ]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.55, 0.55]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#f8fafc' : '#0284c7'} />
            </mesh>
            <mesh position={[0.55, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.55, 0.55]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#0284c7' : '#f8fafc'} />
            </mesh>
          </group>
        ))}

        {/* Glowing Hologram Start / Finish Laser Beam Projection */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, MONZA_TRACK_WIDTH + 0.4]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          3. HOLOGRAPHIC SECTOR TIMING GATES
      ───────────────────────────────────────────────────────────── */}
      {MONZA_CHECKPOINTS.map((cp) => {
        const isCurrentTarget = activeCheckpoint === cp.id;
        const beamColor = isCurrentTarget ? '#22d3ee' : '#a855f7';
        return (
          <group key={cp.id} position={[cp.center[0], 0.015, cp.center[1]]}>
            {/* Ground Checkpoint Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.4, 1.75, 32]} />
              <meshBasicMaterial
                color={beamColor}
                transparent
                opacity={isCurrentTarget ? 0.95 : 0.4}
                depthWrite={false}
              />
            </mesh>

            {/* Vertical Hologram Sector Timing Laser Beacon */}
            <mesh position={[0, 1.8, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 3.6, 12]} />
              <meshBasicMaterial
                color={beamColor}
                transparent
                opacity={isCurrentTarget ? 0.88 : 0.3}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          4. STADIUM FLOODLIGHTS ACROSS MONZA
      ───────────────────────────────────────────────────────────── */}
      {/* Rettifilo Straight */}
      <pointLight position={[20, 12, -25]} color="#ffffff" intensity={3.5} distance={38} />
      <pointLight position={[-25, 12, -25]} color="#ffffff" intensity={3.5} distance={38} />

      {/* Prima Variante Chicane */}
      <pointLight position={[48, 10, -18]} color="#38bdf8" intensity={4.2} distance={32} />

      {/* Curva Grande */}
      <pointLight position={[56, 12, 6]} color="#ffffff" intensity={3.8} distance={36} />

      {/* Variante della Roggia & Lesmo */}
      <pointLight position={[30, 11, 36]} color="#a855f7" intensity={4.0} distance={35} />
      <pointLight position={[0, 11, 35]} color="#38bdf8" intensity={3.8} distance={35} />

      {/* Curva del Serraglio & Variante Ascari */}
      <pointLight position={[-28, 12, 3]} color="#ffffff" intensity={4.2} distance={36} />

      {/* Curva Parabolica */}
      <pointLight position={[-64, 12, -10]} color="#38bdf8" intensity={4.5} distance={38} />

      {/* Paddock Area */}
      <pointLight position={[0, 10, 0]} color="#ffffff" intensity={2.2} distance={30} />
    </group>
  );
}
