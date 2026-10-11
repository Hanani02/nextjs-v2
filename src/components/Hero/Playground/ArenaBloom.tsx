'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface ArenaBloomProps {
  strength?: number;
  radius?: number;
  threshold?: number;
}

export default function ArenaBloom({
  strength = 0.65,
  radius = 0.38,
  threshold = 0.82,
}: ArenaBloomProps) {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    comp.renderToScreen = true;

    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      strength,
      radius,
      threshold
    );
    comp.addPass(bloomPass);

    return comp;
  }, [gl, scene, camera, size.width, size.height, strength, radius, threshold]);

  // Adjust resolution on window/canvas resize
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);

  // Cleanup WebGL render targets on unmount
  useEffect(() => {
    return () => {
      composer.dispose();
    };
  }, [composer]);

  // Render via composer at priority 1 (after physics and animations)
  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}
