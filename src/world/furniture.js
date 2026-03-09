import { createCeilingFurniture } from './furniture/ceilingFurniture.js';
import { createFloorFurniture } from './furniture/floorFurniture.js';
import { createWallMountedFurniture } from './furniture/wallMountedFurniture.js';

export function createFurniture(interiorGroup, wallGroups) {
  createCeilingFurniture(interiorGroup);
  const { furnitureCollisionBoxes } = createFloorFurniture(interiorGroup);
  createWallMountedFurniture(wallGroups);

  return { furnitureCollisionBoxes };
}
