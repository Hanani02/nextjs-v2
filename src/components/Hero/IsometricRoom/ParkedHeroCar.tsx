'use client';

import { useState, useEffect } from 'react';
import type { CarModelType } from '@/types/vehicle';
import CarBodyMesh from '../Playground/CarBodyMesh';
import CarWheels from '../Playground/CarWheels';
import CarUsernameBadge from '../Playground/CarUsernameBadge';

interface ParkedHeroCarProps {
  position?: [number, number, number];
  rotationY?: number;
}

export default function ParkedHeroCar({
  position = [2.0, -0.74, 0.9],
  rotationY = -0.75, // Angled toward the isometric center
}: ParkedHeroCarProps) {
  const [model, setModel] = useState<CarModelType>('sport');
  const [color, setColor] = useState<string>('#06b6d4');
  const [username, setUsername] = useState<string>('Pilot_01');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readPreferences = () => {
      const savedModel = localStorage.getItem('playground_car_model') as CarModelType | null;
      if (savedModel && ['sport', 'truck', 'buggy'].includes(savedModel)) {
        setModel(savedModel);
      }
      const savedColor = localStorage.getItem('playground_car_color');
      if (savedColor) setColor(savedColor);

      const savedName = localStorage.getItem('playground_username');
      if (savedName) setUsername(savedName);
    };

    readPreferences();

    // Listen to storage changes if user customizes car in the garage
    window.addEventListener('storage', readPreferences);
    return () => window.removeEventListener('storage', readPreferences);
  }, []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Ground Contact Shadow / Display Decal so wheels look planted */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 2.4]} />
        <meshBasicMaterial color="#090514" transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Volumetric Miniature Scale Group (Uniform 3D Proportions) */}
      <group scale={[0.92, 0.92, 0.92]}>
        {/* Floating Badge (Parked Status) */}
        <CarUsernameBadge
          username={username}
          isSelf={true}
          color={color}
          model={model}
          isDrifting={false}
          speed={0}
        />

        {/* 3D Car Body Mesh */}
        <CarBodyMesh
          model={model}
          color={color}
          isDrifting={false}
          isBraking={true}
        />

      {/* Wheel Assembly (Straight parked wheels) */}
      <CarWheels
        model={model}
        color={color}
        steerAngle={0}
        wheelSpin={0}
      />

        {/* Gentle Idle Headlight Beam */}
        <spotLight
          position={[0, 0.3, 0.9]}
          target-position={[0, 0, 3.5]}
          color="#38bdf8"
          intensity={1.8}
          angle={0.6}
          penumbra={0.7}
          distance={5}
        />
      </group>
    </group>
  );
}
