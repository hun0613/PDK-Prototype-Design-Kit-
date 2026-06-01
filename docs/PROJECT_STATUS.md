# 엘커넥트 × 토스 프론트2 프로토타입 — 작업 현황

> 컨텍스트 초기화 시 이 파일만 읽어도 이어서 작업할 수 있도록 정리.
> 마지막 갱신: 2026-05-28

---

## 1. 프로젝트 개요

- **목적**: 엘커넥트 골프장에서 사용할 **토스 프론트2 단말기** 화면 프로토타입
- **단말기**: 세로형 터치 단말기, 화면 **400 × 640** 캔버스
- **기술**: 정적 **HTML / CSS / JS** (빌드/번들 없음, 즉시 미리보기 가능)
- **폰트**: Pretendard (CDN, common.css에서 import)
- **Git 원격**: `http://git.hanuriit.co.kr/biz-planning/lconnect-toss-project.git`
- **로컬 경로**: `C:\Users\THEBESTPAY\Desktop\내손키\엘커넥트`

---

## 2. 디렉터리 구조

```
엘커넥트/
├── landing.html                LCN-INT-001 랜딩페이지 (최초 진입)
├── index.html                  LCN-MAN-001 메인페이지
├── arrival.html                LCN-ATH-001 인증방법 선택
├── qr-output.html              LCN-ATH-002 QR출력
├── qr-fail.html                LCN-ATH-003 QR인증 실패
├── reservation-empty.html      LCN-ATH-004 예약목록 미존재
├── reservation-list.html       LCN-ATH-005 예약목록 페이지-1개
├── reservation-list-multi.html LCN-ATH-008 예약목록 페이지-2개이상 (횟수권 선택)
├── arrival-complete.html       LCN-ATH-006 도착인증 완료
├── purchase.html               LCN-PCH-001 1회권상품 선택
├── phone-input.html            LCN-PCH-002 휴대폰번호 입력 (placeholder)
├── seat-select.html            LCN-PCH-003 타석 선택 (placeholder)
├── selection-confirm.html      LCN-PCH-004 선택내용 확인 (placeholder)
├── card-payment.html           LCN-PCH-005 카드결제 (placeholder)
├── payment-success.html        LCN-PCH-006 결제 성공 (placeholder)
├── payment-fail.html           LCN-PCH-007 결제 실패 (placeholder)
├── product-detail.html         LCN-PCH-009 상품 상세
├── final-complete.html         LCN-PCH-010 타석배정 최종완료 (placeholder)
├── assets/
│   ├── toss-logo.png           하단 푸터 (80×24)
│   ├── home.png                홈 버튼 (120×120 → 40×40 표시, 패딩 포함)
│   ├── qr-code.png             QR 코드 (160×160)
│   ├── qr-icon.png             QR 인증 카드 아이콘 (42×42)
│   ├── landing-bg.png          랜딩 배경 골프 연습장 사진 (832×1248)
│   ├── the-best-golf-club.svg  랜딩 "더베스트 골프클럽" 흰색 로고
│   ├── ticket-icon.svg         횟수권 티켓 아이콘 (초록, 80×80) — 예약목록 2개이상
│   ├── ticket-icon-blue.svg    기간제 티켓 아이콘 (블루, 80×80) — 예약목록 1개
│   ├── golfer-icon.svg         골퍼 일러스트 (80×80) — 1회권 상품 카드(PCH-001)/선택확인(PCH-004)
│   ├── golfer-large.svg        골퍼 일러스트 (270×270) — 상품 상세 상단(LCN-PCH-009)
│   ├── clear-x-icon.svg        입력 초기화 X (휴대폰 입력 LCN-PCH-002)
│   └── backspace-icon.svg      키패드 지우기 ← (휴대폰 입력 LCN-PCH-002)
│   (랜딩 하단 toss 로고는 기존 toss-logo.png 재사용)
├── styles/
│   └── common.css              공용 스타일 + 디바이스 목업 + 사이드바
├── scripts/
│   └── common.js               개발 사이드바 자동 주입 + CATEGORIES
└── docs/
    ├── PROJECT_STATUS.md       (이 파일)
    ├── .bkit-memory.json
    └── .pdca-status.json
```

---

## 3. 디자인 적용 현황

### 공통 카테고리 — **전체 적용 완료** ✓

| ID | 화면명 | 파일 | 상태 |
|---|---|---|---|
| LCN-INT-001 | 랜딩페이지 (최초 진입) | landing.html | ✅ |
| LCN-MAN-001 | 메인페이지 | index.html | ✅ |

### 도착인증 카테고리 — **전체 적용 완료** ✓

| ID | 화면명 | 파일 | 상태 |
|---|---|---|---|
| LCN-MAN-001 | 메인페이지 | index.html | ✅ |
| LCN-ATH-001 | 인증방법 선택페이지 | arrival.html | ✅ |
| LCN-ATH-002 | QR출력페이지 | qr-output.html | ✅ |
| LCN-ATH-003 | QR인증 실패페이지 | qr-fail.html | ✅ |
| LCN-ATH-004 | 예약목록 미존재 알림페이지 | reservation-empty.html | ✅ |
| LCN-ATH-005 | 예약목록 페이지-1개 | reservation-list.html | ✅ |
| LCN-ATH-008 | 예약목록 페이지-2개이상 (횟수권 선택) | reservation-list-multi.html | ✅ |
| LCN-ATH-007 | 예약최종확인 모달 (dim 배경 하단 시트) | reservation-list-multi.html 내 모달 (`?modal=1`로 미리보기) | ✅ |
| LCN-ATH-006 | 도착인증 완료 페이지 | arrival-complete.html | ✅ |

### 1회권 구매 카테고리 — **전체 적용 완료** ✓

| ID | 화면명 | 파일 | 상태 |
|---|---|---|---|
| LCN-PCH-001 | 1회권상품 선택 페이지 | purchase.html | ✅ |
| LCN-PCH-002 | 휴대폰번호 입력페이지 | phone-input.html | ✅ |
| LCN-PCH-009 | 상품 상세페이지 | product-detail.html | ✅ |
| LCN-PCH-003 | 타석 선택페이지 | seat-select.html | ✅ |
| LCN-PCH-004 | 선택내용 확인페이지 | selection-confirm.html | ✅ |
| LCN-PCH-005 | 카드결제(우리 에이전트) 화면 | card-payment.html | ✅ |
| LCN-PCH-006 | 결제 성공페이지 | payment-success.html | ✅ |
| LCN-PCH-007 | 결제 실패페이지 | payment-fail.html | ✅ |
| LCN-PCH-010 | 타석배정 최종완료 페이지 | final-complete.html | ✅ |
| ~~LCN-PCH-008~~ | ~~층 선택페이지~~ | ~~floor-select.html~~ | ❌ 삭제됨 (플로우 변경) |

---

## 4. 페이지 흐름 (User Flow)

```
랜딩 (LCN-INT-001, 최초 진입)
└── [환영합니다] → 메인 (LCN-MAN-001)

메인 (LCN-MAN-001)
├── (30초 무동작) → 랜딩 (LCN-INT-001) 자동 복귀  ※ 터치/클릭 시 타이머 초기화
├── [도착 인증] → 인증방법 선택 (LCN-ATH-001)
│   └── [QR 인증] → QR 출력 (LCN-ATH-002, 60초 카운트다운)
│       ├── ❌ QR 실패 → QR인증 실패 (LCN-ATH-003, 10초/확인 → 메인)
│       └── ✅ QR 성공
│           ├── 예약 없음 → 예약목록 미존재 (LCN-ATH-004, 10초/확인 → 메인)
│           ├── 예약 1개 → 예약목록 페이지-1개 (LCN-ATH-005)
│           │              └── [도착 완료하기] → 도착인증 완료 (LCN-ATH-006, 5초/확인 → 랜딩)
│           └── 예약 2개 이상(횟수권) → 예약목록 페이지-2개이상 (LCN-ATH-008)
│                          └── [예약 카드 선택] → 예약최종확인 모달 (LCN-ATH-007, dim 배경)
│                                     ├── [맞아요] → 도착인증 완료 (LCN-ATH-006, 5초/확인 → 랜딩)
│                                     └── [다시 고를래요]/배경 클릭 → 모달 닫고 목록 복귀
│
└── [1회권 구매] → 1회권상품 선택 (LCN-PCH-001)
    └── [상품 카드 클릭] → 상품 상세 (LCN-PCH-009)
        └── [총 N원 결제하기] → 휴대폰번호 입력 (LCN-PCH-002)
            └── 휴대폰번호 11자리 / "안 할래요" → 타석 선택 (LCN-PCH-003)
                └── [다음] → 선택내용 확인 (LCN-PCH-004)
                    └── [결제하기] → 카드결제 (LCN-PCH-005)
                        ├── ✅ 성공 → 결제 성공 (LCN-PCH-006)
                        │              └── (카드 제거) → 타석배정 최종완료 (LCN-PCH-010, 10초/확인 → 랜딩)
                        └── ❌ 실패 → 결제 실패 (LCN-PCH-007)

※ 도착인증 완료(LCN-ATH-006)·타석배정 최종완료(LCN-PCH-010)는 카운트다운 종료/[확인] 시 랜딩페이지(LCN-INT-001)로 복귀
※ QR인증 실패(LCN-ATH-003)·예약목록 미존재(LCN-ATH-004)는 기존 정책 유지(메인페이지로 복귀)
```

---

## 5. 공통 HTML 구조 패턴

모든 페이지가 동일한 외부 구조를 사용:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=400, initial-scale=1.0" />
  <title>엘커넥트 · {화면명} ({화면ID})</title>
  <link rel="stylesheet" href="styles/common.css" />
  <style>
    /* 페이지 전용 스타일 (절대 좌표 기반 Figma 매칭) */
    .{page}-screen { ... }
  </style>
</head>
<body>
  <div class="device-stage">
    <div class="device-mockup">
      <div class="device-frame">
        <div class="device-screen">
          <div class="{page}-screen">
            <!-- 페이지 콘텐츠 -->
          </div>
        </div>
      </div>
      <div class="device-stand"></div>
      <div class="device-base"></div>
    </div>
  </div>
  <script src="scripts/common.js"></script>
  <script>/* 페이지 전용 스크립트 (있는 경우) */</script>
</body>
</html>
```

---

## 6. 공용 컴포넌트

### 6.1 뒤로가기 버튼 (좌상단)
- 위치: `top: 8px; left: 8px;`
- 크기: 40×40 (내부 18×16 SVG)
- 인라인 SVG ← 화살표
- `aria-label="뒤로가기"`
- 클릭 → `history.back()` (fallback: 적절한 페이지)

### 6.2 홈 버튼 (우상단)
- 위치: `top: 8px; left: 352px;`
- 크기: 40×40 (내부 IMG 40×40, PNG는 120×120이지만 패딩 포함)
- `<img src="assets/home.png" width="40" height="40">`
- `aria-label="홈"`
- 클릭 → `go('index.html')`

### 6.3 toss 푸터 로고
- 위치: `top: 589px; left: 50% (translateX)`
- 크기: 80×24
- `assets/toss-logo.png`

### 6.4 누름 효과 (글로벌, common.css)
- `.device-screen button:active` → `transform: scale(0.97); filter: brightness(0.92);`
- 제외: `class="no-press"` 또는 `disabled` 속성
- 뒤로/홈 버튼은 추가로 누름 시 **둥근 회색 배경** (`rgba(0,0,0,0.06)`) — `border-radius: 12px`
- 셀렉터: `button[aria-label="뒤로가기"], button[aria-label="홈"]`

### 6.5 스크롤바 숨김 (글로벌, common.css)
- `.device-screen` 내부 모든 스크롤 영역에 적용
- 기능 유지, 시각적으로만 숨김
- WebKit, Firefox, IE/Edge 모두 지원

---

## 7. 디자인 토큰 (실측, 시안 확정값)

### 색상
| 토큰 | 값 | 용도 |
|---|---|---|
| Primary Blue | `#3182F6` | 주 버튼, 강조 |
| Teal Accent | `#1EA3AE` | 메인페이지 "입장" 강조 |
| Title Gradient | `linear-gradient(151.4deg, #1EA3AE 40.865%, #2F87EA 59.621%)` | 서브 라벨 (도착 인증/반가워요 등) |
| Text Primary | `#363D4A` | 본문 |
| Text Secondary | `#6E7683` / `#6B7684` | 보조 텍스트 |
| Text Tertiary | `#474E5C` | 카운터 |
| Light Gray BG | `#F3F4F6` / `#F0F2F4` | 카드/박스 |
| Notice Blue BG | `#E8F3FF` | 공지 배너 |
| Border | `#D6DBDF` | 구분선 |
| Yellow Warning | `#FACC15` | 경고 아이콘 원 |
| Dark Text | `#191C23` | 메인 타이틀 (여기서/해주세요) |
| Badge Blue | `#2F71D0` | "기간제" 뱃지 |

### 폰트
- **Pretendard** (Bold 700, SemiBold 600, Medium 500, Regular 400)
- 메인 타이틀: 47px Bold (메인페이지)
- 페이지 타이틀: 28px Bold
- 서브 라벨 그라데이션: 17px Bold
- 버튼 (메인): 26px SemiBold (메인페이지 도착/1회권)
- 버튼 (CTA 하단): 18px Bold

---

## 8. 개발 사이드바 (common.js 자동 주입)

### 좌측 상단: 페이지 목록 테이블
- 카테고리(공통 / 도착인증 / 1회권 구매)별 그룹
- 컬럼: **화면ID / 화면이름 / 디자인** (반영/미반영 뱃지)
- 행 클릭 → 해당 페이지로 이동
- `max-height: 42vh`로 높이 제한 + 내부 스크롤 + sticky 컬럼 헤더

### 좌측 하단: 화면 플로우 다이어그램 (Mermaid)
- `common.js`의 `injectFlowDiagram()`이 주입, **Mermaid**(CDN)로 렌더
- 전체 화면 흐름을 **상→하(TD) 유저플로우** 스타일로 표시 (랜딩 → 메인 → 도착인증/1회권 분기)
- **노드 타입별 스타일** (실무 유저플로우 가이드 반영):
  - 화면 페이지 = 진한 파랑(`#3182F6`, 흰 글자, 화면명+ID 2줄)
  - 액션(클릭) = 연한 파랑(`#D9E8FF`)
  - 분기(판단) = 노란 마름모(`#FFD43B`) — 인증 성공 여부 / 예약 목록 존재 여부 / 예약 개수 / 결제 성공 여부
  - 시작·종료 = 회색 원(terminator)
- **현재 화면 노드는 굵은 검정 테두리(4px)로 강조** (`classDef cur`, `currentFlowNode()`로 판별, 모달은 ATH-007)
- **화면 노드 클릭 → 해당 페이지로 이동** (`click … call __flowGo()`, `FLOW_HREFS` 매핑)
- **다이어그램은 자연 크기로 렌더**(Mermaid `useMaxWidth:false` + 렌더 후 viewBox 크기로 고정) → 노드가 작아지지 않음
- 패널 본문(`.page-flow-body`)에서 **좌우/상하 스크롤**로 큰 플로우 탐색, 헤더(제목·▾ 접기)는 상단 고정
- **마우스 드래그(grab) 패닝**: 빈 영역을 잡고 상하좌우로 끌어 이동(`enableFlowPan`). 4px 이상 드래그하면 직후 클릭 1회를 막아 노드 오클릭 방지, 살짝만 누르면 노드 클릭(이동)으로 동작
- **현재 화면 노드 자동 중앙 정렬**: 페이지 진입 시 해당 노드가 패널 정중앙에 오도록 스크롤(`centerCurrentNodeIn`, 렌더 후 `requestAnimationFrame`)
- **현재 위치 버튼(⊕ 크로스헤어)**: 헤더 아이콘 클릭 시 현재 화면 노드로 부드럽게(smooth) 중앙 이동 — 패널·모달 양쪽에 제공(`centerCurrentNodeIn(body, true)`)
- **크게 보기(전체화면 모달)**: 헤더의 ⛶ 아이콘 클릭 → `.page-flow-modal`이 화면 전체에 열림
  - 확대/축소(`+`/`−`)·맞춤(폭 기준 fit)·`✕`/ESC/배경 클릭으로 닫기
  - 모달 안에서도 드래그 패닝 + 현재 노드 중앙정렬 + 노드 클릭 이동 동작 (모달용 Mermaid를 최초 열 때 1회 렌더)
- 패널 크기 `width:380px / max-height:48vh`, 좌측 하단 고정
- **로딩 처리(깜빡임 방지)**: Mermaid 렌더 전까지 `.page-flow.is-loading`으로 원시 그래프 텍스트를 숨기고(`position:absolute; visibility:hidden`) "불러오는 중…" 표시 → 렌더 완료 시 클래스 해제(모달은 `:not([data-processed])`로 동일 처리)
- 노드/엣지 정의는 `buildFlowGraph()`에 하드코딩 (화면 추가 시 함께 갱신)

### 우측: Description 패널
- 현재 페이지의: **화면 ID / 화면명 / 카테고리 / 디자인 반영 / Figma 링크 / Description 리스트**
- Description은 번호 리스트로 표시
- 각 항목 hover 시 → 디바이스 내부 UI에서 해당 요소만 또렷, 나머지는 흰색으로 dim + 파란 펄스 ring
- nested 타겟 지원 (`.contains-highlight` 부모 체인)

### CATEGORIES 데이터 구조 (`scripts/common.js`)

```js
const CATEGORIES = [
  {
    name: '카테고리명',
    pages: [
      {
        href: 'file.html',
        label: '화면명',
        id: 'LCN-XXX-000',
        designed: true | false,
        figmaLink: 'https://...',
        description: [
          { text: '설명 문구', target: '.css-selector' },
        ],
      },
    ],
  },
];
```

---

## 9. 진행 중 / 최근 작업 메모

### LCN-PCH-009 상품 상세페이지 (방금 작업)
- **단가**: 5,000원 (변수 `UNIT_PRICE`)
- **초기 수량**: 1 (MIN_QTY = 1)
- **수량 선택기 (`.product-detail-qty`)**:
  - 가운데 카운트 박스는 `<button>` (id: `qty-display`)
  - 좌/우 스와이프로 ±1 (pointer 이벤트 기반)
  - `SWIPE_THRESHOLD = 40px` (박스 너비 56px의 약 70%)
  - `FREE_RANGE = 56px` (자유 이동), `DAMPING = 0.35` (러버밴드)
  - **qty=1 일 때**: 
    - `-` 버튼 `disabled` (opacity 0.3, cursor: not-allowed)
    - 왼쪽 스와이프 차단 (visible 20%만 따라옴, 트리거 없음)
  - 박스 자체는 `class="no-press"` (스와이프 중 scale 튐 방지)
- **결제 버튼 텍스트**: `<span id="pay-text">총 N원 결제하기</span>` 단일 span으로 처리
  - flex 안에서 텍스트 노드 사이 공백 잘리는 문제 회피
  - JS: `payText.textContent = \`총 \${fmt(UNIT_PRICE * qty)}원 결제하기\``

### LCN-PCH-001 상품 카드 → LCN-PCH-009로 변경
- 이전: 상품 카드 클릭 → `phone-input.html` (LCN-PCH-002)
- 현재: 상품 카드 클릭 → **`product-detail.html` (LCN-PCH-009)**
- 결제 버튼 → `phone-input.html`

### 카운트다운 페이지 (qr-output, qr-fail, arrival-complete)
- 60초 / 10초 / 5초
- 0에서 정지 (프로토타입), 실제 운영 시 메인 이동 의도 (description에 명시)

### 디자인 동기화 (최근 일괄 작업)
- LCN-ATH-003 / 004 / 006: **뒤로가기 버튼 제거** (시안에 없음)
- LCN-ATH-002: **우상단 홈 버튼 추가**
- LCN-ATH-006: 서브 타이틀 "5분 뒤 시간이 활성화 됩니다" → **"타석으로 이동해주세요"**
- LCN-ATH-001 / 002: 홈 버튼은 `assets/home.png` 40×40 표시 (PNG 패딩 포함)

---

## 10. 사이드바 관련 동작 패턴

### Description hover dim/highlight
- 우측 Description 항목에 마우스 올리면:
  - JS: 화면 래퍼(`.device-screen` 첫 자식)에 `.is-dimming`, 타겟에 `.is-highlighted`, 타겟의 모든 부모(스크린 직전까지)에 `.contains-highlight`
  - CSS: 자식 중 `is-highlighted`/`contains-highlight`가 아닌 것은 dim(opacity 0.12, saturate 0.4)
  - 강조: 또렷 + 파란 펄스 ring (::before, inset -6px, border 2px #527EF6)
- 강조 ring이 안 보일 때 → 타겟 또는 부모에 `overflow: hidden`이 있는지 확인 (해제 필요)

### 스와이프 가능 요소 패턴
- `touch-action: none` (페이지 스크롤 방지)
- pointer 이벤트 + `setPointerCapture`
- 실시간 `transform: translateX()` 적용 (`transition: none`)
- 트리거/해제 시 `transition: transform 0.22s cubic-bezier(...)` 로 부드럽게 0으로 복귀
- 러버밴드: free range 이후 `damping` 적용

---

## 11. 자주 사용한 SVG 인라인 패턴

### 뒤로가기 화살표 (18×16)
```html
<svg width="18" height="16" viewBox="0 0 18 16" fill="none">
  <path d="M17 8H1M1 8L8 15M1 8L8 1"
        stroke="#363D4A" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### 노란 경고 (LCN-ATH-003, LCN-ATH-004)
```html
<svg viewBox="0 0 80 80" fill="none">
  <circle cx="40" cy="40" r="40" fill="#FACC15"/>
  <line x1="40" y1="23" x2="40" y2="43"
        stroke="#191C23" stroke-width="7" stroke-linecap="round"/>
  <circle cx="40" cy="58" r="4" fill="#191C23"/>
</svg>
```

### 파란 체크 (LCN-ATH-006)
```html
<svg viewBox="0 0 80 80" fill="none">
  <circle cx="40" cy="40" r="40" fill="#3182F6"/>
  <path d="M25 41 L36 52 L56 30"
        stroke="#ffffff" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## 12. Figma 파일 정보

- **메인 Figma 파일 키**: `UfaTo8FaMLnsqzAvGkNUQq`
- **이전 파일 키** (메인페이지 초기 시안): `SYhohRgqqH5syqrnx0CKkL`

### 노드 ID 매핑
| 페이지 | Figma 노드 ID |
|---|---|
| LCN-INT-001 | 386:294 |
| LCN-MAN-001 | 308:87 |
| LCN-ATH-001 | 308:11 |
| LCN-ATH-002 | 310:619 |
| LCN-ATH-003 | 310:2679 |
| LCN-ATH-004 | 338:305 |
| LCN-ATH-005 | 339:339 |
| LCN-ATH-008 | 380:563 |
| LCN-ATH-007 | 385:286 |
| LCN-ATH-006 | 313:2757 |
| LCN-PCH-001 | 313:2719 |
| LCN-PCH-009 | 339:474 |

---

## 13. 미리보기

- 별도 서버 불필요. 각 `.html` 파일을 브라우저로 열기만 하면 됨.
- 단, 일부 폰트나 이미지는 file:// 프로토콜에서도 정상 작동.
- Live Server 확장 등을 사용하면 편리.

---

## 14. 다음 작업 후보

- LCN-PCH-002 ~ LCN-PCH-008 (1회권 구매 플로우 잔여 7개 페이지) — 사용자가 Figma 시안 보내면 적용
- 사용자 추가 피드백/수정 사항 반영

---

## 15. 컨텍스트 복구 시 빠르게 시작하는 방법

1. **이 파일** (`docs/PROJECT_STATUS.md`) 우선 읽기
2. `scripts/common.js`의 **CATEGORIES** 배열 확인 → 페이지 상태 파악
3. 현재 작업이 모호하면 사용자에게 어떤 페이지를 작업 중인지 확인 요청
4. Figma 시안 적용 작업 시:
   - `mcp__5a5476d4-...__get_design_context` + `get_metadata` 호출
   - 노드 ID는 사용자가 보내는 Figma URL에서 추출
5. 패턴 통일:
   - 헤더 (뒤로/홈)
   - 카운트다운이 있다면 0에서 정지 + 의도는 description에 명시
   - 누름 효과는 자동 (글로벌)
   - 스크롤 영역은 자동 스크롤바 숨김
