import * as THREE from 'three';

const CAMERA_DISTANCE = 6;
const CAMERA_HEIGHT = 2;
const LOOK_AT_HEIGHT = 0.7;
const SMOOTHING = 0.1;
const MOUSE_SENSITIVITY = 0.002;
const MIN_PITCH = -20 * (Math.PI / 180);
const MAX_PITCH = 60 * (Math.PI / 180);

let yaw = 0;
let pitch = 0.3;
let isPointerLocked = false;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

let _camera = null;

const _desiredPosition = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _cameraForward = new THREE.Vector3();

export function createThirdPersonCamera(camera, canvas) {
  _camera = camera;

  function onMouseMove(e) {
    const isMouseButtonHeld = (e.buttons & 1) === 1;
    if (isPointerLocked || isDragging || isMouseButtonHeld) {
      const deltaX = isPointerLocked ? e.movementX : (e.clientX - lastMouseX);
      const deltaY = isPointerLocked ? e.movementY : (e.clientY - lastMouseY);
      yaw -= deltaX * MOUSE_SENSITIVITY;
      pitch += deltaY * MOUSE_SENSITIVITY;
      pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }

  function onPointerLockChange() {
    isPointerLocked = document.pointerLockElement === canvas;
  }

  function onPointerLockError() {
    isPointerLocked = false;
  }

  function onMouseDown(e) {
    if (!isPointerLocked) {
      if (e.button !== 0) return;
      e.preventDefault();
      if (e.button === 0) {
        canvas.requestPointerLock();
      }
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  }

  function onMouseUp() {
    isDragging = false;
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('pointerlockerror', onPointerLockError);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('dragstart', (e) => e.preventDefault());
  document.addEventListener('mouseup', onMouseUp);

  _camera.position.set(0, CAMERA_HEIGHT + 1, 15 + CAMERA_DISTANCE);
  _camera.lookAt(0, LOOK_AT_HEIGHT, 15);
}

export function applyCameraRotation(deltaX, deltaY) {
  yaw -= deltaX * 0.005;
  pitch += deltaY * 0.005;
  pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
}

export function updateCamera(dt, characterGroup) {
  if (!_camera) return;

  const charPos = characterGroup.position;

  // Camera always Y-up
  _camera.up.set(0, 1, 0);

  // Spherical offset from character (yaw around Y, pitch up/down)
  const offsetX = Math.sin(yaw) * Math.cos(pitch) * CAMERA_DISTANCE;
  const offsetY = Math.sin(pitch) * CAMERA_DISTANCE + CAMERA_HEIGHT;
  const offsetZ = Math.cos(yaw) * Math.cos(pitch) * CAMERA_DISTANCE;

  _desiredPosition.set(
    charPos.x + offsetX,
    charPos.y + offsetY,
    charPos.z + offsetZ
  );

  // Clamp camera above ground
  if (_desiredPosition.y < 0.5) _desiredPosition.y = 0.5;

  // Smooth follow
  _camera.position.lerp(_desiredPosition, SMOOTHING);

  // Look at character
  _lookTarget.set(charPos.x, charPos.y + LOOK_AT_HEIGHT, charPos.z);
  _camera.lookAt(_lookTarget);
}

export function getCamera() {
  return _camera;
}

export function getCameraForward() {
  // Camera forward projected onto XZ plane (for movement direction)
  _cameraForward.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
  return _cameraForward;
}


