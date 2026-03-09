import * as THREE from 'three';
import { createGround } from './world/ground.js';
import { createHouse, HOUSE_CONSTANTS } from './world/house.js';
import { createFurniture } from './world/furniture.js';
import { createGarden } from './world/garden.js';
import { createSky } from './world/sky.js';
import { createKorilakkuma } from './character/korilakkuma.js';
import { createController, updateController, initCharacterPosition, setCollisionBoxes } from './character/controller.js';
import { updateAnimations } from './character/animations.js';
import { createThirdPersonCamera, updateCamera, getCameraForward, applyCameraRotation } from './camera/thirdPerson.js';
import { isTouchDevice, createTouchControls } from './controls/touchControls.js';
import { createLighting, updateLighting } from './effects/lighting.js';
import { createAudio, resumeAudio, updateAudio } from './effects/audio.js';
import { createDoorEntry, updateDoorEntry } from './interaction/doorEntry.js';
import { initFurnitureInteraction, updateFurnitureInteraction } from './interaction/furnitureInteraction.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ECAE6);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 5, 20);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xFFF5E0, 0.45);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xFFF0D4, 1.1);
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

const gameState = {
  timeOfDay: 0.25,
  fps: 0,
  characterPosition: new THREE.Vector3(),
  isIndoor: false,
};
window.gameState = gameState;
window.__scene = scene;

window.__character = null;


const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');

function setLoadingProgress(percent, text) {
  if (loadingBar) loadingBar.style.width = percent + '%';
  if (loadingText) loadingText.textContent = text;
}

function hideLoadingScreen() {
  if (!loadingScreen) return;
  loadingScreen.classList.add('fade-out');
  setTimeout(() => loadingScreen.classList.add('hidden'), 600);
}

async function init() {
  setLoadingProgress(10, 'Creating ground...');
  createGround(scene);

  setLoadingProgress(20, 'Building house...');
  const { exteriorGroup, interiorGroup, roofGroup, wallGroups, collisionBoxes, frontDoorCollisionBox } = createHouse(scene);
  interiorGroup.visible = false;

  setLoadingProgress(35, 'Furnishing rooms...');
  const { furnitureCollisionBoxes } = createFurniture(interiorGroup, wallGroups);

  setLoadingProgress(45, 'Planting garden...');
  const gardenResult = createGarden(scene);

  setLoadingProgress(55, 'Painting sky...');
  createSky(scene);

  setLoadingProgress(65, 'Loading Korilakkuma...');
  const character = await createKorilakkuma((progress) => {
    const pct = 65 + Math.round(progress * 20);
    setLoadingProgress(pct, 'Loading Korilakkuma...');
  });
  scene.add(character.group);
  window.__character = character;

  setLoadingProgress(88, 'Setting up controls...');
  const controllerState = createController();
  initCharacterPosition(character.group, controllerState);
  setCollisionBoxes(collisionBoxes);

  createThirdPersonCamera(camera, canvas);

  if (isTouchDevice()) {
    createTouchControls(controllerState, { applyCameraRotation });
    document.addEventListener('touchstart', () => {
      resumeAudio();
    }, { once: true });
  } else {
    canvas.addEventListener('click', () => {
      resumeAudio();
    }, { once: true });
  }

  setLoadingProgress(92, 'Lighting the scene...');
  createLighting(scene, sunLight, ambientLight);

  setLoadingProgress(95, 'Preparing sounds...');
  createAudio();

  const allIndoorCollisionBoxes = [...collisionBoxes, ...furnitureCollisionBoxes];
  createDoorEntry({
    characterGroup: character.group,
    exteriorGroup,
    interiorGroup,
    roofGroup,
    wallGroups,
    camera,
    outdoorCollisionBoxes: collisionBoxes,
    indoorCollisionBoxes: allIndoorCollisionBoxes,
    frontDoorCollisionBox,
  });

  initFurnitureInteraction();

  setLoadingProgress(100, 'Ready!');
  hideLoadingScreen();

  const clock = new THREE.Clock();
  let frameCount = 0;
  let fpsTime = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);

    frameCount++;
    fpsTime += dt;
    if (fpsTime >= 1.0) {
      gameState.fps = Math.round(frameCount / fpsTime);
      frameCount = 0;
      fpsTime = 0;
    }

    const movementState = updateController(dt, character.group, controllerState, getCameraForward);

    updateAnimations(dt, movementState, {
      bodyGroup: character.bodyGroup,
      dustParticles: character.dustParticles,
    });

    updateCamera(dt, character.group);
    updateDoorEntry(dt, character.group.position);
    updateFurnitureInteraction(character.group.position);
    updateLighting(dt, scene, sunLight, ambientLight, gameState);
    updateAudio(dt, movementState, character.group.position);
    if (gardenResult && gardenResult.updateGardenParticles) gardenResult.updateGardenParticles(dt);

    gameState.characterPosition.copy(character.group.position);

    renderer.render(scene, camera);
  }

  animate();
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200);
});

init().catch((err) => {
  console.error('Failed to initialize game:', err);
  setLoadingProgress(0, 'Failed to load — check console');
});

export { scene, camera, renderer, sunLight, ambientLight, gameState };
