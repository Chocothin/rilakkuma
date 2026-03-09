import * as THREE from 'three';
import { fbm } from '../utils/noise.js';

let starsMaterial;
let planet;
let moon;
let moonGlow;
let shootingStars = [];
let shootingStarTimer = 0;
let nextShootingStarDelay = 4 + Math.random() * 4;

const starVertexShader = `
attribute float size;
attribute float phase;
varying float vSize;
varying float vPhase;

void main() {
  vSize = size;
  vPhase = phase;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const starFragmentShader = `
uniform float uTime;
uniform float uOpacity;
varying float vSize;
varying float vPhase;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  if (dist > 0.5) discard;
  
  float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + vPhase);
  float alpha = smoothstep(0.5, 0.3, dist) * twinkle * uOpacity;
  
  gl_FragColor = vec4(1.0, 0.98, 0.94, alpha);
}
`;

export function createSky(scene) {
  const starCount = 4000;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const phases = new Float32Array(starCount);
  
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2000;
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    
    sizes[i] = 0.5 + Math.random() * 2.5;
    phases[i] = Math.random() * Math.PI * 2;
  }
  
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  starsGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  
  starsMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uOpacity: { value: 0.0 }
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    depthWrite: false
  });
  
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  
  const moonGeo = new THREE.SphereGeometry(20, 32, 32);
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xFFF8DC,
    transparent: true,
    opacity: 0.0
  });
  moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(-200, 400, -300);
  scene.add(moon);
  
  const glowGeo = new THREE.SphereGeometry(35, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xFFF0C8,
    transparent: true,
    opacity: 0.0,
    side: THREE.BackSide
  });
  moonGlow = new THREE.Mesh(glowGeo, glowMat);
  moonGlow.position.copy(moon.position);
  scene.add(moonGlow);
  
  const planetGeo = new THREE.SphereGeometry(30, 64, 32);
  const planetColors = new Float32Array(planetGeo.attributes.position.count * 3);
  const posAttr = planetGeo.attributes.position;
  
  const oceanColor = new THREE.Color(0x2B7A8E);
  const landColor = new THREE.Color(0x5A8A3C);
  const snowColor = new THREE.Color(0xF5EDE0);
  
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const normalizedY = y / 30;
    
    const noiseVal = fbm(x * 0.05, z * 0.05, 3, 2.0, 0.5);
    
    let color;
    if (Math.abs(normalizedY) > 0.8) {
      color = snowColor;
    } else if (noiseVal > 0.1) {
      color = landColor;
    } else {
      color = oceanColor;
    }
    
    planetColors[i * 3] = color.r;
    planetColors[i * 3 + 1] = color.g;
    planetColors[i * 3 + 2] = color.b;
  }
  
  planetGeo.setAttribute('color', new THREE.BufferAttribute(planetColors, 3));
  
  const planetMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.0,
  });
  
  planet = new THREE.Mesh(planetGeo, planetMat);
  planet.position.set(300, 500, -400);
  scene.add(planet);
  
  const atmosGeo = new THREE.SphereGeometry(31, 32, 16);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x5EAABB,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });
  const atmos = new THREE.Mesh(atmosGeo, atmosMat);
  atmos.position.copy(planet.position);
  scene.add(atmos);
}

export function updateSky(dt, timeOfDay) {
  let nightOpacity;
  if (timeOfDay < 0.15 || timeOfDay > 0.85) {
    nightOpacity = 1.0;
  } else if (timeOfDay < 0.3) {
    nightOpacity = 1.0 - (timeOfDay - 0.15) / 0.15;
  } else if (timeOfDay > 0.7) {
    nightOpacity = (timeOfDay - 0.7) / 0.15;
  } else {
    nightOpacity = 0.0;
  }
  
  if (starsMaterial) {
    starsMaterial.uniforms.uTime.value += dt;
    starsMaterial.uniforms.uOpacity.value = nightOpacity;
  }
  
  if (moon && moonGlow) {
    moon.material.opacity = nightOpacity;
    moonGlow.material.opacity = nightOpacity * 0.08;
  }
  
  if (planet) {
    planet.rotation.y += dt * 0.02;
  }
  
  if (nightOpacity > 0.5) {
    shootingStarTimer += dt;
    
    if (shootingStarTimer >= nextShootingStarDelay && shootingStars.length < 3) {
      spawnShootingStar();
      shootingStarTimer = 0;
      nextShootingStarDelay = 4 + Math.random() * 4;
    }
  }
  
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.age += dt;
    
    if (star.age >= star.lifetime) {
      star.line.parent.remove(star.line);
      shootingStars.splice(i, 1);
    } else {
      star.head.addScaledVector(star.direction, star.speed * dt);
      star.tail.addScaledVector(star.direction, star.speed * dt);
      
      const positions = star.line.geometry.attributes.position.array;
      positions[0] = star.head.x;
      positions[1] = star.head.y;
      positions[2] = star.head.z;
      positions[3] = star.tail.x;
      positions[4] = star.tail.y;
      positions[5] = star.tail.z;
      star.line.geometry.attributes.position.needsUpdate = true;
      
      const fadeProgress = star.age / star.lifetime;
      star.line.material.opacity = (1.0 - fadeProgress) * nightOpacity;
    }
  }
}

function spawnShootingStar() {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 0.5;
  const r = 1800;
  
  const head = new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
  
  const direction = new THREE.Vector3(
    (Math.random() - 0.5) * 0.5,
    -0.8 - Math.random() * 0.2,
    (Math.random() - 0.5) * 0.5
  ).normalize();
  
  const tailDistance = 50 + Math.random() * 50;
  const tail = head.clone().addScaledVector(direction, -tailDistance);
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([
    head.x, head.y, head.z,
    tail.x, tail.y, tail.z
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.LineBasicMaterial({
    color: 0xFFFAF0,
    transparent: true,
    opacity: 1.0
  });
  
  const line = new THREE.Line(geometry, material);
  
  if (planet && planet.parent) {
    planet.parent.add(line);
  }
  
  shootingStars.push({
    line,
    head,
    tail,
    direction,
    speed: 800,
    lifetime: 0.8 + Math.random() * 0.7,
    age: 0
  });
}
