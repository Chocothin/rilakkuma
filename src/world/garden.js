import * as THREE from 'three';

export function createGarden(scene) {
  const gardenGroup = new THREE.Group();
  gardenGroup.name = 'garden';
  
  createTrees(gardenGroup);
  createFlowerBeds(gardenGroup);
  createBushes(gardenGroup);
  createPond(gardenGroup);
  createDecorations(gardenGroup);
  const particleSystem = createGardenParticles(gardenGroup);
  createStonePath(gardenGroup);
  createGardenFence(gardenGroup);
  
  scene.add(gardenGroup);
  
  return { updateGardenParticles: particleSystem.update };
}

function createTrees(group) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6D4C41, roughness: 0.9 });
  const canopyMats = [
    new THREE.MeshStandardMaterial({ color: 0x66BB6A, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x81C784, roughness: 0.8 }),
  ];
  const fruitMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.7 });
  
  // Tree positions: scattered around house, avoiding front path (Z > 6, X near 0)
  // Expanded from 5 to 12 trees for lush garden
  const treePositions = [
    { x: -9, z: -8, scale: 1.2, type: 'round' },
    { x: 8, z: -8, scale: 1.0, type: 'dodeca' },
    { x: -8, z: 10, scale: 0.9, type: 'round' },
    { x: 9, z: 8, scale: 1.1, type: 'cone' },
    { x: -9, z: 3, scale: 0.8, type: 'round' },
    { x: 9, z: 12, scale: 0.95, type: 'multi' },
    { x: -9, z: -7, scale: 1.05, type: 'cone' },
    { x: 7, z: -9, scale: 0.85, type: 'dodeca' },
    { x: -7, z: 14, scale: 0.9, type: 'round' },
    { x: 9, z: -7, scale: 1.0, type: 'multi' },
    { x: -8, z: 12, scale: 0.95, type: 'cone' },
    { x: 8, z: 14, scale: 0.8, type: 'round' },
  ];
  
  treePositions.forEach((pos, i) => {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.12 * pos.scale, 0.18 * pos.scale, 1.5 * pos.scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75 * pos.scale;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Canopy with variety
    const canopyMat = canopyMats[i % canopyMats.length];
    
    if (pos.type === 'round') {
      const canopyGeo = new THREE.SphereGeometry(1.0 * pos.scale, 8, 8);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 2.0 * pos.scale;
      canopy.castShadow = true;
      tree.add(canopy);
      
      // Add fruit details to some round trees
      if (i % 3 === 0) {
        for (let f = 0; f < 3; f++) {
          const fruitGeo = new THREE.SphereGeometry(0.12 * pos.scale, 6, 6);
          const fruit = new THREE.Mesh(fruitGeo, fruitMat);
          const angle = (f / 3) * Math.PI * 2;
          fruit.position.set(
            Math.cos(angle) * 0.7 * pos.scale,
            2.0 * pos.scale + Math.sin(angle) * 0.5 * pos.scale,
            Math.sin(angle) * 0.7 * pos.scale
          );
          fruit.castShadow = true;
          tree.add(fruit);
        }
      }
    } else if (pos.type === 'cone') {
      const canopyGeo = new THREE.ConeGeometry(0.8 * pos.scale, 1.8 * pos.scale, 8);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 2.1 * pos.scale;
      canopy.castShadow = true;
      tree.add(canopy);
    } else if (pos.type === 'multi') {
      // Multi-sphere canopy (2-3 overlapping spheres)
      for (let s = 0; s < 3; s++) {
        const canopyGeo = new THREE.SphereGeometry(0.75 * pos.scale, 8, 8);
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.y = 1.8 * pos.scale + s * 0.4 * pos.scale;
        canopy.castShadow = true;
        tree.add(canopy);
      }
    } else {
      // dodeca
      const canopyGeo = new THREE.DodecahedronGeometry(0.9 * pos.scale, 1);
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 2.0 * pos.scale;
      canopy.castShadow = true;
      tree.add(canopy);
    }
    
    tree.position.set(pos.x, 0, pos.z);
    group.add(tree);
  });
}

function createFlowerBeds(group) {
  const pastelColors = [
    0xFFD1DC, // pink
    0xC9B1FF, // lavender
    0xFFF1C1, // butter
    0xB5EAD7, // mint
    0xFFE082, // yellow
    0xCE93D8, // purple
    0xFF8A65, // coral
    0x80DEEA, // cyan
  ];
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.8 });
  
  // Expanded flower bed positions on all sides (doubled count)
  const bedPositions = [
    { x: -8, z: 0, count: 12 },
    { x: 8, z: 0, count: 12 },
    { x: 0, z: -8, count: 15 },
    { x: -5, z: 12, count: 8 },
    { x: 5, z: 12, count: 8 },
  ];
  
  bedPositions.forEach(bed => {
    for (let i = 0; i < bed.count; i++) {
      const flower = new THREE.Group();
      
      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.15;
      flower.add(stem);
      
      // Flower type variety
      const flowerType = i % 3;
      const petalColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.6 });
      
      if (flowerType === 0) {
        // Simple sphere flower
        const petalGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.y = 0.35;
        flower.add(petal);
      } else if (flowerType === 1) {
        // Multi-petal flower (3-4 small spheres in circle)
        for (let p = 0; p < 4; p++) {
          const petalGeo = new THREE.SphereGeometry(0.06, 6, 6);
          const petal = new THREE.Mesh(petalGeo, petalMat);
          const angle = (p / 4) * Math.PI * 2;
          petal.position.set(
            Math.cos(angle) * 0.08,
            0.35,
            Math.sin(angle) * 0.08
          );
          flower.add(petal);
        }
      } else {
        // Tulip-shaped (cone + sphere)
        const coneGeo = new THREE.ConeGeometry(0.06, 0.15, 8);
        const cone = new THREE.Mesh(coneGeo, petalMat);
        cone.position.y = 0.38;
        flower.add(cone);
        
        const tipGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const tip = new THREE.Mesh(tipGeo, petalMat);
        tip.position.y = 0.48;
        flower.add(tip);
      }
      
      // Scatter within bed area
      const angle = (i / bed.count) * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.0;
      flower.position.set(
        bed.x + Math.cos(angle) * radius,
        0,
        bed.z + Math.sin(angle) * radius
      );
      
      group.add(flower);
    }
  });
}

function createBushes(group) {
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x558B2F, roughness: 0.8 });
  const flowerDotMat = new THREE.MeshStandardMaterial({ color: 0xFFD1DC, roughness: 0.6 });
  
  const bushPositions = [
    { x: -9, z: 8 }, { x: -8, z: 5.5 }, { x: -9, z: 2 },
    { x: 9, z: 8 }, { x: 8, z: 5.5 }, { x: 9, z: 2 },
    { x: -7, z: -9 }, { x: -4, z: -9 }, { x: 0, z: -9 }, { x: 4, z: -9 }, { x: 7, z: -9 },
    { x: -9, z: 0 }, { x: -9, z: 6 }, { x: 9, z: 0 }, { x: 9, z: 6 },
    { x: 6, z: 14 }, { x: -6, z: 14 }, { x: 0, z: 13 },
    { x: 8, z: -6 }, { x: -8, z: -6 },
  ];
  
  bushPositions.forEach((pos, i) => {
    const bush = new THREE.Group();
    
    const bushGeo = new THREE.SphereGeometry(0.35 + Math.random() * 0.15, 8, 8);
    const bushMesh = new THREE.Mesh(bushGeo, bushMat);
    bushMesh.castShadow = true;
    bush.add(bushMesh);
    
    // Add flower dots to some bushes
    if (i % 2 === 0) {
      for (let d = 0; d < 2; d++) {
        const dotGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const dot = new THREE.Mesh(dotGeo, flowerDotMat);
        const angle = (d / 2) * Math.PI * 2 + Math.random() * 0.5;
        dot.position.set(
          Math.cos(angle) * 0.3,
          0.2 + Math.random() * 0.2,
          Math.sin(angle) * 0.3
        );
        bush.add(dot);
      }
    }
    
    bush.position.set(pos.x, 0.35, pos.z);
    group.add(bush);
  });
}

function createPond(group) {
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4A90E2,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.7,
  });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x9E9E9E, roughness: 0.9 });
  const lilyMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.7 });
  
  // Pond water surface
  const pondGeo = new THREE.CircleGeometry(1.5, 32);
  const pond = new THREE.Mesh(pondGeo, waterMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(8, 0.02, -5);
  pond.receiveShadow = true;
  group.add(pond);
  
  // Rocks around pond edges
  const rockPositions = [
    { x: 8, z: -6.5 }, { x: 9.3, z: -5 }, { x: 8, z: -3.5 },
    { x: 6.7, z: -5 }, { x: 9, z: -4 }, { x: 7, z: -6 },
  ];
  
  rockPositions.forEach(pos => {
    const rockGeo = new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.15, 0);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(pos.x, 0.15, pos.z);
    rock.castShadow = true;
    group.add(rock);
  });
  
  // Lily pads
  for (let l = 0; l < 2; l++) {
    const lilyGeo = new THREE.CircleGeometry(0.3, 16);
    const lily = new THREE.Mesh(lilyGeo, lilyMat);
    lily.rotation.x = -Math.PI / 2;
    lily.position.set(
      8 + (Math.random() - 0.5) * 1.5,
      0.05,
      -5 + (Math.random() - 0.5) * 1.5
    );
    group.add(lily);
  }
  
  // Small frog on lily pad
  const frogBody = new THREE.SphereGeometry(0.12, 8, 8);
  const frogMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.7 });
  const frog = new THREE.Mesh(frogBody, frogMat);
  frog.position.set(8.2, 0.15, -4.8);
  group.add(frog);
  
  // Frog eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5 });
  for (let e = 0; e < 2; e++) {
    const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(8.1 + (e === 0 ? -0.06 : 0.06), 0.22, -4.75);
    group.add(eye);
  }
}

function createDecorations(group) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.9 });
  const benchSeatMat = new THREE.MeshStandardMaterial({ color: 0xA1887F, roughness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xBDBDBD, roughness: 0.6 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x9E9E9E, roughness: 0.9 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.7 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.8 });
  
  // Garden bench near pond
  const bench = new THREE.Group();
  
  // Seat
  const seatGeo = new THREE.BoxGeometry(1.2, 0.1, 0.4);
  const seat = new THREE.Mesh(seatGeo, benchSeatMat);
  seat.position.y = 0.4;
  seat.castShadow = true;
  bench.add(seat);
  
  // Backrest
  const backrestGeo = new THREE.BoxGeometry(1.2, 0.5, 0.1);
  const backrest = new THREE.Mesh(backrestGeo, benchSeatMat);
  backrest.position.set(0, 0.65, -0.2);
  backrest.castShadow = true;
  bench.add(backrest);
  
  // Legs
  for (let leg = 0; leg < 4; leg++) {
    const legGeo = new THREE.BoxGeometry(0.08, 0.4, 0.08);
    const legMesh = new THREE.Mesh(legGeo, woodMat);
    const xOffset = leg < 2 ? -0.5 : 0.5;
    const zOffset = leg % 2 === 0 ? -0.15 : 0.15;
    legMesh.position.set(xOffset, 0.2, zOffset);
    legMesh.castShadow = true;
    bench.add(legMesh);
  }
  
  bench.position.set(7, 0, -6.5);
  group.add(bench);
  
  // Mailbox near path
  const mailbox = new THREE.Group();
  
  // Post
  const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
  const post = new THREE.Mesh(postGeo, woodMat);
  post.position.y = 0.4;
  post.castShadow = true;
  mailbox.add(post);
  
  // Mailbox body
  const boxGeo = new THREE.BoxGeometry(0.3, 0.2, 0.2);
  const box = new THREE.Mesh(boxGeo, metalMat);
  box.position.set(0, 0.85, 0);
  box.castShadow = true;
  mailbox.add(box);
  
  // Mailbox flag
  const flagGeo = new THREE.BoxGeometry(0.15, 0.08, 0.05);
  const flag = new THREE.Mesh(flagGeo, redMat);
  flag.position.set(0.18, 0.82, 0);
  flag.castShadow = true;
  mailbox.add(flag);
  
  mailbox.position.set(1, 0, 14);
  group.add(mailbox);
  
  // Decorative mushrooms
  const mushroomPositions = [
    { x: -7, z: 6, scale: 1.0 },
    { x: 5, z: 10, scale: 0.8 },
    { x: -4, z: -8, scale: 0.9 },
  ];
  
  mushroomPositions.forEach((pos, i) => {
    const mushroom = new THREE.Group();
    
    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xF5DEB3, roughness: 0.8 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.15;
    stem.castShadow = true;
    mushroom.add(stem);
    
    // Cap
    const capMat = i % 2 === 0 ? redMat : whiteMat;
    const capGeo = new THREE.SphereGeometry(0.2 * pos.scale, 8, 8);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.scale.y = 0.6;
    cap.position.y = 0.35;
    cap.castShadow = true;
    mushroom.add(cap);
    
    // Spots on red mushrooms
    if (i % 2 === 0) {
      for (let s = 0; s < 3; s++) {
        const spotGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const spot = new THREE.Mesh(spotGeo, whiteMat);
        const angle = (s / 3) * Math.PI * 2;
        spot.position.set(
          Math.cos(angle) * 0.12,
          0.38,
          Math.sin(angle) * 0.12
        );
        mushroom.add(spot);
      }
    }
    
    mushroom.position.set(pos.x, 0, pos.z);
    group.add(mushroom);
  });
  
  // Decorative rocks/boulders
  const boulderPositions = [
    { x: -8, z: 0 },
    { x: 7, z: 8 },
    { x: -5, z: 11 },
  ];
  
  boulderPositions.forEach(pos => {
    const boulderGeo = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.2, 0);
    const boulder = new THREE.Mesh(boulderGeo, rockMat);
    boulder.position.set(pos.x, 0.3, pos.z);
    boulder.castShadow = true;
    group.add(boulder);
  });
}

function createGardenParticles(group) {
  const particleCount = 30;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  const particleColors = [
    { r: 1.0, g: 0.82, b: 0.86 }, // pink
    { r: 0.79, g: 0.69, b: 1.0 }, // lavender
    { r: 1.0, g: 0.95, b: 0.76 }, // butter
    { r: 0.71, g: 0.92, b: 0.84 }, // mint
    { r: 1.0, g: 0.88, b: 0.51 }, // yellow
  ];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = 1.5 + Math.random() * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });
  
  const particles = new THREE.Points(geometry, material);
  group.add(particles);
  
  // Animation state
  const particleState = {
    time: 0,
    positions: positions,
    initialPositions: new Float32Array(positions),
  };
  
  return {
    update: function(dt) {
      particleState.time += dt;
      const posAttr = particles.geometry.attributes.position;
      
      for (let i = 0; i < particleCount; i++) {
        const baseX = particleState.initialPositions[i * 3];
        const baseY = particleState.initialPositions[i * 3 + 1];
        const baseZ = particleState.initialPositions[i * 3 + 2];
        
        posAttr.array[i * 3] = baseX + Math.sin(particleState.time * 0.5 + i) * 0.5;
        posAttr.array[i * 3 + 1] = baseY + Math.sin(particleState.time * 0.8 + i * 0.3) * 0.3;
        posAttr.array[i * 3 + 2] = baseZ + Math.cos(particleState.time * 0.6 + i) * 0.5;
      }
      
      posAttr.needsUpdate = true;
    }
  };
}

function createStonePath(group) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9E9E9E, roughness: 0.9 });
  
  // Path from spawn (z=15) to front door (z=6.5)
  const pathStart = 15;
  const pathEnd = 6.8;
  let z = pathStart;
  
  while (z > pathEnd) {
    const radius = 0.3 + Math.random() * 0.2;
    const stoneGeo = new THREE.CylinderGeometry(radius, radius, 0.03, 8);
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(
      (Math.random() - 0.5) * 0.4,  // slight X offset
      0.015,
      z
    );
    stone.receiveShadow = true;
    group.add(stone);
    
    z -= 0.8 + Math.random() * 0.4;  // irregular spacing
  }
}

function createGardenFence(group) {
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.9 });
  const fenceHeight = 0.3;
  const fenceThickness = 0.05;
  
  // Low fence around garden perimeter (roughly 20×20 area)
  // Opening at front for path
  const fenceSegments = [
    { x: -10, z: 16, w: 20, d: fenceThickness },   // back of path area
    { x: -10, z: -10, w: fenceThickness, d: 26 },   // left side
    { x: 10, z: -10, w: fenceThickness, d: 26 },    // right side
    { x: -10, z: -10, w: 20, d: fenceThickness },   // behind house
    // Front: two segments with gap for path
    { x: -10, z: 16, w: 8, d: fenceThickness },     // front left
    { x: 3, z: 16, w: 7, d: fenceThickness },        // front right
  ];
  
  fenceSegments.forEach(seg => {
    const geo = new THREE.BoxGeometry(seg.w, fenceHeight, seg.d);
    const mesh = new THREE.Mesh(geo, fenceMat);
    mesh.position.set(seg.x + seg.w / 2, fenceHeight / 2, seg.z + (seg.d) / 2);
    mesh.castShadow = true;
    group.add(mesh);
  });
}
