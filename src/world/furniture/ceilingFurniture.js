import * as THREE from 'three';
import { createCeilingLamp } from './common.js';

export function createCeilingFurniture(interiorGroup) {
  interiorGroup.add(createCeilingLamp(new THREE.Vector3(-2, 3.0, 2)));
  interiorGroup.add(createCeilingLamp(new THREE.Vector3(4, 3.0, 1.5)));
  interiorGroup.add(createCeilingLamp(new THREE.Vector3(4, 3.0, -3.5)));
  interiorGroup.add(createCeilingLamp(new THREE.Vector3(-2, 3.0, -3)));
}
