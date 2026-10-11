'use client';

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export interface TechCoinItem {
  id: string;
  name: string;
  symbol: string;
  position: [number, number, number];
  color: string;
  glowColor: string;
}

export const TECH_GEMS_CONFIG = [
  {
    id: 'react',
    name: 'React 19',
    symbol: '⚛️',
    color: '#06b6d4',
    glowColor: '#22d3ee'
  },
  {
    id: 'nextjs',
    name: 'Next.js 16',
    symbol: '▲',
    color: '#f8fafc',
    glowColor: '#e2e8f0'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    symbol: 'TS',
    color: '#3b82f6',
    glowColor: '#60a5fa'
  },
  {
    id: 'tailwind',
    name: 'Tailwind v4',
    symbol: '✦',
    color: '#38bdf8',
    glowColor: '#7dd3fc'
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    symbol: '⚡',
    color: '#22c55e',
    glowColor: '#4ade80'
  },
  {
    id: 'threejs',
    name: 'Three.js 3D',
    symbol: '🌐',
    color: '#a855f7',
    glowColor: '#c084fc'
  }
];

// Fallback initial export for type compatibility
export const INITIAL_TECH_COINS: TechCoinItem[] = TECH_GEMS_CONFIG.map((item, idx) => {
  const angle = (idx / TECH_GEMS_CONFIG.length) * Math.PI * 2;
  return {
    ...item,
    position: [
      Math.round(Math.cos(angle) * 14 * 10) / 10,
      0.5,
      Math.round(Math.sin(angle) * 9 * 10) / 10
    ] as [number, number, number]
  };
});

/**
 * Generates well-distributed random spawn coordinates inside the 48x32 arena.
 * Ensures gems don't spawn directly on top of the car spawn (0, 0)
 * and maintains comfortable spacing between each gem.
 */
function getRandomArenaPositions(
  count: number,
  boundsX = 20,
  boundsZ = 13,
  minCenterDist = 4.2,
  minPairDist = 5.5
): [number, number, number][] {
  const positions: [number, number, number][] = [];

  for (let i = 0; i < count; i++) {
    let chosen: [number, number, number] | null = null;
    let attempts = 0;

    while (attempts < 80) {
      attempts++;
      const x = Math.round((Math.random() * 2 - 1) * boundsX * 10) / 10;
      const z = Math.round((Math.random() * 2 - 1) * boundsZ * 10) / 10;

      // Avoid spawning directly on top of the car's initial center point
      if (Math.hypot(x, z) < minCenterDist) continue;

      // Avoid clustering too close to existing gems
      const tooClose = positions.some(
        ([px, , pz]) => Math.hypot(x - px, z - pz) < minPairDist
      );
      if (tooClose) continue;

      chosen = [x, 0.5, z];
      break;
    }

    if (!chosen) {
      // Deterministic fallback spread around perimeter ring
      const angle = (i / count) * Math.PI * 2;
      const rx = 12 + (i % 2) * 5;
      const rz = 8 + (i % 2) * 3;
      chosen = [
        Math.round(Math.cos(angle) * rx * 10) / 10,
        0.5,
        Math.round(Math.sin(angle) * rz * 10) / 10
      ];
    }

    positions.push(chosen);
  }

  return positions;
}

interface ParticleBurst {
  active: boolean;
  pos: THREE.Vector3;
  color: string;
  particles: {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    size: number;
  }[];
  life: number;
  maxLife: number;
}

interface TechCoinsProps {
  carPositionRef: React.RefObject<THREE.Vector3>;
  onCoinCollected?: (coin: TechCoinItem, totalCollected: number) => void;
  resetTrigger?: number;
}

export default function TechCoins({
  carPositionRef,
  onCoinCollected,
  resetTrigger = 0
}: TechCoinsProps) {
  const [collectedMap, setCollectedMap] = useState<Record<string, boolean>>({});

  // Dynamic randomized coins state
  const [coins, setCoins] = useState<TechCoinItem[]>(() => {
    const coords = getRandomArenaPositions(TECH_GEMS_CONFIG.length);
    return TECH_GEMS_CONFIG.map((cfg, idx) => ({
      ...cfg,
      position: coords[idx]
    }));
  });

  // Re-roll random positions on spawn & whenever resetTrigger changes
  useEffect(() => {
    setCollectedMap({});
    const coords = getRandomArenaPositions(TECH_GEMS_CONFIG.length);
    setCoins(
      TECH_GEMS_CONFIG.map((cfg, idx) => ({
        ...cfg,
        position: coords[idx]
      }))
    );
  }, [resetTrigger]);

  const burstsRef = useRef<ParticleBurst[]>([]);
  const coinGroupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.getElapsedTime();
    const carPos = carPositionRef.current;

    coins.forEach((coin, idx) => {
      const isCollected = collectedMap[coin.id];
      const grp = coinGroupRefs.current[idx];

      if (grp) {
        if (!isCollected) {
          grp.rotation.y += dt * 2.2;
          grp.position.y = coin.position[1] + Math.sin(time * 3 + idx * 1.5) * 0.14;

          if (carPos) {
            const dx = carPos.x - coin.position[0];
            const dz = carPos.z - coin.position[2];
            const dist = Math.hypot(dx, dz);

            if (dist < 1.45) {
              setCollectedMap((prev) => {
                const next = { ...prev, [coin.id]: true };
                const count = Object.values(next).filter(Boolean).length;
                if (onCoinCollected) {
                  onCoinCollected(coin, count);
                }
                return next;
              });

              const burstParticles = Array.from({ length: 24 }, () => {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const speed = 3.0 + Math.random() * 5.0;
                return {
                  pos: new THREE.Vector3(coin.position[0], coin.position[1], coin.position[2]),
                  vel: new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed * 0.9 + 1.5,
                    Math.sin(phi) * Math.sin(theta) * speed
                  ),
                  size: 0.1 + Math.random() * 0.09
                };
              });

              burstsRef.current.push({
                active: true,
                pos: new THREE.Vector3(...coin.position),
                color: coin.glowColor,
                particles: burstParticles,
                life: 0.8,
                maxLife: 0.8
              });
            }
          }
        }
      }
    });

    for (let i = burstsRef.current.length - 1; i >= 0; i--) {
      const b = burstsRef.current[i];
      if (b.active) {
        b.life -= dt;
        if (b.life <= 0) {
          burstsRef.current.splice(i, 1);
        } else {
          b.particles.forEach((p) => {
            p.pos.addScaledVector(p.vel, dt);
            p.vel.y -= 8.5 * dt;
          });
        }
      }
    }
  });

  return (
    <group>
      {coins.map((coin, idx) => {
        const isCollected = !!collectedMap[coin.id];
        if (isCollected) return null;

        return (
          <group
            key={coin.id}
            position={[coin.position[0], coin.position[1], coin.position[2]]}
            ref={(el) => {
              coinGroupRefs.current[idx] = el;
            }}
          >
            {/* 3D Faceted Tech Gem */}
            <mesh castShadow>
              <octahedronGeometry args={[0.42, 0]} />
              <meshStandardMaterial
                color={coin.color}
                emissive={coin.glowColor}
                emissiveIntensity={1.5}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>

            {/* Pulsing Outer Neon Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.58, 0.68, 28]} />
              <meshBasicMaterial
                color={coin.glowColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Glowing Floor Aura */}
            <mesh position={[0, -coin.position[1] + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.9, 20]} />
              <meshBasicMaterial
                color={coin.glowColor}
                transparent
                opacity={0.25}
                depthWrite={false}
              />
            </mesh>

            <pointLight color={coin.glowColor} intensity={2.0} distance={4.5} />

            {/* Floating Label */}
            <Html position={[0, 0.8, 0]} center distanceFactor={18} zIndexRange={[50, 0]}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 border border-cyan-400/40 text-[11px] font-bold text-white shadow-xl backdrop-blur-md pointer-events-none select-none whitespace-nowrap">
                <span>{coin.symbol}</span>
                <span className="opacity-95">{coin.name}</span>
              </div>
            </Html>
          </group>
        );
      })}

      <BurstRenderer burstsRef={burstsRef} />
    </group>
  );
}

function BurstRenderer({
  burstsRef
}: {
  burstsRef: React.RefObject<ParticleBurst[]>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useRef(new THREE.Matrix4());
  const maxTotalParticles = 160;

  useFrame(() => {
    if (!meshRef.current) return;
    const bursts = burstsRef.current || [];
    let count = 0;

    for (const b of bursts) {
      if (!b.active) continue;
      const progress = 1 - b.life / b.maxLife;
      const scaleBase = 1 - progress * 0.8;

      for (const p of b.particles) {
        if (count >= maxTotalParticles) break;
        const currentScale = Math.max(p.size * scaleBase, 0.001);
        dummy.current.makeScale(currentScale, currentScale, currentScale);
        dummy.current.setPosition(p.pos);
        meshRef.current.setMatrixAt(count, dummy.current);
        count++;
      }
    }

    for (let i = count; i < maxTotalParticles; i++) {
      dummy.current.makeScale(0, 0, 0);
      dummy.current.setPosition(0, -100, 0);
      meshRef.current.setMatrixAt(i, dummy.current);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxTotalParticles]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} depthWrite={false} />
    </instancedMesh>
  );
}
