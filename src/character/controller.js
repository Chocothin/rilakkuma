import * as THREE from 'three';

const WALK_SPEED = 3.2;
const RUN_SPEED = 8;
const JUMP_VELOCITY = 8;
const GRAVITY = 20;
const GROUND_Y = 0;
const SPAWN_X = 0;
const SPAWN_Z = 15;
const CHARACTER_HALF_WIDTH = 0.3;
const CHARACTER_HEIGHT = 1.4;

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _inputDir = new THREE.Vector3();
const _smoothDir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _newPos = new THREE.Vector3();
const _testBox = new THREE.Box3();
const _charMin = new THREE.Vector3();
const _charMax = new THREE.Vector3();

const DIRECTION_SMOOTHING = 12;

let collisionBoxes = [];

export function setCollisionBoxes(boxes) {
  collisionBoxes = boxes || [];
}

export function createController() {
  const state = {
    keys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
    },
    velocity: new THREE.Vector3(),
    velocityY: 0,
    isGrounded: true,
    isMoving: false,
    isRunning: false,
    isJumping: false,
    facingAngle: -Math.PI / 2,
  };

  const codeMap = {
    KeyW: 'forward',
    ArrowUp: 'forward',
    KeyS: 'backward',
    ArrowDown: 'backward',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'sprint',
    ShiftRight: 'sprint',
    Space: 'jump',
  };

  const keyFallback = {
    w: 'forward', W: 'forward',
    s: 'backward', S: 'backward',
    a: 'left', A: 'left',
    d: 'right', D: 'right',
    ' ': 'jump',
    'ㅈ': 'forward', 'ㄴ': 'backward', 'ㅁ': 'left', 'ㅇ': 'right',
  };

  function resolveAction(e) {
    return codeMap[e.code] || keyFallback[e.key] || null;
  }

  function onKeyDown(e) {
    const action = resolveAction(e);
    if (action) {
      state.keys[action] = true;
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    const action = resolveAction(e);
    if (action) state.keys[action] = false;
  }

  function onBlur() {
    state.keys.forward = false;
    state.keys.backward = false;
    state.keys.left = false;
    state.keys.right = false;
    state.keys.sprint = false;
    state.keys.jump = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return state;
}

function checkCollision(x, z) {
  _charMin.set(x - CHARACTER_HALF_WIDTH, GROUND_Y, z - CHARACTER_HALF_WIDTH);
  _charMax.set(x + CHARACTER_HALF_WIDTH, GROUND_Y + CHARACTER_HEIGHT, z + CHARACTER_HALF_WIDTH);
  _testBox.set(_charMin, _charMax);
  
  for (let i = 0; i < collisionBoxes.length; i++) {
    if (_testBox.intersectsBox(collisionBoxes[i])) {
      return true;
    }
  }
  return false;
}

export function initCharacterPosition(characterGroup, controllerState) {
  characterGroup.position.set(SPAWN_X, GROUND_Y, SPAWN_Z);
  characterGroup.quaternion.identity();
  if (controllerState) {
    controllerState.velocityY = 0;
    controllerState.isGrounded = true;
    controllerState.facingAngle = -Math.PI / 2;
  }
}

export function updateController(dt, characterGroup, controllerState, getCameraForward) {
  const keys = controllerState.keys;

  const camFwd = getCameraForward();
  _forward.set(camFwd.x, 0, camFwd.z).normalize();
  _right.crossVectors(_forward, _up).normalize();

  _inputDir.set(0, 0, 0);
  if (keys.forward) _inputDir.add(_forward);
  if (keys.backward) _inputDir.sub(_forward);
  if (keys.left) _inputDir.sub(_right);
  if (keys.right) _inputDir.add(_right);

  const hasInput = _inputDir.lengthSq() > 0.0001;
  if (hasInput) _inputDir.normalize();

  if (hasInput) {
    const lerpRate = Math.min(1, DIRECTION_SMOOTHING * dt);
    _smoothDir.x += (_inputDir.x - _smoothDir.x) * lerpRate;
    _smoothDir.z += (_inputDir.z - _smoothDir.z) * lerpRate;
    if (_smoothDir.lengthSq() > 0.0001) {
      _smoothDir.normalize();
    }
    _moveDir.copy(_smoothDir);
  } else {
    _smoothDir.x *= Math.max(0, 1 - 10 * dt);
    _smoothDir.z *= Math.max(0, 1 - 10 * dt);
    _moveDir.set(0, 0, 0);
  }

  const isRunning = keys.sprint && hasInput;
  const speed = isRunning ? RUN_SPEED : WALK_SPEED;

  controllerState.isGrounded = characterGroup.position.y <= GROUND_Y + 0.01;

  if (controllerState.isGrounded && keys.jump) {
    controllerState.velocityY = JUMP_VELOCITY;
    controllerState.isGrounded = false;
    controllerState.isJumping = true;
  }

  if (!controllerState.isGrounded) {
    controllerState.velocityY -= GRAVITY * dt;
  }

  characterGroup.position.y += controllerState.velocityY * dt;
  if (characterGroup.position.y <= GROUND_Y) {
    characterGroup.position.y = GROUND_Y;
    controllerState.velocityY = 0;
    controllerState.isGrounded = true;
    controllerState.isJumping = false;
  }

  if (hasInput) {
    const dx = _moveDir.x * speed * dt;
    const dz = _moveDir.z * speed * dt;
    
    _newPos.copy(characterGroup.position);
    _newPos.x += dx;
    if (!checkCollision(_newPos.x, characterGroup.position.z)) {
      characterGroup.position.x = _newPos.x;
    }
    
    _newPos.copy(characterGroup.position);
    _newPos.z += dz;
    if (!checkCollision(characterGroup.position.x, _newPos.z)) {
      characterGroup.position.z = _newPos.z;
    }
  }

  if (hasInput) {
    const targetAngle = Math.atan2(_moveDir.z, -_moveDir.x);
    let diff = targetAngle - controllerState.facingAngle;
    // Normalize diff to [-π, +π]
    diff = diff - Math.round(diff / (Math.PI * 2)) * Math.PI * 2;
    controllerState.facingAngle += diff * Math.min(1, 12 * dt);
    // Keep facingAngle in [-π, +π] to prevent drift
    controllerState.facingAngle = Math.atan2(
      Math.sin(controllerState.facingAngle),
      Math.cos(controllerState.facingAngle)
    );
  }

  characterGroup.quaternion.setFromAxisAngle(_up, controllerState.facingAngle);

  controllerState.velocity.set(
    hasInput ? _moveDir.x * speed : 0,
    controllerState.velocityY,
    hasInput ? _moveDir.z * speed : 0
  );

  controllerState.isMoving = hasInput;
  controllerState.isRunning = isRunning;

  return {
    isMoving: controllerState.isMoving,
    isRunning: controllerState.isRunning,
    isGrounded: controllerState.isGrounded,
    isJumping: controllerState.isJumping,
    velocity: controllerState.velocity,
  };
}
