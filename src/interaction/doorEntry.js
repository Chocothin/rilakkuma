import * as THREE from 'three';
import { HOUSE_CONSTANTS } from '../world/house.js';
import { setIndoorMode } from '../effects/lighting.js';
import { setCollisionBoxes } from '../character/controller.js';

let isIndoor = false;
let isTransitioning = false;
const DOOR_PROXIMITY = 1.5;
const INDOOR_DOOR_PROXIMITY = 1.2;
const INDOOR_EXIT_REF = { x: -1, y: 0, z: 4.5 };
const FADE_DURATION = 500;

let _overlay = null;
let _prompt = null;
let _characterGroup = null;
let _exteriorGroup = null;
let _interiorGroup = null;
let _roofGroup = null;
let _wallGroups = null;
let _camera = null;
let _outdoorCollisionBoxes = [];
let _indoorCollisionBoxes = [];
let _frontDoorCollisionBox = null;
let _promptVisible = false;
let _onKeyDown = null;

const _doorPos = new THREE.Vector3();
const _charPos = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _rayDir = new THREE.Vector3();

const WALL_TRANSPARENT = 0.12;
const WALL_OPAQUE = 1.0;

const _wallBounds = {};
const _testBox = new THREE.Box3();
const _segStart = new THREE.Vector3();
const _segEnd = new THREE.Vector3();
let _boundsReady = false;

const _EXTERIOR_NAMES = new Set(['south', 'north', 'east', 'west']);
const _WALL_PAD = 0.3;

function prepareWalls() {
  Object.entries(_wallGroups).forEach(([name, group]) => {
    const box = new THREE.Box3();
    let hasMesh = false;
    group.traverse(child => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      child.userData._origOpacity = child.material.opacity;
      if (child.userData.isWallOccluder) {
        child.updateWorldMatrix(true, false);
        child.geometry.computeBoundingBox();
        _testBox.copy(child.geometry.boundingBox).applyMatrix4(child.matrixWorld);
        box.union(_testBox);
        hasMesh = true;
      }
    });
    if (hasMesh) {
      if (_EXTERIOR_NAMES.has(name)) box.expandByScalar(_WALL_PAD);
      _wallBounds[name] = box;
    }
  });
  _boundsReady = true;
}

function setGroupOpacity(group, opacity) {
  const fading = opacity < 1;
  group.traverse(child => {
    if (!child.isMesh || child.userData._origOpacity === undefined) return;
    const base = child.userData._origOpacity;
    const target = Math.min(base, opacity);
    child.material.transparent = target < 1;
    child.material.opacity = target;
    child.material.depthWrite = target >= 1;
    if (child.userData._origSide === undefined) {
      child.userData._origSide = child.material.side;
    }
    child.material.side = fading ? THREE.DoubleSide : child.userData._origSide;
  });
}

function segmentIntersectsBox(p0, p1, box) {
  const dir = _rayDir.copy(p1).sub(p0);
  const len = dir.length();
  if (len < 0.001) return false;
  dir.divideScalar(len);
  _raycaster.set(p0, dir);
  _raycaster.far = len;
  _raycaster.near = 0;
  return _raycaster.ray.intersectsBox(box);
}

function updateWallTransparency(charPos) {
  if (!_boundsReady) prepareWalls();

  _segStart.copy(charPos);
  _segStart.y += 1.0;
  _segEnd.copy(_camera.position);

  const exteriorHit = {
    south: _wallBounds.south ? segmentIntersectsBox(_segStart, _segEnd, _wallBounds.south) : false,
    north: _wallBounds.north ? segmentIntersectsBox(_segStart, _segEnd, _wallBounds.north) : false,
    east: _wallBounds.east ? segmentIntersectsBox(_segStart, _segEnd, _wallBounds.east) : false,
    west: _wallBounds.west ? segmentIntersectsBox(_segStart, _segEnd, _wallBounds.west) : false,
  };

  const dx = _camera.position.x - charPos.x;
  const dz = _camera.position.z - charPos.z;
  const absDx = Math.abs(dx);
  const absDz = Math.abs(dz);

  let fadeSouth = exteriorHit.south;
  let fadeNorth = exteriorHit.north;
  let fadeEast  = exteriorHit.east;
  let fadeWest  = exteriorHit.west;

  if (absDz >= absDx) {
    if (dz > 0) fadeSouth = true;
    else        fadeNorth = true;
  } else {
    if (dx > 0) fadeEast = true;
    else        fadeWest = true;
  }

  if (_wallGroups.south) setGroupOpacity(_wallGroups.south, fadeSouth ? WALL_TRANSPARENT : WALL_OPAQUE);
  if (_wallGroups.north) setGroupOpacity(_wallGroups.north, fadeNorth ? WALL_TRANSPARENT : WALL_OPAQUE);
  if (_wallGroups.east)  setGroupOpacity(_wallGroups.east,  fadeEast  ? WALL_TRANSPARENT : WALL_OPAQUE);
  if (_wallGroups.west)  setGroupOpacity(_wallGroups.west,  fadeWest  ? WALL_TRANSPARENT : WALL_OPAQUE);

  Object.entries(_wallGroups).forEach(([name, group]) => {
    if (_EXTERIOR_NAMES.has(name)) return;
    const box = _wallBounds[name];
    if (!box) return;
    const hit = segmentIntersectsBox(_segStart, _segEnd, box);
    setGroupOpacity(group, hit ? WALL_TRANSPARENT : WALL_OPAQUE);
  });
}

export function createDoorEntry({ characterGroup, exteriorGroup, interiorGroup, roofGroup, wallGroups, camera, outdoorCollisionBoxes, indoorCollisionBoxes, frontDoorCollisionBox }) {
  Object.keys(_wallBounds).forEach((k) => delete _wallBounds[k]);
  _boundsReady = false;

  _characterGroup = characterGroup;
  _exteriorGroup = exteriorGroup;
  _interiorGroup = interiorGroup;
  _roofGroup = roofGroup;
  _wallGroups = wallGroups || null;
  _camera = camera || null;
  _outdoorCollisionBoxes = outdoorCollisionBoxes || [];
  _indoorCollisionBoxes = indoorCollisionBoxes || [];
  _frontDoorCollisionBox = frontDoorCollisionBox || null;

  _overlay = document.getElementById('fade-overlay');
  _prompt = document.getElementById('interaction-prompt');

  if (_onKeyDown) {
    window.removeEventListener('keydown', _onKeyDown);
  }

  _onKeyDown = (e) => {
    if (e.code === 'KeyE' && _promptVisible && !isTransitioning) {
      if (isIndoor) {
        exitHouse();
      } else {
        enterHouse();
      }
    }
  };

  window.addEventListener('keydown', _onKeyDown);
}

export function updateDoorEntry(dt, characterPosition) {
  if (isTransitioning) return;
  
  const doorRef = isIndoor ? INDOOR_EXIT_REF : HOUSE_CONSTANTS.FRONT_DOOR_POSITION;
  _doorPos.set(doorRef.x, doorRef.y, doorRef.z);
  _charPos.copy(characterPosition);
  _charPos.y = 0;
  _doorPos.y = 0;
  
  const dist = _charPos.distanceTo(_doorPos);
  const proximity = isIndoor ? INDOOR_DOOR_PROXIMITY : DOOR_PROXIMITY;
  
  if (dist < proximity) {
    showPrompt(isIndoor ? 'E : 밖으로 나가기' : 'E : 집에 들어가기');
  } else {
    hidePrompt();
  }

  if (isIndoor && _wallGroups && _camera) {
    updateWallTransparency(characterPosition);
  }
}

function showPrompt(text) {
  if (!_prompt) return;
  _prompt.textContent = text;
  _prompt.classList.add('visible');
  _promptVisible = true;
}

function hidePrompt() {
  if (!_prompt) return;
  _prompt.classList.remove('visible');
  _promptVisible = false;
}

function fadeToBlack() {
  return new Promise(resolve => {
    if (!_overlay) return resolve();
    _overlay.classList.add('active');
    setTimeout(resolve, FADE_DURATION);
  });
}

function fadeFromBlack() {
  return new Promise(resolve => {
    if (!_overlay) return resolve();
    _overlay.classList.remove('active');
    setTimeout(resolve, FADE_DURATION);
  });
}

async function enterHouse() {
  isTransitioning = true;
  hidePrompt();
  
  await fadeToBlack();
  
  const entry = HOUSE_CONSTANTS.ENTRY_POSITION;
  _characterGroup.position.set(entry.x, entry.y, entry.z);
  
  _interiorGroup.visible = true;
  _exteriorGroup.visible = true;
  if (_roofGroup) _roofGroup.visible = false;
  
  setIndoorMode(true);
  setCollisionBoxes(_indoorCollisionBoxes);
  isIndoor = true;
  
  await fadeFromBlack();
  isTransitioning = false;
}

async function exitHouse() {
  isTransitioning = true;
  hidePrompt();
  
  await fadeToBlack();
  
  const exit = HOUSE_CONSTANTS.EXIT_POSITION;
  _characterGroup.position.set(exit.x, exit.y, exit.z);
  
  _interiorGroup.visible = false;
  _exteriorGroup.visible = true;
  if (_roofGroup) _roofGroup.visible = true;

  if (_wallGroups) {
    Object.values(_wallGroups).forEach(g => setGroupOpacity(g, WALL_OPAQUE));
  }
  
  setIndoorMode(false);
  setCollisionBoxes(_outdoorCollisionBoxes);
  isIndoor = false;
  
  await fadeFromBlack();
  isTransitioning = false;
}

export function getIsIndoor() {
  return isIndoor;
}

export function isDoorPromptActive() {
  return _promptVisible;
}
