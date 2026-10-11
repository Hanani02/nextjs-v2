'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface NeonCircuitArenaProps {
  boundsX?: number;
  boundsZ?: number;
  activeCheckpoint?: number;
}

export const RACE_CHECKPOINTS = [
  { id: 0, name: 'Start / Finish', center: [0, -9.1] as [number, number], width: 5.5, depth: 11.5 },
  { id: 1, name: 'Turn 1 Apex', center: [18.5, 0] as [number, number], width: 11.5, depth: 6.0 },
  { id: 2, name: 'Chicane Entry', center: [0, 9.1] as [number, number], width: 5.5, depth: 11.5 },
  { id: 3, name: 'Hairpin Apex', center: [-18.5, 0] as [number, number], width: 11.5, depth: 6.0 },
];

export const NITRO_BOOST_PADS: Array<{
  id: string;
  x: number;
  z: number;
  rotationY: number;
  width: number;
  length: number;
  name: string;
}> = [];

export default function NeonCircuitArena({
  boundsX = 22.2,
  boundsZ = 14.0,
  activeCheckpoint = 0,
}: NeonCircuitArenaProps) {
  // Track geometry parameters matching carPhysics.ts stadium-oval collisions
  const straightLimit = 11.0;
  const outerR = boundsZ; // 14.0
  const islandStraight = 6.0;
  const islandR = 4.2;

  // ─────────────────────────────────────────────────────────────
  // 1. PROCEDURAL TEXTURES (Asphalt, F1 Red/White Tecpro, Chevrons)
  // ─────────────────────────────────────────────────────────────

  // High-grip dark asphalt with subtle grid lines
  const asphaltTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 1024, 1024);

      // Fine grid texture
      ctx.strokeStyle = '#141a29';
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
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
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

  // F1 Tecpro Safety Barrier: alternating vibrant Red (#dc2626) and pure White (#ffffff)
  const f1BarrierTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Left block: Bright F1 Red
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 256, 128);

      // Right block: Crisp White
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(256, 0, 256, 128);

      // Top and bottom heavy-duty black rubber bumper strips
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 14);
      ctx.fillRect(0, 114, 512, 14);

      // Vertical seam grooves between Tecpro blocks
      ctx.fillStyle = '#020617';
      ctx.fillRect(253, 0, 6, 128);
      ctx.fillRect(0, 0, 4, 128);
      ctx.fillRect(508, 0, 4, 128);

      // Plastic specular gradient
      const grad = ctx.createLinearGradient(0, 14, 0, 114);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 14, 512, 100);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // F1 Chicane Chevron directional arrows (pointing cars around the obstacle)
  const f1ChevronTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 512, 128);

      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const xOffset = i * 128 + 24;
        ctx.beginPath();
        ctx.moveTo(xOffset + 70, 20);
        ctx.lineTo(xOffset + 25, 64);
        ctx.lineTo(xOffset + 70, 108);
        ctx.lineTo(xOffset + 48, 108);
        ctx.lineTo(xOffset + 0, 64);
        ctx.lineTo(xOffset + 48, 20);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 14);
      ctx.fillRect(0, 114, 512, 14);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Cloned textures for straight wall runs
  const straightWallTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(11, 1);
    t.needsUpdate = true;
    return t;
  }, [f1BarrierTexture]);

  const islandStraightTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(6, 1);
    t.needsUpdate = true;
    return t;
  }, [f1BarrierTexture]);

  const chicaneSideTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(3, 1);
    t.needsUpdate = true;
    return t;
  }, [f1BarrierTexture]);

  const chicaneFaceTex = useMemo(() => {
    if (!f1ChevronTexture) return null;
    const t = f1ChevronTexture.clone();
    t.repeat.set(2, 1);
    t.needsUpdate = true;
    return t;
  }, [f1ChevronTexture]);

  // ─────────────────────────────────────────────────────────────
  // 2. CURVED STADIUM OVAL GEOMETRY DATA
  // ─────────────────────────────────────────────────────────────

  // Outer East Arc (Turn 1): 16 curved barrier blocks from -PI/2 to +PI/2
  const outerEastSegments = useMemo(() => {
    const segs = [];
    const count = 16;
    const dTheta = Math.PI / count;
    const arcLength = outerR * dTheta;
    for (let i = 0; i < count; i++) {
      const theta = -Math.PI / 2 + (i + 0.5) * dTheta;
      const x = straightLimit + outerR * Math.cos(theta);
      const z = outerR * Math.sin(theta);
      // Tangent rotation: facing inward towards the arena center
      const rotY = -theta + Math.PI / 2;
      segs.push({ id: i, x, z, rotY, isRed: i % 2 === 0, width: arcLength + 0.1 });
    }
    return segs;
  }, [straightLimit, outerR]);

  // Outer West Arc (Hairpin): 16 curved barrier blocks from +PI/2 to +3PI/2
  const outerWestSegments = useMemo(() => {
    const segs = [];
    const count = 16;
    const dTheta = Math.PI / count;
    const arcLength = outerR * dTheta;
    for (let i = 0; i < count; i++) {
      const theta = Math.PI / 2 + (i + 0.5) * dTheta;
      const x = -straightLimit + outerR * Math.cos(theta);
      const z = outerR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      segs.push({ id: i, x, z, rotY, isRed: i % 2 === 0, width: arcLength + 0.1 });
    }
    return segs;
  }, [straightLimit, outerR]);

  // Infield Island East Semicircular Cap: 10 barrier blocks around (6.0, 0), radius 4.2
  const islandEastSegments = useMemo(() => {
    const segs = [];
    const count = 10;
    const dTheta = Math.PI / count;
    const arcLength = islandR * dTheta;
    for (let i = 0; i < count; i++) {
      const theta = -Math.PI / 2 + (i + 0.5) * dTheta;
      const x = islandStraight + islandR * Math.cos(theta);
      const z = islandR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      segs.push({ id: i, x, z, rotY, isRed: i % 2 === 0, width: arcLength + 0.08 });
    }
    return segs;
  }, [islandStraight, islandR]);

  // Infield Island West Semicircular Cap: 10 barrier blocks around (-6.0, 0), radius 4.2
  const islandWestSegments = useMemo(() => {
    const segs = [];
    const count = 10;
    const dTheta = Math.PI / count;
    const arcLength = islandR * dTheta;
    for (let i = 0; i < count; i++) {
      const theta = Math.PI / 2 + (i + 0.5) * dTheta;
      const x = -islandStraight + islandR * Math.cos(theta);
      const z = islandR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      segs.push({ id: i, x, z, rotY, isRed: i % 2 === 0, width: arcLength + 0.08 });
    }
    return segs;
  }, [islandStraight, islandR]);

  // Curved Apex Kerbs hugging the inner curve at island caps
  const eastApexKerbs = useMemo(() => {
    const kerbs = [];
    const count = 8;
    const dTheta = (Math.PI * 0.7) / count;
    const kerbR = islandR + 0.45;
    for (let i = 0; i < count; i++) {
      const theta = -Math.PI * 0.35 + (i + 0.5) * dTheta;
      const x = islandStraight + kerbR * Math.cos(theta);
      const z = kerbR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      kerbs.push({ id: i, x, z, rotY, isRed: i % 2 === 0 });
    }
    return kerbs;
  }, [islandStraight, islandR]);

  const westApexKerbs = useMemo(() => {
    const kerbs = [];
    const count = 8;
    const dTheta = (Math.PI * 0.7) / count;
    const kerbR = islandR + 0.45;
    for (let i = 0; i < count; i++) {
      const theta = Math.PI * 0.65 + (i + 0.5) * dTheta;
      const x = -islandStraight + kerbR * Math.cos(theta);
      const z = kerbR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      kerbs.push({ id: i, x, z, rotY, isRed: i % 2 === 0 });
    }
    return kerbs;
  }, [islandStraight, islandR]);

  // Curved Outer White Boundary Line Segments
  const outerEastLines = useMemo(() => {
    const lines = [];
    const count = 18;
    const dTheta = Math.PI / count;
    const lineR = outerR - 0.55;
    const length = lineR * dTheta;
    for (let i = 0; i < count; i++) {
      const theta = -Math.PI / 2 + (i + 0.5) * dTheta;
      const x = straightLimit + lineR * Math.cos(theta);
      const z = lineR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      lines.push({ id: i, x, z, rotY, length });
    }
    return lines;
  }, [straightLimit, outerR]);

  const outerWestLines = useMemo(() => {
    const lines = [];
    const count = 18;
    const dTheta = Math.PI / count;
    const lineR = outerR - 0.55;
    const length = lineR * dTheta;
    for (let i = 0; i < count; i++) {
      const theta = Math.PI / 2 + (i + 0.5) * dTheta;
      const x = -straightLimit + lineR * Math.cos(theta);
      const z = lineR * Math.sin(theta);
      const rotY = -theta + Math.PI / 2;
      lines.push({ id: i, x, z, rotY, length });
    }
    return lines;
  }, [straightLimit, outerR]);

  return (
    <group position={[0, -0.01, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. CIRCUIT ASPHALT FLOOR & WHITE PAINTED TRACK LIMITS
      ───────────────────────────────────────────────────────────── */}
      {/* Base Asphalt Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[boundsX * 2 + 16, boundsZ * 2 + 16]} />
        <meshStandardMaterial
          map={asphaltTexture || undefined}
          color="#0d111a"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>

      {/* North Straight Track Limit Line */}
      <mesh position={[0, 0.012, outerR - 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[straightLimit * 2, 0.14]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* South Straight Track Limit Line */}
      <mesh position={[0, 0.012, -outerR + 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[straightLimit * 2, 0.14]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* East Curved Track Limit Line */}
      {outerEastLines.map((line) => (
        <mesh
          key={`oel-${line.id}`}
          position={[line.x, 0.012, line.z]}
          rotation={[-Math.PI / 2, 0, line.rotY]}
        >
          <planeGeometry args={[line.length + 0.05, 0.14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* West Curved Track Limit Line */}
      {outerWestLines.map((line) => (
        <mesh
          key={`owl-${line.id}`}
          position={[line.x, 0.012, line.z]}
          rotation={[-Math.PI / 2, 0, line.rotY]}
        >
          <planeGeometry args={[line.length + 0.05, 0.14]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Infield Capsule Boundary Lines */}
      <mesh position={[0, 0.012, islandR + 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[islandStraight * 2, 0.12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.012, -islandR - 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[islandStraight * 2, 0.12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. OUTER PERIMETER BARRIERS (CURVED STADIUM-OVAL RED & WHITE TECPRO)
      ───────────────────────────────────────────────────────────── */}
      {/* NORTH STRAIGHT WALL (Back Straight) */}
      <group position={[0, 0.45, outerR]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[straightLimit * 2, 0.9, 0.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.205]}>
          <planeGeometry args={[straightLimit * 2, 0.88]} />
          <meshStandardMaterial
            map={straightWallTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* Top White Edge Rail & Glowing Safety Strip */}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[straightLimit * 2, 0.04, 0.44]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.44, -0.21]}>
          <boxGeometry args={[straightLimit * 2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* SOUTH STRAIGHT WALL (Start/Finish Straight) */}
      <group position={[0, 0.45, -outerR]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[straightLimit * 2, 0.9, 0.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.205]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[straightLimit * 2, 0.88]} />
          <meshStandardMaterial
            map={straightWallTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[straightLimit * 2, 0.04, 0.44]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.44, 0.21]}>
          <boxGeometry args={[straightLimit * 2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* EAST CURVED BARRIER (Turn 1 Sweeping Arc) */}
      <group>
        {outerEastSegments.map((seg) => (
          <group key={`oes-${seg.id}`} position={[seg.x, 0.45, seg.z]} rotation={[0, seg.rotY, 0]}>
            {/* Concrete Core Block */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[seg.width, 0.9, 0.4]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Inward-facing Red or White Tecpro Front Plate */}
            <mesh position={[0, 0, -0.205]}>
              <planeGeometry args={[seg.width, 0.88]} />
              <meshStandardMaterial
                color={seg.isRed ? '#dc2626' : '#ffffff'}
                roughness={0.25}
                metalness={0.15}
              />
            </mesh>
            {/* Top White Edge Rail */}
            <mesh position={[0, 0.46, 0]}>
              <boxGeometry args={[seg.width + 0.02, 0.04, 0.44]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Glowing White LED Light Strip */}
            <mesh position={[0, 0.44, -0.21]}>
              <boxGeometry args={[seg.width, 0.06, 0.02]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* WEST CURVED BARRIER (Hairpin Sweeping Arc) */}
      <group>
        {outerWestSegments.map((seg) => (
          <group key={`ows-${seg.id}`} position={[seg.x, 0.45, seg.z]} rotation={[0, seg.rotY, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[seg.width, 0.9, 0.4]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, -0.205]}>
              <planeGeometry args={[seg.width, 0.88]} />
              <meshStandardMaterial
                color={seg.isRed ? '#dc2626' : '#ffffff'}
                roughness={0.25}
                metalness={0.15}
              />
            </mesh>
            <mesh position={[0, 0.46, 0]}>
              <boxGeometry args={[seg.width + 0.02, 0.04, 0.44]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.44, -0.21]}>
              <boxGeometry args={[seg.width, 0.06, 0.02]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─────────────────────────────────────────────────────────────
          3. INFIELD CENTRAL ISLAND (ROUNDED CAPSULE BARRIER & PADDOCK)
      ───────────────────────────────────────────────────────────── */}
      {/* Central Straight Body */}
      <group position={[0, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[islandStraight * 2, 0.9, islandR * 2]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* South Face: Red & White Tecpro */}
        <mesh position={[0, 0, -islandR - 0.005]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[islandStraight * 2, 0.88]} />
          <meshStandardMaterial
            map={islandStraightTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* North Face: Red & White Tecpro */}
        <mesh position={[0, 0, islandR + 0.005]}>
          <planeGeometry args={[islandStraight * 2, 0.88]} />
          <meshStandardMaterial
            map={islandStraightTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* Top Trim and LED Strips */}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[islandStraight * 2 + 0.08, 0.04, islandR * 2 + 0.08]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.44, islandR + 0.02]}>
          <boxGeometry args={[islandStraight * 2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.44, -islandR - 0.02]}>
          <boxGeometry args={[islandStraight * 2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Infield East Rounded Cap (Semicircular Cylinder Core) */}
      <mesh
        position={[islandStraight, 0.45, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[islandR, islandR, 0.9, 24, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Semicircle Curved Barrier Blocks along East End */}
      {islandEastSegments.map((seg) => (
        <group key={`ies-${seg.id}`} position={[seg.x, 0.45, seg.z]} rotation={[0, seg.rotY, 0]}>
          <mesh position={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[seg.width, 0.88, 0.3]} />
            <meshStandardMaterial
              color={seg.isRed ? '#dc2626' : '#ffffff'}
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.45, 0.15]}>
            <boxGeometry args={[seg.width, 0.04, 0.32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.44, 0.31]}>
            <boxGeometry args={[seg.width, 0.06, 0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Infield West Rounded Cap (Semicircular Cylinder Core) */}
      <mesh
        position={[-islandStraight, 0.45, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[islandR, islandR, 0.9, 24, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Semicircle Curved Barrier Blocks along West End */}
      {islandWestSegments.map((seg) => (
        <group key={`iws-${seg.id}`} position={[seg.x, 0.45, seg.z]} rotation={[0, seg.rotY, 0]}>
          <mesh position={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[seg.width, 0.88, 0.3]} />
            <meshStandardMaterial
              color={seg.isRed ? '#dc2626' : '#ffffff'}
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.45, 0.15]}>
            <boxGeometry args={[seg.width, 0.04, 0.32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.44, 0.31]}>
            <boxGeometry args={[seg.width, 0.06, 0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Center Paddock Tower & Telemetry Core */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.6, 1.9, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <ringGeometry args={[1.7, 2.4, 32]} />
          <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 2.22, 0]}>
          <ringGeometry args={[1.0, 1.4, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 6.0, 0]} color="#ffffff" intensity={3.5} distance={28} />
      </group>

      {/* ─────────────────────────────────────────────────────────────
          4. CHICANE OBSTACLE ISLAND (Red & White F1 Chevrons on North Straight)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0.45, 9.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.6, 0.9, 3.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* South Face: Red & White Chevrons pointing LEFT <<< */}
        <mesh position={[0, 0, -1.905]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[5.6, 0.88]} />
          <meshStandardMaterial
            map={chicaneFaceTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* North Face */}
        <mesh position={[0, 0, 1.905]}>
          <planeGeometry args={[5.6, 0.88]} />
          <meshStandardMaterial
            map={chicaneFaceTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* East Face */}
        <mesh position={[2.805, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.8, 0.88]} />
          <meshStandardMaterial
            map={chicaneSideTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* West Face */}
        <mesh position={[-2.805, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[3.8, 0.88]} />
          <meshStandardMaterial
            map={chicaneSideTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* Chicane Top Cap */}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[5.68, 0.04, 3.88]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.485, 0]}>
          <boxGeometry args={[5.5, 0.02, 3.7]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>

        {/* 4 Corner Warning Beacons */}
        {[
          [-2.7, 1.8],
          [2.7, 1.8],
          [-2.7, -1.8],
          [2.7, -1.8],
        ].map(([px, pz], idx) => (
          <group key={idx} position={[px, 0.55, pz]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        ))}

        <pointLight position={[0, 5.0, 0]} color="#ffffff" intensity={3.8} distance={18} />
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. 3D F1 RED & WHITE ALTERNATING KERBS (Curved Apex & Chicanes)
      ───────────────────────────────────────────────────────────── */}
      {/* Turn 1 Inner Apex Curved Kerbs */}
      {eastApexKerbs.map((k) => (
        <group key={`eak-${k.id}`} position={[k.x, 0.025, k.z]} rotation={[0, k.rotY, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.05, 0.5]} />
            <meshStandardMaterial
              color={k.isRed ? '#dc2626' : '#ffffff'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Hairpin Inner Apex Curved Kerbs */}
      {westApexKerbs.map((k) => (
        <group key={`wak-${k.id}`} position={[k.x, 0.025, k.z]} rotation={[0, k.rotY, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.05, 0.5]} />
            <meshStandardMaterial
              color={k.isRed ? '#dc2626' : '#ffffff'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Chicane S-Curve Kerbs */}
      {[-4.5, -3.5, -2.5, 2.5, 3.5, 4.5].map((x, idx) => (
        <group key={`chic-k1-${idx}`} position={[x, 0.025, 6.9]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.05, 0.4]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#dc2626' : '#ffffff'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
      {[-4.5, -3.5, -2.5, 2.5, 3.5, 4.5].map((x, idx) => (
        <group key={`chic-k2-${idx}`} position={[x, 0.025, 11.3]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.05, 0.4]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#ffffff' : '#dc2626'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────
          6. F1 STARTING GRID BOXES (Staggered Pole Position Slots)
      ───────────────────────────────────────────────────────────── */}
      {[
        { slot: 1, x: -2.5, z: -9.8 },
        { slot: 2, x: -5.5, z: -8.5 },
        { slot: 3, x: -8.5, z: -9.8 },
        { slot: 4, x: -11.5, z: -8.5 },
      ].map((grid) => (
        <group key={grid.slot} position={[grid.x, 0.012, grid.z]}>
          <mesh position={[0.65, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 1.2]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          <mesh position={[0, 0, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, -0.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────
          7. HOLOGRAM START / FINISH GANTRY ARCH & CHECKERED LINE
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, -9.1]}>
        {/* Left Truss Pillar */}
        <mesh position={[0, 1.8, -4.8]} castShadow>
          <boxGeometry args={[0.3, 3.6, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Truss Pillar */}
        <mesh position={[0, 1.8, 4.8]} castShadow>
          <boxGeometry args={[0.3, 3.6, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Overhead Arch Crossbeam */}
        <mesh position={[0, 3.6, 0]} castShadow>
          <boxGeometry args={[0.4, 0.35, 9.9]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        {/* Overhead Glowing Hologram Sign Banner */}
        <mesh position={[0, 3.25, 0]}>
          <boxGeometry args={[0.08, 0.5, 8.4]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        <pointLight position={[0, 3.2, 0]} color="#ffffff" intensity={3.5} distance={12} />

        {/* Checkered Hologram Finish Line on Asphalt Surface */}
        {[-4.0, -3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0, 4.0].map((z, idx) => (
          <group key={idx} position={[0, 0.015, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.5]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#f8fafc' : '#0284c7'} />
            </mesh>
            <mesh position={[0.45, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.45, 0.5]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#0284c7' : '#f8fafc'} />
            </mesh>
          </group>
        ))}

        {/* Start / Finish Glowing Hologram Line Projection */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 9.5]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          8. TRANSPARENT HOLOGRAPHIC CHECKPOINT GATES
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
          9. PIT STOP ENTRY LANE MARKERS
      ───────────────────────────────────────────────────────────── */}
      <group position={[12.5, 0.015, -4.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 0.16]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <mesh position={[0, 0, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 0.16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}
