'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FollowCameraProps {
  carPosRef: React.RefObject<THREE.Vector3>;
  carHeadingRef?: React.RefObject<number>;
  carSpeedRef?: React.RefObject<number>;
  scrollProgress?: number; // 0 (Playground Wide Overhead View) to 1 (Isometric Room view)
}

/**
 * Responsive Wide/Elevated Tracking Camera (Sistem Kamera Seperti Sebelumnya)
 * - Tampilan atas/perspektif lebar yang nyaman dan immersif untuk mengawasi seluruh lintasan.
 * - Mengikuti pergerakan mobil secara halus dengan lerp damping tanpa membuat pusing.
 * - Secara dinamis menyesuaikan FOV, elevasi (Y=18-25), dan jarak offset untuk layar HP & Desktop.
 * - Bertransisi secara halus melepaskan mobil ke sudut pandang Isometrik saat di-scroll ke bawah.
 */
export default function FollowCamera({
  carPosRef,
  scrollProgress = 0,
}: FollowCameraProps) {
  const { camera, size } = useThree();
  const currentPosRef = useRef(new THREE.Vector3(0, 18, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.2, -25));
  const isInitializedRef = useRef<boolean>(false);

  // Isometric Room camera presets
  const isoPosition = useRef(new THREE.Vector3(11.5, 9.5, 11.5));
  const isoTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    const carPos = carPosRef.current;
    if (carPos) {
      currentPosRef.current.set(carPos.x * 0.82, 19, carPos.z * 0.82 + 19);
      currentLookAtRef.current.set(carPos.x * 0.88, 0.2, carPos.z * 0.88);
      camera.position.copy(currentPosRef.current);
      camera.lookAt(currentLookAtRef.current);
      isInitializedRef.current = true;
    }
  }, [carPosRef, camera]);

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const dt = Math.min(delta, 0.05);
    const carPos = carPosRef.current;
    if (!carPos) return;

    // Detect aspect ratio: mobile portrait (< 1) vs desktop landscape (>= 1)
    const aspect = size.width / Math.max(size.height, 1);
    const isPortrait = aspect < 1;

    // Responsive FOV: on portrait screens, widen vertical FOV to 66deg
    const baseWideFov = isPortrait ? 66 : 48;

    // Elevated tracking position tailored for the wide arena and Monza track
    const targetCamY = isPortrait ? 25 : 19;
    const targetCamZOffset = isPortrait ? 22 : 19;
    const trackingFactor = isPortrait ? 0.88 : 0.82;

    const targetCamX = carPos.x * trackingFactor;
    const targetCamZ = carPos.z * trackingFactor + targetCamZOffset;

    const targetLookX = carPos.x * 0.88;
    const targetLookZ = carPos.z * 0.88;
    const targetLookY = 0.2;

    // Smooth lerp damping towards wide tracking position
    if (!isInitializedRef.current) {
      currentPosRef.current.set(targetCamX, targetCamY, targetCamZ);
      currentLookAtRef.current.set(targetLookX, targetLookY, targetLookZ);
      isInitializedRef.current = true;
    } else {
      currentPosRef.current.x = THREE.MathUtils.lerp(currentPosRef.current.x, targetCamX, dt * 4.2);
      currentPosRef.current.y = THREE.MathUtils.lerp(currentPosRef.current.y, targetCamY, dt * 4.2);
      currentPosRef.current.z = THREE.MathUtils.lerp(currentPosRef.current.z, targetCamZ, dt * 4.2);

      currentLookAtRef.current.x = THREE.MathUtils.lerp(currentLookAtRef.current.x, targetLookX, dt * 4.8);
      currentLookAtRef.current.y = THREE.MathUtils.lerp(currentLookAtRef.current.y, targetLookY, dt * 4.8);
      currentLookAtRef.current.z = THREE.MathUtils.lerp(currentLookAtRef.current.z, targetLookZ, dt * 4.8);
    }

    // ─────────────────────────────────────────────────────────────
    // SCROLL DETACHMENT TO ISOMETRIC ROOM
    // ─────────────────────────────────────────────────────────────
    const clampedProgress = Math.min(Math.max((scrollProgress - 0.08) / 0.82, 0), 1);
    const t = clampedProgress * clampedProgress * (3 - 2 * clampedProgress);

    const targetFov = THREE.MathUtils.lerp(baseWideFov, 34, t);
    if (Math.abs(camera.fov - targetFov) > 0.2) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    if (t > 0.001) {
      const finalCamPos = new THREE.Vector3().lerpVectors(
        currentPosRef.current,
        isoPosition.current,
        t
      );
      const finalLookAt = new THREE.Vector3().lerpVectors(
        currentLookAtRef.current,
        isoTarget.current,
        t
      );
      camera.position.copy(finalCamPos);
      camera.lookAt(finalLookAt);
    } else {
      camera.position.copy(currentPosRef.current);
      camera.lookAt(currentLookAtRef.current);
    }
  });

  return null;
}
