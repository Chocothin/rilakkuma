import * as THREE from 'three';

export function createWallSegment(x, y, z, width, height, depth, material, collisionBoxes) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.isWallOccluder = true;

  const box = new THREE.Box3().setFromObject(mesh);
  collisionBoxes.push(box);

  return mesh;
}

export function createHorizontalWallWithOpenings(group, config, material, collisionBoxes) {
  const { z, xStart, xEnd, height, thickness, openings = [] } = config;
  const wallLength = xEnd - xStart;
  const y = height / 2;

  if (openings.length === 0) {
    const mesh = createWallSegment(
      (xStart + xEnd) / 2,
      y,
      z,
      wallLength,
      height,
      thickness,
      material,
      collisionBoxes
    );
    group.add(mesh);
    return;
  }

  const sortedOpenings = [...openings].sort((a, b) => a.x - b.x);
  let currentX = xStart;

  sortedOpenings.forEach((opening) => {
    const { x, width, height: openHeight, fromFloor } = opening;
    const openLeft = x - width / 2;
    const openRight = x + width / 2;

    if (openLeft > currentX) {
      const segWidth = openLeft - currentX;
      const mesh = createWallSegment(
        currentX + segWidth / 2,
        y,
        z,
        segWidth,
        height,
        thickness,
        material,
        collisionBoxes
      );
      group.add(mesh);
    }

    const topHeight = height - (fromFloor + openHeight);
    if (topHeight > 0.01) {
      const topY = fromFloor + openHeight + topHeight / 2;
      const mesh = createWallSegment(
        x,
        topY,
        z,
        width,
        topHeight,
        thickness,
        material,
        collisionBoxes
      );
      group.add(mesh);
    }

    if (fromFloor > 0.01) {
      const bottomY = fromFloor / 2;
      const mesh = createWallSegment(
        x,
        bottomY,
        z,
        width,
        fromFloor,
        thickness,
        material,
        collisionBoxes
      );
      group.add(mesh);
    }

    currentX = openRight;
  });

  if (currentX < xEnd) {
    const segWidth = xEnd - currentX;
    const mesh = createWallSegment(
      currentX + segWidth / 2,
      y,
      z,
      segWidth,
      height,
      thickness,
      material,
      collisionBoxes
    );
    group.add(mesh);
  }
}

export function createVerticalWallWithOpenings(group, config, material, collisionBoxes) {
  const { x, zStart, zEnd, height, thickness, openings = [] } = config;
  const wallLength = zEnd - zStart;
  const y = height / 2;

  if (openings.length === 0) {
    const mesh = createWallSegment(
      x,
      y,
      (zStart + zEnd) / 2,
      thickness,
      height,
      wallLength,
      material,
      collisionBoxes
    );
    group.add(mesh);
    return;
  }

  const sortedOpenings = [...openings].sort((a, b) => a.z - b.z);
  let currentZ = zStart;

  sortedOpenings.forEach((opening) => {
    const { z, width, height: openHeight, fromFloor } = opening;
    const openFront = z - width / 2;
    const openBack = z + width / 2;

    if (openFront > currentZ) {
      const segDepth = openFront - currentZ;
      const mesh = createWallSegment(
        x,
        y,
        currentZ + segDepth / 2,
        thickness,
        height,
        segDepth,
        material,
        collisionBoxes
      );
      group.add(mesh);
    }

    const topHeight = height - (fromFloor + openHeight);
    if (topHeight > 0.01) {
      const topY = fromFloor + openHeight + topHeight / 2;
      const mesh = createWallSegment(
        x,
        topY,
        z,
        thickness,
        topHeight,
        width,
        material,
        collisionBoxes
      );
      group.add(mesh);
    }

    if (fromFloor > 0.01) {
      const bottomY = fromFloor / 2;
      const mesh = createWallSegment(
        x,
        bottomY,
        z,
        thickness,
        fromFloor,
        width,
        material,
        collisionBoxes
      );
      group.add(mesh);
    }

    currentZ = openBack;
  });

  if (currentZ < zEnd) {
    const segDepth = zEnd - currentZ;
    const mesh = createWallSegment(
      x,
      y,
      currentZ + segDepth / 2,
      thickness,
      height,
      segDepth,
      material,
      collisionBoxes
    );
    group.add(mesh);
  }
}
