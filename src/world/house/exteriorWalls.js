import * as THREE from 'three';
import { createHorizontalWallWithOpenings, createVerticalWallWithOpenings } from './wallUtils.js';

export function createExteriorWalls({ constants, exteriorWallMaterial, windowFrameMaterial, doorFrameMaterial, collisionBoxes, createWindowFrame, createDoorFrame }) {
  const {
    WALL_HEIGHT,
    WALL_THICKNESS,
    DOOR_HEIGHT,
    DOOR_WIDTH,
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    WINDOW_SILL_HEIGHT,
  } = constants;

  const wallSouth = new THREE.Group();
  wallSouth.name = 'wallSouth';
  const wallNorth = new THREE.Group();
  wallNorth.name = 'wallNorth';
  const wallWest = new THREE.Group();
  wallWest.name = 'wallWest';
  const wallEast = new THREE.Group();
  wallEast.name = 'wallEast';

  createHorizontalWallWithOpenings(
    wallSouth,
    {
      z: 5 + WALL_THICKNESS / 2,
      xStart: -6,
      xEnd: 6,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [
        { x: -1, width: DOOR_WIDTH, height: DOOR_HEIGHT, fromFloor: 0 },
        { x: -4, width: WINDOW_WIDTH, height: WINDOW_HEIGHT, fromFloor: WINDOW_SILL_HEIGHT },
        { x: 4, width: WINDOW_WIDTH, height: WINDOW_HEIGHT, fromFloor: WINDOW_SILL_HEIGHT },
      ],
    },
    exteriorWallMaterial,
    collisionBoxes
  );

  createHorizontalWallWithOpenings(
    wallNorth,
    {
      z: -5 - WALL_THICKNESS / 2,
      xStart: -6,
      xEnd: 6,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [
        { x: -2, width: WINDOW_WIDTH, height: WINDOW_HEIGHT, fromFloor: WINDOW_SILL_HEIGHT },
        { x: 4, width: 0.8, height: 0.6, fromFloor: 1.8 },
      ],
    },
    exteriorWallMaterial,
    collisionBoxes
  );

  createVerticalWallWithOpenings(
    wallWest,
    {
      x: -6 - WALL_THICKNESS / 2,
      zStart: -5,
      zEnd: 5,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [
        { z: -3, width: WINDOW_WIDTH, height: WINDOW_HEIGHT, fromFloor: WINDOW_SILL_HEIGHT },
        { z: 2, width: WINDOW_WIDTH, height: WINDOW_HEIGHT, fromFloor: WINDOW_SILL_HEIGHT },
      ],
    },
    exteriorWallMaterial,
    collisionBoxes
  );

  createVerticalWallWithOpenings(
    wallEast,
    {
      x: 6 + WALL_THICKNESS / 2,
      zStart: -5,
      zEnd: 5,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [{ z: 2, width: WINDOW_WIDTH, height: WINDOW_HEIGHT, fromFloor: WINDOW_SILL_HEIGHT }],
    },
    exteriorWallMaterial,
    collisionBoxes
  );

  const windowY = WINDOW_SILL_HEIGHT + WINDOW_HEIGHT / 2;
  const bathroomWindowY = 1.8 + 0.6 / 2;
  const wc = WALL_THICKNESS / 2;

  wallSouth.add(createWindowFrame(-4, windowY, 5 + wc, false, windowFrameMaterial));
  wallSouth.add(createWindowFrame(4, windowY, 5 + wc, false, windowFrameMaterial));
  wallSouth.add(createDoorFrame(-1, 0, 5 + wc, doorFrameMaterial));

  wallNorth.add(createWindowFrame(-2, windowY, -5 - wc, false, windowFrameMaterial));
  wallNorth.add(createWindowFrame(4, bathroomWindowY, -5 - wc, false, windowFrameMaterial, 0.8, 0.6));

  wallWest.add(createWindowFrame(-6 - wc, windowY, 2, true, windowFrameMaterial));
  wallWest.add(createWindowFrame(-6 - wc, windowY, -3, true, windowFrameMaterial));

  wallEast.add(createWindowFrame(6 + wc, windowY, 2, true, windowFrameMaterial));

  return {
    wallSouth,
    wallNorth,
    wallWest,
    wallEast,
  };
}
