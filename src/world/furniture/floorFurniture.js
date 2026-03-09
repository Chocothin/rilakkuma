import * as THREE from 'three';
import { HOUSE_CONSTANTS } from '../house.js';
import { registerInteractable } from '../../interaction/furnitureInteraction.js';
import {
  createAlarmClock,
  createBookshelf,
  createCircularRug,
  createCushion,
  createDeskLamp,
  createDishRack,
  createFloorLamp,
  createFruitBasket,
  createKettle,
  createMug,
  createPottedPlant,
  createRug,
  createSideTable,
  createStrawberryBasket,
  createStrawberryPlushie,
  createStuffedBear,
  createTable,
  createWardrobe,
  PASTEL,
} from './common.js';

function createLivingRoomFloorFurniture(interiorGroup, furnitureCollisionBoxes) {
  const { FLOOR_Y } = HOUSE_CONSTANTS;

  const diningTable = createTable(1.5, 0.75, 1.0, new THREE.Vector3(-2, FLOOR_Y, 2));
  interiorGroup.add(diningTable);
  registerInteractable('diningTable', new THREE.Vector3(-2, 0, 2), diningTable);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(-2 - 0.75, FLOOR_Y, 2 - 0.5), new THREE.Vector3(-2 + 0.75, FLOOR_Y + 0.8, 2 + 0.5))
  );

  const tv = new THREE.Group();
  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.05), new THREE.MeshStandardMaterial({ color: 0x212121 }));
  tvScreen.position.y = 0.8;
  tv.add(tvScreen);

  const tvStand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.2), new THREE.MeshStandardMaterial({ color: 0x424242 }));
  tvStand.position.y = 0.4;
  tv.add(tvStand);

  const tvLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x424242 })
  );
  tvLeg.position.y = 0.2;
  tv.add(tvLeg);

  tv.position.set(-5.7, FLOOR_Y, 2);
  tv.rotation.y = Math.PI / 2;
  interiorGroup.add(tv);
  registerInteractable('tv', new THREE.Vector3(-5.7, 0, 2), tv);

  const sofa = new THREE.Group();
  const sofaMaterial = new THREE.MeshStandardMaterial({ color: 0xA1887F });

  const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.6), sofaMaterial);
  sofaSeat.position.y = 0.35;
  sofa.add(sofaSeat);

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.15), sofaMaterial);
  sofaBack.position.set(0, 0.525, -0.225);
  sofa.add(sofaBack);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.6), sofaMaterial);
  leftArm.position.set(-0.625, 0.525, 0);
  sofa.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.6), sofaMaterial);
  rightArm.position.set(0.625, 0.525, 0);
  sofa.add(rightArm);

  const sofaLegGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8);
  const sofaLegMaterial = new THREE.MeshStandardMaterial({ color: 0x6D4C41 });
  const sofaLegPositions = [
    [0.6, 0.075, 0.25],
    [0.6, 0.075, -0.25],
    [-0.6, 0.075, 0.25],
    [-0.6, 0.075, -0.25],
  ];

  sofaLegPositions.forEach((pos) => {
    const leg = new THREE.Mesh(sofaLegGeometry, sofaLegMaterial);
    leg.position.set(...pos);
    sofa.add(leg);
  });

  sofa.position.set(-3.5, FLOOR_Y, 2);
  sofa.rotation.y = Math.PI / 2;
  interiorGroup.add(sofa);
  registerInteractable('sofa', new THREE.Vector3(-3.5, 0, 2), sofa);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(-3.5 - 0.3, FLOOR_Y, 2 - 0.7), new THREE.Vector3(-3.5 + 0.3, FLOOR_Y + 0.8, 2 + 0.7))
  );

  interiorGroup.add(createCircularRug(-2, FLOOR_Y + 0.001, 2, 1.2, PASTEL.cream));

  const livingBookshelf = createBookshelf(1.3, FLOOR_Y, -0.7, 3, 0.8, 1.6, 0.3, Math.PI);
  interiorGroup.add(livingBookshelf);
  registerInteractable('bookshelf', new THREE.Vector3(1.3, 0, -0.7), livingBookshelf);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(1.3 - 0.4, FLOOR_Y, -0.7 - 0.2), new THREE.Vector3(1.3 + 0.4, FLOOR_Y + 1.6, -0.7 + 0.2))
  );

  const livingPlant = createPottedPlant(-5.5, FLOOR_Y, 4.5, 1.5);
  interiorGroup.add(livingPlant);
  registerInteractable('plant', new THREE.Vector3(-5.5, 0, 4.5), livingPlant);

  interiorGroup.add(createPottedPlant(-1.5, FLOOR_Y + 0.78, 2.2, 0.4));

  const livingFloorLamp = createFloorLamp(-4.2, FLOOR_Y, 3.5);
  interiorGroup.add(livingFloorLamp);
  registerInteractable('floorLamp', new THREE.Vector3(-4.2, 0, 3.5), livingFloorLamp);

  interiorGroup.add(createCushion(-3.5, FLOOR_Y + 0.55, 2.3, PASTEL.pink));
  interiorGroup.add(createCushion(-3.5, FLOOR_Y + 0.55, 1.7, PASTEL.mint));

  const sideTable = createSideTable(-4.5, FLOOR_Y, 2);
  interiorGroup.add(sideTable);

  const livingMug = createMug(-4.5, FLOOR_Y + 0.52, 2, PASTEL.pink);
  interiorGroup.add(livingMug);
  registerInteractable('mug', new THREE.Vector3(-4.5, 0, 2), livingMug);
}

function createKitchenFloorFurniture(interiorGroup, furnitureCollisionBoxes) {
  const { FLOOR_Y } = HOUSE_CONSTANTS;

  const fridge = new THREE.Group();
  const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.6), new THREE.MeshStandardMaterial({ color: 0xF5F5F5 }));
  fridgeBody.position.y = 0.9;
  fridge.add(fridgeBody);

  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x757575 }));
  handle.position.set(0.3, 1.2, 0.35);
  fridge.add(handle);

  fridge.position.set(5.5, FLOOR_Y, -1.5);
  interiorGroup.add(fridge);
  registerInteractable('fridge', new THREE.Vector3(5.5, 0, -1.5), fridge);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(5.5 - 0.35, FLOOR_Y, -1.5 - 0.3), new THREE.Vector3(5.5 + 0.35, FLOOR_Y + 1.8, -1.5 + 0.3))
  );

  const kitchenTable = createTable(1.0, 0.75, 0.8, new THREE.Vector3(4, FLOOR_Y, 2));
  interiorGroup.add(kitchenTable);
  registerInteractable('kitchenTable', new THREE.Vector3(4, 0, 2), kitchenTable);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(4 - 0.5, FLOOR_Y, 2 - 0.4), new THREE.Vector3(4 + 0.5, FLOOR_Y + 0.8, 2 + 0.4))
  );

  const sink = new THREE.Group();
  const counterMaterial = new THREE.MeshStandardMaterial({ color: 0xBDBDBD });

  const sinkCabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.87, 0.5), new THREE.MeshStandardMaterial({ color: 0xD7CCC8 }));
  sinkCabinet.position.y = 0.435;
  sink.add(sinkCabinet);

  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.5), counterMaterial);
  counter.position.y = 0.9;
  sink.add(counter);

  const basin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.35), new THREE.MeshStandardMaterial({ color: 0x9E9E9E }));
  basin.position.set(0, 0.825, 0);
  sink.add(basin);

  const faucetBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8),
    new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8 })
  );
  faucetBase.position.set(0, 0.95, -0.1);
  sink.add(faucetBase);

  const faucetSpout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8 })
  );
  faucetSpout.rotation.z = Math.PI / 3;
  faucetSpout.position.set(0.05, 1.05, 0);
  sink.add(faucetSpout);

  sink.position.set(4, FLOOR_Y, -1.5);
  interiorGroup.add(sink);
  registerInteractable('sink', new THREE.Vector3(4, 0, -1.5), sink);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(4 - 0.75, FLOOR_Y, -1.5 - 0.25), new THREE.Vector3(4 + 0.75, FLOOR_Y + 0.95, -1.5 + 0.25))
  );

  const utensilMaterial = new THREE.MeshStandardMaterial({ color: 0x757575 });

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.15, 16), utensilMaterial);
  pot.position.set(2.8, 0.98, -1.5);
  interiorGroup.add(pot);

  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16), utensilMaterial);
  pan.position.set(2.3, 0.975, -1.4);
  interiorGroup.add(pan);

  const spatula = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8), utensilMaterial);
  spatula.position.set(3.2, 1.025, -1.5);
  spatula.rotation.z = Math.PI / 4;
  interiorGroup.add(spatula);

  const gasRange = new THREE.Group();

  const rangeCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.87, 0.55), new THREE.MeshStandardMaterial({ color: 0xD7CCC8 }));
  rangeCabinet.position.y = 0.435;
  gasRange.add(rangeCabinet);

  const rangeBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.55), new THREE.MeshStandardMaterial({ color: 0xE0E0E0 }));
  rangeBody.position.y = 0.9;
  gasRange.add(rangeBody);

  const burnerMaterial = new THREE.MeshStandardMaterial({ color: 0x424242 });
  const burnerPositions = [
    [0.15, 0.925, 0.15],
    [0.15, 0.925, -0.15],
    [-0.15, 0.925, 0.15],
    [-0.15, 0.925, -0.15],
  ];

  burnerPositions.forEach((pos) => {
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), burnerMaterial);
    burner.position.set(...pos);
    gasRange.add(burner);
  });

  gasRange.position.set(2.5, FLOOR_Y, -1.5);
  interiorGroup.add(gasRange);
  registerInteractable('gasRange', new THREE.Vector3(2.5, 0, -1.5), gasRange);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(2.5 - 0.3, FLOOR_Y, -1.5 - 0.275), new THREE.Vector3(2.5 + 0.3, FLOOR_Y + 0.95, -1.5 + 0.275))
  );

  interiorGroup.add(createDishRack(4.6, FLOOR_Y + 0.93, -1.5));
  interiorGroup.add(createFruitBasket(4, FLOOR_Y + 0.78, 2));
  interiorGroup.add(createPottedPlant(5.5, FLOOR_Y, 4.5, 0.6));

  const kitchenKettle = createKettle(2.6, FLOOR_Y + 0.93, -1.3);
  interiorGroup.add(kitchenKettle);
  registerInteractable('kettle', new THREE.Vector3(2.6, 0, -1.3), kitchenKettle);

  const magnetColors = [PASTEL.pink, PASTEL.mint, PASTEL.butter, PASTEL.lavender];
  magnetColors.forEach((color, i) => {
    const magnet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), new THREE.MeshStandardMaterial({ color }));
    magnet.position.set(5.5 + (i % 2) * 0.12 - 0.06, 1.3 + Math.floor(i / 2) * 0.12, -1.5 + 0.32);
    interiorGroup.add(magnet);
  });

  const strawberryBasket = createStrawberryBasket(4, FLOOR_Y + 0.78, 2.15);
  interiorGroup.add(strawberryBasket);
  registerInteractable('strawberryBasket', new THREE.Vector3(4, 0, 2), strawberryBasket);

  const chairMat = new THREE.MeshStandardMaterial({ color: PASTEL.warmBrown });
  const cLegGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);

  const kitchenChair1 = new THREE.Group();
  const seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), chairMat);
  seat1.position.y = 0.45;
  kitchenChair1.add(seat1);
  const back1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.04), chairMat);
  back1.position.set(0, 0.7, -0.18);
  kitchenChair1.add(back1);
  [[0.16, 0.225, 0.16], [0.16, 0.225, -0.16], [-0.16, 0.225, 0.16], [-0.16, 0.225, -0.16]].forEach((p) => {
    const leg = new THREE.Mesh(cLegGeo, chairMat);
    leg.position.set(...p);
    kitchenChair1.add(leg);
  });
  kitchenChair1.position.set(4, FLOOR_Y, 2.8);
  kitchenChair1.rotation.y = Math.PI;
  interiorGroup.add(kitchenChair1);

  const kitchenChair2 = new THREE.Group();
  const seat2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), chairMat);
  seat2.position.y = 0.45;
  kitchenChair2.add(seat2);
  const back2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.04), chairMat);
  back2.position.set(0, 0.7, -0.18);
  kitchenChair2.add(back2);
  [[0.16, 0.225, 0.16], [0.16, 0.225, -0.16], [-0.16, 0.225, 0.16], [-0.16, 0.225, -0.16]].forEach((p) => {
    const leg = new THREE.Mesh(cLegGeo, chairMat);
    leg.position.set(...p);
    kitchenChair2.add(leg);
  });
  kitchenChair2.position.set(4, FLOOR_Y, 1.2);
  interiorGroup.add(kitchenChair2);
}

function createBathroomFloorFurniture(interiorGroup, furnitureCollisionBoxes) {
  const { FLOOR_Y } = HOUSE_CONSTANTS;

  const vanity = new THREE.Group();
  const vanityMaterial = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });

  const vanityCounter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.45), vanityMaterial);
  vanityCounter.position.y = 0.8;
  vanity.add(vanityCounter);

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.4), new THREE.MeshStandardMaterial({ color: 0xD7CCC8 }));
  cabinet.position.y = 0.4;
  vanity.add(cabinet);

  const vanityBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xFAFAFA }));
  vanityBasin.position.set(0, 0.77, 0);
  vanity.add(vanityBasin);

  const faucet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8 })
  );
  faucet.rotation.z = Math.PI / 4;
  faucet.position.set(0.05, 0.9, -0.1);
  vanity.add(faucet);

  vanity.position.set(3, FLOOR_Y, -2.5);
  interiorGroup.add(vanity);
  registerInteractable('vanity', new THREE.Vector3(3, 0, -2.5), vanity);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(3 - 0.4, FLOOR_Y, -2.5 - 0.225), new THREE.Vector3(3 + 0.4, FLOOR_Y + 0.85, -2.5 + 0.225))
  );

  const toilet = new THREE.Group();
  const toiletMaterial = new THREE.MeshStandardMaterial({ color: 0xFAFAFA });

  const bowl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.5), toiletMaterial);
  bowl.position.y = 0.2;
  toilet.add(bowl);

  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16), toiletMaterial);
  seat.position.y = 0.42;
  toilet.add(seat);

  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.15), toiletMaterial);
  tank.position.set(0, 0.6, -0.2);
  toilet.add(tank);

  toilet.position.set(5.2, FLOOR_Y, -4.3);
  interiorGroup.add(toilet);
  registerInteractable('toilet', new THREE.Vector3(5.2, 0, -4.3), toilet);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(5.2 - 0.2, FLOOR_Y, -4.3 - 0.25), new THREE.Vector3(5.2 + 0.2, FLOOR_Y + 0.8, -4.3 + 0.25))
  );

  const tpHolder = new THREE.Group();
  const holder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8 })
  );
  holder.rotation.z = Math.PI / 2;
  tpHolder.add(holder);

  const tpRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0xFFF8E1 }));
  tpRoll.rotation.z = Math.PI / 2;
  tpHolder.add(tpRoll);

  tpHolder.position.set(4.8, 0.6, -4.3);
  interiorGroup.add(tpHolder);

  interiorGroup.add(createRug(3, FLOOR_Y + 0.001, -3.2, 0.4, 0.3, PASTEL.mint));
  interiorGroup.add(createPottedPlant(3.4, FLOOR_Y + 0.83, -2.5, 0.3));
}

function createBedroomFloorFurniture(interiorGroup, furnitureCollisionBoxes) {
  const { FLOOR_Y } = HOUSE_CONSTANTS;

  const bed = new THREE.Group();

  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 1.4), new THREE.MeshStandardMaterial({ color: 0xBCAAA4 }));
  mattress.position.y = 0.2;
  bed.add(mattress);

  const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.08), new THREE.MeshStandardMaterial({ color: 0x6D4C41 }));
  headboard.position.set(0, 0.6, -0.7);
  bed.add(headboard);

  const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x6D4C41 });
  const legPositions = [
    [0.9, 0.1, 0.6],
    [0.9, 0.1, -0.6],
    [-0.9, 0.1, 0.6],
    [-0.9, 0.1, -0.6],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(...pos);
    bed.add(leg);
  });

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: 0xFFF8E1 }));
  pillow.position.set(0, 0.475, -0.4);
  bed.add(pillow);

  bed.position.set(-2, FLOOR_Y, -4.2);
  interiorGroup.add(bed);
  registerInteractable('bed', new THREE.Vector3(-2, 0, -4.2), bed);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(-2 - 1.0, FLOOR_Y, -4.2 - 0.7), new THREE.Vector3(-2 + 1.0, FLOOR_Y + 0.6, -4.2 + 0.7))
  );

  const chair = new THREE.Group();
  const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });

  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), chairMaterial);
  chairSeat.position.y = 0.45;
  chair.add(chairSeat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.05), chairMaterial);
  back.position.set(0, 0.7, -0.2);
  chair.add(back);

  const chairLegGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
  const chairLegPositions = [
    [0.18, 0.225, 0.18],
    [0.18, 0.225, -0.18],
    [-0.18, 0.225, 0.18],
    [-0.18, 0.225, -0.18],
  ];

  chairLegPositions.forEach((pos) => {
    const leg = new THREE.Mesh(chairLegGeometry, chairMaterial);
    leg.position.set(...pos);
    chair.add(leg);
  });

  chair.position.set(0, FLOOR_Y, -3);
  interiorGroup.add(chair);

  const nightstand = new THREE.Group();
  const nightstandMaterial = new THREE.MeshStandardMaterial({ color: 0x6D4C41 });

  const nightstandTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.4), nightstandMaterial);
  nightstandTop.position.y = 0.5;
  nightstand.add(nightstandTop);

  const nightstandBody = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.35), new THREE.MeshStandardMaterial({ color: 0x8D6E63 }));
  nightstandBody.position.y = 0.25;
  nightstand.add(nightstandBody);

  nightstand.position.set(-4, FLOOR_Y, -4.2);
  interiorGroup.add(nightstand);
  registerInteractable('nightstand', new THREE.Vector3(-4, 0, -4.2), nightstand);
  furnitureCollisionBoxes.push(
    new THREE.Box3(new THREE.Vector3(-4 - 0.25, FLOOR_Y, -4.2 - 0.2), new THREE.Vector3(-4 + 0.25, FLOOR_Y + 0.55, -4.2 + 0.2))
  );

  interiorGroup.add(createRug(-2, FLOOR_Y + 0.001, -3.2, 1.2, 0.6, PASTEL.lavender));

  const wardrobe = createWardrobe(-5.3, FLOOR_Y, -4.3, furnitureCollisionBoxes);
  interiorGroup.add(wardrobe);
  registerInteractable('wardrobe', new THREE.Vector3(-5.3, 0, -4.3), wardrobe);

  interiorGroup.add(createDeskLamp(-4, FLOOR_Y + 0.54, -4.2));

  const bedroomBookshelf = createBookshelf(1.3, FLOOR_Y, -1.2, 2, 0.6, 1.0, 0.25, Math.PI);
  interiorGroup.add(bedroomBookshelf);

  interiorGroup.add(createAlarmClock(-3.8, FLOOR_Y + 0.54, -4.1));

  const bear = createStuffedBear(-1.5, FLOOR_Y + 0.42, -4.4);
  interiorGroup.add(bear);
  registerInteractable('stuffedBear', new THREE.Vector3(-1.5, 0, -4.4), bear);

  const extraPillow = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.35), new THREE.MeshStandardMaterial({ color: PASTEL.pink }));
  extraPillow.position.set(-2.4, FLOOR_Y + 0.475, -4.5);
  extraPillow.rotation.y = 0.15;
  interiorGroup.add(extraPillow);

  const strawberryPlushie = createStrawberryPlushie(-0.5, FLOOR_Y, -3.8);
  interiorGroup.add(strawberryPlushie);
  registerInteractable('strawberryPlushie', new THREE.Vector3(-0.5, 0, -3.8), strawberryPlushie);
}

export function createFloorFurniture(interiorGroup) {
  const furnitureCollisionBoxes = [];

  createLivingRoomFloorFurniture(interiorGroup, furnitureCollisionBoxes);
  createKitchenFloorFurniture(interiorGroup, furnitureCollisionBoxes);
  createBathroomFloorFurniture(interiorGroup, furnitureCollisionBoxes);
  createBedroomFloorFurniture(interiorGroup, furnitureCollisionBoxes);

  return { furnitureCollisionBoxes };
}
