'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface PlaygroundArenaProps {
  boundsX?: number;
  boundsZ?: number;
}

export default function PlaygroundArena({
  boundsX = 24,
  boundsZ = 16
}: PlaygroundArenaProps) {
  // Dark cyber floor grid texture
  const gridTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#030206';
      ctx.fillRect(0, 0, 512, 512);

      // Fine grid
      ctx.strokeStyle = '#120f26';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Major grid accents
      ctx.strokeStyle = '#221d45';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 512; x += step * 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step * 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 16);
    return tex;
  }, []);

  return (
    <group position={[0, -0.01, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. WIDE DEEP-DARK ARENA FLOOR (48 x 32 Units)
      ───────────────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[boundsX * 2 + 16, boundsZ * 2 + 16]} />
        <meshStandardMaterial
          map={gridTexture || undefined}
          color="#05030a"
          roughness={0.75}
          metalness={0.3}
        />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. SCREEN WRAP BOUNDARY LINES (Cyan & Purple Neon Strips)
      ───────────────────────────────────────────────────────────── */}
      {/* North Border (+Z) */}
      <mesh position={[0, 0.02, boundsZ]}>
        <boxGeometry args={[boundsX * 2, 0.06, 0.16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* South Border (-Z) */}
      <mesh position={[0, 0.02, -boundsZ]}>
        <boxGeometry args={[boundsX * 2, 0.06, 0.16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* East Border (+X) */}
      <mesh position={[boundsX, 0.02, 0]}>
        <boxGeometry args={[0.16, 0.06, boundsZ * 2]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      {/* West Border (-X) */}
      <mesh position={[-boundsX, 0.02, 0]}>
        <boxGeometry args={[0.16, 0.06, boundsZ * 2]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          3. CORNER & MIDWAY LIGHTING PYLONS
      ───────────────────────────────────────────────────────────── */}
      {[
        [boundsX, boundsZ],
        [-boundsX, boundsZ],
        [boundsX, -boundsZ],
        [-boundsX, -boundsZ],
        [0, boundsZ],
        [0, -boundsZ],
        [boundsX, 0],
        [-boundsX, 0]
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 1.0, 8]} />
            <meshStandardMaterial color="#18152e" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#38bdf8' : '#c084fc'} />
          </mesh>
          <pointLight
            position={[0, 1.2, 0]}
            color={i % 2 === 0 ? '#38bdf8' : '#c084fc'}
            intensity={1.8}
            distance={6}
          />
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────
          4. CENTER SPAWN CIRCLE (Pulsing Launchpad)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0.015, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.05, 48]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.85} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.35, 48]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.75, 48]} />
          <meshBasicMaterial color="#0a081a" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. ARENA SPEED & CHEVRON FLOOR MARKINGS
      ───────────────────────────────────────────────────────────── */}
      {/* Horizontal & Vertical Guide Accents */}
      {[-12, 12].map((x) => (
        <mesh key={x} position={[x, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, boundsZ * 1.6]} />
          <meshBasicMaterial color="#312e81" transparent opacity={0.3} />
        </mesh>
      ))}
      {[-8, 8].map((z) => (
        <mesh key={z} position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[boundsX * 1.6, 0.08]} />
          <meshBasicMaterial color="#312e81" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
