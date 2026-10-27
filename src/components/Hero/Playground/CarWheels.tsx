'use client';

import * as THREE from 'three';
import type { CarModelType } from '@/types/vehicle';

interface CarWheelsProps {
  model: CarModelType;
  color: string;
  steerAngle: number;
  wheelSpin: number;
}

export interface CarWheelRefs {
  frontLeft: React.RefObject<THREE.Group | null>;
  frontRight: React.RefObject<THREE.Group | null>;
  rearLeft: React.RefObject<THREE.Mesh | null>;
  rearRight: React.RefObject<THREE.Mesh | null>;
}

export default function CarWheels({
  model,
  color,
  steerAngle,
  wheelSpin,
}: CarWheelsProps) {
  // Model specific dimensions
  const radius = model === 'truck' ? 0.26 : model === 'buggy' ? 0.22 : 0.2;
  const width = model === 'truck' ? 0.2 : model === 'buggy' ? 0.16 : 0.14;
  const rimRadius = radius * 0.6;
  const trackWidth = model === 'truck' ? 0.62 : model === 'buggy' ? 0.58 : 0.52;
  const wheelbaseFront = model === 'truck' ? 0.72 : model === 'buggy' ? 0.58 : 0.6;
  const wheelbaseRear = model === 'truck' ? -0.72 : model === 'buggy' ? -0.58 : -0.6;
  const height = radius;

  return (
    <group>
      {/* Front Left Wheel Assembly */}
      <group position={[-trackWidth, height, wheelbaseFront]} rotation={[0, steerAngle, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin} castShadow>
          <cylinderGeometry args={[radius, radius, width, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        {/* Rim Accent */}
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin}>
          <cylinderGeometry args={[rimRadius, rimRadius, width + 0.005, 12]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Front Right Wheel Assembly */}
      <group position={[trackWidth, height, wheelbaseFront]} rotation={[0, steerAngle, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin} castShadow>
          <cylinderGeometry args={[radius, radius, width, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        {/* Rim Accent */}
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin}>
          <cylinderGeometry args={[rimRadius, rimRadius, width + 0.005, 12]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Rear Left Wheel */}
      <group position={[-trackWidth, height, wheelbaseRear]}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin} castShadow>
          <cylinderGeometry args={[radius, radius, width, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        {/* Rim Accent */}
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin}>
          <cylinderGeometry args={[rimRadius, rimRadius, width + 0.005, 12]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Rear Right Wheel */}
      <group position={[trackWidth, height, wheelbaseRear]}>
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin} castShadow>
          <cylinderGeometry args={[radius, radius, width, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        {/* Rim Accent */}
        <mesh rotation={[0, 0, Math.PI / 2]} rotation-x={wheelSpin}>
          <cylinderGeometry args={[rimRadius, rimRadius, width + 0.005, 12]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
