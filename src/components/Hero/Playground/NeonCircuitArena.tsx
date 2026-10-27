'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { GraphicsQuality } from '@/types/vehicle';
import {
  MONZA_SAMPLED_POINTS,
  MONZA_CHECKPOINTS,
  MONZA_TRACK_WIDTH,
} from './monzaTrack';

interface NeonCircuitArenaProps {
  boundsX?: number;
  boundsZ?: number;
  activeCheckpoint?: number;
  graphicsQuality?: GraphicsQuality;
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
  graphicsQuality = 'medium',
}: NeonCircuitArenaProps) {
  const points = MONZA_SAMPLED_POINTS;
  const halfWidth = MONZA_TRACK_WIDTH / 2;

  // ─────────────────────────────────────────────────────────────
  // 1. PROCEDURAL ASPHALT TEXTURE (Scaled by Graphics Quality)
  // ─────────────────────────────────────────────────────────────
  const asphaltTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    const size = graphicsQuality === 'high' ? 2048 : graphicsQuality === 'medium' ? 1024 : 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, size, size);

      if (graphicsQuality === 'high') {
        // High Quality: Ultra-detailed aggregate pebbles, micro-tarmac cracks & dual rubber racing line
        ctx.strokeStyle = 'rgba(26, 34, 52, 0.7)';
        ctx.lineWidth = 1;
        const step = 16;
        for (let x = 0; x <= size; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, size);
          ctx.stroke();
        }
        for (let y = 0; y <= size; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y);
          ctx.stroke();
        }

        // Multi-tone asphalt aggregate noise
        for (let k = 0; k < 6000; k++) {
          const rx = Math.random() * size;
          const ry = Math.random() * size;
          const brightness = Math.random() * 0.12 + 0.04;
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness.toFixed(3)})`;
          ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
        }

        // Deep rubberized racing groove streaks with soft gradient
        const grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, 'rgba(10, 13, 20, 0.1)');
        grad.addColorStop(0.25, 'rgba(2, 6, 23, 0.75)');
        grad.addColorStop(0.5, 'rgba(2, 6, 23, 0.4)');
        grad.addColorStop(0.75, 'rgba(2, 6, 23, 0.75)');
        grad.addColorStop(1, 'rgba(10, 13, 20, 0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      } else if (graphicsQuality === 'medium') {
        // Medium Quality: Standard asphalt grid and rubber streak
        ctx.strokeStyle = '#121824';
        ctx.lineWidth = 1;
        const step = 32;
        for (let x = 0; x <= size; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, size);
          ctx.stroke();
        }
        for (let y = 0; y <= size; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.fillRect(size * 0.25, 0, size * 0.5, size);
      } else {
        // Low Quality: Minimal lightweight texture
        ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
        ctx.fillRect(size * 0.3, 0, size * 0.4, size);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, graphicsQuality === 'high' ? 64 : 48);
    if (graphicsQuality === 'high') {
      tex.anisotropy = 16;
    }
    return tex;
  }, [graphicsQuality]);

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

    // Explicit UP normals (0, 1, 0) for perfectly uniform asphalt illumination without pinched fan artifacts
    const normals = new Float32Array(positions.length);
    for (let i = 0; i < positions.length / 3; i++) {
      normals[i * 3] = 0;
      normals[i * 3 + 1] = 1;
      normals[i * 3 + 2] = 0;
    }
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
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

    const normals = new Float32Array(positions.length);
    for (let i = 0; i < positions.length / 3; i++) {
      normals[i * 3] = 0;
      normals[i * 3 + 1] = 1;
      normals[i * 3 + 2] = 0;
    }
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
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
  // 5. 3D SOLID RECTANGULAR CONNECTED BARRIERS (Alternating Red & White)
  // ─────────────────────────────────────────────────────────────
  const barriersGeom = useMemo(() => {
    const N = points.length;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const barrierHeight = 0.95; // 3D block height
    const barrierThickness = 0.55; // 3D block cross-section thickness
    const barrierOffset = halfWidth + 0.45; // Placed right at edge of track & kerbs

    let vIdx = 0;

    const redColor = [0.88, 0.14, 0.14];
    const whiteColor = [0.97, 0.97, 0.98];

    // Helper to add a quad face (2 triangles) with specific vertex color
    const addQuad = (
      p0: [number, number, number],
      p1: [number, number, number],
      p2: [number, number, number],
      p3: [number, number, number],
      col: number[]
    ) => {
      positions.push(...p0, ...p1, ...p2, ...p3);
      colors.push(...col, ...col, ...col, ...col);
      indices.push(vIdx, vIdx + 1, vIdx + 2);
      indices.push(vIdx, vIdx + 2, vIdx + 3);
      vIdx += 4;
    };

    // Step every 2 spline points (~1.8m segment per rectangular block)
    const step = 2;

    // 1. LEFT 3D BARRIER WALL (Solid connected rectangular blocks)
    for (let i = 0; i < N; i += step) {
      const pt1 = points[i];
      const pt2 = points[(i + step) % N];

      // Alternating red and white every ~2.2m
      const isRed = Math.floor(pt1.distanceAlongTrack / 2.2) % 2 === 0;
      const col = isRed ? redColor : whiteColor;

      // 8 vertices of the 3D rectangular block on the left side
      const inB1: [number, number, number] = [pt1.x + pt1.nx * barrierOffset, 0, pt1.z + pt1.nz * barrierOffset];
      const inT1: [number, number, number] = [pt1.x + pt1.nx * barrierOffset, barrierHeight, pt1.z + pt1.nz * barrierOffset];
      const inB2: [number, number, number] = [pt2.x + pt2.nx * barrierOffset, 0, pt2.z + pt2.nz * barrierOffset];
      const inT2: [number, number, number] = [pt2.x + pt2.nx * barrierOffset, barrierHeight, pt2.z + pt2.nz * barrierOffset];

      const outB1: [number, number, number] = [pt1.x + pt1.nx * (barrierOffset + barrierThickness), 0, pt1.z + pt1.nz * (barrierOffset + barrierThickness)];
      const outT1: [number, number, number] = [pt1.x + pt1.nx * (barrierOffset + barrierThickness), barrierHeight, pt1.z + pt1.nz * (barrierOffset + barrierThickness)];
      const outB2: [number, number, number] = [pt2.x + pt2.nx * (barrierOffset + barrierThickness), 0, pt2.z + pt2.nz * (barrierOffset + barrierThickness)];
      const outT2: [number, number, number] = [pt2.x + pt2.nx * (barrierOffset + barrierThickness), barrierHeight, pt2.z + pt2.nz * (barrierOffset + barrierThickness)];

      // Inner Face (facing track & car POV)
      addQuad(inB1, inB2, inT2, inT1, col);
      // Top Face (horizontal top surface of block)
      addQuad(inT1, inT2, outT2, outT1, col);
      // Outer Face (facing arena floor)
      addQuad(outB2, outB1, outT1, outT2, col);
      // Connecting End-Cap Face between blocks
      addQuad(inB2, outB2, outT2, inT2, col);
    }

    // 2. RIGHT 3D BARRIER WALL (Solid connected rectangular blocks - 100% visible from car POV!)
    for (let i = 0; i < N; i += step) {
      const pt1 = points[i];
      const pt2 = points[(i + step) % N];

      // Alternating red and white (offset by 1 block so corners look dynamic)
      const isRed = Math.floor(pt1.distanceAlongTrack / 2.2 + 1) % 2 === 0;
      const col = isRed ? redColor : whiteColor;

      // 8 vertices of the 3D rectangular block on the right side
      const inB1: [number, number, number] = [pt1.x - pt1.nx * barrierOffset, 0, pt1.z - pt1.nz * barrierOffset];
      const inT1: [number, number, number] = [pt1.x - pt1.nx * barrierOffset, barrierHeight, pt1.z - pt1.nz * barrierOffset];
      const inB2: [number, number, number] = [pt2.x - pt2.nx * barrierOffset, 0, pt2.z - pt2.nz * barrierOffset];
      const inT2: [number, number, number] = [pt2.x - pt2.nx * barrierOffset, barrierHeight, pt2.z - pt2.nz * barrierOffset];

      const outB1: [number, number, number] = [pt1.x - pt1.nx * (barrierOffset + barrierThickness), 0, pt1.z - pt1.nz * (barrierOffset + barrierThickness)];
      const outT1: [number, number, number] = [pt1.x - pt1.nx * (barrierOffset + barrierThickness), barrierHeight, pt1.z - pt1.nz * (barrierOffset + barrierThickness)];
      const outB2: [number, number, number] = [pt2.x - pt2.nx * (barrierOffset + barrierThickness), 0, pt2.z - pt2.nz * (barrierOffset + barrierThickness)];
      const outT2: [number, number, number] = [pt2.x - pt2.nx * (barrierOffset + barrierThickness), barrierHeight, pt2.z - pt2.nz * (barrierOffset + barrierThickness)];

      // Inner Face (facing track & car POV from the right)
      addQuad(inB2, inB1, inT1, inT2, col);
      // Top Face (horizontal top surface of block)
      addQuad(outT1, outT2, inT2, inT1, col);
      // Outer Face (facing arena floor)
      addQuad(outB1, outB2, outT2, outT1, col);
      // Connecting End-Cap Face between blocks
      addQuad(outB2, inB2, inT2, outT2, col);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [points, halfWidth]);

  // Dynamic material reflection & detail based on graphics settings
  const floorRoughness = graphicsQuality === 'high' ? 0.72 : graphicsQuality === 'medium' ? 0.90 : 0.96;
  const floorMetalness = graphicsQuality === 'high' ? 0.20 : graphicsQuality === 'medium' ? 0.05 : 0.02;

  const roadRoughness = graphicsQuality === 'high' ? 0.48 : graphicsQuality === 'medium' ? 0.85 : 0.94;
  const roadMetalness = graphicsQuality === 'high' ? 0.32 : graphicsQuality === 'medium' ? 0.08 : 0.02;

  const kerbRoughness = graphicsQuality === 'high' ? 0.25 : graphicsQuality === 'medium' ? 0.50 : 0.65;
  const kerbMetalness = graphicsQuality === 'high' ? 0.25 : graphicsQuality === 'medium' ? 0.10 : 0.05;

  const barrierRoughness = graphicsQuality === 'high' ? 0.28 : graphicsQuality === 'medium' ? 0.50 : 0.65;
  const barrierMetalness = graphicsQuality === 'high' ? 0.25 : graphicsQuality === 'medium' ? 0.10 : 0.05;

  return (
    <group position={[0, -0.01, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. CIRCUIT ASPHALT SURFACE & ARENA GROUND
      ───────────────────────────────────────────────────────────── */}
      {/* Expansive Surrounding Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 5]}>
        <planeGeometry args={[220, 140]} />
        <meshStandardMaterial color="#050811" roughness={floorRoughness} metalness={floorMetalness} />
      </mesh>

      {/* Monza Dark Asphalt Ribbon */}
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          map={asphaltTexture || undefined}
          color="#0c101a"
          roughness={roadRoughness}
          metalness={roadMetalness}
        />
      </mesh>

      {/* White Painted Boundary Track Lines */}
      <mesh geometry={boundaryLinesGeom}>
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* F1 Red & White Alternating Kerbs */}
      <mesh geometry={kerbsGeom} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={kerbRoughness} metalness={kerbMetalness} />
      </mesh>

      {/* Continuous 3D Rectangular Connected Barriers (Alternating Red & White) */}
      <mesh geometry={barriersGeom} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={barrierRoughness} metalness={barrierMetalness} side={THREE.DoubleSide} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. RETTIFILO START / FINISH GANTRY ARCH & CHECKERED LINE
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, -25]}>
        {/* Left Truss Pillar */}
        <mesh position={[0, 2.0, -halfWidth - 0.7]} castShadow>
          <boxGeometry args={[0.35, 4.2, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Truss Pillar */}
        <mesh position={[0, 2.0, halfWidth + 0.7]} castShadow>
          <boxGeometry args={[0.35, 4.2, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Overhead Gantry Crossbeam */}
        <mesh position={[0, 4.0, 0]} castShadow>
          <boxGeometry args={[0.45, 0.4, MONZA_TRACK_WIDTH + 2.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>

        {/* Glowing Hologram Monza Signboard */}
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[0.08, 0.65, MONZA_TRACK_WIDTH + 0.6]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2.8}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Gantry Overhead Lighting */}
        <pointLight position={[0, 3.6, 0]} color="#ffffff" intensity={4.5} distance={18} />

        {/* Checkered Hologram Finish Line on Asphalt Surface */}
        {[-5.0, -4.0, -3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0, 4.0, 5.0].map((offsetZ, idx) => (
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
          <planeGeometry args={[1.5, MONZA_TRACK_WIDTH + 0.6]} />
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
              <ringGeometry args={[2.0, 2.45, 32]} />
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
