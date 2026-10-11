'use client';

import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import CarBodyMesh from './CarBodyMesh';
import CarWheels from './CarWheels';
import CarUsernameBadge from './CarUsernameBadge';
import type { PlayerVehicleState, CarModelType } from '@/types/vehicle';

interface OtherPlayerCarProps {
  playerId: string;
  remotePlayersRef: React.RefObject<Record<string, PlayerVehicleState>>;
  activeEmote?: string | null;
}

function OtherPlayerCar({ playerId, remotePlayersRef, activeEmote }: OtherPlayerCarProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);

  const initial = remotePlayersRef.current?.[playerId];
  const [model, setModel] = useState<CarModelType>(initial?.model || 'sport');
  const [color, setColor] = useState<string>(initial?.color || '#06b6d4');
  const [username, setUsername] = useState<string>(initial?.username || 'Pilot');
  const [isDrifting, setIsDrifting] = useState<boolean>(initial?.isDrifting || false);
  const [isBraking, setIsBraking] = useState<boolean>(initial?.isBraking || false);

  // Interpolated smooth transform state
  const smooth = useRef({
    x: initial?.x ?? 0,
    z: initial?.z ?? 0,
    heading: initial?.heading ?? 0,
    steerAngle: initial?.steerAngle ?? 0,
    wheelSpin: 0,
    pitch: 0,
    roll: 0,
  });

  useFrame((_, delta) => {
    const player = remotePlayersRef.current?.[playerId];
    if (!player) return;

    const dt = Math.min(delta, 0.05);
    const s = smooth.current;

    // Linear Interpolation for position (lerp)
    s.x = THREE.MathUtils.lerp(s.x, player.x, dt * 12);
    s.z = THREE.MathUtils.lerp(s.z, player.z, dt * 12);

    // Shortest-arc angle interpolation for heading rotation y
    let angleDiff = player.heading - s.heading;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    s.heading += angleDiff * Math.min(dt * 14, 1.0);

    // Steering and wheel spin
    s.steerAngle = THREE.MathUtils.lerp(s.steerAngle, player.steerAngle, dt * 12);
    s.wheelSpin += (player.speed / 0.22) * dt;

    // Chassis body roll and pitch
    const targetRoll = (s.steerAngle * (player.speed / 20)) * 0.16;
    const targetPitch = player.isBraking ? 0.04 : (player.speed / 20) * -0.04;
    s.roll = THREE.MathUtils.lerp(s.roll, targetRoll, dt * 8);
    s.pitch = THREE.MathUtils.lerp(s.pitch, targetPitch, dt * 8);

    // Apply transforms
    if (groupRef.current) {
      groupRef.current.position.set(s.x, 0.08, s.z);
      groupRef.current.rotation.y = s.heading;
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.x = s.pitch;
      bodyRef.current.rotation.z = s.roll;
    }

    // Update visual properties if changed by remote player
    if (player.model !== model) setModel(player.model);
    if (player.color !== color) setColor(player.color);
    if (player.username !== username) setUsername(player.username);
    if (player.isDrifting !== isDrifting) setIsDrifting(player.isDrifting);
    if (player.isBraking !== isBraking) setIsBraking(player.isBraking);
  });

  return (
    <group ref={groupRef} position={[initial?.x ?? 0, 0.08, initial?.z ?? 0]}>
      {/* Floating Username & Status Badge */}
      <CarUsernameBadge
        username={username}
        isSelf={false}
        color={color}
        model={model}
        isDrifting={isDrifting}
        activeEmote={activeEmote}
      />

      {/* Tilting Car Body Mesh */}
      <group ref={bodyRef}>
        <CarBodyMesh
          model={model}
          color={color}
          isDrifting={isDrifting}
          isBraking={isBraking}
        />
      </group>

      {/* Wheels Assembly */}
      <CarWheels
        model={model}
        color={color}
        steerAngle={smooth.current.steerAngle}
        wheelSpin={smooth.current.wheelSpin}
      />
    </group>
  );
}

interface OtherPlayersProps {
  activePlayerIds?: string[];
  remotePlayersRef: React.RefObject<Record<string, PlayerVehicleState>>;
  activeEmotes?: Record<string, { text: string; expiresAt: number }>;
}

export default function OtherPlayers({
  activePlayerIds = [],
  remotePlayersRef,
  activeEmotes = {},
}: OtherPlayersProps) {
  const now = Date.now();
  return (
    <group>
      {activePlayerIds.map((id) => {
        const emoteObj = activeEmotes[id];
        const emoteText = emoteObj && emoteObj.expiresAt > now ? emoteObj.text : null;
        return (
          <OtherPlayerCar
            key={id}
            playerId={id}
            remotePlayersRef={remotePlayersRef}
            activeEmote={emoteText}
          />
        );
      })}
    </group>
  );
}
