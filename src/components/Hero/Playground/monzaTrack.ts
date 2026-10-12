import * as THREE from 'three';

/**
 * Autodromo Nazionale Monza - Canonical Spline & Physics Geometry
 * Coordinates in 3D world space (X, Z).
 * Start/Finish is on the Rettifilo Straight at (0, -25).
 * Total length ~340 units, width ~125 units, depth ~67 units.
 */

// 1. Precise Control Points for the Monza Circuit Spline
export const MONZA_CONTROL_POINTS: Array<[number, number]> = [
  // Start / Finish on Rettifilo Straight
  [0, -25],
  [18, -25],
  [32, -25],

  // Variante del Rettifilo (Prima Variante Chicane - smooth flowing entry & exit)
  [43, -24.5],
  [50, -22],   // Right flick
  [53, -16],   // Apex
  [53.5, -9],  // Transition to Curva Grande

  // Curva Grande (Curva Biassono - Turn 3: long high-speed sweeping right curve)
  [56, 1],
  [55, 12],
  [50, 22],
  [43, 28],

  // Variante della Roggia (Turns 4 & 5)
  [37, 31],
  [31, 35],
  [27, 40],

  // Curva di Lesmo 1 & 2
  [20, 42.5],
  [11, 41.5],
  [3, 38],
  [-3, 34],
  [-8, 27],

  // Curva del Serraglio & Straight towards Ascari
  [-13, 18],
  [-17, 10],
  [-21, 3],

  // Variante Ascari (Turns 8, 9, 10: high-speed chicane)
  [-27, 1],
  [-33, 3],
  [-39, 2.5],

  // Back Straight
  [-46, 1.5],
  [-54, -0.5],

  // Curva Parabolica (Curva Alboreto - Turn 11)
  [-61, -4],
  [-65, -11],
  [-63, -19],
  [-54, -24.5],
  [-32, -25],
  [-15, -25],
];

export const MONZA_TRACK_WIDTH = 9.2; // Optimized wide F1 track width without chicane pinch/overlap
export const MONZA_CAR_RADIUS = 0.7; // Collision radius of the car
export const MONZA_MAX_DEVIATION = 4.65; // Max allowed distance from centerline before hitting 3D barriers

export interface TrackPoint {
  x: number;
  z: number;
  tx: number; // Tangent X
  tz: number; // Tangent Z
  nx: number; // Perpendicular Left Normal X
  nz: number; // Perpendicular Left Normal Z
  distanceAlongTrack: number;
  isCorner: boolean;
  cornerName?: string;
}

/**
 * Build sampled dense track points using Catmull-Rom spline interpolation.
 */
function generateSampledTrack(sampleCount: number = 360): TrackPoint[] {
  // Create 3D points on X-Z plane
  const points3D = MONZA_CONTROL_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(points3D, true, 'centripetal', 0.5);

  // getSpacedPoints returns sampleCount + 1 points where index 0 and sampleCount are duplicates.
  // Take exactly sampleCount points to prevent duplicate point seam and index jump.
  const rawPoints = curve.getSpacedPoints(sampleCount).slice(0, sampleCount);
  const trackPoints: TrackPoint[] = [];

  let accumulatedDist = 0;

  for (let i = 0; i < sampleCount; i++) {
    const curr = rawPoints[i];
    const next = rawPoints[(i + 1) % sampleCount];
    const prev = rawPoints[(i - 1 + sampleCount) % sampleCount];

    // Tangent direction
    const tVec = new THREE.Vector3().subVectors(next, prev).normalize();
    // Normal (perpendicular to tangent on X-Z plane)
    const nVec = new THREE.Vector3(-tVec.z, 0, tVec.x).normalize();

    if (i > 0) {
      accumulatedDist += curr.distanceTo(prev);
    }

    // Curvature estimation: angle between (curr - prev) and (next - curr)
    const d1 = new THREE.Vector3().subVectors(curr, prev).normalize();
    const d2 = new THREE.Vector3().subVectors(next, curr).normalize();
    const angle = d1.angleTo(d2);
    const isCorner = angle > 0.038;

    // Corner name attribution
    let cornerName: string | undefined;
    if (curr.x > 40 && curr.x < 55 && curr.z < -14) {
      cornerName = 'Prima Variante';
    } else if (curr.x > 43 && curr.z >= -14 && curr.z < 26) {
      cornerName = 'Curva Grande';
    } else if (curr.x > 25 && curr.x <= 40 && curr.z >= 26 && curr.z < 41) {
      cornerName = 'Variante della Roggia';
    } else if (curr.x > 8 && curr.x <= 25 && curr.z >= 39) {
      cornerName = 'Lesmo 1';
    } else if (curr.x <= 8 && curr.x >= -10 && curr.z >= 26) {
      cornerName = 'Lesmo 2';
    } else if (curr.x >= -22 && curr.x < -10 && curr.z >= 2 && curr.z < 26) {
      cornerName = 'Curva del Serraglio';
    } else if (curr.x <= -22 && curr.x >= -40 && curr.z >= 0 && curr.z <= 4) {
      cornerName = 'Variante Ascari';
    } else if (curr.x <= -50 && curr.z <= 2) {
      cornerName = 'Curva Parabolica';
    } else if (curr.z <= -24) {
      cornerName = 'Rettifilo Straight';
    }

    trackPoints.push({
      x: curr.x,
      z: curr.z,
      tx: tVec.x,
      tz: tVec.z,
      nx: nVec.x,
      nz: nVec.z,
      distanceAlongTrack: accumulatedDist,
      isCorner,
      cornerName,
    });
  }

  return trackPoints;
}

export const MONZA_SAMPLED_POINTS = generateSampledTrack(360);

// Bounding box for 2D minimap scaling
export const MONZA_BOUNDS = {
  minX: -68,
  maxX: 58,
  minZ: -28,
  maxZ: 44,
};

/**
 * Sequential Checkpoints for Monza Circuit
 * 0: Start / Finish Line (Rettifilo)
 * 1: Prima Variante exit / Curva Grande entry
 * 2: Variante della Roggia exit / Lesmo 1
 * 3: Lesmo 2 exit / Serraglio
 * 4: Variante Ascari exit
 * 5: Curva Parabolica apex / exit
 */
export const MONZA_CHECKPOINTS = [
  {
    id: 0,
    name: 'Start / Finish',
    center: [0, -25] as [number, number],
    width: 10.5,
    depth: 3.5,
    normal: [1, 0] as [number, number], // Car crosses towards +X
  },
  {
    id: 1,
    name: 'Prima Variante Exit',
    center: [53.2, -15] as [number, number],
    width: 10.5,
    depth: 3.5,
    normal: [0.1, 1.0] as [number, number],
  },
  {
    id: 2,
    name: 'Roggia Chicane Exit',
    center: [27.1, 40] as [number, number],
    width: 10.5,
    depth: 3.5,
    normal: [-0.8, 0.6] as [number, number],
  },
  {
    id: 3,
    name: 'Lesmo 2 Exit',
    center: [-8.2, 27] as [number, number],
    width: 10.5,
    depth: 3.5,
    normal: [-0.5, -0.85] as [number, number],
  },
  {
    id: 4,
    name: 'Variante Ascari Exit',
    center: [-39.1, 2.5] as [number, number],
    width: 10.5,
    depth: 3.5,
    normal: [-1, -0.1] as [number, number],
  },
  {
    id: 5,
    name: 'Curva Parabolica Exit',
    center: [-54.1, -24.5] as [number, number],
    width: 10.5,
    depth: 3.5,
    normal: [0.97, -0.25] as [number, number],
  },
];

/**
 * Find the closest point and segment on the Monza centerline.
 * Uses localized window search for O(1) frame budget efficiency.
 */
export function findClosestTrackPoint(
  x: number,
  z: number,
  hintIdx: number = 0
): {
  index: number;
  projX: number;
  projZ: number;
  dist: number;
  normalX: number;
  normalZ: number;
} {
  const points = MONZA_SAMPLED_POINTS;
  const N = points.length;

  let bestIdx = hintIdx;
  let bestDistSq = Infinity;

  // Search window of points around hint, or full search if hint is distant
  const windowSize = 35;
  const isLocal =
    hintIdx >= 0 &&
    hintIdx < N &&
    Math.hypot(points[hintIdx].x - x, points[hintIdx].z - z) < 28;

  const start = isLocal ? hintIdx - windowSize : 0;
  const end = isLocal ? hintIdx + windowSize : N;

  for (let k = start; k <= end; k++) {
    const i = ((k % N) + N) % N;
    const pt = points[i];
    const dx = pt.x - x;
    const dz = pt.z - z;
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestIdx = i;
    }
  }

  // Refine projection on adjacent line segment
  const i0 = bestIdx;
  const i1 = (bestIdx + 1) % N;
  const p0 = points[i0];
  const p1 = points[i1];

  const segX = p1.x - p0.x;
  const segZ = p1.z - p0.z;
  const segLenSq = segX * segX + segZ * segZ || 0.0001;

  const t = Math.max(0, Math.min(1, ((x - p0.x) * segX + (z - p0.z) * segZ) / segLenSq));
  const projX = p0.x + t * segX;
  const projZ = p0.z + t * segZ;

  const dist = Math.hypot(x - projX, z - projZ);

  // Normal from projection toward car
  let nx = x - projX;
  let nz = z - projZ;
  if (dist > 0.0001) {
    nx /= dist;
    nz /= dist;
  } else {
    nx = p0.nx;
    nz = p0.nz;
  }

  return {
    index: bestIdx,
    projX,
    projZ,
    dist,
    normalX: nx,
    normalZ: nz,
  };
}

/**
 * Continuous collision detection against Monza track limits.
 * Clamps car inside track boundary with realistic bounce without trapping the car.
 */
export function resolveMonzaTrackCollisions(
  pos: THREE.Vector3,
  vel: { vx: number; vz: number },
  hintIndexRef: { current: number }
): boolean {
  const info = findClosestTrackPoint(pos.x, pos.z, hintIndexRef.current);
  hintIndexRef.current = info.index;

  const maxAllowed = MONZA_MAX_DEVIATION;

  if (info.dist > maxAllowed) {
    // Car has hit 3D boundary wall!
    // Push car slightly inward from boundary so it doesn't get caught in sticky edge loop
    pos.x = info.projX + info.normalX * (maxAllowed - 0.04);
    pos.z = info.projZ + info.normalZ * (maxAllowed - 0.04);

    const RESTITUTION = 0.25; // Gentle bounce off 3D Tecpro barrier

    // Outward velocity component along normal
    const vDot = vel.vx * info.normalX + vel.vz * info.normalZ;

    if (vDot > 0) {
      // Reflect and eliminate outward velocity
      vel.vx -= (1 + RESTITUTION) * vDot * info.normalX;
      vel.vz -= (1 + RESTITUTION) * vDot * info.normalZ;

      // Gentle graze friction: preserves high forward speed instead of grinding to dead halt!
      vel.vx *= 0.96;
      vel.vz *= 0.96;
    }
    return true;
  }

  return false;
}
