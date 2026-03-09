import * as THREE from 'three';
import { createExteriorWalls } from './house/exteriorWalls.js';
import { createInteriorWalls } from './house/interiorWalls.js';

/**
 * House constants - shared dimensions and room data
 */
export const HOUSE_CONSTANTS = {
  WALL_HEIGHT: 3.2,
  WALL_THICKNESS: 0.2,
  DOOR_HEIGHT: 2.4,
  DOOR_WIDTH: 1.2,
  WINDOW_WIDTH: 1.2,
  WINDOW_HEIGHT: 1.0,
  WINDOW_SILL_HEIGHT: 1.4,
  FLOOR_Y: 0.05,
  ROOMS: {
    LIVING: { center: { x: -2, y: 0, z: 2 }, name: 'Living Room', width: 7.8, depth: 5.8 },
    KITCHEN: { center: { x: 4, y: 0, z: 1.5 }, name: 'Kitchen', width: 3.8, depth: 6.8 },
    BEDROOM: { center: { x: -2, y: 0, z: -3 }, name: 'Bedroom', width: 7.8, depth: 3.8 },
    BATHROOM: { center: { x: 4, y: 0, z: -3.5 }, name: 'Bathroom', width: 3.8, depth: 2.8 },
  },
  FRONT_DOOR_POSITION: { x: -1, y: 0, z: 5.5 },
  ENTRY_POSITION: { x: -1, y: 0.05, z: 3.5 },
  EXIT_POSITION: { x: -1, y: 0, z: 6.5 },
};

/**
 * Create window frame
 * @param {number} winWidth - optional override for window width (defaults to HOUSE_CONSTANTS.WINDOW_WIDTH)
 * @param {number} winHeight - optional override for window height (defaults to HOUSE_CONSTANTS.WINDOW_HEIGHT)
 */
function createWindowFrame(x, y, z, isVerticalWall, material, winWidth, winHeight) {
  const group = new THREE.Group();
  const frameThickness = 0.05;
  const frameDepth = 0.15;
  
  const ww = winWidth ?? HOUSE_CONSTANTS.WINDOW_WIDTH;
  const wh = winHeight ?? HOUSE_CONSTANTS.WINDOW_HEIGHT;

  // Frame pieces
  const pieces = [
    // Top
    { w: ww + 0.2, h: frameThickness, d: frameDepth, x: 0, y: wh / 2 + frameThickness / 2, z: 0 },
    // Bottom
    { w: ww + 0.2, h: frameThickness, d: frameDepth, x: 0, y: -wh / 2 - frameThickness / 2, z: 0 },
    // Left
    { w: frameThickness, h: wh + frameThickness * 2, d: frameDepth, x: -ww / 2 - frameThickness / 2, y: 0, z: 0 },
    // Right
    { w: frameThickness, h: wh + frameThickness * 2, d: frameDepth, x: ww / 2 + frameThickness / 2, y: 0, z: 0 },
  ];

  pieces.forEach(p => {
    const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(p.x, p.y, p.z);
    mesh.castShadow = true;
    group.add(mesh);
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xB3E5FC,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const glassGeo = new THREE.PlaneGeometry(ww, wh);
  const glass = new THREE.Mesh(glassGeo, glassMaterial);
  group.add(glass);

  if (isVerticalWall) {
    group.rotation.y = Math.PI / 2;
  }

  group.position.set(x, y, z);
  return group;
}

function createDoorFrame(x, y, z, material, doorWidth, doorHeight) {
  const group = new THREE.Group();
  const frameThickness = 0.08;
  const frameDepth = 0.25;
  
  const dw = doorWidth ?? HOUSE_CONSTANTS.DOOR_WIDTH;
  const dh = doorHeight ?? HOUSE_CONSTANTS.DOOR_HEIGHT;

  const pieces = [
    { w: dw + 0.3, h: frameThickness, d: frameDepth, x: 0, y: dh / 2 + frameThickness / 2, z: 0 },
    { w: frameThickness, h: dh, d: frameDepth, x: -dw / 2 - 0.15, y: dh / 2, z: 0 },
    { w: frameThickness, h: dh, d: frameDepth, x: dw / 2 + 0.15, y: dh / 2, z: 0 },
  ];

  pieces.forEach(p => {
    const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(p.x, p.y, p.z);
    mesh.castShadow = true;
    group.add(mesh);
  });

  group.position.set(x, y, z);
  return group;
}

/**
 * Create pitched roof
 */
function createRoof(material) {
  const { WALL_HEIGHT } = HOUSE_CONSTANTS;
  const houseWidth = 12;
  const houseDepth = 10;
  const overhang = 0.5;
  const roofHeight = 2;

  const roofGroup = new THREE.Group();

  const hw = houseWidth / 2 + overhang;
  const hd = houseDepth / 2 + overhang;
  const baseY = WALL_HEIGHT;
  const peakY = WALL_HEIGHT + roofHeight;

  const doubleMat = material.clone();
  doubleMat.side = THREE.DoubleSide;

  const leftVerts = new Float32Array([
    -hw, baseY, -hd,
     0,  peakY, -hd,
     0,  peakY,  hd,
    -hw, baseY,  hd,
  ]);
  const leftIdx = [0, 1, 2, 0, 2, 3];
  const leftGeo = new THREE.BufferGeometry();
  leftGeo.setAttribute('position', new THREE.BufferAttribute(leftVerts, 3));
  leftGeo.setIndex(leftIdx);
  leftGeo.computeVertexNormals();
  const leftRoof = new THREE.Mesh(leftGeo, doubleMat);
  leftRoof.castShadow = true;
  leftRoof.receiveShadow = true;
  roofGroup.add(leftRoof);

  const rightVerts = new Float32Array([
     0,  peakY, -hd,
     hw, baseY, -hd,
     hw, baseY,  hd,
     0,  peakY,  hd,
  ]);
  const rightIdx = [0, 1, 2, 0, 2, 3];
  const rightGeo = new THREE.BufferGeometry();
  rightGeo.setAttribute('position', new THREE.BufferAttribute(rightVerts, 3));
  rightGeo.setIndex(rightIdx);
  rightGeo.computeVertexNormals();
  const rightRoof = new THREE.Mesh(rightGeo, doubleMat);
  rightRoof.castShadow = true;
  rightRoof.receiveShadow = true;
  roofGroup.add(rightRoof);

  const capShape = new THREE.Shape();
  capShape.moveTo(-hw, 0);
  capShape.lineTo(0, roofHeight);
  capShape.lineTo(hw, 0);
  capShape.lineTo(-hw, 0);

  const capGeo = new THREE.ShapeGeometry(capShape);

  const frontCap = new THREE.Mesh(capGeo, doubleMat);
  frontCap.position.set(0, baseY, hd);
  frontCap.castShadow = true;
  roofGroup.add(frontCap);

  const backCap = new THREE.Mesh(capGeo, doubleMat);
  backCap.rotation.y = Math.PI;
  backCap.position.set(0, baseY, -hd);
  backCap.castShadow = true;
  roofGroup.add(backCap);

  return roofGroup;
}

function createBaseboards(room, material, wallGroups) {
  const baseboardHeight = 0.15;
  const baseboardDepth = 0.05;
  const roomX = room.center.x;
  const roomZ = room.center.z;
  const halfW = room.width / 2;
  const halfD = room.depth / 2;

  const segments = [
    { x: roomX, y: baseboardHeight / 2, z: roomZ - halfD, w: room.width, h: baseboardHeight, d: baseboardDepth, side: 'n' },
    { x: roomX, y: baseboardHeight / 2, z: roomZ + halfD, w: room.width, h: baseboardHeight, d: baseboardDepth, side: 's' },
    { x: roomX - halfW, y: baseboardHeight / 2, z: roomZ, w: baseboardDepth, h: baseboardHeight, d: room.depth, side: 'w' },
    { x: roomX + halfW, y: baseboardHeight / 2, z: roomZ, w: baseboardDepth, h: baseboardHeight, d: room.depth, side: 'e' },
  ];

  segments.forEach(seg => {
    const geo = new THREE.BoxGeometry(seg.w, seg.h, seg.d);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(seg.x, seg.y, seg.z);
    mesh.castShadow = true;
    classifyBaseboardIntoWallGroup(seg, wallGroups).add(mesh);
  });
}

// Exterior walls at x=±6, z=±5. Interior walls at x=2, z=-1, z=-2.
function classifyBaseboardIntoWallGroup(seg, wallGroups) {
  const T = 0.2;

  if (seg.side === 'n' || seg.side === 's') {
    if (Math.abs(seg.z - 5) < T)  return wallGroups.south;
    if (Math.abs(seg.z + 5) < T)  return wallGroups.north;
    if (Math.abs(seg.z + 1) < T)  return wallGroups.interiorHoriz1;
    if (Math.abs(seg.z + 2) < T)  return wallGroups.interiorHoriz2;
  } else {
    if (Math.abs(seg.x - 6) < T)  return wallGroups.east;
    if (Math.abs(seg.x + 6) < T)  return wallGroups.west;
    if (Math.abs(seg.x - 2) < T)  return wallGroups.interiorVert;
  }

  return wallGroups.interiorVert;
}

/**
 * Create exterior decorations for the house
 */
function createExteriorDecorations(exteriorGroup, wallGroups) {
  const { WALL_THICKNESS, WINDOW_SILL_HEIGHT, WINDOW_HEIGHT } = HOUSE_CONSTANTS;

  const flowerBoxMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
  const flowerColors = [0xFFD1DC, 0xFF6B6B, 0xFFF1C1, 0xC9B1FF];

  const windowPositions = [
    { x: -4, z: 5 + WALL_THICKNESS / 2, isVertical: false, wall: 'south' },
    { x: 4, z: 5 + WALL_THICKNESS / 2, isVertical: false, wall: 'south' },
    { x: -2, z: -5 - WALL_THICKNESS / 2, isVertical: false, wall: 'north' },
    { x: -6 - WALL_THICKNESS / 2, z: 2, isVertical: true, wall: 'west' },
    { x: -6 - WALL_THICKNESS / 2, z: -3, isVertical: true, wall: 'west' },
    { x: 6 + WALL_THICKNESS / 2, z: 2, isVertical: true, wall: 'east' },
  ];

  windowPositions.forEach(pos => {
    const target = wallGroups[pos.wall] || exteriorGroup;
    const boxY = WINDOW_SILL_HEIGHT - 0.15;
    const boxWidth = 1.4;
    const boxHeight = 0.2;
    const boxDepth = 0.25;

    const boxGeo = new THREE.BoxGeometry(
      pos.isVertical ? boxDepth : boxWidth,
      boxHeight,
      pos.isVertical ? boxWidth : boxDepth
    );
    const box = new THREE.Mesh(boxGeo, flowerBoxMaterial);
    box.position.set(pos.x, boxY, pos.z);
    box.castShadow = true;
    box.receiveShadow = true;
    target.add(box);

    for (let i = 0; i < 4; i++) {
      const flowerGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const flowerMat = new THREE.MeshStandardMaterial({
        color: flowerColors[i % flowerColors.length]
      });
      const flower = new THREE.Mesh(flowerGeo, flowerMat);

      const offset = (i - 1.5) * 0.3;
      if (pos.isVertical) {
        flower.position.set(pos.x, boxY + boxHeight / 2 + 0.08, pos.z + offset);
      } else {
        flower.position.set(pos.x + offset, boxY + boxHeight / 2 + 0.08, pos.z);
      }

      flower.castShadow = true;
      flower.receiveShadow = true;
      target.add(flower);
    }
  });

  // ========== CHIMNEY ==========
  const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0xA1887F });
  const chimneyGeo = new THREE.BoxGeometry(0.8, 1.5, 0.8);
  const chimney = new THREE.Mesh(chimneyGeo, chimneyMaterial);
  chimney.position.set(3, 4.2 + 1.5 / 2, -2);
  chimney.castShadow = true;
  chimney.receiveShadow = true;
  exteriorGroup.add(chimney);

  // ========== DOOR CANOPY + LANTERNS (south wall) ==========
  const southTarget = wallGroups.south || exteriorGroup;

  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
  const canopyGeo = new THREE.BoxGeometry(2.0, 0.1, 0.8);
  const canopy = new THREE.Mesh(canopyGeo, canopyMaterial);
  canopy.position.set(-1, 2.6, 5.5);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  southTarget.add(canopy);

  const postMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);

  const leftPost = new THREE.Mesh(postGeo, postMaterial);
  leftPost.position.set(-1.8, 2.4, 5.3);
  leftPost.castShadow = true;
  leftPost.receiveShadow = true;
  southTarget.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, postMaterial);
  rightPost.position.set(-0.2, 2.4, 5.3);
  rightPost.castShadow = true;
  rightPost.receiveShadow = true;
  southTarget.add(rightPost);

  const lanternPostMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
  const lanternMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFF8E1,
    emissive: 0xFFE082,
    emissiveIntensity: 0.5
  });

  [{ x: -1.8, z: 5.3 }, { x: -0.2, z: 5.3 }].forEach(pos => {
    const lPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
    const lPost = new THREE.Mesh(lPostGeo, lanternPostMaterial);
    lPost.position.set(pos.x, 2.0, pos.z);
    lPost.castShadow = true;
    lPost.receiveShadow = true;
    southTarget.add(lPost);

    const lanternGeo = new THREE.BoxGeometry(0.15, 0.2, 0.15);
    const lantern = new THREE.Mesh(lanternGeo, lanternMaterial);
    lantern.position.set(pos.x, 2.3, pos.z);
    lantern.castShadow = true;
    lantern.receiveShadow = true;
    southTarget.add(lantern);
  });

  // ========== SHUTTERS (south wall) ==========
  const shutterMaterial = new THREE.MeshStandardMaterial({ color: 0x7CB342 });
  [
    { x: -4, z: 5 + WALL_THICKNESS / 2 },
    { x: 4, z: 5 + WALL_THICKNESS / 2 }
  ].forEach(pos => {
    const shutterGeo = new THREE.BoxGeometry(0.15, WINDOW_HEIGHT, 0.05);

    const leftShutter = new THREE.Mesh(shutterGeo, shutterMaterial);
    leftShutter.position.set(pos.x - 0.75, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT / 2, pos.z);
    leftShutter.castShadow = true;
    leftShutter.receiveShadow = true;
    southTarget.add(leftShutter);

    const rightShutter = new THREE.Mesh(shutterGeo, shutterMaterial);
    rightShutter.position.set(pos.x + 0.75, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT / 2, pos.z);
    rightShutter.castShadow = true;
    rightShutter.receiveShadow = true;
    southTarget.add(rightShutter);
  });

  // ========== WELCOME MAT + STEPPING STONES (ground, not wall-attached) ==========
  const matMaterial = new THREE.MeshStandardMaterial({ color: 0xD7CCC8 });
  const matGeo = new THREE.BoxGeometry(1.0, 0.02, 0.6);
  const mat = new THREE.Mesh(matGeo, matMaterial);
  mat.position.set(-1, 0.02, 6.0);
  mat.castShadow = true;
  mat.receiveShadow = true;
  exteriorGroup.add(mat);

  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xBDBDBD });
  [6.2, 6.8, 7.4, 8.0].forEach(z => {
    const stoneGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16);
    const stone = new THREE.Mesh(stoneGeo, stoneMaterial);
    stone.position.set(-1 + (Math.random() - 0.5) * 0.3, 0.02, z);
    stone.rotation.y = Math.random() * Math.PI;
    stone.castShadow = true;
    stone.receiveShadow = true;
    exteriorGroup.add(stone);
  });
}

/**
 * Main function to create the house
 */
export function createHouse(scene) {
  const exteriorGroup = new THREE.Group();
  exteriorGroup.name = 'houseExterior';

  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'houseInterior';

  const collisionBoxes = [];

  const {
    WALL_HEIGHT,
    WALL_THICKNESS,
    DOOR_HEIGHT,
    DOOR_WIDTH,
    FLOOR_Y,
  } = HOUSE_CONSTANTS;

  // Materials
  const exteriorWallMaterial = new THREE.MeshStandardMaterial({ color: 0xF5E6D3 });
  const interiorWallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF8E1 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xD7A86E });
  const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFDE7 });
  const doorFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x5D4037,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const baseboardMaterial = new THREE.MeshStandardMaterial({ color: 0xBCAAA4 });
  const windowFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x8D6E63,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const {
    wallSouth,
    wallNorth,
    wallWest,
    wallEast,
  } = createExteriorWalls({
    constants: HOUSE_CONSTANTS,
    exteriorWallMaterial,
    windowFrameMaterial,
    doorFrameMaterial,
    collisionBoxes,
    createWindowFrame,
    createDoorFrame,
  });

  exteriorGroup.add(wallSouth, wallNorth, wallWest, wallEast);

  // ========== ROOF ==========
  const roofGroup = createRoof(roofMaterial);
  roofGroup.name = 'roof';
  exteriorGroup.add(roofGroup);

  const {
    interiorWallVert,
    interiorWallHoriz1,
    interiorWallHoriz2,
  } = createInteriorWalls({
    constants: HOUSE_CONSTANTS,
    interiorWallMaterial,
    doorFrameMaterial,
    collisionBoxes,
    createDoorFrame,
  });

  interiorGroup.add(interiorWallVert, interiorWallHoriz1, interiorWallHoriz2);

  // ========== ROOM FLOORS ==========
  Object.values(HOUSE_CONSTANTS.ROOMS).forEach(room => {
    const floorGeo = new THREE.PlaneGeometry(room.width, room.depth);
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(room.center.x, FLOOR_Y, room.center.z);
    floor.receiveShadow = true;
    interiorGroup.add(floor);
  });

  // ========== ROOM CEILINGS ==========
  Object.values(HOUSE_CONSTANTS.ROOMS).forEach(room => {
    const ceilingGeo = new THREE.PlaneGeometry(room.width, room.depth);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(room.center.x, WALL_HEIGHT, room.center.z);
    ceiling.receiveShadow = true;
    interiorGroup.add(ceiling);
  });

  // ========== WALL GROUPS ==========
  const wallGroups = {
    south: wallSouth, north: wallNorth, west: wallWest, east: wallEast,
    interiorVert: interiorWallVert, interiorHoriz1: interiorWallHoriz1, interiorHoriz2: interiorWallHoriz2,
  };

  // ========== BASEBOARDS ==========
  Object.values(HOUSE_CONSTANTS.ROOMS).forEach(room => {
    createBaseboards(room, baseboardMaterial, wallGroups);
  });

  // ========== FRONT DOOR COLLISION BOX ==========
  const doorX = HOUSE_CONSTANTS.FRONT_DOOR_POSITION.x;
  const doorZ = 5 + WALL_THICKNESS / 2;
  const frontDoorCollisionBox = new THREE.Box3(
    new THREE.Vector3(doorX - DOOR_WIDTH / 2, 0, doorZ - WALL_THICKNESS / 2),
    new THREE.Vector3(doorX + DOOR_WIDTH / 2, DOOR_HEIGHT, doorZ + WALL_THICKNESS / 2)
  );
  collisionBoxes.push(frontDoorCollisionBox);

  // ========== EXTERIOR DECORATIONS ==========
  createExteriorDecorations(exteriorGroup, wallGroups);

  scene.add(exteriorGroup);
  scene.add(interiorGroup);

  return { exteriorGroup, interiorGroup, roofGroup, wallGroups, collisionBoxes, frontDoorCollisionBox };
}
