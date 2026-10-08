'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

const CARD_GLB_URL = '/lanyard/card.glb';
const LANYARD_TEXTURE_URL = '/lanyard/lanyard.png';

// Preload 3D model & default textures
if (typeof window !== 'undefined') {
  useGLTF.preload(CARD_GLB_URL);
  useTexture.preload(LANYARD_TEXTURE_URL);
  useTexture.preload('/image/card-back.png');
  useTexture.preload('/image/profil.jpeg');
}

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: any;
    meshLineMaterial: any;
  }
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  className?: string;
  showFlipButton?: boolean;
  anchorY?: number;
  segmentLength?: number;
  isFlippedProp?: boolean;
  onFlipToggle?: () => void;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  className = '',
  showFlipButton = true,
  anchorY = 4,
  segmentLength = 1,
  isFlippedProp,
  onFlipToggle
}: LanyardProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = isFlippedProp !== undefined ? isFlippedProp : internalFlipped;
  const handleToggleFlip = () => {
    if (onFlipToggle) {
      onFlipToggle();
    } else {
      setInternalFlipped(f => !f);
    }
  };

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    return (
      <div className={`relative flex items-center justify-center ${className || 'w-full h-[450px] md:h-[550px]'}`}>
        <div className="w-56 h-80 rounded-3xl border border-border/60 bg-surface/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-text/80">Memuat Lanyard 3D...</p>
          <p className="text-xs text-text/50 mt-1">Interaktif &amp; Realistis</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative z-10 w-full flex justify-center items-center select-none ${className || 'h-[460px] md:h-[550px] lg:h-[600px]'}`}>
      <Canvas
        camera={{ position: isMobile ? [position[0], position[1] + 0.1, position[2] + 1.2] : position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band
              isMobile={isMobile}
              frontImage={frontImage}
              backImage={backImage}
              imageFit={imageFit}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth}
              isFlipped={isFlipped}
              onToggleFlip={handleToggleFlip}
              anchorY={anchorY}
              segmentLength={segmentLength}
            />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>

      {showFlipButton && (
        <button
          type="button"
          onClick={handleToggleFlip}
          className="absolute bottom-2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-surface/85 hover:bg-surface border border-border/80 text-text/90 hover:text-primary text-xs font-medium backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
          title="Klik untuk membalik kartu lanyard"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-500 text-primary ${isFlipped ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span className="font-semibold">{isFlipped ? 'Sisi Belakang' : 'Sisi Depan'}</span>
          <span className="text-[11px] text-text/60 group-hover:text-text/90">
            {isFlipped ? '(Lihat Depan ↺)' : '(Lihat Belakang ↺)'}
          </span>
        </button>
      )}
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
  isFlipped?: boolean;
  onToggleFlip?: () => void;
  anchorY?: number;
  segmentLength?: number;
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  isFlipped = false,
  onToggleFlip,
  anchorY = 4,
  segmentLength = 1
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const clampPos = new THREE.Vector3();
  const cardQuat = new THREE.Quaternion();
  const cardTrans = new THREE.Vector3();
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const targetDragQuat = new THREE.Quaternion();
  const dragStartTime = useRef(0);
  const dragStartPos = useRef(new THREE.Vector2());

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }

    return body.lerped;
  };

  const { nodes, materials } = useGLTF(CARD_GLB_URL) as any;
  const texture = useTexture(lanyardImage || LANYARD_TEXTURE_URL) as THREE.Texture;
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL) as THREE.Texture;
  const backTex = useTexture(backImage || BLANK_PIXEL) as THREE.Texture;

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base?.map as THREE.Texture | undefined;
    if (!baseMap) return null;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image as any;
    if (!baseImg || !baseImg.width || !baseImg.height) return baseMap;

    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: any, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.drawImage(img, dx, dy, dw, dh);
      // Subtle elevated badge border highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = Math.max(2, Math.round(W * 0.003));
      ctx.strokeRect(rx + 2, ry + 2, rw - 4, rh - 4);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base?.map]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  const seg = segmentLength || 1;
  const topY = anchorY !== undefined ? anchorY : 4;

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], seg]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], seg]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], seg]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, -0.05]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
      targetDragQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), isFlipped ? Math.PI : 0);
      card.current?.setNextKinematicRotation(targetDragQuat);
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        const lerped = getLerped(ref.current);
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())));
        lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      // Rigidly anchor strap tip (curve.points[0]) directly to the clamp loop hole in world space
      if (card.current) {
        const t = card.current.translation();
        const r = card.current.rotation();
        cardQuat.set(r.x, r.y, r.z, r.w);
        cardTrans.set(t.x, t.y, t.z);
        // Anchor point is at [0, 1.45, -0.05] in card's local space (exactly at the clamp loop hole)
        clampPos.set(0, 1.45, -0.05).applyQuaternion(cardQuat).add(cardTrans);
        curve.points[0].copy(clampPos);

        // Smooth physical torque towards target angle
        euler.setFromQuaternion(cardQuat, 'YXZ');
        let diffY = (isFlipped ? Math.PI : 0) - euler.y;
        while (diffY > Math.PI) diffY -= 2 * Math.PI;
        while (diffY < -Math.PI) diffY += 2 * Math.PI;

        ang.copy(card.current.angvel());
        card.current.setAngvel({ x: ang.x * 0.95, y: ang.y + diffY * 3.5 - ang.y * 0.25, z: ang.z * 0.95 }, true);
      } else if (j3.current) {
        curve.points[0].copy(j3.current.translation());
      }

      curve.points[1].copy(getLerped(j2.current));
      curve.points[2].copy(getLerped(j1.current));
      curve.points[3].copy(fixed.current.translation());
      if (band.current?.geometry) {
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, topY, 0]}>
        {/* Realistic top suspension pin & chrome ring */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.08, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.04, 16, 32]} />
          <meshStandardMaterial color="#d4d4d4" metalness={0.95} roughness={0.15} />
        </mesh>

        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.3, -0.1, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody position={[0.6, -0.2, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody position={[0.9, -0.3, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.08]} />
        </RigidBody>
        <RigidBody
          position={[1.2, -0.5, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              const duration = performance.now() - dragStartTime.current;
              const distance = dragStartPos.current.distanceTo(new THREE.Vector2(e.point.x, e.point.y));
              if (duration < 250 && distance < 0.25) {
                onToggleFlip?.();
              }
              drag(false);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              dragStartTime.current = performance.now();
              dragStartPos.current.set(e.point.x, e.point.y);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap || materials.base?.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 0.8}
                clearcoatRoughness={0.15}
                roughness={0.25}
                metalness={0.1}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={texture}
          repeat={seg < 0.8 ? [-2.2, 1] : [-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
