import * as THREE from 'three';
import type { CarControls } from './useKeyboardControls';
import { resolveMonzaTrackCollisions } from './monzaTrack';

export type DriftSlicknessMode = 'normal' | 'slippery' | 'hyper';

export interface CarPhysicsState {
  position: THREE.Vector3;
  vx: number;
  vz: number;
  speed: number;
  heading: number; // in radians (0 = pointing +Z, PI/2 = pointing +X)
  steerAngle: number;
  wheelSpin: number;
  pitch: number;
  roll: number;
  isDrifting: boolean;
  isBraking: boolean;
  wrapCooldown: number;
  hintIndex: number;
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
  acceleration: 32.0,
  maxSpeed: 25.0,
  reverseAccel: 16.0,
  maxReverse: -10.0,
  turnSpeed: 4.4,
  driftTurnMultiplier: 2.1,
  normalGrip: 0.94,
  driftGrip: 0.16, // Extra slippery drift by default
  friction: 0.988,
  maxSteer: 0.60,
};

export function createInitialPhysicsState(
  initialPosition: [number, number, number] = [0, 0.08, -25]
): CarPhysicsState {
  return {
    position: new THREE.Vector3(...initialPosition),
    vx: 0,
    vz: 0,
    speed: 0,
    heading: Math.PI / 2, // Facing East (+X) towards Prima Variante down Rettifilo straight
    steerAngle: 0,
    wheelSpin: 0,
    pitch: 0,
    roll: 0,
    isDrifting: false,
    isBraking: false,
    wrapCooldown: 0,
    hintIndex: 0,
  };
}

/**
 * Step the car physics simulation using discrete integration.
 * - Drifting dibuat ekstra licin (slick momentum retention, low lateral friction).
 * - Mendukung pengaturan sensivitas kemudi (steering sensitivity) dan mode kelicinan drift.
 * - Spacebar engages handbrake drift dengan slide angle yang halus dan tahan lama.
 */
export function stepCarPhysics(
  p: CarPhysicsState,
  controls: CarControls,
  dt: number,
  steeringSensitivity: number = 1.0,
  driftSlickness: DriftSlicknessMode = 'slippery',
  constants: PhysicsConstants = DEFAULT_PHYSICS_CONSTANTS
): void {
  // 1. Steering Sensitivity Adjustments
  const effectiveMaxSteer = constants.maxSteer * (0.8 + 0.2 * steeringSensitivity);
  const effectiveTurnSpeed = constants.turnSpeed * steeringSensitivity;
  const steerSmoothing = 14 * (0.75 + 0.35 * steeringSensitivity);

  let targetSteer = 0;
  if (controls.left) targetSteer += effectiveMaxSteer;
  if (controls.right) targetSteer -= effectiveMaxSteer;

  p.steerAngle = THREE.MathUtils.lerp(p.steerAngle, targetSteer, dt * steerSmoothing);

  // 2. Velocity Components along Car Orientation
  const currentSpeed = Math.hypot(p.vx, p.vz);
  const forwardX = Math.sin(p.heading);
  const forwardZ = Math.cos(p.heading);
  const rightX = Math.cos(p.heading);
  const rightZ = -Math.sin(p.heading);

  const forwardVelocity = p.vx * forwardX + p.vz * forwardZ;
  const latVel = p.vx * rightX + p.vz * rightZ;

  // 3. Determine Drift & Braking State (Licin & Sustained Drift)
  const isHandbrake = Boolean(controls.brake);
  const isReverseBraking = controls.backward && forwardVelocity > 1.0;
  const isHardSteerAtSpeed =
    Math.abs(p.steerAngle) > 0.26 && currentSpeed > 6.0 && (controls.forward || isHandbrake);

  p.isBraking = isHandbrake || isReverseBraking;

  // Drift engages easily and sustains smoothly while momentum lasts
  const hasLateralSlide = Math.abs(latVel) > 1.4 && currentSpeed > 4.0;
  p.isDrifting =
    (isHandbrake && currentSpeed > 2.0) ||
    (isHardSteerAtSpeed && (isHandbrake || controls.backward || Math.abs(latVel) > 1.2)) ||
    (p.isDrifting && hasLateralSlide);

  // 4. Heading (Yaw) Calculation
  const isInputActive = controls.forward || controls.backward || currentSpeed > 0.15;
  if (isInputActive) {
    const minTurnRatio = controls.forward || controls.backward ? 0.38 : 0.0;
    const speedRatio = Math.max(minTurnRatio, Math.min(currentSpeed / constants.maxSpeed, 1.0));
    const driveDir = controls.backward && !controls.forward && forwardVelocity <= 0.1 ? -1 : 1;
    const steerMultiplier = p.isDrifting
      ? effectiveTurnSpeed * constants.driftTurnMultiplier
      : effectiveTurnSpeed;

    p.heading += p.steerAngle * steerMultiplier * speedRatio * driveDir * dt;
  }

  // 5. Acceleration & Engine Thrust (Gas & Reverse)
  let engineThrust = 0;
  if (controls.forward && !controls.backward) {
    engineThrust = constants.acceleration;
  } else if (controls.backward && !controls.forward) {
    if (forwardVelocity > 0.5) {
      engineThrust = -constants.acceleration * 1.85;
    } else {
      engineThrust = -constants.reverseAccel;
    }
  }

  p.vx += forwardX * engineThrust * dt;
  p.vz += forwardZ * engineThrust * dt;

  // 6. Super Slick Drift Traction & Lateral Momentum
  // Mode Kelicinan:
  // - normal: 0.26 grip (agak licin)
  // - slippery: 0.16 grip (sangat licin)
  // - hyper: 0.10 grip (ekstra licin / Tokyo Drift hyper slide)
  let activeDriftGrip = constants.driftGrip;
  if (driftSlickness === 'normal') activeDriftGrip = 0.26;
  else if (driftSlickness === 'slippery') activeDriftGrip = 0.16;
  else if (driftSlickness === 'hyper') activeDriftGrip = 0.10;

  const gripFactor = p.isDrifting ? activeDriftGrip : constants.normalGrip;

  // Lateral velocity attenuation (Higher retention = much longer, smoother slide!)
  const lateralRetention = Math.pow(1 - gripFactor, dt * 60);
  const newLatVel = latVel * lateralRetention;

  // Longitudinal drag: retains high forward speed during drifts so car doesn't bog down
  const driftDecel = p.isDrifting ? 0.988 : constants.friction;
  const newLongVel = forwardVelocity * Math.pow(driftDecel, dt * 60);

  // Handbrake smooth slide deceleration (preserves slide speed)
  const handbrakeSlideDecel = driftSlickness === 'hyper' ? 0.985 : 0.972;
  const finalLongVel = isHandbrake
    ? newLongVel * Math.pow(handbrakeSlideDecel, dt * 60)
    : newLongVel;

  // Recombine velocity vector
  p.vx = forwardX * finalLongVel + rightX * newLatVel;
  p.vz = forwardZ * finalLongVel + rightZ * newLatVel;

  // Clamp speeds
  const totalSpeed = Math.hypot(p.vx, p.vz);
  const effectiveMaxSpeed = constants.maxSpeed;
  if (totalSpeed > effectiveMaxSpeed) {
    const scale = effectiveMaxSpeed / totalSpeed;
    p.vx *= scale;
    p.vz *= scale;
  }
  if (finalLongVel < constants.maxReverse) {
    p.vx = forwardX * constants.maxReverse;
    p.vz = forwardZ * constants.maxReverse;
  }

  if (Math.abs(p.vx) < 0.02 && Math.abs(p.vz) < 0.02 && !controls.forward && !controls.backward) {
    p.vx = 0;
    p.vz = 0;
  }

  p.speed = Math.hypot(p.vx, p.vz);

  // 7. Update Position
  p.position.x += p.vx * dt;
  p.position.z += p.vz * dt;

  // 8. Track Collision Limits
  const hintRef = { current: p.hintIndex ?? 0 };
  resolveMonzaTrackCollisions(p.position, p, hintRef);
  p.hintIndex = hintRef.current;

  // 9. Suspension Body Roll & Pitch
  const targetPitch = (engineThrust / constants.acceleration) * -0.06;
  p.pitch = THREE.MathUtils.lerp(p.pitch, targetPitch, dt * 8);

  const driftRollBonus = p.isDrifting ? Math.sign(p.steerAngle) * 0.14 : 0;
  const targetRoll = (p.steerAngle * (p.speed / constants.maxSpeed)) * 0.2 + driftRollBonus;
  p.roll = THREE.MathUtils.lerp(p.roll, targetRoll, dt * 9);

  // Wheel spin
  const wheelRadius = 0.22;
  p.wheelSpin += (forwardVelocity / wheelRadius) * dt;
}
