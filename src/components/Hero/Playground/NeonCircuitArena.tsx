'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

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
  // ─────────────────────────────────────────────────────────────
  // 1. PROCEDURAL TEXTURES (Asphalt, F1 Red/White Tecpro, Chevrons, Kerbs)
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

      // Plastic specular gradient for authentic glossy barrier sheen
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
      // Vibrant Red background
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 512, 128);

      // Bold white directional arrows (<<<)
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

      // Top & bottom black bumper trims
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 14);
      ctx.fillRect(0, 114, 512, 14);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Cloned textures with tailored aspect repeats for each wall span
  const northSouthWallTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(22, 1);
    t.needsUpdate = true;
    return t;
  }, [f1BarrierTexture]);

  const eastWestWallTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(14, 1);
    t.needsUpdate = true;
    return t;
  }, [f1BarrierTexture]);

  const islandLongTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(11, 1);
    t.needsUpdate = true;
    return t;
  }, [f1BarrierTexture]);

  const islandShortTex = useMemo(() => {
    if (!f1BarrierTexture) return null;
    const t = f1BarrierTexture.clone();
    t.repeat.set(4, 1);
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

  return (
    <group position={[0, -0.01, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. CIRCUIT ASPHALT FLOOR & WHITE TRACK LIMIT LINES
      ───────────────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[boundsX * 2 + 12, boundsZ * 2 + 12]} />
        <meshStandardMaterial
          map={asphaltTexture || undefined}
          color="#0d111a"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>

      {/* Outer White Track Boundary Lines (Continuous Painted Track Limits) */}
      {/* North Outer Line */}
      <mesh position={[0, 0.012, boundsZ - 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boundsX * 2 - 1.2, 0.14]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* South Outer Line */}
      <mesh position={[0, 0.012, -boundsZ + 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boundsX * 2 - 1.2, 0.14]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* East Outer Line */}
      <mesh position={[boundsX - 0.55, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, boundsZ * 2 - 1.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* West Outer Line */}
      <mesh position={[-boundsX + 0.55, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, boundsZ * 2 - 1.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. OUTER PERIMETER BARRIERS (F1 Red & White Tecpro Walls)
      ───────────────────────────────────────────────────────────── */}
      {/* NORTH WALL (Top) */}
      <group position={[0, 0.45, boundsZ]}>
        {/* Core concrete safety barrier */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[boundsX * 2, 0.9, 0.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Inward-facing Red & White Tecpro plate */}
        <mesh position={[0, 0, -0.205]}>
          <planeGeometry args={[boundsX * 2, 0.88]} />
          <meshStandardMaterial
            map={northSouthWallTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* Top white safety rail */}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[boundsX * 2, 0.04, 0.44]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        {/* Glowing LED safety edge strip */}
        <mesh position={[0, 0.44, -0.21]}>
          <boxGeometry args={[boundsX * 2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* SOUTH WALL (Bottom) */}
      <group position={[0, 0.45, -boundsZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[boundsX * 2, 0.9, 0.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.205]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[boundsX * 2, 0.88]} />
          <meshStandardMaterial
            map={northSouthWallTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[boundsX * 2, 0.04, 0.44]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.44, 0.21]}>
          <boxGeometry args={[boundsX * 2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* EAST WALL (Turn 1 - Right) */}
      <group position={[boundsX, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.9, boundsZ * 2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[-0.205, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[boundsZ * 2, 0.88]} />
          <meshStandardMaterial
            map={eastWestWallTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[0.44, 0.04, boundsZ * 2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[-0.21, 0.44, 0]}>
          <boxGeometry args={[0.02, 0.06, boundsZ * 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* WEST WALL (Hairpin - Left) */}
      <group position={[-boundsX, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.9, boundsZ * 2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0.205, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[boundsZ * 2, 0.88]} />
          <meshStandardMaterial
            map={eastWestWallTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[0.44, 0.04, boundsZ * 2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0.21, 0.44, 0]}>
          <boxGeometry args={[0.02, 0.06, boundsZ * 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          3. INFIELD CENTRAL ISLAND BARRIER (Red & White F1 Safety Block)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0.45, 0]}>
        {/* Core island structure (Light Concrete Base) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[22.0, 0.9, 8.4]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.4} />
        </mesh>

        {/* South Face (Facing Start/Finish straight): Red & White Tecpro */}
        <mesh position={[0, 0, -4.205]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[22.0, 0.88]} />
          <meshStandardMaterial
            map={islandLongTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* North Face (Facing Chicane straight): Red & White Tecpro */}
        <mesh position={[0, 0, 4.205]}>
          <planeGeometry args={[22.0, 0.88]} />
          <meshStandardMaterial
            map={islandLongTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* East End (Facing Turn 1 Apex): Red & White Tecpro */}
        <mesh position={[11.005, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[8.4, 0.88]} />
          <meshStandardMaterial
            map={islandShortTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* West End (Facing Hairpin Apex): Red & White Tecpro */}
        <mesh position={[-11.005, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[8.4, 0.88]} />
          <meshStandardMaterial
            map={islandShortTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Top White Edge Rail around Center Island */}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[22.08, 0.04, 8.48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Glowing LED safety strip around island top */}
        <mesh position={[0, 0.44, 4.22]}>
          <boxGeometry args={[22.0, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.44, -4.22]}>
          <boxGeometry args={[22.0, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[11.02, 0.44, 0]}>
          <boxGeometry args={[0.02, 0.06, 8.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-11.02, 0.44, 0]}>
          <boxGeometry args={[0.02, 0.06, 8.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Center Paddock Tower & Telemetry Core */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.6, 1.9, 16]} />
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

        {/* Stadium Center Floodlight */}
        <pointLight position={[0, 6.0, 0]} color="#ffffff" intensity={3.5} distance={26} />
      </group>

      {/* ─────────────────────────────────────────────────────────────
          4. CHICANE OBSTACLE ISLAND (Bright Red & White F1 Chevron Arrows)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0.45, 9.5]}>
        {/* Core obstacle body (White safety concrete) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.6, 0.9, 3.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* South Face (Front of chicane): Bold Red & White Chevrons pointing LEFT <<< */}
        <mesh position={[0, 0, -1.905]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[5.6, 0.88]} />
          <meshStandardMaterial
            map={chicaneFaceTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* North Face (Back of chicane): Bold Red & White Chevrons */}
        <mesh position={[0, 0, 1.905]}>
          <planeGeometry args={[5.6, 0.88]} />
          <meshStandardMaterial
            map={chicaneFaceTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* East Face (Chicane Entry end): Red & White Tecpro */}
        <mesh position={[2.805, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.8, 0.88]} />
          <meshStandardMaterial
            map={chicaneSideTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* West Face (Chicane Exit end): Red & White Tecpro */}
        <mesh position={[-2.805, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[3.8, 0.88]} />
          <meshStandardMaterial
            map={chicaneSideTex || undefined}
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Chicane Top Cap with Red Border Trim */}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[5.68, 0.04, 3.88]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.485, 0]}>
          <boxGeometry args={[5.5, 0.02, 3.7]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>

        {/* 4 Corner High-Visibility Pylon Beacons (Flashing Hazard Markers) */}
        {[
          [-2.7, 1.8],
          [2.7, 1.8],
          [-2.7, -1.8],
          [2.7, -1.8],
        ].map(([px, pz], idx) => (
          <group key={idx} position={[px, 0.55, pz]}>
            {/* Pylon post */}
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Glowing amber/red beacon head */}
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        ))}

        {/* Chicane Spot Floodlight (Guarantees obstacle is 100% brightly lit!) */}
        <pointLight position={[0, 5.0, 0]} color="#ffffff" intensity={3.8} distance={18} />
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. 3D F1 RED & WHITE ALTERNATING KERBS (Kerbs Apex & Chicanes)
      ───────────────────────────────────────────────────────────── */}
      {/* Turn 1 Apex Kerbs (East Curve): alternating 3D Red & White blocks */}
      {[-11, -9, -7, -5, 5, 7, 9, 11].map((z, idx) => (
        <group key={`t1-${idx}`} position={[boundsX - 0.45, 0.025, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.05, 1.8]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#dc2626' : '#ffffff'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Hairpin Apex Kerbs (West Curve): alternating 3D Red & White blocks */}
      {[-11, -9, -7, -5, 5, 7, 9, 11].map((z, idx) => (
        <group key={`hp-${idx}`} position={[-boundsX + 0.45, 0.025, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.05, 1.8]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#dc2626' : '#ffffff'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Chicane S-Curve Kerbs: alternating Red & White blocks guiding drivers */}
      {[-4.5, -3.5, -2.5, 2.5, 3.5, 4.5].map((x, idx) => (
        <group key={`chic-k1-${idx}`} position={[x, 0.025, 7.3]}>
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
        <group key={`chic-k2-${idx}`} position={[x, 0.025, 11.7]}>
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
        { slot: 2, x: -5.5, z: -8.6 },
        { slot: 3, x: -8.5, z: -9.8 },
        { slot: 4, x: -11.5, z: -8.6 },
        { slot: 5, x: -14.5, z: -9.8 },
      ].map((grid) => (
        <group key={grid.slot} position={[grid.x, 0.012, grid.z]}>
          {/* Front yellow pole bar */}
          <mesh position={[0.65, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 1.2]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {/* White grid box outline */}
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
      <group position={[0, 0, -9.2]}>
        {/* Left Truss Pillar */}
        <mesh position={[0, 1.8, -4.5]} castShadow>
          <boxGeometry args={[0.3, 3.6, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Truss Pillar */}
        <mesh position={[0, 1.8, 4.5]} castShadow>
          <boxGeometry args={[0.3, 3.6, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
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
        <pointLight position={[0, 3.2, 0]} color="#ffffff" intensity={3.5} distance={10} />

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
          9. PIT STOP ENTRY LANE & PADDOCK MARKERS
      ───────────────────────────────────────────────────────────── */}
      <group position={[12.5, 0.015, -4.5]}>
        {/* Yellow/Cyan Pit Lane Entrance Stripes */}
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
