'use client';

import type { CarModelType, GraphicsQuality } from '@/types/vehicle';

interface CarBodyMeshProps {
  model: CarModelType;
  color: string;
  isDrifting?: boolean;
  isBraking?: boolean;
  graphicsQuality?: GraphicsQuality;
}

export default function CarBodyMesh({
  model,
  color,
  isDrifting = false,
  isBraking = false,
  graphicsQuality = 'medium',
}: CarBodyMeshProps) {
  // Dynamic material reflection & detail based on graphics settings
  const bodyRoughness =
    graphicsQuality === 'high' ? 0.18 : graphicsQuality === 'medium' ? 0.60 : 0.85;
  const bodyMetalness =
    graphicsQuality === 'high' ? 0.78 : graphicsQuality === 'medium' ? 0.28 : 0.10;
  const glowMultiplier =
    graphicsQuality === 'high' ? 1.25 : graphicsQuality === 'medium' ? 0.85 : 0.5;
  const neonGlowIntensity = (isDrifting ? 1.8 : 0.8) * glowMultiplier;

  if (model === 'truck') {
    // ─────────────────────────────────────────────────────────────
    // 2. TRUCK / ROVER MODEL (Boxy Rugged Chassis, Roof Lightbar, Bull-bar)
    // ─────────────────────────────────────────────────────────────
    return (
      <group position={[0, 0, 0]}>
        {/* Main Rugged Frame / Lower Chassis */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.08, 0.22, 2.1]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Elevated Cabin (Body Color) */}
        <mesh position={[0, 0.52, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.32, 1.05]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={neonGlowIntensity * 0.3}
            roughness={bodyRoughness}
            metalness={bodyMetalness}
          />
        </mesh>

        {/* Cabin Tinted Glass Windshield & Windows */}
        <mesh position={[0, 0.56, 0.18]}>
          <boxGeometry args={[0.98, 0.24, 0.8]} />
          <meshStandardMaterial
            color="#020617"
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Rear Open Bed / Cargo Bay */}
        <group position={[0, 0.42, -0.68]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.98, 0.2, 0.85]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Bed Liner Rail */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[1.02, 0.05, 0.88]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        </group>

        {/* Roof Rack with 5-LED High-Intensity Lightbar */}
        <group position={[0, 0.72, 0.12]}>
          {/* Rack Base */}
          <mesh castShadow>
            <boxGeometry args={[0.88, 0.04, 0.5]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} />
          </mesh>
          {/* Lightbar Housing */}
          <mesh position={[0, 0.06, 0.22]} castShadow>
            <boxGeometry args={[0.82, 0.08, 0.06]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* 5-LED Neon Lightbar Beams */}
          {[-0.32, -0.16, 0, 0.16, 0.32].map((x, i) => (
            <mesh key={i} position={[x, 0.06, 0.255]}>
              <boxGeometry args={[0.1, 0.05, 0.02]} />
              <meshStandardMaterial
                color="#f8fafc"
                emissive="#38bdf8"
                emissiveIntensity={3.5}
              />
            </mesh>
          ))}
        </group>

        {/* Heavy-Duty Front Bull-Bar Bumper */}
        <group position={[0, 0.24, 1.1]}>
          <mesh castShadow>
            <boxGeometry args={[1.12, 0.2, 0.14]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Center Guard Bar */}
          <mesh position={[0, 0.12, 0.05]} castShadow>
            <boxGeometry args={[0.6, 0.08, 0.08]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
        </group>

        {/* Dual Vertical Rear Exhaust Stacks */}
        {[-0.42, 0.42].map((x, i) => (
          <group key={i} position={[x, 0.62, -0.32]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.55, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Stack Glowing Lip */}
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2.0}
              />
            </mesh>
          </group>
        ))}

        {/* Front LED Headlights */}
        <mesh position={[-0.38, 0.32, 1.08]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshStandardMaterial color="#f8fafc" emissive="#38bdf8" emissiveIntensity={3.0} />
        </mesh>
        <mesh position={[0.38, 0.32, 1.08]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshStandardMaterial color="#f8fafc" emissive="#38bdf8" emissiveIntensity={3.0} />
        </mesh>

        {/* Rear Brake Lights */}
        <mesh position={[-0.4, 0.38, -1.06]}>
          <boxGeometry args={[0.16, 0.08, 0.04]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 3.0 : 0.8}
          />
        </mesh>
        <mesh position={[0.4, 0.38, -1.06]}>
          <boxGeometry args={[0.16, 0.08, 0.04]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 3.0 : 0.8}
          />
        </mesh>

        {/* Neon Underglow Floor Ring */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 2.3]} />
          <meshBasicMaterial color={color} transparent opacity={isDrifting ? 0.6 : 0.35} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  if (model === 'buggy') {
    // ─────────────────────────────────────────────────────────────
    // 3. BUGGY MODEL (Tubular Roll-Cage, Exposed Cockpit, Neon Whip Antenna)
    // ─────────────────────────────────────────────────────────────
    return (
      <group position={[0, 0, 0]}>
        {/* Compact Lower Tub Chassis */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.16, 1.6]} />
          <meshStandardMaterial color="#090d16" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Angular Nose Cone (Color Accent) */}
        <mesh position={[0, 0.28, 0.62]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.66, 0.16, 0.55]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={neonGlowIntensity * 0.4}
            roughness={bodyRoughness}
            metalness={bodyMetalness}
          />
        </mesh>

        {/* Tubular Roll-Cage Framework */}
        {/* Main Overhead Hoop */}
        <group position={[0, 0.46, -0.05]}>
          {/* Top Bar */}
          <mesh position={[0, 0.24, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.72, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          {/* Left A-Pillar / Strut */}
          <mesh position={[-0.36, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          {/* Right A-Pillar / Strut */}
          <mesh position={[0.36, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          {/* Diagonal Rear Braces */}
          <mesh position={[-0.34, 0.05, -0.32]} rotation={[-0.6, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[0.34, 0.05, -0.32]} rotation={[-0.6, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.65, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        </group>

        {/* Visible Cockpit Racing Seat */}
        <group position={[0, 0.36, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.35, 0.38]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Headrest */}
          <mesh position={[0, 0.25, -0.1]} castShadow>
            <boxGeometry args={[0.24, 0.15, 0.12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Tall Cyber Neon Whip Antenna (Agile Buggy Signature) */}
        <group position={[-0.32, 0.5, -0.65]}>
          {/* Flexible Rod */}
          <mesh position={[0, 0.38, 0]} rotation={[0.05, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.015, 0.78, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          {/* Neon Whip Tip Sphere */}
          <mesh position={[0, 0.78, 0.04]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={4.5}
            />
          </mesh>
          {/* Whip Flag */}
          <mesh position={[0.08, 0.72, 0.04]}>
            <boxGeometry args={[0.15, 0.08, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>

        {/* Exposed Front Baja Round Headlights */}
        <group position={[0, 0.38, 0.78]}>
          {[-0.24, 0.24].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
              <meshStandardMaterial
                color="#f8fafc"
                emissive="#38bdf8"
                emissiveIntensity={3.2}
              />
            </mesh>
          ))}
        </group>

        {/* Rear Brake Light Bar */}
        <mesh position={[0, 0.38, -0.82]}>
          <boxGeometry args={[0.5, 0.06, 0.03]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 3.2 : 0.8}
          />
        </mesh>

        {/* Neon Underglow Floor Ring */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.8]} />
          <meshBasicMaterial color={color} transparent opacity={isDrifting ? 0.6 : 0.35} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. SPORT MODEL (Low-Slung Sleek Body, Spoiler, Aero Splitter)
  // ─────────────────────────────────────────────────────────────
  return (
    <group position={[0, 0, 0]}>
      {/* Lower Dark Chassis with Low Splitter */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.14, 1.85]} />
        <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Aerodynamic Sculpted Cockpit & Hood (Selected Neon Color) */}
      <mesh position={[0, 0.32, -0.05]} castShadow>
        <boxGeometry args={[0.76, 0.18, 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={neonGlowIntensity * 0.35}
          metalness={bodyMetalness}
          roughness={bodyRoughness}
        />
      </mesh>

      {/* Aerodynamic Slanted Nose Hood */}
      <mesh position={[0, 0.24, 0.68]} rotation={[-0.14, 0, 0]} castShadow>
        <boxGeometry args={[0.74, 0.14, 0.58]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={neonGlowIntensity * 0.25}
          metalness={bodyMetalness}
          roughness={bodyRoughness}
        />
      </mesh>

      {/* Tinted Cabin Windshield Glass */}
      <mesh position={[0, 0.39, 0.05]}>
        <boxGeometry args={[0.68, 0.16, 0.68]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.95}
          roughness={0.08}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Front Aerodynamic Splitter */}
      <mesh position={[0, 0.13, 0.98]} castShadow>
        <boxGeometry args={[0.98, 0.06, 0.22]} />
        <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Dual Front LED Headlights */}
      <mesh position={[-0.33, 0.22, 0.96]}>
        <boxGeometry args={[0.18, 0.06, 0.04]} />
        <meshStandardMaterial color="#f8fafc" emissive="#38bdf8" emissiveIntensity={3.2} />
      </mesh>
      <mesh position={[0.33, 0.22, 0.96]}>
        <boxGeometry args={[0.18, 0.06, 0.04]} />
        <meshStandardMaterial color="#f8fafc" emissive="#38bdf8" emissiveIntensity={3.2} />
      </mesh>

      {/* Rear Dual-Fin GT Spoiler Wing (Sport Signature) */}
      <group position={[0, 0.44, -0.85]}>
        {/* Top Blade Wing */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[1.02, 0.04, 0.24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={neonGlowIntensity * 0.5}
          />
        </mesh>
        {/* Left Strut */}
        <mesh position={[-0.4, 0.05, 0]}>
          <boxGeometry args={[0.04, 0.16, 0.14]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Right Strut */}
        <mesh position={[0.4, 0.05, 0]}>
          <boxGeometry args={[0.04, 0.16, 0.14]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Rear LED Brake Light Strips */}
      <mesh position={[-0.32, 0.22, -0.94]}>
        <boxGeometry args={[0.22, 0.06, 0.03]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isBraking ? 3.0 : 0.6}
        />
      </mesh>
      <mesh position={[0.32, 0.22, -0.94]}>
        <boxGeometry args={[0.22, 0.06, 0.03]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isBraking ? 3.0 : 0.6}
        />
      </mesh>

      {/* Neon Underglow Floor Ring */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.25, 2.05]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isDrifting ? 0.65 : 0.38}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
