import * as THREE from 'three';
import { getIsIndoor, isDoorPromptActive } from './doorEntry.js';

const INTERACT_RADIUS = 1.44;
const TOAST_DURATION = 2500;
const COOLDOWN = 1000;

const _charPos = new THREE.Vector3();
const _itemPos = new THREE.Vector3();

let _interactables = [];
let _prompt = null;
let _toastEl = null;
let _activeItem = null;
let _lastInteractTime = 0;
let _toastTimeout = null;

const INTERACTIONS = {
  tv: {
    label: 'TV',
    messages: [
      '만화 보는 중~ 너무 재밌어!',
      '요리 프로그램이다! 맛있겠다~',
      '채널 돌리는 중~ 뭐 볼까?',
      '코리락쿠마 최애 프로그램이야~!',
    ],
    onInteract: (mesh) => toggleEmissive(mesh, 0x4FC3F7, 0.4),
  },
  sofa: {
    label: '소파',
    messages: [
      '너무 푹신해... 에헤헤~ zzZ',
      '소파에서 뒹굴뒹굴~ 행복해!',
      '쿠션이 몽글몽글해서 좋아~',
      '여기서 낮잠 자고 싶다...',
    ],
  },
  fridge: {
    label: '냉장고',
    messages: [
      '음~ 푸딩이랑 케이크 중에 뭘 먹을까?',
      '냉장고에 간식이 가득해~!',
      '딸기 발견! 맛있겠다~!',
      '어제 만든 핫케이크가 남아있어!',
    ],
  },
  gasRange: {
    label: '가스레인지',
    messages: [
      '핫케이크 만들 시간이야~!',
      '요리 중~ 맛있는 거 만들 거야!',
      '좋은 냄새가 솔솔~ 후후~',
    ],
    onInteract: (mesh) => toggleEmissive(mesh, 0xFF6E40, 0.3),
  },
  sink: {
    label: '싱크대',
    messages: [
      '첨벙첨벙~ 손 씻는 중!',
      '물이 따뜻해서 기분 좋아~',
      '설거지 끝! 깨끗해졌다~!',
    ],
  },
  kitchenTable: {
    label: '주방 테이블',
    messages: [
      '간식 시간이야~!',
      '차 마시는 중~ 홀짝홀짝~',
      '과일 바구니가 알록달록해!',
    ],
  },
  bed: {
    label: '침대',
    messages: [
      '졸려... 5분만 더 잘래...',
      '이불이 따뜻해서 나가기 싫어~',
      '릴라쿠마 인형이랑 같이 누웠어~ 포근해~',
      '쿨쿨... zzZ...',
    ],
  },
  wardrobe: {
    label: '옷장',
    messages: [
      '예쁜 옷이 엄청 많아~!',
      '노란 우비 발견! 귀여워~!',
      '오늘은 어떤 모자를 쓸까?',
    ],
  },
  nightstand: {
    label: '탁자',
    messages: [
      '알람이 7시래... 아직 이른데...',
      '작은 램프가 있어~ 아늑하다~',
      '시계 확인! 똑딱똑딱~',
    ],
  },
  bookshelf: {
    label: '책장',
    messages: [
      '알록달록한 책이 잔뜩 있어~!',
      '그림책 발견! 읽어볼까?',
      '꿀 핫케이크 레시피 책이다~!',
    ],
  },
  diningTable: {
    label: '식탁',
    messages: [
      '친구들이랑 밥 먹을 시간이야~!',
      '식탁이 예쁘게 차려져 있어~',
      '핫케이크가 먹고 싶어~!',
    ],
  },
  toilet: {
    label: '변기',
    messages: [
      '...잠깐 실례!',
      '잠깐만 기다려줘~ 에헤헤...',
    ],
  },
  vanity: {
    label: '세면대',
    messages: [
      '거울 속 코리락쿠마~ 안녕!',
      '오늘도 귀엽다~ 후후~',
      '이 닦을 시간이야! 치카치카~',
    ],
  },
  floorLamp: {
    label: '스탠드',
    messages: [
      '찰칵! 불빛이 따뜻해~',
      '아늑한 독서등 켰어~!',
    ],
    onInteract: (mesh) => toggleEmissive(mesh, 0xFFE082, 0.5),
  },
  plant: {
    label: '화분',
    messages: [
      '식물이 건강해~! 초록초록!',
      '물 줬어~ 쑥쑥 자라라~!',
      '작은 잎이 자라고 있어~ 귀여워!',
    ],
  },
  stuffedBear: {
    label: '릴라쿠마 인형',
    messages: [
      '꼬옥~! 릴라쿠마는 부드러워~',
      '인형을 꽉 안았어! 행복해~!',
      '영원한 베프야~! 사랑해~!',
    ],
  },
  kettle: {
    label: '주전자',
    messages: [
      '물 끓이는 중~ 차 마실 거야!',
      '주전자가 삐~ 하고 울었어!',
      '핫초코 만들 시간이야~!',
    ],
  },
  mug: {
    label: '머그컵',
    messages: [
      '호호~ 핫초코 최고야~!',
      '머그컵에 작은 곰돌이가 그려져 있어~',
    ],
  },
  strawberryBasket: {
    label: '딸기 바구니',
    messages: [
      '딸기 바구니야! 달콤한 향기가 나~ 에헤헤~',
      '코리락쿠마의 보물이야! 딸기가 제일 좋아~',
      '하나만 먹을까...? 후후~',
    ],
  },
  strawberryPlushie: {
    label: '딸기 인형',
    messages: [
      '큰 딸기 인형이야! 안으면 폭신폭신해~',
      '이 인형이랑 같이 자면 딸기 꿈을 꿔~ 에헤헤~',
      '세상에서 제일 큰 딸기! 사실은 인형이지만~',
    ],
  },
};

function toggleEmissive(group, color, intensity) {
  if (!group) return;
  const target = group.isGroup ? group : (group.parent || group);
  let toggled = false;
  target.traverse(child => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      if (mat.emissiveIntensity > 0.01 && mat._interactionToggled) {
        mat.emissiveIntensity = mat._originalEmissiveIntensity || 0;
        mat._interactionToggled = false;
        toggled = true;
      } else if (!toggled) {
        mat._originalEmissiveIntensity = mat.emissiveIntensity;
        mat.emissive = new THREE.Color(color);
        mat.emissiveIntensity = intensity;
        mat._interactionToggled = true;
      }
    }
  });
}

function randomMessage(key) {
  const config = INTERACTIONS[key];
  if (!config) return '';
  const msgs = config.messages;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export function registerInteractable(id, position, meshOrGroup) {
  _interactables.push({ id, position: position.clone(), mesh: meshOrGroup });
}

export function initFurnitureInteraction() {
  _prompt = document.getElementById('interaction-prompt');

  _toastEl = document.getElementById('interaction-toast');
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.id = 'interaction-toast';
    document.body.appendChild(_toastEl);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE' && _activeItem && getIsIndoor() && !isDoorPromptActive()) {
      const now = performance.now();
      if (now - _lastInteractTime < COOLDOWN) return;
      _lastInteractTime = now;
      doInteract(_activeItem);
    }
  });
}

function doInteract(item) {
  const config = INTERACTIONS[item.id];
  if (!config) return;

  const msg = randomMessage(item.id);
  showToast(msg);

  if (config.onInteract) {
    config.onInteract(item.mesh);
  }
}

function showToast(text) {
  if (!_toastEl) return;
  if (_toastTimeout) clearTimeout(_toastTimeout);

  _toastEl.textContent = text;
  _toastEl.classList.add('visible');

  _toastTimeout = setTimeout(() => {
    _toastEl.classList.remove('visible');
    _toastTimeout = null;
  }, TOAST_DURATION);
}

function showFurniturePrompt(label) {
  if (!_prompt) return;
  _prompt.textContent = `E : ${label}`;
  _prompt.classList.add('visible');
  _prompt.classList.add('blink');
}

function hideFurniturePrompt() {
  if (!_prompt) return;
  _prompt.classList.remove('visible');
  _prompt.classList.remove('blink');
}

export function updateFurnitureInteraction(characterPosition) {
  if (!getIsIndoor() || isDoorPromptActive()) {
    if (_activeItem) {
      _activeItem = null;
      hideFurniturePrompt();
    }
    return;
  }

  _charPos.copy(characterPosition);
  _charPos.y = 0;

  let closest = null;
  let closestDist = INTERACT_RADIUS;

  for (let i = 0; i < _interactables.length; i++) {
    const item = _interactables[i];
    _itemPos.copy(item.position);
    _itemPos.y = 0;
    const dist = _charPos.distanceTo(_itemPos);
    if (dist < closestDist) {
      closestDist = dist;
      closest = item;
    }
  }

  if (closest) {
    const config = INTERACTIONS[closest.id];
    if (config && _activeItem !== closest) {
      showFurniturePrompt(config.label);
    }
    _activeItem = closest;
  } else {
    if (_activeItem) {
      hideFurniturePrompt();
    }
    _activeItem = null;
  }
}
