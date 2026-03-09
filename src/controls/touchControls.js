/**
 * Touch Controls for Mobile Devices
 * Provides virtual joystick, action buttons, and touch camera controls
 */

export function isTouchDevice() {
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const hasFinePointer = window.matchMedia && window.matchMedia('(any-pointer: fine)').matches;
  return hasTouchPoints && coarsePointer && !hasFinePointer;
}

let controllerState = null;
let applyCameraRotation = null;

// Joystick state
const joystickState = {
  active: false,
  touchId: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  knobElement: null,
  areaElement: null,
};

// Camera touch state
const cameraState = {
  active: false,
  lastX: 0,
  lastY: 0,
  touchId: null,
};


const JOYSTICK_RADIUS = 60;
const DEADZONE = 0.2;
const TOUCH_CAMERA_SENSITIVITY = 0.005;

export function createTouchControls(controller, cameraControls) {
  if (!isTouchDevice()) return;

  controllerState = controller;
  applyCameraRotation = cameraControls.applyCameraRotation;

  // Add touch-device class to body
  document.body.classList.add('touch-device');

  const container = document.getElementById('touch-controls');
  if (!container) {
    console.error('Touch controls container not found');
    return;
  }

  // Create joystick
  const joystickArea = document.createElement('div');
  joystickArea.className = 'joystick-area';
  
  const joystickKnob = document.createElement('div');
  joystickKnob.className = 'joystick-knob';
  
  joystickArea.appendChild(joystickKnob);
  container.appendChild(joystickArea);

  joystickState.areaElement = joystickArea;
  joystickState.knobElement = joystickKnob;

  // Create jump button
  const jumpBtn = document.createElement('div');
  jumpBtn.className = 'touch-btn touch-btn-jump';
  jumpBtn.textContent = 'JUMP';
  container.appendChild(jumpBtn);

  // Create sprint button
  const sprintBtn = document.createElement('div');
  sprintBtn.className = 'touch-btn touch-btn-sprint';
  sprintBtn.textContent = 'RUN';
  container.appendChild(sprintBtn);

  // Create interact button (E key)
  const interactBtn = document.createElement('div');
  interactBtn.className = 'touch-btn touch-btn-interact';
  interactBtn.textContent = 'E';
  container.appendChild(interactBtn);

  // Create camera touch zone (BEFORE buttons in z-order, buttons on top via CSS z-index)
  const cameraTouchZone = document.createElement('div');
  cameraTouchZone.className = 'camera-touch-zone';
  container.appendChild(cameraTouchZone);

  // Setup joystick touch handlers
  joystickArea.addEventListener('touchstart', handleJoystickStart, { passive: false });
  joystickArea.addEventListener('touchmove', handleJoystickMove, { passive: false });
  joystickArea.addEventListener('touchend', handleJoystickEnd, { passive: false });
  joystickArea.addEventListener('touchcancel', handleJoystickEnd, { passive: false });

  // Setup button handlers
  jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    controllerState.keys.jump = true;
  }, { passive: false });
  
  jumpBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    controllerState.keys.jump = false;
  }, { passive: false });

  jumpBtn.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    controllerState.keys.jump = false;
  }, { passive: false });

  sprintBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    controllerState.keys.sprint = true;
  }, { passive: false });
  
  sprintBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    controllerState.keys.sprint = false;
  }, { passive: false });

  sprintBtn.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    controllerState.keys.sprint = false;
  }, { passive: false });

  interactBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true }));
  }, { passive: false });

  interactBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
  }, { passive: false });

  // Setup camera touch handlers
  cameraTouchZone.addEventListener('touchstart', handleCameraStart, { passive: false });
  cameraTouchZone.addEventListener('touchmove', handleCameraMove, { passive: false });
  cameraTouchZone.addEventListener('touchend', handleCameraEnd, { passive: false });
  cameraTouchZone.addEventListener('touchcancel', handleCameraEnd, { passive: false });

}

function handleJoystickStart(e) {
  e.preventDefault();
  
  const touch = e.changedTouches[0];
  const rect = joystickState.areaElement.getBoundingClientRect();
  
  joystickState.active = true;
  joystickState.touchId = touch.identifier;
  joystickState.startX = rect.left + rect.width / 2;
  joystickState.startY = rect.top + rect.height / 2;
  joystickState.currentX = touch.clientX;
  joystickState.currentY = touch.clientY;
  
  updateJoystickKnob();
}

function handleJoystickMove(e) {
  e.preventDefault();
  
  if (!joystickState.active) return;
  
  // Find our tracked touch by identifier in changedTouches
  let touch = null;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === joystickState.touchId) {
      touch = e.changedTouches[i];
      break;
    }
  }
  
  if (!touch) return;
  
  joystickState.currentX = touch.clientX;
  joystickState.currentY = touch.clientY;
  
  updateJoystickKnob();
}

function handleJoystickEnd(e) {
  e.preventDefault();
  
  // Only reset if our tracked joystick touch ended
  let ourTouchEnded = false;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === joystickState.touchId) {
      ourTouchEnded = true;
      break;
    }
  }
  
  if (!ourTouchEnded) return;
  
  joystickState.active = false;
  joystickState.touchId = null;
  joystickState.currentX = joystickState.startX;
  joystickState.currentY = joystickState.startY;
  
  // Reset knob to center
  joystickState.knobElement.style.transform = 'translate(-50%, -50%)';
  
  // Reset all movement keys
  controllerState.keys.forward = false;
  controllerState.keys.backward = false;
  controllerState.keys.left = false;
  controllerState.keys.right = false;
}

function updateJoystickKnob() {
  const deltaX = joystickState.currentX - joystickState.startX;
  const deltaY = joystickState.currentY - joystickState.startY;
  
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const clampedDistance = Math.min(distance, JOYSTICK_RADIUS);
  
  let knobX = 0;
  let knobY = 0;
  
  if (distance > 0) {
    knobX = (deltaX / distance) * clampedDistance;
    knobY = (deltaY / distance) * clampedDistance;
  }
  
  // Update knob position
  joystickState.knobElement.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  
  // Update controller state based on joystick position
  const normalizedX = knobX / JOYSTICK_RADIUS;
  const normalizedY = knobY / JOYSTICK_RADIUS;
  
  // Apply deadzone
  const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
  
  if (magnitude < DEADZONE) {
    controllerState.keys.forward = false;
    controllerState.keys.backward = false;
    controllerState.keys.left = false;
    controllerState.keys.right = false;
  } else {
    // X axis: negative = left, positive = right
    controllerState.keys.left = normalizedX < -DEADZONE;
    controllerState.keys.right = normalizedX > DEADZONE;
    
    // Y axis: negative = forward (up on screen), positive = backward (down on screen)
    controllerState.keys.forward = normalizedY < -DEADZONE;
    controllerState.keys.backward = normalizedY > DEADZONE;
  }
}

function handleCameraStart(e) {
  e.preventDefault();
  
  const touch = e.changedTouches[0];
  cameraState.active = true;
  cameraState.touchId = touch.identifier;
  cameraState.lastX = touch.clientX;
  cameraState.lastY = touch.clientY;
}

function handleCameraMove(e) {
  e.preventDefault();
  
  if (!cameraState.active) return;
  
  let touch = null;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === cameraState.touchId) {
      touch = e.changedTouches[i];
      break;
    }
  }
  
  if (!touch) return;
  
  const deltaX = touch.clientX - cameraState.lastX;
  const deltaY = touch.clientY - cameraState.lastY;
  
  if (applyCameraRotation) {
    applyCameraRotation(deltaX, deltaY);
  }
  
  cameraState.lastX = touch.clientX;
  cameraState.lastY = touch.clientY;
}

function handleCameraEnd(e) {
  e.preventDefault();
  
  let ourTouchEnded = false;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === cameraState.touchId) {
      ourTouchEnded = true;
      break;
    }
  }
  
  if (ourTouchEnded) {
    cameraState.active = false;
    cameraState.touchId = null;
  }
}
