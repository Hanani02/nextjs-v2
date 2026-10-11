import * as THREE from 'three';
import type { CarControls } from './useKeyboardControls';

export interface CarPhysicsState {
  position: THREE.Vector3;
  vx: number;
  vz: number;
  speed: number;
  heading: number; // in radians (0 = pointing +Z)
  steerAngle: number;
  wheelSpin: number;
  pitch: number;
  roll: number;
  isDrifting: boolean;
  isBraking: boolean;
  wrapCooldown: number;
}

export interface PhysicsConstants {
  acceleration: number;
  maxSpeed: number;
  reverseAccel: number;
  maxReverse: number;
  turnSpeed: number;
  driftTurnMultiplier: number;
  normalGrip: number;
  driftGrip: number;
  friction: number;
  maxSteer: number;
}

export const DEFAULT_PHYSICS_CONSTANTS: PhysicsConstants = {
  acceleration: 28.0,
  maxSpeed: 21.0,
  reverseAccel: 14.0,
  maxReverse: -9.0,
  turnSpeed: 3.9,
  driftTurnMultiplier: 1.65,
  normalGrip: 0.93,
  driftGrip: 0.48,
  friction: 0.985,
  maxSteer: 0.58,
};

export function createInitialPhysicsState(
  initialPosition: [number, number, number] = [0, 0.08, -9.5]
): CarPhysicsState {
  return {
    position: new THREE.Vector3(...initialPosition),
    vx: 0,
    vz: 0,
    speed: 0,
    heading: Math.PI / 2, // Facing East (+X) towards Turn 1 at Start line
    steerAngle: 0,
    wheelSpin: 0,
    pitch: 0,
    roll: 0,
    isDrifting: false,
    isBraking: false,
    wrapCooldown: 0,
  };
}

/**
 * Handle closed-circuit wall collision response with elastic bounce and barrier scrape friction.
 */
function resolveCircuitWallCollisions(
  p: CarPhysicsState,
  boundsX: number = 22.2,
  boundsZ: number = 14.0
): void {
  const CAR_RADIUS = 0.65;
  const RESTITUTION = 0.42; // Bounciness
  const SCRAPE_FRICTION = 0.88; // Speed retention along wall

  // 1. Outer Perimeter Walls
  if (p.position.x + CAR_RADIUS > boundsX) {
    p.position.x = boundsX - CAR_RADIUS;
    p.vx = -Math.abs(p.vx) * RESTITUTION;
    p.vz *= SCRAPE_FRICTION;
  } else if (p.position.x - CAR_RADIUS < -boundsX) {
    p.position.x = -boundsX + CAR_RADIUS;
    p.vx = Math.abs(p.vx) * RESTITUTION;
    p.vz *= SCRAPE_FRICTION;
  }

  if (p.position.z + CAR_RADIUS > boundsZ) {
    p.position.z = boundsZ - CAR_RADIUS;
    p.vz = -Math.abs(p.vz) * RESTITUTION;
    p.vx *= SCRAPE_FRICTION;
  } else if (p.position.z - CAR_RADIUS < -boundsZ) {
    p.position.z = -boundsZ + CAR_RADIUS;
    p.vz = Math.abs(p.vz) * RESTITUTION;
    p.vx *= SCRAPE_FRICTION;
  }

  // 2. Infield Island Barrier Box (Center island separating straightaway from back straight)
  const islandMinX = -11.0;
  const islandMaxX = 11.0;
  const islandMinZ = -4.2;
  const islandMaxZ = 4.2;

  if (
    p.position.x + CAR_RADIUS > islandMinX &&
    p.position.x - CAR_RADIUS < islandMaxX &&
    p.position.z + CAR_RADIUS > islandMinZ &&
    p.position.z - CAR_RADIUS < islandMaxZ
  ) {
    // Find axis of minimum penetration
    const overlapLeft = (p.position.x + CAR_RADIUS) - islandMinX;
    const overlapRight = islandMaxX - (p.position.x - CAR_RADIUS);
    const overlapBottom = (p.position.z + CAR_RADIUS) - islandMinZ;
    const overlapTop = islandMaxZ - (p.position.z - CAR_RADIUS);

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapBottom, overlapTop);

    if (minOverlap === overlapLeft) {
      p.position.x = islandMinX - CAR_RADIUS;
      p.vx = -Math.abs(p.vx) * RESTITUTION;
      p.vz *= SCRAPE_FRICTION;
    } else if (minOverlap === overlapRight) {
      p.position.x = islandMaxX + CAR_RADIUS;
      p.vx = Math.abs(p.vx) * RESTITUTION;
      p.vz *= SCRAPE_FRICTION;
    } else if (minOverlap === overlapBottom) {
      p.position.z = islandMinZ - CAR_RADIUS;
      p.vz = -Math.abs(p.vz) * RESTITUTION;
      p.vx *= SCRAPE_FRICTION;
    } else {
      p.position.z = islandMaxZ + CAR_RADIUS;
      p.vz = Math.abs(p.vz) * RESTITUTION;
      p.vx *= SCRAPE_FRICTION;
    }
  }

  // 3. Chicane Deflector Barrier (Creates S-curve chicane drift challenge along back straight)
  const chicaneMinX = -2.8;
  const chicaneMaxX = 2.8;
  const chicaneMinZ = 7.6;
  const chicaneMaxZ = 11.4;

  if (
    p.position.x + CAR_RADIUS > chicaneMinX &&
    p.position.x - CAR_RADIUS < chicaneMaxX &&
    p.position.z + CAR_RADIUS > chicaneMinZ &&
    p.position.z - CAR_RADIUS < chicaneMaxZ
  ) {
    const oL = (p.position.x + CAR_RADIUS) - chicaneMinX;
    const oR = chicaneMaxX - (p.position.x - CAR_RADIUS);
    const oB = (p.position.z + CAR_RADIUS) - chicaneMinZ;
    const oT = chicaneMaxZ - (p.position.z - CAR_RADIUS);

    const minO = Math.min(oL, oR, oB, oT);

    if (minO === oL) {
      p.position.x = chicaneMinX - CAR_RADIUS;
      p.vx = -Math.abs(p.vx) * RESTITUTION;
    } else if (minO === oR) {
      p.position.x = chicaneMaxX + CAR_RADIUS;
      p.vx = Math.abs(p.vx) * RESTITUTION;
    } else if (minO === oB) {
      p.position.z = chicaneMinZ - CAR_RADIUS;
      p.vz = -Math.abs(p.vz) * RESTITUTION;
    } else {
      p.position.z = chicaneMaxZ + CAR_RADIUS;
      p.vz = Math.abs(p.vz) * RESTITUTION;
    }
  }
}

/**
 * Step the car physics simulation using discrete integration.
 * Decouples car heading from velocity vector to produce authentic drift (ngepot) mechanics.
 */
export function stepCarPhysics(
  p: CarPhysicsState,
  controls: CarControls,
  dt: number,
  boundsX: number = 22.2,
  boundsZ: number = 14.0,
  constants: PhysicsConstants = DEFAULT_PHYSICS_CONSTANTS
): void {
  // 1. Steering Input & Smoothing
  let targetSteer = 0;
  if (controls.left) targetSteer += constants.maxSteer;
  if (controls.right) targetSteer -= constants.maxSteer;

  // Steering snaps smoothly
  p.steerAngle = THREE.MathUtils.lerp(p.steerAngle, targetSteer, dt * 14);

  // 2. Determine Drift & Braking State
  const currentSpeed = Math.hypot(p.vx, p.vz);
  const forwardX = Math.sin(p.heading);
  const forwardZ = Math.cos(p.heading);

  // Dot product of velocity with heading to determine forward vs reverse motion
  const forwardVelocity = p.vx * forwardX + p.vz * forwardZ;

  const isHandbrake = Boolean(controls.brake);
  const isReverseBraking = controls.backward && forwardVelocity > 1.0;
  const isHardSteerAtSpeed =
    Math.abs(p.steerAngle) > 0.35 && currentSpeed > 8.0 && (controls.forward || isHandbrake);

  p.isBraking = isHandbrake || isReverseBraking;

  // Drift engages on handbrake at speed, or aggressive cornering at high momentum
  p.isDrifting = (isHandbrake && currentSpeed > 3.0) || (isHardSteerAtSpeed && (isHandbrake || controls.backward));

  // 3. Heading (Yaw) Calculation
  if (currentSpeed > 0.2) {
    const speedRatio = Math.min(currentSpeed / constants.maxSpeed, 1.0);
    const driveDir = forwardVelocity >= 0 ? 1 : -1;
    const steerMultiplier = p.isDrifting
      ? constants.turnSpeed * constants.driftTurnMultiplier
      : constants.turnSpeed;

    p.heading += p.steerAngle * steerMultiplier * speedRatio * driveDir * dt;
  }

  // 4. Acceleration & Engine Thrust
  let engineThrust = 0;
  if (controls.forward && !controls.backward) {
    engineThrust = constants.acceleration;
  } else if (controls.backward && !controls.forward) {
    if (forwardVelocity > 0.5) {
      // Foot brake deceleration
      engineThrust = -constants.acceleration * 1.8;
    } else {
      // Reverse thrust
      engineThrust = -constants.reverseAccel;
    }
  }

  // Apply engine thrust along facing heading
  p.vx += forwardX * engineThrust * dt;
  p.vz += forwardZ * engineThrust * dt;

  // 5. Tire Traction & Lateral Drift Friction
  const rightX = Math.cos(p.heading);
  const rightZ = -Math.sin(p.heading);

  const longVel = p.vx * forwardX + p.vz * forwardZ;
  const latVel = p.vx * rightX + p.vz * rightZ;

  // Grip factor: during drift, lateral traction drops significantly, allowing the rear to kick out
  const gripFactor = p.isDrifting
    ? constants.driftGrip
    : constants.normalGrip;

  // Attenuate lateral velocity according to tire grip
  const lateralRetention = Math.pow(1 - gripFactor, dt * 60);
  const newLatVel = latVel * lateralRetention;

  // Longitudinal drag: natural friction + slide friction if drifting
  const driftDecel = p.isDrifting ? 0.96 : constants.friction;
  const newLongVel = longVel * Math.pow(driftDecel, dt * 60);

  // Handbrake extra slide deceleration
  const finalLongVel = isHandbrake
    ? newLongVel * Math.pow(0.88, dt * 60)
    : newLongVel;

  // Recombine velocity vector from components
  p.vx = forwardX * finalLongVel + rightX * newLatVel;
  p.vz = forwardZ * finalLongVel + rightZ * newLatVel;

  // Clamp max speeds
  const totalSpeed = Math.hypot(p.vx, p.vz);
  if (totalSpeed > constants.maxSpeed) {
    const scale = constants.maxSpeed / totalSpeed;
    p.vx *= scale;
    p.vz *= scale;
  }
  if (finalLongVel < constants.maxReverse) {
    p.vx = forwardX * constants.maxReverse;
    p.vz = forwardZ * constants.maxReverse;
  }

  // Stop completely if negligible velocity
  if (Math.abs(p.vx) < 0.02 && Math.abs(p.vz) < 0.02 && !controls.forward && !controls.backward) {
    p.vx = 0;
    p.vz = 0;
  }

  p.speed = Math.hypot(p.vx, p.vz);

  // 6. Update Position
  p.position.x += p.vx * dt;
  p.position.z += p.vz * dt;

  // 7. Closed Circuit Collision Barrier Resolution (No wrapping: real enclosed race circuit)
  resolveCircuitWallCollisions(p, boundsX, boundsZ);

  // 8. Dynamic Suspension Body Roll & Pitch
  const targetPitch = (engineThrust / constants.acceleration) * -0.06;
  p.pitch = THREE.MathUtils.lerp(p.pitch, targetPitch, dt * 8);

  const driftRollBonus = p.isDrifting ? Math.sign(p.steerAngle) * 0.12 : 0;
  const targetRoll = (p.steerAngle * (p.speed / constants.maxSpeed)) * 0.18 + driftRollBonus;
  p.roll = THREE.MathUtils.lerp(p.roll, targetRoll, dt * 9);

  // Wheel spin rotation
  const wheelRadius = 0.22;
  p.wheelSpin += (forwardVelocity / wheelRadius) * dt;
}
