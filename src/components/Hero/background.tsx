"use client"

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import type { OGLRenderingContext } from 'ogl';
import { useEffect, useRef, useState } from 'react';

import '../../app/globals.css';

interface LineWavesProps {
  speed?: number;
  innerLineCount?: number;
  outerLineCount?: number;
  warpIntensity?: number;
  rotation?: number;
  edgeFadeWidth?: number;
  colorCycleSpeed?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
  lightMode?: boolean;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;
uniform float uLightMode;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  if (uLightMode > 0.5) {
    vec3 weights = pow(max(vec3(rChannel, gChannel, bChannel), vec3(0.0)), vec3(3.0));
    float weightSum = max(weights.r + weights.g + weights.b, 0.0001);
    vec3 chroma = (weights.r * uColor1 + weights.g * uColor2 + weights.b * uColor3) / weightSum;
    float neutral = min(chroma.r, min(chroma.g, chroma.b));
    chroma = max(chroma - vec3(neutral * 0.92), vec3(0.0));
    float peak = max(chroma.r, max(chroma.g, chroma.b));
    chroma = pow(clamp(chroma / max(peak, 0.0001), 0.0, 1.0), vec3(1.08));
    float ink = clamp(max(rChannel, max(gChannel, bChannel)) * uBrightness * 1.15, 0.0, 0.92);
    gl_FragColor = vec4(mix(vec3(1.0), chroma, ink), 1.0);
  } else {
    gl_FragColor = vec4(col, alpha);
  }
}
`;

interface WebGLSupportResult {
  supported: boolean;
  version: 1 | 2;
  canvas: HTMLCanvasElement | null;
}

function detectWebGL(): WebGLSupportResult {
  if (typeof window === 'undefined') {
    return { supported: false, version: 1, canvas: null };
  }

  const attributes: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: 'default'
  };

  // 1. Try WebGL 2 on a dedicated canvas
  try {
    const canvas2 = document.createElement('canvas');
    const gl2 = canvas2.getContext('webgl2', attributes);
    if (gl2) {
      return { supported: true, version: 2, canvas: canvas2 };
    }
  } catch {
    // Continue to WebGL 1
  }

  // 2. Try WebGL 1 on a fresh canvas (avoiding context lock on the same element)
  try {
    const canvas1 = document.createElement('canvas');
    const gl1 =
      canvas1.getContext('webgl', attributes) ||
      canvas1.getContext('experimental-webgl', attributes);
    if (gl1) {
      return { supported: true, version: 1, canvas: canvas1 };
    }
  } catch {
    // WebGL unavailable
  }

  return { supported: false, version: 1, canvas: null };
}

export default function LineWaves({
  speed = 0.3,
  innerLineCount = 32.0,
  outerLineCount = 36.0,
  warpIntensity = 1.0,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 1.0,
  brightness = 0.2,
  color1 = '#ffffff',
  color2 = '#ffffff',
  color3 = '#ffffff',
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
  lightMode = false
}: LineWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // On mobile screens (<768px) or hidden containers, use the lightweight SVG fallback to save CPU and maximize performance
    if (window.innerWidth < 768 || container.offsetWidth === 0) {
      setWebglSupported(false);
      return;
    }

    // Check if WebGL is supported safely without triggering uncaught errors
    const webglInfo = detectWebGL();
    if (!webglInfo.supported || !webglInfo.canvas) {
      setWebglSupported(false);
      return;
    }

    let animationFrameId: number;
    let renderer: Renderer | null = null;
    let resizeListener: (() => void) | null = null;

    try {
      renderer = new Renderer({
        canvas: webglInfo.canvas,
        webgl: webglInfo.version,
        alpha: true,
        premultipliedAlpha: false
      });

      const gl: OGLRenderingContext = renderer.gl;
      if (!gl) {
        setWebglSupported(false);
        return;
      }
      const canvas: HTMLCanvasElement = gl.canvas;

      gl.clearColor(0, 0, 0, 0);

      let currentMouse = [0.5, 0.5];
      let targetMouse = [0.5, 0.5];

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        targetMouse = [
          (e.clientX - rect.left) / rect.width,
          1.0 - (e.clientY - rect.top) / rect.height
        ];
      };

      const handleMouseLeave = () => {
        targetMouse = [0.5, 0.5];
      };

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(animationFrameId);
        setWebglSupported(false);
      };

      canvas.addEventListener('webglcontextlost', handleContextLost, false);

      let program: Program | null = null;

      const resize = () => {
        if (!renderer || !container) return;
        const width = Math.max(container.offsetWidth || 1, 1);
        const height = Math.max(container.offsetHeight || 1, 1);
        renderer.setSize(width, height);
        if (program) {
          program.uniforms.uResolution.value = [
            canvas.width,
            canvas.height,
            canvas.width / Math.max(canvas.height, 1)
          ];
        }
      };

      resizeListener = resize;
      window.addEventListener('resize', resize);
      resize();

      const geometry = new Triangle(gl);
      const rotationRad = (rotation * Math.PI) / 180;
      const initialResolution = [
        canvas.width || 300,
        canvas.height || 150,
        (canvas.width || 300) / Math.max(canvas.height || 150, 1)
      ];

      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: initialResolution },
          uSpeed: { value: speed },
          uInnerLines: { value: innerLineCount },
          uOuterLines: { value: outerLineCount },
          uWarpIntensity: { value: warpIntensity },
          uRotation: { value: rotationRad },
          uEdgeFadeWidth: { value: edgeFadeWidth },
          uColorCycleSpeed: { value: colorCycleSpeed },
          uBrightness: { value: brightness },
          uColor1: { value: hexToVec3(color1) },
          uColor2: { value: hexToVec3(color2) },
          uColor3: { value: hexToVec3(color3) },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uMouseInfluence: { value: mouseInfluence },
          uEnableMouse: { value: enableMouseInteraction },
          uLightMode: { value: lightMode ? 1 : 0 }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });
      container.appendChild(canvas);

      if (enableMouseInteraction) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
      }

      function update(time: number) {
        animationFrameId = requestAnimationFrame(update);
        if (!program || !renderer) return;
        program.uniforms.uTime.value = time * 0.001;

        if (enableMouseInteraction) {
          currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
          currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
          program.uniforms.uMouse.value[0] = currentMouse[0];
          program.uniforms.uMouse.value[1] = currentMouse[1];
        } else {
          program.uniforms.uMouse.value[0] = 0.5;
          program.uniforms.uMouse.value[1] = 0.5;
        }

        renderer.render({ scene: mesh });
      }

      animationFrameId = requestAnimationFrame(update);
      setWebglSupported(true);

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (resizeListener) {
          window.removeEventListener('resize', resizeListener);
        }
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        if (enableMouseInteraction) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
        if (container.contains(canvas)) {
          container.removeChild(canvas);
        }
        try {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          // Ignore error during cleanup
        }
      };
    } catch {
      setWebglSupported(false);
      if (renderer?.gl?.canvas && container.contains(renderer.gl.canvas as HTMLCanvasElement)) {
        container.removeChild(renderer.gl.canvas as HTMLCanvasElement);
      }
    }
  }, [
    speed,
    innerLineCount,
    outerLineCount,
    warpIntensity,
    rotation,
    edgeFadeWidth,
    colorCycleSpeed,
    brightness,
    color1,
    color2,
    color3,
    enableMouseInteraction,
    mouseInfluence,
    lightMode
  ]);

  const handleFallbackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableMouseInteraction) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="line-waves-container relative overflow-hidden select-none pointer-events-auto"
      onMouseMove={handleFallbackMouseMove}
      style={{ width: '100%', height: '100%' }}
    >
      {webglSupported === false && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Ambient Glowing Radial Mesh */}
          <div
            className="absolute inset-0 transition-all duration-300 ease-out"
            style={{
              background: `radial-gradient(circle 600px at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${color3}30, transparent 70%),
                           radial-gradient(ellipse 80% 50% at 75% 25%, ${color2}40, transparent 65%),
                           radial-gradient(ellipse 60% 60% at 25% 75%, ${color1}55, transparent 60%)`,
              filter: 'blur(30px)'
            }}
          />

          {/* Animated Wave Contours */}
          <div
            className="absolute inset-[-50%] w-[200%] h-[200%] flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <svg
              className="w-full h-full opacity-40"
              viewBox="0 0 1440 900"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="fallbackGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color1} stopOpacity={brightness * 1.8} />
                  <stop offset="50%" stopColor={color2} stopOpacity={brightness * 3.5} />
                  <stop offset="100%" stopColor={color3} stopOpacity={brightness * 2.8} />
                </linearGradient>
                <linearGradient id="fallbackGrad2" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={color3} stopOpacity={brightness * 2.8} />
                  <stop offset="50%" stopColor={color2} stopOpacity={brightness * 3.2} />
                  <stop offset="100%" stopColor={color1} stopOpacity={brightness * 1.8} />
                </linearGradient>
              </defs>
              {/* Primary flowing contour waves */}
              <g className="animate-[pulse_6s_ease-in-out_infinite]">
                <path
                  d="M-200 150 C 200 80, 600 240, 1000 140 C 1300 70, 1500 220, 1800 150"
                  stroke="url(#fallbackGrad1)"
                  strokeWidth="1.5"
                />
                <path
                  d="M-200 250 C 150 180, 550 340, 950 240 C 1250 170, 1450 320, 1800 250"
                  stroke="url(#fallbackGrad2)"
                  strokeWidth="2"
                />
                <path
                  d="M-200 350 C 250 280, 650 440, 1050 340 C 1350 270, 1550 420, 1800 350"
                  stroke="url(#fallbackGrad1)"
                  strokeWidth="1.5"
                />
                <path
                  d="M-200 450 C 180 380, 580 540, 980 440 C 1280 370, 1480 520, 1800 450"
                  stroke="url(#fallbackGrad2)"
                  strokeWidth="2"
                />
                <path
                  d="M-200 550 C 220 480, 620 640, 1020 540 C 1320 470, 1520 620, 1800 550"
                  stroke="url(#fallbackGrad1)"
                  strokeWidth="1.5"
                />
                <path
                  d="M-200 650 C 160 580, 560 740, 960 640 C 1260 570, 1460 720, 1800 650"
                  stroke="url(#fallbackGrad2)"
                  strokeWidth="2"
                />
                <path
                  d="M-200 750 C 240 680, 640 840, 1040 740 C 1340 670, 1540 820, 1800 750"
                  stroke="url(#fallbackGrad1)"
                  strokeWidth="1.5"
                />
              </g>
              {/* Secondary flowing contour waves */}
              <g className="animate-[pulse_9s_ease-in-out_infinite_reverse] opacity-70">
                <path
                  d="M-200 200 C 300 280, 700 120, 1100 220 C 1400 290, 1600 140, 1800 200"
                  stroke="url(#fallbackGrad2)"
                  strokeWidth="1"
                />
                <path
                  d="M-200 400 C 280 480, 680 320, 1080 420 C 1380 490, 1580 340, 1800 400"
                  stroke="url(#fallbackGrad1)"
                  strokeWidth="1.5"
                />
                <path
                  d="M-200 600 C 320 680, 720 520, 1120 620 C 1420 690, 1620 540, 1800 600"
                  stroke="url(#fallbackGrad2)"
                  strokeWidth="1"
                />
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
