import * as THREE from 'three';
import { createHorizontalWallWithOpenings, createVerticalWallWithOpenings } from './wallUtils.js';

export function createInteriorWalls({ constants, interiorWallMaterial, doorFrameMaterial, collisionBoxes, createDoorFrame }) {
  const { WALL_HEIGHT, WALL_THICKNESS, DOOR_HEIGHT, DOOR_WIDTH } = constants;

  const interiorWallVert = new THREE.Group();
  interiorWallVert.name = 'interiorWallVert';
  const interiorWallHoriz1 = new THREE.Group();
  interiorWallHoriz1.name = 'interiorWallHoriz1';
  const interiorWallHoriz2 = new THREE.Group();
  interiorWallHoriz2.name = 'interiorWallHoriz2';

  createVerticalWallWithOpenings(
    interiorWallVert,
    {
      x: 2,
      zStart: -5,
      zEnd: 5,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [
        { z: -3.5, width: 0.8, height: DOOR_HEIGHT, fromFloor: 0 },
        { z: 2, width: 2.0, height: 2.6, fromFloor: 0 },
      ],
    },
    interiorWallMaterial,
    collisionBoxes
  );

  createHorizontalWallWithOpenings(
    interiorWallHoriz1,
    {
      z: -1,
      xStart: -6,
      xEnd: 2,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [{ x: -2, width: DOOR_WIDTH, height: DOOR_HEIGHT, fromFloor: 0 }],
    },
    interiorWallMaterial,
    collisionBoxes
  );

  createHorizontalWallWithOpenings(
    interiorWallHoriz2,
    {
      z: -2,
      xStart: 2,
      xEnd: 6,
      height: WALL_HEIGHT,
      thickness: WALL_THICKNESS,
      openings: [],
    },
    interiorWallMaterial,
    collisionBoxes
  );

  interiorWallHoriz1.add(createDoorFrame(-2, 0, -1, doorFrameMaterial));
  const bathroomDoorFrame = createDoorFrame(2, 0, -3.5, doorFrameMaterial, 0.8);
  bathroomDoorFrame.rotation.y = Math.PI / 2;
  interiorWallVert.add(bathroomDoorFrame);

  return {
    interiorWallVert,
    interiorWallHoriz1,
    interiorWallHoriz2,
  };
}
