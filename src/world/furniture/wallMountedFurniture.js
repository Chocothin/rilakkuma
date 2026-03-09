import * as THREE from 'three';
import { HOUSE_CONSTANTS } from '../house.js';
import { createCurtain, createMirror, createPictureFrame, createSmallShelf, createTowelRack, PASTEL } from './common.js';

export function createWallMountedFurniture(wallGroups) {
  const { FLOOR_Y } = HOUSE_CONSTANTS;

  wallGroups.interiorHoriz1.add(createPictureFrame(-1, 1.6, -0.85, 0.4, 0.3, PASTEL.pink));
  wallGroups.interiorHoriz1.add(createPictureFrame(-3, 1.8, -0.85, 0.3, 0.4, PASTEL.mint));
  wallGroups.interiorHoriz1.add(createPictureFrame(-4.5, 1.5, -0.85, 0.35, 0.25, PASTEL.lavender));

  wallGroups.east.add(createTowelRack(5.8, 1.0, -0.5, Math.PI / 2));

  const mirror = createMirror(new THREE.Vector3(3, 1.4, -2.15), 0.6, 0.8);
  wallGroups.interiorHoriz2.add(mirror);

  wallGroups.east.add(createTowelRack(5.8, 1.2, -3.5, Math.PI / 2));
  wallGroups.east.add(createSmallShelf(5.5, 1.5, -2.3, Math.PI / 2));

  wallGroups.west.add(createCurtain(-5.85, FLOOR_Y, -3.5, 2.0, Math.PI / 2));
  wallGroups.west.add(createCurtain(-5.85, FLOOR_Y, -2.5, 2.0, Math.PI / 2));
}
