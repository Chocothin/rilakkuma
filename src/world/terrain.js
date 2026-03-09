import * as THREE from 'three';

export const GROUND_Y = 0;
export const PLANET_RADIUS = 0;

export function createTerrain(scene) {
  return { mesh: null };
}

export function getSurfacePosition(direction) {
  return {
    position: new THREE.Vector3(0, 0, 0),
    normal: new THREE.Vector3(0, 1, 0),
    radius: 0,
    displacement: 0
  };
}

export function getSurfaceRadius(direction) {
  return 0;
}

export function getSpawnDirection() {
  return new THREE.Vector3(0, 0, 1);
}

export function getDisplacement(direction) {
  return 0;
}

export function composeOnSurface(matrix, direction, localYRotation, scale) {}

export function alignGroupToSurface(group, direction) {}

export function randomSphereDirection() {
  return new THREE.Vector3(0, 1, 0);
}

export function isInAvoidZone(direction) {
  return false;
}

export function isInVillageZone(direction) {
  return false;
}

export function getVillageDirection() {
  return new THREE.Vector3(0, 0, 1);
}
