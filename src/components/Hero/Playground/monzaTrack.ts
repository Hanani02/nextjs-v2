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
  [34, -25],

  // Variante del Rettifilo (Prima Variante Chicane - Turns 1 & 2)
  [44, -24],
  [49, -21], // Turn 1 (Right flick)
  [51, -15], // Turn 2 (Left flick)

  // Curva Grande (Curva Biassono - Turn 3: long high-speed sweeping right curve)
  [55, -8],
  [58, 2],
  [57, 12],
  [52, 21],
  [45, 27],

  // Variante della Roggia (Seconda Variante - Turns 4 & 5: chicane)
  [39, 30],
  [34, 33], // Turn 4 (Left)
  [30, 38], // Turn 5 (Right)

  // Curva di Lesmo 1 (Turn 6)
  [23, 41],
  [14, 40],

  // Short Straight between Lesmos
  [6, 38],

  // Curva di Lesmo 2 (Turn 7)
  [-1, 35],
  [-7, 28],

  // Curva del Serraglio & Straight towards Ascari
  [-12, 19],
  [-16, 9],
  [-19, 1],

  // Variante Ascari (Turns 8, 9, 10: high-speed chicane Left -> Right -> Left)
  [-23, 0], // Turn 8 (Left entry)
  [-29, 4], // Turn 9 (Right apex)
  [-36, 4], // Turn 10 (Left exit)

  // Back Straight (Rettifilo towards Curva Parabolica)
  [-44, 4],
  [-52, 4],

  // Curva Parabolica (Curva Alboreto - Turn 11: iconic 180° long sweeping right curve)
  [-59, 2], // Parabolica entry
  [-65, -4],
  [-67, -13], // Mid-corner apex
  [-63, -21], // Exit opening up
  [-53, -25], // Full throttle onto Rettifilo Straight
  [-30, -25], // Rettifilo approach to Start/Finish
  [-15, -25],
];

export const MONZA_TRACK_WIDTH = 5.6; // Width of the asphalt ribbon in world units
export const MONZA_CAR_RADIUS = 0.65; // Collision radius of the car
export const MONZA_MAX_DEVIATION = MONZA_TRACK_WIDTH / 2 - MONZA_CAR_RADIUS; // ~2.15 units

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

  const rawPoints = curve.getSpacedPoints(sampleCount);
  const trackPoints: TrackPoint[] = [];

  let accumulatedDist = 0;

  for (let i = 0; i < rawPoints.length; i++) {
    const curr = rawPoints[i];
    const next = rawPoints[(i + 1) % rawPoints.length];
    const prev = rawPoints[(i - 1 + rawPoints.length) % rawPoints.length];

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
    const isCorner = angle > 0.045;

    // Corner name attribution
    let cornerName: string | undefined;
    if (curr.x > 38 && curr.x < 53 && curr.z < -14) {
      cornerName = 'Prima Variante';
    } else if (curr.x > 45 && curr.z >= -14 && curr.z < 26) {
      cornerName = 'Curva Grande';
    } else if (curr.x > 25 && curr.x <= 40 && curr.z >= 26 && curr.z < 38) {
      cornerName = 'Variante della Roggia';
    } else if (curr.x > 8 && curr.x <= 25 && curr.z >= 38) {
      cornerName = 'Lesmo 1';
    } else if (curr.x <= 8 && curr.x >= -8 && curr.z >= 28) {
      cornerName = 'Lesmo 2';
    } else if (curr.x >= -20 && curr.x < -8 && curr.z >= 0 && curr.z < 28) {
      cornerName = 'Curva del Serraglio';
    } else if (curr.x <= -20 && curr.x >= -38 && curr.z >= -1 && curr.z <= 6) {
      cornerName = 'Variante Ascari';
    } else if (curr.x <= -52 && curr.z <= 4) {
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
  minX: -70,
  maxX: 61,
  minZ: -27.5,
  maxZ: 43.5,
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
    width: 6.8,
    depth: 3.5,
    normal: [1, 0] as [number, number], // Car crosses towards +X
  },
  {
    id: 1,
    name: 'Prima Variante Exit',
    center: [51, -15] as [number, number],
    width: 6.8,
    depth: 3.5,
    normal: [0.6, 0.8] as [number, number],
  },
  {
    id: 2,
    name: 'Roggia Chicane Exit',
    center: [28, 38] as [number, number],
    width: 6.8,
    depth: 3.5,
    normal: [-0.6, 0.8] as [number, number],
  },
  {
    id: 3,
    name: 'Lesmo 2 Exit',
    center: [-8, 25] as [number, number],
    width: 6.8,
    depth: 3.5,
    normal: [-0.5, -0.8] as [number, number],
  },
  {
    id: 4,
    name: 'Variante Ascari Exit',
    center: [-37, 4] as [number, number],
    width: 6.8,
    depth: 3.5,
    normal: [-1, 0] as [number, number],
  },
  {
    id: 5,
    name: 'Curva Parabolica Exit',
    center: [-54, -25] as [number, number],
    width: 6.8,
    depth: 3.5,
    normal: [0.8, -0.6] as [number, number],
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

  // Search window of ±24 points around hint, or full search if hint is distant
  const windowSize = 26;
  const isLocal =
    hintIdx >= 0 &&
    hintIdx < N &&
    Math.hypot(points[hintIdx].x - x, points[hintIdx].z - z) < 18;

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
 * Clamps car inside the track ribbon with realistic bounce and scrape friction.
 */
export function resolveMonzaTrackCollisions(
  pos: THREE.Vector3,
  vel: { vx: number; vz: number },
  hintIndexRef: { current: number }
): boolean {
  const info = findClosestTrackPoint(pos.x, pos.z, hintIndexRef.current);
  hintIndexRef.current = info.index;

  const maxAllowed = MONZA_MAX_DEVIATION; // ~2.15m

  if (info.dist > maxAllowed) {
    // Car has hit outer or inner track barrier!
    // Push car back onto edge
    pos.x = info.projX + info.normalX * maxAllowed;
    pos.z = info.projZ + info.normalZ * maxAllowed;

    const RESTITUTION = 0.35; // Bounciness off Tecpro barrier
    const SCRAPE_FRICTION = 0.88; // Friction along wall

    // Velocity dot product with outward normal
    const vDot = vel.vx * info.normalX + vel.vz * info.normalZ;

    if (vDot > 0) {
      vel.vx -= (1 + RESTITUTION) * vDot * info.normalX;
      vel.vz -= (1 + RESTITUTION) * vDot * info.normalZ;
      vel.vx *= SCRAPE_FRICTION;
      vel.vz *= SCRAPE_FRICTION;
    }
    return true;
  }

  return false;
}
