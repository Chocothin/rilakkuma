import * as THREE from 'three';

export const PASTEL = {
  pink: 0xFFD1DC,
  mint: 0xB5EAD7,
  butter: 0xFFF1C1,
  cream: 0xE8D5B7,
  lavender: 0xC9B1FF,
  softWhite: 0xFFF8F0,
  warmBrown: 0x8D6E63,
  darkWood: 0x5D4037,
  lightWood: 0xD7A86E,
};

export function createCeilingLamp(position) {
  const lamp = new THREE.Group();

  const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x424242 });
  const rod = new THREE.Mesh(rodGeometry, rodMaterial);
  rod.position.set(0, -0.15, 0);
  lamp.add(rod);

  const shadeGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 16);
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFF8E1,
    emissive: 0xFFE082,
    emissiveIntensity: 0.2,
  });
  const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
  shade.position.set(0, -0.4, 0);
  lamp.add(shade);

  lamp.position.copy(position);
  return lamp;
}

export function createMirror(position, width = 0.8, height = 1.2) {
  const mirror = new THREE.Group();

  const frameThickness = 0.05;
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });

  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameThickness),
    frameMaterial
  );
  topFrame.position.set(0, height / 2, 0);
  mirror.add(topFrame);

  const bottomFrame = topFrame.clone();
  bottomFrame.position.set(0, -height / 2, 0);
  mirror.add(bottomFrame);

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, height, frameThickness),
    frameMaterial
  );
  leftFrame.position.set(-width / 2, 0, 0);
  mirror.add(leftFrame);

  const rightFrame = leftFrame.clone();
  rightFrame.position.set(width / 2, 0, 0);
  mirror.add(rightFrame);

  const mirrorGeometry = new THREE.PlaneGeometry(width, height);
  const mirrorMaterial = new THREE.MeshStandardMaterial({
    color: 0xE0E0E0,
    metalness: 0.9,
    roughness: 0.1,
  });
  const mirrorSurface = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  mirrorSurface.position.z = -0.01;
  mirror.add(mirrorSurface);

  mirror.position.copy(position);
  return mirror;
}

export function createTable(width, height, depth, position) {
  const table = new THREE.Group();
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });

  const topGeometry = new THREE.BoxGeometry(width, 0.05, depth);
  const top = new THREE.Mesh(topGeometry, woodMaterial);
  top.position.y = height;
  table.add(top);

  const legRadius = 0.04;
  const legGeometry = new THREE.CylinderGeometry(legRadius, legRadius, height, 8);
  const legOffsetX = width / 2 - 0.1;
  const legOffsetZ = depth / 2 - 0.1;

  const positions = [
    [legOffsetX, height / 2, legOffsetZ],
    [legOffsetX, height / 2, -legOffsetZ],
    [-legOffsetX, height / 2, legOffsetZ],
    [-legOffsetX, height / 2, -legOffsetZ],
  ];

  positions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, woodMaterial);
    leg.position.set(...pos);
    table.add(leg);
  });

  table.position.copy(position);
  return table;
}

export function createPottedPlant(x, y, z, scale = 1.0) {
  const plant = new THREE.Group();

  const potGeo = new THREE.CylinderGeometry(0.1 * scale, 0.08 * scale, 0.15 * scale, 12);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xD4A574 });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.075 * scale;
  plant.add(pot);

  const dirtGeo = new THREE.CylinderGeometry(0.09 * scale, 0.09 * scale, 0.02 * scale, 12);
  const dirtMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
  const dirt = new THREE.Mesh(dirtGeo, dirtMat);
  dirt.position.y = 0.15 * scale;
  plant.add(dirt);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x66BB6A });
  const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 8, 8), leafMat);
  leaf1.position.set(0, 0.25 * scale, 0);
  plant.add(leaf1);

  const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.07 * scale, 8, 8), leafMat);
  leaf2.position.set(0.06 * scale, 0.32 * scale, 0.03 * scale);
  plant.add(leaf2);

  const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 8, 8), leafMat);
  leaf3.position.set(-0.05 * scale, 0.3 * scale, -0.04 * scale);
  plant.add(leaf3);

  plant.position.set(x, y, z);
  return plant;
}

export function createBookshelf(x, y, z, shelfCount, width, height, depth, rotY = 0) {
  const shelf = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: PASTEL.warmBrown });

  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.03), woodMat);
  backPanel.position.set(0, height / 2, -depth / 2 + 0.015);
  shelf.add(backPanel);

  const leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, height, depth), woodMat);
  leftSide.position.set(-width / 2 + 0.02, height / 2, 0);
  shelf.add(leftSide);

  const rightSide = leftSide.clone();
  rightSide.position.set(width / 2 - 0.02, height / 2, 0);
  shelf.add(rightSide);

  const bookColors = [0xE57373, 0x64B5F6, 0x81C784, 0xFFB74D, PASTEL.lavender, PASTEL.pink, 0xFFD54F];

  for (let i = 0; i <= shelfCount; i++) {
    const shelfY = (i / shelfCount) * height;
    const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(width, 0.03, depth), woodMat);
    shelfBoard.position.set(0, shelfY, 0);
    shelf.add(shelfBoard);

    if (i < shelfCount) {
      const bookCount = 3 + Math.floor(Math.random() * 3);
      let bookX = -width / 2 + 0.08;

      for (let b = 0; b < bookCount && bookX < width / 2 - 0.08; b++) {
        const bookW = 0.04 + Math.random() * 0.04;
        const bookH = (height / shelfCount) * (0.6 + Math.random() * 0.3);
        const bookD = depth * 0.7;
        const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];

        const book = new THREE.Mesh(
          new THREE.BoxGeometry(bookW, bookH, bookD),
          new THREE.MeshStandardMaterial({ color: bookColor })
        );
        book.position.set(bookX + bookW / 2, shelfY + 0.015 + bookH / 2, 0);
        shelf.add(book);
        bookX += bookW + 0.005;
      }
    }
  }

  shelf.position.set(x, y, z);
  shelf.rotation.y = rotY;
  return shelf;
}

export function createRug(x, y, z, radiusX, radiusZ, color) {
  const rugGeo = new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2, 1, 1);
  const rugMat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(x, y, z);
  rug.receiveShadow = true;
  return rug;
}

export function createCircularRug(x, y, z, radius, color) {
  const rugGeo = new THREE.CircleGeometry(radius, 32);
  const rugMat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(x, y, z);
  rug.receiveShadow = true;
  return rug;
}

export function createPictureFrame(x, y, z, width, height, color, rotY = 0) {
  const frame = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: PASTEL.darkWood });
  const thickness = 0.03;

  const top = new THREE.Mesh(new THREE.BoxGeometry(width + thickness * 2, thickness, 0.03), frameMat);
  top.position.y = height / 2;
  frame.add(top);

  const bottom = top.clone();
  bottom.position.y = -height / 2;
  frame.add(bottom);

  const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, 0.03), frameMat);
  left.position.x = -width / 2;
  frame.add(left);

  const right = left.clone();
  right.position.x = width / 2;
  frame.add(right);

  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ color }));
  canvas.position.z = -0.005;
  frame.add(canvas);

  frame.position.set(x, y, z);
  frame.rotation.y = rotY;
  return frame;
}

export function createFloorLamp(x, y, z) {
  const lamp = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x424242 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16), baseMat);
  base.position.y = 0.02;
  lamp.add(base);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 8), baseMat);
  rod.position.y = 0.69;
  lamp.add(rod);

  const shadeMat = new THREE.MeshStandardMaterial({ color: PASTEL.butter, emissive: 0xFFE082, emissiveIntensity: 0.3 });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.25, 16), shadeMat);
  shade.position.y = 1.45;
  lamp.add(shade);

  lamp.position.set(x, y, z);
  return lamp;
}

export function createCushion(x, y, z, color, scaleX = 1, scaleZ = 1) {
  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(0.25 * scaleX, 0.08, 0.25 * scaleZ),
    new THREE.MeshStandardMaterial({ color })
  );
  cushion.position.set(x, y, z);
  cushion.rotation.y = Math.random() * 0.3 - 0.15;
  return cushion;
}

export function createSideTable(x, y, z) {
  const table = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: PASTEL.lightWood });

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), mat);
  top.position.y = 0.5;
  table.add(top);

  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.5, 8), mat);
  leg.position.y = 0.25;
  table.add(leg);

  table.position.set(x, y, z);
  return table;
}

export function createMug(x, y, z, color) {
  const mug = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.07, 12), mat);
  body.position.y = 0.035;
  mug.add(body);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 12, Math.PI), mat);
  handle.position.set(0.04, 0.035, 0);
  handle.rotation.z = Math.PI / 2;
  mug.add(handle);

  mug.position.set(x, y, z);
  return mug;
}

export function createDeskLamp(x, y, z) {
  const lamp = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x424242 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 12), metalMat);
  base.position.y = 0.01;
  lamp.add(base);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8), metalMat);
  arm.position.y = 0.14;
  arm.rotation.z = 0.2;
  lamp.add(arm);

  const shadeMat = new THREE.MeshStandardMaterial({ color: PASTEL.mint, emissive: 0xFFE082, emissiveIntensity: 0.4 });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.08, 12), shadeMat);
  shade.position.set(0.03, 0.28, 0);
  shade.rotation.z = Math.PI;
  lamp.add(shade);

  lamp.position.set(x, y, z);
  return lamp;
}

export function createWardrobe(x, y, z, collisionBoxes) {
  const wardrobe = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: PASTEL.darkWood });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 0.5), woodMat);
  body.position.y = 1.0;
  wardrobe.add(body);

  const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.01, 1.8, 0.51), new THREE.MeshStandardMaterial({ color: 0x4E342E }));
  doorLine.position.set(0, 1.0, 0);
  wardrobe.add(doorLine);

  const handleMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8 });
  const leftHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8), handleMat);
  leftHandle.position.set(-0.08, 1.1, 0.26);
  leftHandle.rotation.x = Math.PI / 2;
  wardrobe.add(leftHandle);

  const rightHandle = leftHandle.clone();
  rightHandle.position.set(0.08, 1.1, 0.26);
  wardrobe.add(rightHandle);

  wardrobe.position.set(x, y, z);

  collisionBoxes.push(new THREE.Box3(new THREE.Vector3(x - 0.5, y, z - 0.25), new THREE.Vector3(x + 0.5, y + 2.0, z + 0.25)));

  return wardrobe;
}

export function createStuffedBear(x, y, z) {
  const bear = new THREE.Group();
  const brownMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
  const lightBrownMat = new THREE.MeshStandardMaterial({ color: 0xBCAAA4 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x212121 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), brownMat);
  body.position.y = 0.1;
  body.scale.set(1, 0.9, 0.8);
  bear.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), brownMat);
  head.position.set(0, 0.22, 0);
  bear.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), lightBrownMat);
  snout.position.set(0, 0.2, 0.06);
  bear.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), blackMat);
  nose.position.set(0, 0.21, 0.09);
  bear.add(nose);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), blackMat);
  leftEye.position.set(-0.03, 0.24, 0.07);
  bear.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.set(0.03, 0.24, 0.07);
  bear.add(rightEye);

  const earGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const leftEar = new THREE.Mesh(earGeo, brownMat);
  leftEar.position.set(-0.06, 0.3, 0);
  bear.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, brownMat);
  rightEar.position.set(0.06, 0.3, 0);
  bear.add(rightEar);

  const innerEarGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const leftInnerEar = new THREE.Mesh(innerEarGeo, lightBrownMat);
  leftInnerEar.position.set(-0.06, 0.3, 0.02);
  bear.add(leftInnerEar);

  const rightInnerEar = new THREE.Mesh(innerEarGeo, lightBrownMat);
  rightInnerEar.position.set(0.06, 0.3, 0.02);
  bear.add(rightInnerEar);

  bear.position.set(x, y, z);
  return bear;
}

export function createAlarmClock(x, y, z) {
  const clock = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), new THREE.MeshStandardMaterial({ color: PASTEL.pink }));
  body.position.y = 0.03;
  clock.add(body);

  const face = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), new THREE.MeshStandardMaterial({ color: 0xFFFDE7 }));
  face.position.set(0, 0.03, 0.021);
  clock.add(face);

  const bellMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.6 });
  const leftBell = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), bellMat);
  leftBell.position.set(-0.03, 0.07, 0);
  clock.add(leftBell);

  const rightBell = leftBell.clone();
  rightBell.position.set(0.03, 0.07, 0);
  clock.add(rightBell);

  clock.position.set(x, y, z);
  return clock;
}

export function createCurtain(x, y, z, height, rotY = 0) {
  const curtain = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: PASTEL.cream, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });

  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.4, height), mat);
  panel.position.y = height / 2;
  curtain.add(panel);

  const rodMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), rodMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.y = height + 0.05;
  curtain.add(rod);

  curtain.position.set(x, y, z);
  curtain.rotation.y = rotY;
  return curtain;
}

export function createTowelRack(x, y, z, rotY = 0) {
  const rack = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.7 });

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), metalMat);
  bar.rotation.z = Math.PI / 2;
  rack.add(bar);

  const towelMat = new THREE.MeshStandardMaterial({ color: PASTEL.mint });
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.02), towelMat);
  towel.position.y = -0.16;
  rack.add(towel);

  rack.position.set(x, y, z);
  rack.rotation.y = rotY;
  return rack;
}

export function createSmallShelf(x, y, z, rotY = 0) {
  const shelf = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: PASTEL.warmBrown });

  const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.15), woodMat);
  shelf.add(board);

  const bottleColors = [0x64B5F6, 0xE57373, 0x81C784, PASTEL.lavender];
  for (let i = 0; i < 4; i++) {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.08 + Math.random() * 0.04, 8),
      new THREE.MeshStandardMaterial({ color: bottleColors[i] })
    );
    bottle.position.set(-0.15 + i * 0.1, 0.06, 0);
    shelf.add(bottle);
  }

  shelf.position.set(x, y, z);
  shelf.rotation.y = rotY;
  return shelf;
}

export function createDishRack(x, y, z) {
  const rack = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xBDBDBD });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.2), metalMat);
  base.position.y = 0.01;
  rack.add(base);

  const plateMat = new THREE.MeshStandardMaterial({ color: 0xFAFAFA });
  for (let i = 0; i < 4; i++) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.005, 12), plateMat);
    plate.rotation.z = Math.PI / 2;
    plate.position.set(-0.08 + i * 0.06, 0.07, 0);
    rack.add(plate);
  }

  rack.position.set(x, y, z);
  return rack;
}

export function createFruitBasket(x, y, z) {
  const basket = new THREE.Group();

  const bowlMat = new THREE.MeshStandardMaterial({ color: PASTEL.cream });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), bowlMat);
  bowl.rotation.x = Math.PI;
  bowl.position.y = 0.12;
  basket.add(bowl);

  const fruitData = [
    { color: 0xE53935, pos: [0, 0.08, 0] },
    { color: 0xFF8F00, pos: [0.05, 0.09, 0.04] },
    { color: 0xE53935, pos: [-0.04, 0.09, -0.03] },
    { color: 0x7CB342, pos: [0.02, 0.12, -0.02] },
  ];

  fruitData.forEach((f) => {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshStandardMaterial({ color: f.color }));
    fruit.position.set(...f.pos);
    basket.add(fruit);
  });

  basket.position.set(x, y, z);
  return basket;
}

export function createKettle(x, y, z) {
  const kettle = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xE0E0E0, metalness: 0.5 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.1, 12), mat);
  body.position.y = 0.05;
  kettle.add(body);

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.02, 12), mat);
  lid.position.y = 0.11;
  kettle.add(lid);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshStandardMaterial({ color: 0x424242 }));
  knob.position.y = 0.13;
  kettle.add(knob);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 8, 12, Math.PI), mat);
  handle.position.set(0, 0.12, 0);
  handle.rotation.x = Math.PI / 2;
  kettle.add(handle);

  kettle.position.set(x, y, z);
  return kettle;
}

export function createStrawberryBasket(x, y, z) {
  const basket = new THREE.Group();

  const basketGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
  const basketMat = new THREE.MeshStandardMaterial({ color: 0xE8D5B7 });
  const basketBody = new THREE.Mesh(basketGeo, basketMat);
  basketBody.position.y = 0.04;
  basket.add(basketBody);

  const strawberryPositions = [
    [0, 0.08, 0],
    [0.06, 0.06, 0.03],
    [-0.05, 0.07, -0.04],
    [0.04, 0.05, -0.05],
    [-0.07, 0.06, 0.02],
  ];

  strawberryPositions.forEach((pos) => {
    const berryGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B });
    const berry = new THREE.Mesh(berryGeo, berryMat);
    berry.position.set(pos[0], pos[1], pos[2]);
    basket.add(berry);

    const leafGeo = new THREE.ConeGeometry(0.015, 0.025, 8);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x66BB6A });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(pos[0], pos[1] + 0.035, pos[2]);
    basket.add(leaf);
  });

  basket.position.set(x, y, z);
  return basket;
}

export function createStrawberryPlushie(x, y, z) {
  const plushie = new THREE.Group();

  const bodyGeo = new THREE.SphereGeometry(0.25, 16, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xE53935 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.y = 1.3;
  plushie.add(body);

  const leafCount = 6;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leafX = Math.cos(angle) * 0.15;
    const leafZ = Math.sin(angle) * 0.15;

    const leafGeo = new THREE.ConeGeometry(0.08, 0.15, 8);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x66BB6A });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(leafX, 0.35, leafZ);
    leaf.rotation.z = angle;
    plushie.add(leaf);
  }

  const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.08, 0.1, 0.23);
  plushie.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.08, 0.1, 0.23);
  plushie.add(rightEye);

  const seedPositions = [
    [0, 0.15, 0.24],
    [-0.12, 0.05, 0.2],
    [0.12, 0.05, 0.2],
    [-0.08, -0.1, 0.22],
    [0.08, -0.1, 0.22],
    [0, -0.15, 0.2],
    [-0.15, 0, 0.18],
    [0.15, 0, 0.18],
  ];

  seedPositions.forEach((pos) => {
    const seedGeo = new THREE.SphereGeometry(0.015, 6, 6);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xFFEB3B });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.position.set(pos[0], pos[1], pos[2]);
    plushie.add(seed);
  });

  plushie.position.set(x, y, z);
  return plushie;
}
