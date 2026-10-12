'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FollowCameraProps {
  carPosRef: React.RefObject<THREE.Vector3>;
  carHeadingRef: React.RefObject<number>;
  carSpeedRef?: React.RefObject<number>;
  scrollProgress?: number; // 0 (Playground Follow Camera) to 1 (Isometric Room view)
}

/**
 * Third-Person Arcade Follow Camera with Smooth Lerp Damping
 * - Stays 4.5 units behind and 2.2 units above the player's car.
 * - Locks lookAt directly onto the car with an offset towards the front nose.
 * - Smoothly rotates along with the car during turns and high-momentum drifting.
 * - Detaches seamlessly into an elevated isometric view when user scrolls down.
 */
export default function FollowCamera({
  carPosRef,
  carHeadingRef,
  carSpeedRef,
  scrollProgress = 0,
}: FollowCameraProps) {
  const { camera, size } = useThree();

  // Internal persistent refs for ultra-smooth 60 FPS damping
  const camYawRef = useRef<number>(Math.PI / 2);
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 4, -29));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(2, 0.5, -25));
  const isInitializedRef = useRef<boolean>(false);

  // Isometric Room camera presets
  const isoPosition = useRef(new THREE.Vector3(11.5, 9.5, 11.5));
  const isoTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    // Initialize behind the start line
    const carPos = carPosRef.current;
    const heading = carHeadingRef.current ?? Math.PI / 2;
    if (carPos) {
      camYawRef.current = heading;
      const behindX = -Math.sin(heading) * 4.6;
      const behindZ = -Math.cos(heading) * 4.6;
      currentPosRef.current.set(carPos.x + behindX, carPos.y + 2.25, carPos.z + behindZ);
      currentLookAtRef.current.set(carPos.x, carPos.y + 0.55, carPos.z);
      camera.position.copy(currentPosRef.current);
      camera.lookAt(currentLookAtRef.current);
      isInitializedRef.current = true;
    }
  }, [carPosRef, carHeadingRef, camera]);

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const dt = Math.min(delta, 0.05);
    const carPos = carPosRef.current;
    if (!carPos) return;

    const carHeading = carHeadingRef.current ?? Math.PI / 2;
    const carSpeed = carSpeedRef?.current ?? 0;

    // Viewport aspect ratio check: mobile portrait (< 1) vs desktop (>= 1)
    const aspect = size.width / Math.max(size.height, 1);
    const isPortrait = aspect < 1;

    // Dynamic FOV: Base 50° + speed compression (+up to 5°)
    const speedRatio = Math.min(Math.abs(carSpeed) / 24, 1);
    const baseFov = isPortrait ? 64 : 50;
    const targetRacingFov = baseFov + speedRatio * 4;

    // ─────────────────────────────────────────────────────────────
    // 1. THIRD-PERSON FOLLOW CALCULATIONS (Racing Phase)
    // ─────────────────────────────────────────────────────────────
    // Smooth angle interpolation with shortest angular path
    let angleDiff = carHeading - camYawRef.current;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Responsive camera yaw damping: 5.2/sec keeps camera glued behind,
    // yet allows car chassis to slide sideways into frame during drifts!
    camYawRef.current += angleDiff * Math.min(dt * 5.4, 1);

    // Camera offset: 4.5 - 4.8 units behind car, 2.2 - 2.4 units above
    const offsetBehind = isPortrait ? 5.2 : 4.6;
    const offsetHeight = isPortrait ? 2.6 : 2.25;
    const offsetForward = 2.2; // Point slightly ahead of nose for natural forward view

    const behindX = -Math.sin(camYawRef.current) * offsetBehind;
    const behindZ = -Math.cos(camYawRef.current) * offsetBehind;

    const targetFollowPos = new THREE.Vector3(
      carPos.x + behindX,
      carPos.y + offsetHeight,
      carPos.z + behindZ
    );

    // LookAt targets nose of car
    const noseX = Math.sin(carHeading) * offsetForward;
    const noseZ = Math.cos(carHeading) * offsetForward;
    const targetLookAt = new THREE.Vector3(
      carPos.x + noseX,
      carPos.y + 0.55,
      carPos.z + noseZ
    );

    // Damp positions
    if (!isInitializedRef.current) {
      currentPosRef.current.copy(targetFollowPos);
      currentLookAtRef.current.copy(targetLookAt);
      isInitializedRef.current = true;
    } else {
      currentPosRef.current.lerp(targetFollowPos, Math.min(dt * 7.5, 1));
      currentLookAtRef.current.lerp(targetLookAt, Math.min(dt * 8.5, 1));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. DETACHED TRANSITION TO ISOMETRIC ROOM ON SCROLL DOWN
    // ─────────────────────────────────────────────────────────────
    // Smoothstep transition curve as scroll progress moves from 0 to 1
    const clampedProgress = Math.min(Math.max((scrollProgress - 0.08) / 0.82, 0), 1);
    const t = clampedProgress * clampedProgress * (3 - 2 * clampedProgress);

    // Responsive FOV transition
    const targetFov = THREE.MathUtils.lerp(targetRacingFov, 34, t);
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    if (t > 0.001) {
      // Smoothly blend from follow chase camera to elevated isometric viewpoint
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
