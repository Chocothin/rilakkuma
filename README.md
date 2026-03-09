# Korilakkuma World

Three.js로 만든 3D 브라우저 게임. 코리락쿠마가 살고 있는 작은 세계를 탐험할 수 있습니다.

## Features

- **3D 오픈월드** — 지형, 바다, 산, 구름, 나무, 꽃, 연못, 다리, 울타리, 마을 건물
- **코리락쿠마 캐릭터** — GLB 모델 로딩, idle/walk/run/jump 애니메이션
- **하우스 시스템** — 거실/주방/욕실/침실 4개 방 + 20여 개 가구
- **문 진입** — "Press E" 프롬프트 → 페이드 전환 → 실내/실외 이동
- **가구 인터랙션** — 가구에 다가가면 토스트 메시지 표시
- **낮/밤 사이클** — 태양 궤도, 하늘색 전환, 별/달/유성
- **실내 조명** — 진입 시 따뜻한 실내등 자동 전환
- **BGM + 발소리** — 배경 음악, 이동 시 발자국 효과음
- **터치 컨트롤** — 모바일 조이스틱 + 버튼 자동 감지
- **로딩 화면** — 단계별 진행률 표시

## Controls

| 입력 | 동작 |
|------|------|
| `W A S D` | 이동 |
| `Shift` | 달리기 |
| `Space` | 점프 |
| `Mouse` | 카메라 회전 |
| `E` | 문 진입/퇴장 |

모바일은 화면 왼쪽 조이스틱 + 오른쪽 버튼으로 조작합니다.

## Getting Started

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 플레이.

### 빌드

```bash
npm run build
npm run preview
```

## Tech Stack

- [Three.js](https://threejs.org/) — 3D 렌더링
- [simplex-noise](https://github.com/jwagner/simplex-noise) — 절차적 지형 생성
- [Vite](https://vite.dev/) — 빌드 도구

## Project Structure

```
src/
├── main.js                  # 진입점, 씬 셋업, 게임 루프
├── camera/
│   └── thirdPerson.js       # 3인칭 카메라
├── character/
│   ├── korilakkuma.js       # GLB 모델 로더
│   ├── controller.js        # WASD 이동 + 충돌
│   └── animations.js        # 절차적 애니메이션
├── controls/
│   └── touchControls.js     # 모바일 터치 조작
├── effects/
│   ├── audio.js             # BGM + 발소리
│   ├── lighting.js          # 낮/밤 + 실내 조명
│   └── wind.js              # 바람 효과
├── interaction/
│   ├── doorEntry.js         # 문 진입/퇴장 시스템
│   └── furnitureInteraction.js  # 가구 인터랙션
├── utils/
│   └── noise.js             # FBM 노이즈
└── world/
    ├── ground.js             # 지면
    ├── terrain.js            # 지형 생성
    ├── sky.js                # 하늘 + 별 + 달 + 유성
    ├── ocean.js              # 바다
    ├── mountains.js          # 산
    ├── clouds.js             # 구름
    ├── trees.js              # 나무
    ├── vegetation.js         # 풀/식생
    ├── flowers.js            # 꽃
    ├── roads.js              # 도로
    ├── bridges.js            # 다리
    ├── ponds.js              # 연못
    ├── fences.js             # 울타리
    ├── garden.js             # 정원
    ├── buildings.js          # 마을 건물
    ├── house.js              # 하우스 본체
    ├── house/
    │   ├── exteriorWalls.js  # 외벽
    │   ├── interiorWalls.js  # 내벽
    │   └── wallUtils.js      # 벽 유틸
    └── furniture/
        ├── furniture.js      # 가구 배치 총괄
        ├── common.js         # 공통 가구 헬퍼
        ├── floorFurniture.js # 바닥 가구
        ├── wallMountedFurniture.js  # 벽걸이 가구
        └── ceilingFurniture.js      # 천장 가구
```

## License

MIT
