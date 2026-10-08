'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  createEditorTexture,
  createTerminalTexture,
  createPreviewTexture,
  createWallArtTexture,
  createFloorGridTexture
} from './roomTextures';
import type { HotspotType } from './Hotspots';

interface RoomMeshesProps {
  onSelectHotspot: (type: HotspotType) => void;
  profileImage?: string;
}

function createRoundedRectShape(width: number, length: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -length / 2;
  const w = width;
  const h = length;
  const r = radius;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

export default function RoomMeshes({ onSelectHotspot, profileImage = '/image/profil.jpeg' }: RoomMeshesProps) {
  // Pre-generate procedural textures
  const editorTex = useMemo(() => createEditorTexture(), []);
  const terminalTex = useMemo(() => createTerminalTexture(), []);
  const previewTex = useMemo(() => createPreviewTexture(), []);
  const wallArtTex = useMemo(() => createWallArtTexture(), []);
  const floorGridTex = useMemo(() => createFloorGridTexture(), []);

  // Dynamic profile photo texture loader for the wall picture frame
  const [profileTexture, setProfileTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!profileImage) return;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      profileImage,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setProfileTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load profile photo in 3D room, using fallback:', err);
      }
    );
  }, [profileImage]);

  // Rounded diorama floor platform and pedestal shapes
  const floorShape = useMemo(() => createRoundedRectShape(8.6, 8.6, 1.4), []);
  const floorExtrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.38,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelOffset: 0,
      bevelSegments: 6
    }),
    []
  );

  const basePedestalShape = useMemo(() => createRoundedRectShape(8.9, 8.9, 1.55), []);
  const basePedestalExtrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelOffset: 0,
      bevelSegments: 4
    }),
    []
  );

  // Subtle animated refs for RGB fan glow and screen pulsate
  const pcFanGroup = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (pcFanGroup.current) {
      pcFanGroup.current.rotation.z += delta * 3;
    }
  });

  return (
    <group position={[0, -1.2, 0]}>
      {/* ─────────────────────────────────────────────────────────────
          1. ROOM STRUCTURE (ROUNDED DIORAMA BASE & CORNERS)
      ───────────────────────────────────────────────────────────── */}
      {/* 1. Main Rounded Diorama Floor Platform */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <extrudeGeometry args={[floorShape, floorExtrudeSettings]} />
        <meshStandardMaterial
          map={floorGridTex}
          color="#251f38"
          roughness={0.5}
          metalness={0.08}
        />
      </mesh>

      {/* 2. Tiered Under-Pedestal (Rounded Base Trim) */}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[basePedestalShape, basePedestalExtrudeSettings]} />
        <meshStandardMaterial color="#151124" roughness={0.8} />
      </mesh>

      {/* 3. Left Wall */}
      <mesh position={[-4.05, 3.5, 0]} receiveShadow>
        <boxGeometry args={[0.3, 7.0, 8.4]} />
        <meshStandardMaterial color="#362d4e" roughness={0.7} />
      </mesh>
      {/* Left Wall Baseboard Skirting */}
      <mesh position={[-3.85, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.2, 8.4]} />
        <meshStandardMaterial color="#201a30" />
      </mesh>

      {/* 4. Right / Back Wall */}
      <mesh position={[0, 3.5, -4.05]} receiveShadow>
        <boxGeometry args={[8.4, 7.0, 0.3]} />
        <meshStandardMaterial color="#312847" roughness={0.7} />
      </mesh>
      {/* Right Wall Baseboard Skirting */}
      <mesh position={[0, 0.1, -3.85]}>
        <boxGeometry args={[8.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#201a30" />
      </mesh>

      {/* 5. Smooth Rounded Corner Pillars & Wall Moldings */}
      {/* Back Corner Rounded Pillar (junction where walls meet) */}
      <mesh position={[-4.05, 3.5, -4.05]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 7.0, 24]} />
        <meshStandardMaterial color="#342b4b" roughness={0.7} />
      </mesh>

      {/* Left Wall Front Rounded End Column */}
      <mesh position={[-4.05, 3.5, 4.2]}>
        <cylinderGeometry args={[0.15, 0.15, 7.0, 24]} />
        <meshStandardMaterial color="#362d4e" roughness={0.7} />
      </mesh>

      {/* Right Wall Right Rounded End Column */}
      <mesh position={[4.2, 3.5, -4.05]}>
        <cylinderGeometry args={[0.15, 0.15, 7.0, 24]} />
        <meshStandardMaterial color="#312847" roughness={0.7} />
      </mesh>

      {/* Left Wall Top Rounded Crown Rail */}
      <mesh position={[-4.05, 7.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 8.4, 24]} />
        <meshStandardMaterial color="#3e335b" roughness={0.6} />
      </mesh>

      {/* Right Wall Top Rounded Crown Rail */}
      <mesh position={[0, 7.02, -4.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 8.4, 24]} />
        <meshStandardMaterial color="#3e335b" roughness={0.6} />
      </mesh>

      {/* Crown Spherical Finials / Caps */}
      <mesh position={[-4.05, 7.02, -4.05]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color="#3e335b" roughness={0.6} />
      </mesh>
      <mesh position={[-4.05, 7.02, 4.2]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color="#3e335b" roughness={0.6} />
      </mesh>
      <mesh position={[4.2, 7.02, -4.05]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color="#3e335b" roughness={0.6} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. NEON LIGHT TUBES (WALL MOUNTED - PROPORTIONATE)
      ───────────────────────────────────────────────────────────── */}
      {/* Top Right Wall LED Tube */}
      <group position={[-0.2, 6.2, -3.88]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 3.2, 16]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
        <pointLight color="#00e5ff" intensity={2.0} distance={6} />
      </group>

      {/* Left Wall Lower Neon Accent Strip */}
      <group position={[-3.88, 2.3, -1.4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 2.4, 16]} />
          <meshBasicMaterial color="#d946ef" />
        </mesh>
        <pointLight color="#d946ef" intensity={1.6} distance={5} />
      </group>

      {/* ─────────────────────────────────────────────────────────────
          3. L-SHAPED COMPUTER DESK & DRAWERS
      ───────────────────────────────────────────────────────────── */}
      {/* Desk Wing 1 (along left wall: X -3.2 to -1.6, Z -3.0 to +0.6) */}
      <mesh position={[-2.4, 2.0, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.12, 3.6]} />
        <meshStandardMaterial color="#423758" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Desk Wing 2 (along right wall: X -3.0 to +0.6, Z -3.2 to -1.6) */}
      <mesh position={[-1.2, 2.0, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.12, 1.6]} />
        <meshStandardMaterial color="#423758" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* L-Desk Glowing RGB Edge Trim (Precise flush edges - NO OVERHANG) */}
      {/* 1. Left inner edge (Z from -1.6 to +0.6, length 2.2, at X = -1.58) */}
      <mesh position={[-1.58, 2.01, -0.5]}>
        <boxGeometry args={[0.03, 0.03, 2.2]} />
        <meshBasicMaterial color="#d946ef" />
      </mesh>
      {/* 2. Right inner edge (X from -1.6 to +0.6, length 2.2, at Z = -1.58) */}
      <mesh position={[-0.5, 2.01, -1.58]}>
        <boxGeometry args={[2.2, 0.03, 0.03]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      {/* 3. Left front cap (X from -3.2 to -1.6, width 1.6, at Z = +0.6) */}
      <mesh position={[-2.4, 2.01, 0.6]}>
        <boxGeometry args={[1.6, 0.03, 0.03]} />
        <meshBasicMaterial color="#d946ef" />
      </mesh>
      {/* 4. Right side cap (Z from -3.2 to -1.6, depth 1.6, at X = +0.6) */}
      <mesh position={[0.6, 2.01, -2.4]}>
        <boxGeometry args={[0.03, 0.03, 1.6]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* Under-desk Left Drawer Unit */}
      <group position={[-2.6, 0.95, 0.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.9, 0.8]} />
          <meshStandardMaterial color="#241e33" roughness={0.5} />
        </mesh>
        {/* 3 Drawer handles */}
        {[-0.5, 0.0, 0.5].map((y, i) => (
          <mesh key={i} position={[0.56, y, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.35]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Desk Steel Legs */}
      {[
        [-0.5, 0.95, -1.7],
        [0.5, 0.95, -3.1],
        [-1.7, 0.95, -0.5],
        [-3.1, 0.95, -2.9]
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.9, 12]} />
          <meshStandardMaterial color="#0f0e14" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* ─────────────────────────────────────────────────────────────
          4. PC GAMING TOWER (UNDER RIGHT DESK)
      ───────────────────────────────────────────────────────────── */}
      <group position={[0.2, 0.85, -2.4]}>
        {/* Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.25, 1.1]} />
          <meshStandardMaterial color="#111116" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Front Tempered Glass */}
        <mesh position={[0.31, 0, 0]}>
          <boxGeometry args={[0.02, 1.2, 1.05]} />
          <meshPhysicalMaterial
            color="#08080c"
            transmission={0.6}
            opacity={0.8}
            transparent
            roughness={0.1}
          />
        </mesh>
        {/* Front Intake Dual RGB Fans */}
        <group ref={pcFanGroup} position={[0.32, 0.25, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.16, 0.025, 12, 24]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
        </group>
        <group position={[0.32, -0.25, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.16, 0.025, 12, 24]} />
            <meshBasicMaterial color="#d946ef" />
          </mesh>
        </group>
        <pointLight position={[0, 0, 0]} color="#00e5ff" intensity={0.8} distance={2} />
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. TRIPLE MONITORS & PERIPHERALS
      ───────────────────────────────────────────────────────────── */}
      {/* Center Main Monitor (VS Code Editor) */}
      <group position={[-1.75, 3.05, -1.75]} rotation={[0, Math.PI / 4, 0]}>
        {/* Stand */}
        <mesh position={[0, -0.75, -0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#0f0e14" metalness={0.9} />
        </mesh>
        <mesh position={[0, -1.02, -0.1]} castShadow>
          <boxGeometry args={[0.5, 0.04, 0.4]} />
          <meshStandardMaterial color="#0f0e14" metalness={0.8} />
        </mesh>
        {/* Monitor Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.9, 1.15, 0.06]} />
          <meshStandardMaterial color="#0f0e14" roughness={0.4} />
        </mesh>
        {/* Screen Display */}
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.84, 1.09]} />
          <meshBasicMaterial map={editorTex} />
        </mesh>
        {/* Webcam on top */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.06]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* Left Monitor (Terminal Matrix / Bash) */}
      <group position={[-2.75, 3.0, -1.0]} rotation={[0, Math.PI / 4 + 0.45, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.05, 0.06]} />
          <meshStandardMaterial color="#0f0e14" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.54, 0.99]} />
          <meshBasicMaterial map={terminalTex} />
        </mesh>
        {/* Stand */}
        <mesh position={[0, -0.75, -0.1]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#0f0e14" metalness={0.9} />
        </mesh>
      </group>

      {/* Right Monitor (Web App UI Preview) */}
      <group position={[-1.0, 3.0, -2.75]} rotation={[0, Math.PI / 4 - 0.45, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.05, 0.06]} />
          <meshStandardMaterial color="#0f0e14" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.54, 0.99]} />
          <meshBasicMaterial map={previewTex} />
        </mesh>
        {/* Stand */}
        <mesh position={[0, -0.75, -0.1]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#0f0e14" metalness={0.9} />
        </mesh>
      </group>

      {/* Studio Speakers (Left & Right of monitors) */}
      {[
        { pos: [-3.3, 2.3, -0.5], rot: Math.PI / 4 + 0.4 },
        { pos: [-0.5, 2.3, -3.3], rot: Math.PI / 4 - 0.4 }
      ].map((spk, idx) => (
        <group key={idx} position={spk.pos as [number, number, number]} rotation={[0, spk.rot, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.5, 0.35]} />
            <meshStandardMaterial color="#161420" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.1, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0, -0.1, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.02, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}

      {/* RGB Mousepad */}
      <group position={[-1.4, 2.07, -1.4]} rotation={[0, Math.PI / 4, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1.5, 0.015, 0.7]} />
          <meshStandardMaterial color="#0a0a0f" roughness={0.9} />
        </mesh>
        {/* Neon edge */}
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[1.52, 0.005, 0.72]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
      </group>

      {/* Mechanical Keyboard */}
      <group position={[-1.48, 2.11, -1.48]} rotation={[0, Math.PI / 4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.04, 0.32]} />
          <meshStandardMaterial color="#181822" roughness={0.4} />
        </mesh>
        {/* RGB Keycaps array */}
        {[-0.32, -0.16, 0, 0.16, 0.32].map((kx, i) =>
          [-0.08, 0, 0.08].map((kz, j) => (
            <mesh key={`${i}-${j}`} position={[kx, 0.03, kz]}>
              <boxGeometry args={[0.1, 0.025, 0.06]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#38bdf8' : '#f472b6'}
                emissive={i % 2 === 0 ? '#0284c7' : '#db2777'}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Gaming Mouse */}
      <group position={[-0.95, 2.11, -1.2]} rotation={[0, Math.PI / 4 - 0.1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.04, 0.2]} />
          <meshStandardMaterial color="#1f1d2b" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.02, 0.01, 0.14]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
      </group>

      {/* Steaming Coffee Mug */}
      <group position={[-0.3, 2.15, -2.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.22, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.02, 12, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Coffee Liquid */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.02, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.3} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          6. ERGONOMIC GAMING CHAIR
      ───────────────────────────────────────────────────────────── */}
      <group position={[-0.2, 0.0, -0.2]} rotation={[0, Math.PI / 4, 0]}>
        {/* 5-Star Wheel Base */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
          <meshStandardMaterial color="#1e1b2e" />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 2 * Math.PI) / 5;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.08, 0.35]}>
                <boxGeometry args={[0.06, 0.05, 0.7]} />
                <meshStandardMaterial color="#1e1b2e" />
              </mesh>
              <mesh position={[0, 0.04, 0.68]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial color="#090810" />
              </mesh>
            </group>
          );
        })}
        {/* Hydraulic Cylinder */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.6, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Seat Cushion */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.8, 0.14, 0.8]} />
          <meshStandardMaterial color="#28223a" roughness={0.6} />
        </mesh>
        {/* Backrest */}
        <group position={[0, 1.45, -0.35]} rotation={[-0.1, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.75, 1.25, 0.12]} />
            <meshStandardMaterial color="#28223a" roughness={0.6} />
          </mesh>
          {/* Headrest Cushion */}
          <mesh position={[0, 0.5, 0.08]}>
            <boxGeometry args={[0.45, 0.2, 0.1]} />
            <meshStandardMaterial color="#d946ef" roughness={0.4} />
          </mesh>
          {/* Lumbar Cushion */}
          <mesh position={[0, -0.25, 0.08]}>
            <boxGeometry args={[0.5, 0.22, 0.1]} />
            <meshStandardMaterial color="#00e5ff" roughness={0.4} />
          </mesh>
        </group>
        {/* Armrests */}
        {[-0.42, 0.42].map((armX, idx) => (
          <group key={idx} position={[armX, 1.05, -0.05]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.35, 12]} />
              <meshStandardMaterial color="#090810" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.1, 0.04, 0.4]} />
              <meshStandardMaterial color="#28223a" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─────────────────────────────────────────────────────────────
          7. LEFT WALL SHELVES (RAK BUKU - PROJECTS HOTSPOT)
      ───────────────────────────────────────────────────────────── */}
      {/* Lower Shelf (The Bookshelf - Clicking triggers Projects!) */}
      <group
        position={[-3.3, 4.0, -1.0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectHotspot('projects');
        }}
        onPointerOver={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Shelf Plank */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.08, 2.8]} />
          <meshStandardMaterial color="#5d422f" roughness={0.7} />
        </mesh>
        {/* Metal Brackets */}
        {[-0.9, 0.9].map((bz, i) => (
          <mesh key={i} position={[-0.2, -0.15, bz]}>
            <boxGeometry args={[0.3, 0.25, 0.04]} />
            <meshStandardMaterial color="#090810" metalness={0.9} />
          </mesh>
        ))}

        {/* Colorful Standing Books Collection */}
        {[
          { z: -1.0, w: 0.14, h: 0.85, c: '#06b6d4', rot: 0 },
          { z: -0.84, w: 0.16, h: 0.95, c: '#3b82f6', rot: 0 },
          { z: -0.66, w: 0.12, h: 0.8, c: '#ec4899', rot: 0 },
          { z: -0.52, w: 0.14, h: 0.9, c: '#10b981', rot: 0 },
          { z: -0.36, w: 0.15, h: 0.82, c: '#f59e0b', rot: 0 },
          { z: -0.15, w: 0.14, h: 0.88, c: '#8b5cf6', rot: 0.25 }, // Tilted leaning book!
          { z: 0.4, w: 0.5, h: 0.14, c: '#0284c7', rot: 0, stack: true },
          { z: 0.4, w: 0.46, h: 0.14, c: '#9333ea', rot: 0, stackY: 0.14 }
        ].map((book, idx) => (
          <mesh
            key={idx}
            position={[0, book.stack ? 0.07 : book.stackY ? 0.21 : book.h / 2 + 0.04, book.z]}
            rotation={[0, 0, book.rot]}
            castShadow
          >
            <boxGeometry args={[0.45, book.h, book.w]} />
            <meshStandardMaterial color={book.c} roughness={0.4} />
          </mesh>
        ))}

        {/* Small tech gadget device on shelf */}
        <mesh position={[0, 0.15, 0.95]} castShadow>
          <boxGeometry args={[0.4, 0.22, 0.4]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Upper Left Shelf (Tech Gadgets & PCB) */}
      <group position={[-3.3, 5.2, -1.0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.08, 2.8]} />
          <meshStandardMaterial color="#5d422f" roughness={0.7} />
        </mesh>
        {/* Mini Drone model */}
        <group position={[0, 0.15, -0.6]}>
          <mesh>
            <boxGeometry args={[0.2, 0.05, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {[-0.18, 0.18].map((dx) =>
            [-0.18, 0.18].map((dz) => (
              <mesh key={`${dx}-${dz}`} position={[dx, 0.05, dz]}>
                <cylinderGeometry args={[0.08, 0.08, 0.01, 12]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            ))
          )}
        </group>
        {/* PCB Board / Microcontroller */}
        <group position={[0, 0.06, 0.2]}>
          <mesh>
            <boxGeometry args={[0.3, 0.02, 0.45]} />
            <meshStandardMaterial color="#15803d" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.12, 0.03, 0.12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        </group>
        {/* External Drive */}
        <mesh position={[0, 0.1, 0.9]}>
          <boxGeometry args={[0.35, 0.15, 0.4]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          8. RIGHT WALL SHELVES & FRAMED PHOTO OF HANANI
      ───────────────────────────────────────────────────────────── */}
      {/* Framed Wall Portrait Photo (Profile Picture from Hero / Admin) */}
      <group position={[0.2, 5.0, -3.88]}>
        {/* Outer Frame (Matte Black / Slate) */}
        <mesh castShadow>
          <boxGeometry args={[2.0, 2.0, 0.06]} />
          <meshStandardMaterial color="#0c0a14" roughness={0.4} metalness={0.25} />
        </mesh>
        {/* Inner Passe-Partout Matting Trim */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.88, 1.88]} />
          <meshStandardMaterial color="#1e182e" roughness={0.7} />
        </mesh>
        {/* Profile Photo Display Surface */}
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.76, 1.76]} />
          <meshBasicMaterial map={profileTexture || wallArtTex} />
        </mesh>
        {/* Soft Gallery Accent Light directly illuminating the photo */}
        <pointLight position={[0, 1.1, 0.35]} color="#fff7ed" intensity={1.8} distance={3.5} />
      </group>

      {/* Upper Right Shelf (TECH STACK HOTSPOT) */}
      <group
        position={[2.0, 4.4, -3.3]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectHotspot('tech');
        }}
        onPointerOver={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.08, 0.7]} />
          <meshStandardMaterial color="#5d422f" roughness={0.7} />
        </mesh>
        {/* Tech device box / server */}
        <mesh position={[-0.7, 0.16, 0]}>
          <boxGeometry args={[0.65, 0.24, 0.45]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Books on right shelf */}
        {[
          { x: 0.1, c: '#38bdf8' },
          { x: 0.28, c: '#a855f7' },
          { x: 0.44, c: '#34d399' }
        ].map((bk, i) => (
          <mesh key={i} position={[bk.x, 0.4, 0]}>
            <boxGeometry args={[0.14, 0.72, 0.42]} />
            <meshStandardMaterial color={bk.c} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Lower Right Shelf (Handheld Console - Switch) */}
      <group position={[2.0, 3.2, -3.3]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.08, 0.7]} />
          <meshStandardMaterial color="#5d422f" roughness={0.7} />
        </mesh>
        {/* Nintendo Switch style console */}
        <group position={[0.4, 0.1, 0]} rotation={[-0.4, 0, 0]}>
          {/* Black Screen */}
          <mesh>
            <boxGeometry args={[0.45, 0.16, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          {/* Blue Left Joycon */}
          <mesh position={[-0.28, 0, 0]}>
            <boxGeometry args={[0.1, 0.16, 0.04]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Red Right Joycon */}
          <mesh position={[0.28, 0, 0]}>
            <boxGeometry args={[0.1, 0.16, 0.04]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          9. POTTED PLANT IN CORNER
      ───────────────────────────────────────────────────────────── */}
      <group position={[-3.1, 0.0, 1.8]}>
        {/* Lavender Ceramic Pot */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.28, 1.0, 16]} />
          <meshStandardMaterial color="#e879f9" roughness={0.5} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 16]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        {/* Lush Tropical Leaves */}
        {[
          { rot: [0.3, 0.2, 0.4], pos: [0.1, 1.3, 0.1], s: 0.9 },
          { rot: [-0.3, 1.4, -0.3], pos: [-0.1, 1.4, 0.15], s: 1.0 },
          { rot: [0.4, 2.6, 0.2], pos: [0.15, 1.5, -0.1], s: 1.1 },
          { rot: [-0.2, 3.8, -0.4], pos: [-0.15, 1.45, -0.1], s: 1.0 },
          { rot: [0.1, 5.0, 0.3], pos: [0.0, 1.6, 0.0], s: 1.2 }
        ].map((leaf, i) => (
          <group
            key={i}
            position={leaf.pos as [number, number, number]}
            rotation={leaf.rot as [number, number, number]}
            scale={leaf.s}
          >
            <mesh castShadow>
              <coneGeometry args={[0.18, 0.7, 4]} />
              <meshStandardMaterial color="#22c55e" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─────────────────────────────────────────────────────────────
          10. LIGHTING ENVIRONMENT (BRIGHT & CRISP ISOMETRIC)
      ───────────────────────────────────────────────────────────── */}
      <ambientLight color="#9d8ebb" intensity={3.0} />
      {/* Key Sunlight / Isometric Sunlight */}
      <directionalLight
        position={[10, 18, 10]}
        intensity={2.8}
        color="#fff9f0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* Soft Fill Light from Opposite Side */}
      <directionalLight position={[-8, 14, 8]} intensity={1.6} color="#c4b5fd" />
      {/* Overhead Room Light */}
      <pointLight position={[-0.8, 5.4, -0.8]} color="#ffffff" intensity={3.5} distance={12} />
      {/* Desk Cyan Glow */}
      <pointLight position={[-1.6, 2.8, -1.6]} color="#22d3ee" intensity={3.2} distance={7} />
      {/* Wall Magenta Glow */}
      <pointLight position={[0.2, 5.8, -3.2]} color="#d946ef" intensity={2.6} distance={8} />
    </group>
  );
}
