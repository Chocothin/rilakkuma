import * as THREE from 'three';
import { updateSky } from '../world/sky.js';

const COLORS = {
  night: new THREE.Color(0x0E1428),
  dawnDusk: new THREE.Color(0xFF8A50),
  dawnDuskLight: new THREE.Color(0xFFCC80),
  day: new THREE.Color(0x8ECAE6),
  white: new THREE.Color(0xFFF8E8),
  nightAmbient: new THREE.Color(0x1A1A3E)
};

const tempColor1 = new THREE.Color();
const tempColor2 = new THREE.Color();

const SUN_ORBIT_RADIUS = 200;

// Indoor/outdoor mode state
let _scene = null;
let _sunLight = null;
let _ambientLight = null;
let _isIndoor = false;
const roomLights = [];
const _savedFog = { color: null, density: 0 };

export function createLighting(scene, sunLight, ambientLight) {
  _scene = scene;
  _sunLight = sunLight;
  _ambientLight = ambientLight;
  
  scene.fog = new THREE.FogExp2(COLORS.dawnDusk.getHex(), 0.012);
  scene.background = COLORS.dawnDusk.clone();
  
  // Indoor room lights (initially hidden)
  const lightConfigs = [
    { pos: [-2, 2.9, 2], color: 0xFFE0B2, intensity: 3.0 },     // Living Room
    { pos: [4, 2.9, 1.5], color: 0xFFE0B2, intensity: 3.0 },    // Kitchen
    { pos: [4, 2.9, -3.5], color: 0xFFF3E0, intensity: 2.5 },   // Bathroom
    { pos: [-2, 2.9, -3], color: 0xFFE0B2, intensity: 2.5 },    // Bedroom
  ];
  
  lightConfigs.forEach(cfg => {
    const light = new THREE.PointLight(cfg.color, cfg.intensity, 15);
    light.position.set(...cfg.pos);
    light.visible = false;
    scene.add(light);
    roomLights.push(light);
  });
}

function getSkyColor(timeOfDay) {
  const result = new THREE.Color();

  if (timeOfDay < 0.2) {
    result.copy(COLORS.night);
  } else if (timeOfDay < 0.3) {
    const t = (timeOfDay - 0.2) / 0.1;
    result.lerpColors(COLORS.dawnDusk, COLORS.dawnDuskLight, t);
  } else if (timeOfDay < 0.35) {
    const t = (timeOfDay - 0.3) / 0.05;
    result.lerpColors(COLORS.dawnDuskLight, COLORS.day, t);
  } else if (timeOfDay < 0.65) {
    result.copy(COLORS.day);
  } else if (timeOfDay < 0.7) {
    const t = (timeOfDay - 0.65) / 0.05;
    result.lerpColors(COLORS.day, COLORS.dawnDuskLight, t);
  } else if (timeOfDay < 0.8) {
    const t = (timeOfDay - 0.7) / 0.1;
    result.lerpColors(COLORS.dawnDuskLight, COLORS.dawnDusk, t);
  } else if (timeOfDay < 0.85) {
    const t = (timeOfDay - 0.8) / 0.05;
    result.lerpColors(COLORS.dawnDusk, COLORS.night, t);
  } else {
    result.copy(COLORS.night);
  }

  return result;
}

function getSunIntensity(timeOfDay) {
  const angle = (timeOfDay - 0.25) * Math.PI * 2;
  return Math.max(0, Math.sin(angle));
}

function getSunColor(timeOfDay) {
  const result = new THREE.Color();

  if (timeOfDay < 0.2 || timeOfDay > 0.8) {
    result.copy(COLORS.white);
  } else if (timeOfDay < 0.35) {
    const t = (timeOfDay - 0.2) / 0.15;
    result.lerpColors(COLORS.dawnDusk, COLORS.white, t);
  } else if (timeOfDay < 0.65) {
    result.copy(COLORS.white);
  } else {
    const t = (timeOfDay - 0.65) / 0.15;
    result.lerpColors(COLORS.white, COLORS.dawnDusk, t);
  }

  return result;
}

function getAmbientIntensity(timeOfDay) {
  const angle = (timeOfDay - 0.25) * Math.PI * 2;
  const normalized = (Math.sin(angle) + 1) / 2;
  return 0.05 + normalized * 0.35;
}

function getAmbientColor(timeOfDay) {
  const result = new THREE.Color();

  if (timeOfDay < 0.25 || timeOfDay > 0.75) {
    const nightAmount = timeOfDay < 0.25
      ? 1 - (timeOfDay / 0.25)
      : (timeOfDay - 0.75) / 0.25;
    result.lerpColors(COLORS.white, COLORS.nightAmbient, nightAmount);
  } else {
    result.copy(COLORS.white);
  }

  return result;
}

export function updateLighting(dt, scene, sunLight, ambientLight, gameState) {
  if (_isIndoor) return; // Skip day/night cycle when indoors
  
  if (gameState.timeOfDay === undefined) {
    gameState.timeOfDay = 0.25;
  }

  gameState.timeOfDay += dt / 300;
  gameState.timeOfDay %= 1.0;

  const timeOfDay = gameState.timeOfDay;

  // Sun orbits in a great circle around planet center
  const angle = (timeOfDay - 0.25) * Math.PI * 2;
  sunLight.position.x = Math.cos(angle) * SUN_ORBIT_RADIUS;
  sunLight.position.y = Math.sin(angle) * SUN_ORBIT_RADIUS;
  sunLight.position.z = 50;

  sunLight.intensity = getSunIntensity(timeOfDay);
  sunLight.color.copy(getSunColor(timeOfDay));

  ambientLight.intensity = getAmbientIntensity(timeOfDay);
  ambientLight.color.copy(getAmbientColor(timeOfDay));

  const skyColor = getSkyColor(timeOfDay);
  scene.background.copy(skyColor);

  scene.fog.color.copy(skyColor);

  updateSky(dt, timeOfDay);
}

export function setIndoorMode(isIndoor) {
  _isIndoor = isIndoor;
  
  if (isIndoor) {
    // Save current fog state
    if (_scene.fog) {
      _savedFog.density = _scene.fog.density;
    }
    _scene.fog = null;
    _scene.background = new THREE.Color(0x5C4A36); // bright warm interior
    _sunLight.intensity = 0;
    _ambientLight.intensity = 0.7;
    _ambientLight.color.set(0xFFE0B2); // warm ambient
    roomLights.forEach(l => l.visible = true);
  } else {
    // Restore outdoor state
    _scene.fog = new THREE.FogExp2(0x8ECAE6, 0.012);
    roomLights.forEach(l => l.visible = false);
    // Day/night cycle will update sun/ambient on next frame
  }
}
