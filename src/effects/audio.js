let audioContext = null;
let bgmAudio = null;
let windNodes = null;
let footstepState = null;

const BGM_VOLUME = 0.35;

export function createAudio() {
  return {
    initialized: false,
    lastFootstepTime: 0,
    context: null,
    nodes: null
  };
}

export function resumeAudio() {
  initBGM();

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    initWindAmbience();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
}

function initBGM() {
  if (bgmAudio) return;

  bgmAudio = new Audio('/audio/bgm.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0;
  bgmAudio.preload = 'auto';

  bgmAudio.play().then(() => {
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(vol + 0.01, BGM_VOLUME);
      bgmAudio.volume = vol;
      if (vol >= BGM_VOLUME) clearInterval(fadeIn);
    }, 80);
  }).catch(err => {
    console.warn('BGM play failed, will retry on next interaction:', err);
    bgmAudio = null;
  });
}

function initWindAmbience() {
  if (!audioContext) return;

  windNodes = {
    bufferSource: null,
    filter: null,
    gain: null,
    modulationStartTime: audioContext.currentTime
  };

  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  filter.Q.value = 1;

  const gain = audioContext.createGain();
  gain.gain.value = 0.01;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  noise.start();

  windNodes.bufferSource = noise;
  windNodes.filter = filter;
  windNodes.gain = gain;

  modulateWindGain();
}

function modulateWindGain() {
  if (!windNodes || !windNodes.gain || !audioContext) return;

  const currentTime = audioContext.currentTime;
  const duration = 5 + Math.random() * 3;
  const targetGain = 0.005 + Math.random() * 0.01;

  windNodes.gain.gain.setTargetAtTime(targetGain, currentTime, duration / 3);

  setTimeout(modulateWindGain, duration * 1000);
}

function createFootstep(volume) {
  if (!audioContext) return;

  const bufferSize = audioContext.sampleRate * 0.05;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.exp(-i / bufferSize * 8);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 250 + Math.random() * 150;
  filter.Q.value = 2;

  const gain = audioContext.createGain();
  gain.gain.value = volume;

  const currentTime = audioContext.currentTime;
  gain.gain.setTargetAtTime(0, currentTime + 0.02, 0.01);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  noise.start(currentTime);
  noise.stop(currentTime + 0.05);
}

export function updateAudio(dt, movementState, characterPosition) {
  if (!audioContext) return;

  if (!footstepState) {
    footstepState = {
      lastFootstepTime: audioContext.currentTime
    };
  }

  if (movementState.isMoving && movementState.isGrounded) {
    const interval = movementState.isRunning ? 0.3 : 0.45;
    const volume = movementState.isRunning ? 0.12 : 0.08;
    const currentTime = audioContext.currentTime;

    const timingVariation = (Math.random() - 0.5) * 0.05;

    if (currentTime - footstepState.lastFootstepTime >= interval + timingVariation) {
      createFootstep(volume);
      footstepState.lastFootstepTime = currentTime;
    }
  }
}
