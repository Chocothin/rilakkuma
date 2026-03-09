import { createNoise2D } from 'simplex-noise';

function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SEED = 42;
const prng = mulberry32(SEED);
const noise2D = createNoise2D(prng);

export function getNoise(x, z) {
  return noise2D(x, z);
}

export function fbm(x, z, octaves = 4, lacunarity = 2.0, gain = 0.5) {
  let sum = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    sum += noise2D(x * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  
  return sum / maxValue;
}

export function ridgedNoise(x, z, octaves = 4) {
  let sum = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    let n = noise2D(x * frequency, z * frequency);
    n = 1.0 - Math.abs(n);
    n = n * n;
    sum += n * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return sum / maxValue;
}
