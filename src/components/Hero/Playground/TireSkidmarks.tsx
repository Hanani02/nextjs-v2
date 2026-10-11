'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TireSkidmarksProps {
  carPosRef: React.RefObject<THREE.Vector3>;
  headingRef: React.RefObject<number>;
  speedRef: React.RefObject<number>;
  isDriftingRef: React.RefObject<boolean>;
}

const MAX_SKID_MARKS = 140;

interface SkidMarkItem {
  pos: THREE.Vector3;
  heading: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export default function TireSkidmarks({
  carPosRef,
  headingRef,
  speedRef,
  isDriftingRef,
}: TireSkidmarksProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const lastSpawnPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const ringIndex = useRef(0);
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyColor = useMemo(() => new THREE.Color(), []);

  // Ring buffer pool
  const skidData = useMemo<SkidMarkItem[]>(() => {
    return Array.from({ length: MAX_SKID_MARKS }, () => ({
      pos: new THREE.Vector3(0, -100, 0),
      heading: 0,
      life: 0,
      maxLife: 5.5,
      active: false,
    }));
  }, []);

  // Initialize all instances parked off-screen
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < MAX_SKID_MARKS; i++) {
      dummyMatrix.makeScale(0, 0, 0);
      dummyMatrix.setPosition(0, -100, 0);
      meshRef.current.setMatrixAt(i, dummyMatrix);
      dummyColor.set('#09090b');
      meshRef.current.setColorAt(i, dummyColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [dummyMatrix, dummyColor]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.05);

    const carPos = carPosRef.current;
    const heading = headingRef.current ?? 0;
    const speed = speedRef.current ?? 0;
    const isDrifting = isDriftingRef.current ?? false;

    // 1. Spawn new skid marks when drifting with sufficient momentum
    if (carPos && isDrifting && speed > 2.8) {
      const distFromLast = carPos.distanceTo(lastSpawnPos.current);
      if (distFromLast > 0.32) {
        lastSpawnPos.current.copy(carPos);

        // Compute rear tire ground contact points
        const leftRearOffset = new THREE.Vector3(-0.42, 0.021, -0.65).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          heading
        );
        const rightRearOffset = new THREE.Vector3(0.42, 0.021, -0.65).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          heading
        );

        const leftPos = carPos.clone().add(leftRearOffset);
        const rightPos = carPos.clone().add(rightRearOffset);

        // Add Left tire mark
        const idx1 = ringIndex.current % MAX_SKID_MARKS;
        ringIndex.current++;
        skidData[idx1].pos.copy(leftPos);
        skidData[idx1].heading = heading;
        skidData[idx1].life = skidData[idx1].maxLife;
        skidData[idx1].active = true;

        // Add Right tire mark
        const idx2 = ringIndex.current % MAX_SKID_MARKS;
        ringIndex.current++;
        skidData[idx2].pos.copy(rightPos);
        skidData[idx2].heading = heading;
        skidData[idx2].life = skidData[idx2].maxLife;
        skidData[idx2].active = true;
      }
    }

    // 2. Update existing active skid marks (gradual rubber dissipation)
    let needsUpdate = false;
    for (let i = 0; i < MAX_SKID_MARKS; i++) {
      const item = skidData[i];
      if (item.active) {
        item.life -= dt;
        if (item.life <= 0) {
          item.active = false;
          dummyMatrix.makeScale(0, 0, 0);
          dummyMatrix.setPosition(0, -100, 0);
          mesh.setMatrixAt(i, dummyMatrix);
        } else {
          // Scale remains constant width, opacity fades gradually
          const progress = item.life / item.maxLife; // 1 to 0
          dummyMatrix.makeRotationY(item.heading);
          dummyMatrix.scale(new THREE.Vector3(1, 1, 1));
          dummyMatrix.setPosition(item.pos.x, 0.021, item.pos.z);
          mesh.setMatrixAt(i, dummyMatrix);

          // Dark rubber color fades into asphalt
          const lightness = 0.04 + (1 - progress) * 0.06;
          dummyColor.setRGB(lightness, lightness, lightness + 0.01);
          mesh.setColorAt(i, dummyColor);
        }
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_SKID_MARKS]}
      frustumCulled={false}
    >
      <planeGeometry args={[0.24, 0.45]} />
      <meshBasicMaterial
        color="#09090b"
        transparent
        opacity={0.85}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </instancedMesh>
  );
}
