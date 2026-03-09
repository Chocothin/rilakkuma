const IDLE = 0;
const WALK = 1;
const RUN = 2;
const JUMP = 3;

const WALK_CYCLE_SPEED = 8;
const RUN_CYCLE_SPEED = 14;
const IDLE_BOB_SPEED = 1.5;
const TRANSITION_SPEED = 8;

let currentState = IDLE;
let cycleTime = 0;

let currentBodyBob = 0;
let currentLean = 0;
let currentSway = 0;
let currentWaddleX = 0;

let landingSquash = 0;
let jumpStretch = 0;
let wasGrounded = true;

let dustParticleStates = [];
for (let i = 0; i < 20; i++) {
  dustParticleStates.push({
    active: false,
    life: 0,
    velocity: { x: 0, y: 0, z: 0 },
    startPos: { x: 0, y: 0, z: 0 }
  });
}

function resolveState(movementState) {
  if (!movementState.isGrounded) return JUMP;
  if (movementState.isRunning) return RUN;
  if (movementState.isMoving) return WALK;
  return IDLE;
}

function lerp(current, target, rate) {
  return current + (target - current) * Math.min(1, rate);
}

export function updateAnimations(dt, movementState, parts) {
  currentState = resolveState(movementState);

  updateSquashStretch(dt, movementState, parts);
  updateDustParticles(dt, movementState, parts);

  let targetBodyBob = 0;
  let targetLean = 0;
  let targetSway = 0;
  let targetWaddleX = 0;

  switch (currentState) {
    case IDLE: {
      cycleTime += dt * IDLE_BOB_SPEED;
      targetBodyBob = Math.sin(cycleTime * Math.PI * 2) * 0.05;
      targetSway = 0;
      targetLean = 0;
      targetWaddleX = 0;
      break;
    }
    case WALK: {
      cycleTime += dt * WALK_CYCLE_SPEED;
      targetBodyBob = Math.abs(Math.sin(cycleTime)) * 0.09;
      targetSway = Math.sin(cycleTime) * 0.22;
      targetWaddleX = 0;
      targetLean = 0.05;
      break;
    }
    case RUN: {
      cycleTime += dt * RUN_CYCLE_SPEED;
      targetBodyBob = Math.abs(Math.sin(cycleTime)) * 0.15;
      targetSway = Math.sin(cycleTime) * 0.13;
      targetWaddleX = 0;
      targetLean = 0.12;
      break;
    }
    case JUMP: {
      const ascending = movementState.velocity.y > 0;
      targetBodyBob = ascending ? 0.08 : -0.04;
      targetLean = ascending ? -0.12 : 0.06;
      targetSway = 0;
      targetWaddleX = 0;
      break;
    }
  }

  const t = TRANSITION_SPEED * dt;
  currentBodyBob = lerp(currentBodyBob, targetBodyBob, t);
  currentLean = lerp(currentLean, targetLean, t);
  currentSway = lerp(currentSway, targetSway, t);
  currentWaddleX = lerp(currentWaddleX, targetWaddleX, t);

  parts.bodyGroup.position.y = currentBodyBob;
  parts.bodyGroup.position.x = currentWaddleX;
  parts.bodyGroup.rotation.x = currentSway;
  parts.bodyGroup.rotation.z = currentLean;
}

function updateSquashStretch(dt, movementState, parts) {
   const justLanded = !wasGrounded && movementState.isGrounded;
   const justJumped = wasGrounded && !movementState.isGrounded;
 
   if (justLanded) landingSquash = 1.0;
   if (justJumped) jumpStretch = 1.0;
 
   if (landingSquash > 0) {
     landingSquash = Math.max(0, landingSquash - dt / 0.2);
     const amount = landingSquash * 0.3;
     parts.bodyGroup.scale.y = 1.0 - amount;
     parts.bodyGroup.scale.x = 1.0 + amount;
     parts.bodyGroup.scale.z = 1.0 + amount;
   } else if (jumpStretch > 0) {
     jumpStretch = Math.max(0, jumpStretch - dt / 0.15);
     const amount = jumpStretch * 0.15;
     parts.bodyGroup.scale.y = 1.0 + amount;
     parts.bodyGroup.scale.x = 1.0 - amount * 0.6;
     parts.bodyGroup.scale.z = 1.0 - amount * 0.6;
   } else {
     // Continuous squash-stretch during walk/run
     let squashStretchAmount = 0;
     let breathingScale = 0;
     
     if (movementState.isGrounded) {
       if (movementState.isRunning) {
         // Run: exaggerated squash-stretch (0.1 amplitude)
         const runBobPhase = Math.sin(cycleTime);
         squashStretchAmount = Math.abs(runBobPhase) * 0.1;
       } else if (movementState.isMoving) {
         // Walk: moderate squash-stretch (0.05 amplitude)
         const walkBobPhase = Math.sin(cycleTime);
         squashStretchAmount = Math.abs(walkBobPhase) * 0.05;
       } else {
         // Idle: gentle breathing effect (0.02 amplitude)
         breathingScale = Math.sin(cycleTime * Math.PI * 2) * 0.02;
       }
     }
     
     // Apply squash-stretch: when bob is up (positive), stretch Y and compress X/Z
     // When bob is down (negative), compress Y and expand X/Z
     const bobPhase = currentState === WALK ? Math.sin(cycleTime) : 
                      currentState === RUN ? Math.sin(cycleTime) : 0;
     const stretchDirection = bobPhase > 0 ? 1 : -1;
     
     const targetScaleY = 1.0 + squashStretchAmount * stretchDirection + breathingScale;
     const targetScaleXZ = 1.0 - squashStretchAmount * stretchDirection * 0.5 + breathingScale;
     
     parts.bodyGroup.scale.y = lerp(parts.bodyGroup.scale.y, targetScaleY, dt * 10);
     parts.bodyGroup.scale.x = lerp(parts.bodyGroup.scale.x, targetScaleXZ, dt * 10);
     parts.bodyGroup.scale.z = lerp(parts.bodyGroup.scale.z, targetScaleXZ, dt * 10);
   }
 
   wasGrounded = movementState.isGrounded;
 }

function updateDustParticles(dt, movementState, parts) {
  if (!parts.dustParticles) return;

  const positions = parts.dustParticles.geometry.attributes.position.array;
  const shouldSpawnDust = movementState.isRunning && movementState.isGrounded;

  for (let i = 0; i < dustParticleStates.length; i++) {
    const particle = dustParticleStates[i];

    if (particle.active) {
      particle.life += dt;

      const idx = i * 3;
      positions[idx] = particle.startPos.x + particle.velocity.x * particle.life;
      positions[idx + 1] = particle.startPos.y + particle.velocity.y * particle.life;
      positions[idx + 2] = particle.startPos.z + particle.velocity.z * particle.life;

      if (particle.life >= 0.3) {
        particle.active = false;
        positions[idx] = 0;
        positions[idx + 1] = 0.05;
        positions[idx + 2] = 0;
      }
    } else if (shouldSpawnDust && Math.random() < 0.3) {
      particle.active = true;
      particle.life = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.4;
      particle.velocity.x = Math.cos(angle) * speed;
      particle.velocity.y = 0.1 + Math.random() * 0.15;
      particle.velocity.z = Math.sin(angle) * speed;

      particle.startPos.x = (Math.random() - 0.5) * 0.2;
      particle.startPos.y = 0.05;
      particle.startPos.z = (Math.random() - 0.5) * 0.2;

      const idx = i * 3;
      positions[idx] = particle.startPos.x;
      positions[idx + 1] = particle.startPos.y;
      positions[idx + 2] = particle.startPos.z;
    }
  }

  parts.dustParticles.material.opacity = shouldSpawnDust ? 0.6 : 0;
  parts.dustParticles.geometry.attributes.position.needsUpdate = true;
}
