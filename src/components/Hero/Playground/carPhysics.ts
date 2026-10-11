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
  maxSpeed: 20.0,
  reverseAccel: 14.0,
  maxReverse: -9.0,
  turnSpeed: 3.8,
  driftTurnMultiplier: 1.65,
  normalGrip: 0.93,
  driftGrip: 0.48,
  friction: 0.985,
  maxSteer: 0.58,
};

export function createInitialPhysicsState(
  initialPosition: [number, number, number] = [0, 0.08, 0]
): CarPhysicsState {
  return {
    position: new THREE.Vector3(...initialPosition),
    vx: 0,
    vz: 0,
    speed: 0,
    heading: 0,
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
 * Step the car physics simulation using discrete integration.
 * Decouples car heading from velocity vector to produce authentic drift (ngepot) mechanics.
 */
export function stepCarPhysics(
  p: CarPhysicsState,
  controls: CarControls,
  dt: number,
  boundsX: number = 24,
  boundsZ: number = 16,
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
    Math.abs(p.steerAngle) > 0.35 && currentSpeed > 9.0 && (controls.forward || isHandbrake);

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
  // Decompose velocity into longitudinal (along heading) and lateral (sideways) components
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

  // 7. Screen Wrap (Pac-Man Teleportation)
  p.wrapCooldown -= dt;
  let didWrap = false;

  if (p.position.x > boundsX) {
    p.position.x = -boundsX + 0.4;
    didWrap = true;
  } else if (p.position.x < -boundsX) {
    p.position.x = boundsX - 0.4;
    didWrap = true;
  }

  if (p.position.z > boundsZ) {
    p.position.z = -boundsZ + 0.4;
    didWrap = true;
  } else if (p.position.z < -boundsZ) {
    p.position.z = boundsZ - 0.4;
    didWrap = true;
  }

  if (didWrap && p.wrapCooldown <= 0) {
    p.wrapCooldown = 0.2;
  }

  // 8. Dynamic Suspension Body Roll & Pitch
  // Pitch: squat on acceleration, dive on braking
  const targetPitch = (engineThrust / constants.acceleration) * -0.06;
  p.pitch = THREE.MathUtils.lerp(p.pitch, targetPitch, dt * 8);

  // Roll: centrifugal tilt outwards in turn + drift chassis roll
  const driftRollBonus = p.isDrifting ? Math.sign(p.steerAngle) * 0.12 : 0;
  const targetRoll = (p.steerAngle * (p.speed / constants.maxSpeed)) * 0.18 + driftRollBonus;
  p.roll = THREE.MathUtils.lerp(p.roll, targetRoll, dt * 9);

  // Wheel spin rotation
  const wheelRadius = 0.22;
  p.wheelSpin += (forwardVelocity / wheelRadius) * dt;
}
