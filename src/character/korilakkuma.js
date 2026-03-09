import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function createKorilakkuma(onProgress) {
  const loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load(
      '/models/korilakkuma.glb',
      resolve,
      (event) => {
        if (onProgress && event.lengthComputable) {
          onProgress(event.loaded / event.total);
        }
      },
      reject
    );
  });

  const model = gltf.scene;

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const scaleFactor = 1.4 / size.y;
  model.scale.setScalar(scaleFactor);

  box.setFromObject(model);
  box.getCenter(center);
  model.position.set(-center.x, -box.min.y, -center.z);

  model.rotation.y = Math.PI;

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.roughness = Math.max(child.material.roughness, 0.5);
        child.material.metalness = Math.min(child.material.metalness, 0.1);
      }
    }
  });

  const characterGroup = new THREE.Group();
  const bodyGroup = new THREE.Group();

  bodyGroup.add(model);
  characterGroup.add(bodyGroup);

  const dustParticleCount = 20;
  const dustPositions = new Float32Array(dustParticleCount * 3);
  for (let i = 0; i < dustParticleCount; i++) {
    dustPositions[i * 3] = 0;
    dustPositions[i * 3 + 1] = 0.05;
    dustPositions[i * 3 + 2] = 0;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

  const dustMaterial = new THREE.PointsMaterial({
    color: 0xD4C4A8,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
  characterGroup.add(dustParticles);

  return {
    group: characterGroup,
    bodyGroup,
    model,
    dustParticles,
    headGroup: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
    leftEyelid: null,
    rightEyelid: null,
  };
}
