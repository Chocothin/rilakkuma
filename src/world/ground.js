import * as THREE from 'three';
import { fbm } from '../utils/noise.js';

export function createGround(scene) {
  const SIZE = 100;
  const SEGMENTS = 64;
  
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geometry.rotateX(-Math.PI / 2);
  
  // Vertex colors for grass variation
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const positions = geometry.attributes.position.array;
  
  const baseColor = new THREE.Color(0x7CB342);   // warm green
  const lightColor = new THREE.Color(0x8BC34A);   // lighter green
  const darkColor = new THREE.Color(0x558B2F);    // darker green
  const dirtColor = new THREE.Color(0x6D4C41);    // brown near center
  const temp = new THREE.Color();
  
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const z = positions[i * 3 + 2];
    
    // Noise for color variation
    const n = fbm(x * 0.05, z * 0.05, 3) * 0.5 + 0.5;
    
    // Distance from center for dirt path
    const dist = Math.sqrt(x * x + z * z);
    const dirtFactor = Math.max(0, 1 - dist / 10);
    
    // Mix base green with variation
    if (n > 0.55) {
      temp.lerpColors(baseColor, lightColor, (n - 0.55) / 0.45);
    } else {
      temp.lerpColors(darkColor, baseColor, n / 0.55);
    }
    
    // Blend toward dirt near center (house area)
    if (dirtFactor > 0) {
      temp.lerp(dirtColor, dirtFactor * 0.4);
    }
    
    colors[i * 3] = temp.r;
    colors[i * 3 + 1] = temp.g;
    colors[i * 3 + 2] = temp.b;
    
    // Subtle height displacement
    const heightNoise = fbm(x * 0.1, z * 0.1, 2) * 0.1;
    // Don't displace near center (house sits flat)
    const flattenFactor = Math.max(0, 1 - dist / 12);
    positions[i * 3 + 1] += heightNoise * (1 - flattenFactor);
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.0,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  scene.add(mesh);
  
  return { mesh };
}
