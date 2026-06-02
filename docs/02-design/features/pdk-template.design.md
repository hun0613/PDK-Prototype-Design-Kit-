---
template: design
version: 1.2
feature: pdk-template
project: thebestpay-prototype-design-kit (PDK)
date: 2026-06-01
author: psh@thebestpay.co.kr
status: Draft
---

# PDK (Prototype Design Kit) Design Document

> **Summary**: 골프 콘텐츠를 제거하고, `CATEGORIES`/`FLOW`가 하드코딩된 엔진을 **단일 config 소스 + 플로우 자동 생성** 구조로 리팩터링하여, 슬래시 커맨드 5종으로 비개발자가 화면설계서를 만드는 무빌드 정적 템플릿 레포로 설계한다.
>
> **Project**: thebestpay-prototype-design-kit
> **Author**: psh@thebestpay.co.kr
> **Date**: 2026-06-01
> **Status**: Draft
> **Planning Doc**: [pdk-template.plan.md](../../01-plan/features/pdk-template.plan.md)
> **Roadmap**: [pdk-template.roadmap.md](../../01-plan/pdk-template.roadmap.md)

---

## 1. Overview

### 1.1 Design Goals

1. **단일 소스화**: 화면 메타·Description·플로우 연결을 `config/`의 데이터로 일원화 → 엔진은 데이터를 읽어 렌더만 한다. (현재 `CATEGORIES`와 `buildFlowGraph()` 2중 하드코딩 제거)
2. **플로우 자동 생성**: 화면별 `flow.from/to`(+분기) 데이터로 Mermaid 그래프를 엔진이 생성. 미등록 대상은 placeholder 노드로 표시.
3. **디바이스 레지스트리**: 내장 4종 + `/pdk-mockup` 커스텀 목업을 동일 스키마로 관리, 캔버스 규격·프레임 이미지를 데이터로 분리.
4. **무빌드 유지**: `index.html`을 브라우저로 열면 즉시 동작. 빌드/번들/서버 불필요.
5. **커맨드 주도 저작**: 비개발자는 코드 대신 슬래시 커맨드 5종으로 화면을 만들고, 엔진/config가 자동 갱신.

### 1.2 Design Principles

- **데이터-엔진 분리** (config = 사용자 영역 / engine = 불변 영역)
- **단방향 의존**: 화면 HTML·config → engine 참조. engine은 특정 화면을 모름(데이터만 안다).
- **점진적 채움**: 화면은 `등록(메타) → 스켈레톤(wireframe) → 디자인(figma-sync)` 3단계로 성숙.
- **디자인 디테일은 Figma에 위임**: Description·스켈레톤에는 색/폰트/간격 등 시각 스타일을 넣지 않는다.

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│ 사용자 영역 (config + 화면 HTML) — 커맨드가 자동 갱신       │
│   config/project.js   프로젝트명·설명·선택 디바이스         │
│   config/devices.js   디바이스 레지스트리(내장4 + 커스텀)   │
│   config/screens.js   화면 메타·Description·flow 연결       │
│   *.html              화면별 콘텐츠(스켈레톤→디자인)        │
└───────────────┬──────────────────────────────────────────┘
                │ (window 전역으로 노출: PDK_PROJECT/PDK_DEVICES/PDK_SCREENS)
                ▼
┌──────────────────────────────────────────────────────────┐
│ 엔진 영역 (engine/ — 불변)                                  │
│   common.js  ① 디바이스 목업/캔버스 적용(+반응형 토글)      │
│              ② 페이지목록 렌더  ③ Description 패널/하이라이트│
│              ④ buildFlowGraph(config) → Mermaid 자동 생성   │
│   common.css 디바이스 목업 + 사이드바 + 스켈레톤 스타일      │
└──────────────────────────────────────────────────────────┘
                ▲
                │ 작성/수정
┌──────────────────────────────────────────────────────────┐
│ Claude 커맨드 (.claude/commands/*.md)                       │
│   pdk-init · pdk-mockup · pdk-screen · pdk-wireframe ·       │
│   pdk-figma-sync   ← 사용자 대화 → config/HTML 파일 수정     │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow (화면 1개 생애주기)

```
/pdk-screen      → config.screens[]에 메타+flow 추가, <id>.html 생성(이름·ID만)
   → 페이지목록/Description/플로우 자동 반영 (designed:false)
/pdk-wireframe   → <id>.html에 스켈레톤 요소 추가(target 부여) + description[] 자동 작성
/pdk-figma-sync  → Figma MCP 디자인을 스켈레톤에 적용, designed:true + figmaLink 저장
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `common.js` | `PDK_PROJECT`, `PDK_DEVICES`, `PDK_SCREENS` | 데이터 읽어 렌더 |
| 화면 HTML | `engine/common.css`, `engine/common.js` | 목업·사이드바 |
| 플로우 다이어그램 | Mermaid (CDN) | 그래프 렌더 |
| `/pdk-figma-sync` | Figma MCP | 디자인 컨텍스트/스크린샷 |

---

## 3. Data Model (config 스키마) ★핵심

### 3.1 `config/project.js`

```js
window.PDK_PROJECT = {
  name: '내 프로젝트',
  description: '한 줄 설명',
  device: 'tossfront2',   // PDK_DEVICES의 키
  responsive: false,      // device==='responsive'일 때 true
};
```

### 3.2 `config/devices.js` — 디바이스 레지스트리

```js
window.PDK_DEVICES = {
  // 내장 4종 (M2에서 전부 구현)
  desktop:    { label: '데스크탑',     width: 1280, height: 800, frame: 'css' }, // 미니멀 프레임, Figma 기반 CSS 제작
  mobile:     { label: '모바일',       width: 390,  height: 844, frame: 'css' }, // 미니멀 프레임, Figma 기반 CSS 제작
  tossfront2: { label: '토스프론트2',  width: 400,  height: 640, frame: 'css' }, // 기존 common.css 목업 그대로 재사용
  responsive: { label: '반응형',       toggle: ['desktop', 'mobile'] }, // 상단 토글로 전환

  // /pdk-mockup으로 추가되는 커스텀 예시
  // mykiosk:  { label: '내 키오스크', width: 720, height: 1280,
  //             frame: 'assets/mockups/mykiosk/frame.png' },
};
```

- `frame`: 외곽 프레임 이미지 경로(없으면 기본 베젤). `width/height`: 캔버스 규격(대화 입력).
- 엔진은 `PDK_PROJECT.device`로 규격/프레임을 골라 CSS 변수(`--screen-w`, `--screen-h`, `--device-frame`)로 적용.
- **`tossfront2`는 현재 프로젝트 `common.css`에 이미 구현된 목업(`.device-mockup`/`.device-frame`/`.device-stand`/`.device-base`, 400×640)을 그대로 재사용**한다. 즉 신규 작성이 아니라 **기존 토스프론트2 목업을 디바이스 일반화의 기준(baseline)** 으로 삼아, 하드코딩된 400×640을 CSS 변수(`--screen-w/h`)로 추출하고 나머지 디바이스(desktop/mobile/custom)는 같은 구조에 변수만 바꿔 확장한다.
- **데스크탑·모바일 내장 목업(M2)**: **미니멀 프레임**으로, **사용자가 제공하는 Figma 링크를 Figma MCP로 참고하여 CSS로 제작**한다(이미지 베젤 대신 CSS 테두리/그림자). 규격은 잠정 desktop 1280×800 / mobile 390×844, Figma 시안에 맞춰 확정.

### 3.3 `config/screens.js` — 화면 단일 소스

```js
window.PDK_SCREENS = [
  {
    category: '공통',
    pages: [
      {
        id: 'SCR-INT-001',          // 화면 ID 규칙: SCR-<카테고리약어>-<순번>
        label: '랜딩페이지',         // 화면 이름
        href: 'landing.html',        // 화면 파일
        designed: false,             // false=스켈레톤, true=Figma 적용 완료
        figmaLink: '',               // figma-sync 후 채워짐
        context: '앱 최초 진입 시 보이는 화면',  // /pdk-screen에서 "언제/어떻게" 답변
        description: [               // /pdk-wireframe에서 자동 작성 (CSS/디자인 제외)
          { text: '환영합니다 버튼 클릭 시 메인으로 이동', target: '.btn-welcome' },
        ],
        flow: {                      // 플로우 자동 생성용 연결 정보
          // ★ `to`가 간선의 유일한 소스(single source). `from`은 스키마에 저장하지 않는다.
          //   진입점 판정 = "어떤 화면의 to에도 등장하지 않는 화면" → 자동 역산.
          //   /pdk-screen이 "진입 출처"를 물어도, 저장은 출처 화면의 to에 기록한다(중복 기록 금지).
          to: [
            { screen: 'SCR-MAN-001', via: '환영합니다 클릭' },
          ],
        },
      },
    ],
  },
];
```

#### flow 분기/특수 표현

```js
// 분기(판단): 같은 출발화면 + 같은 branch 라벨을 가진 to 항목들이 하나의 마름모로 묶임
// ★ 분기 노드 식별 키 = `<출발화면ID>::<branch라벨>` (라벨 문자열만으로 병합 금지 → 다른 화면의
//   동일 라벨 분기가 잘못 합쳐지는 것 방지). diamond의 진입 소스는 항상 "이 화면(자기 자신)".
flow: {
  to: [
    { screen: 'SCR-ATH-003', via: '실패', branch: '인증 성공 여부' },
    { screen: 'SCR-ATH-005', via: '성공', branch: '인증 성공 여부' },
  ],
}

// 자동 복귀(점선): kind:'auto'
flow: { to: [ { screen: 'SCR-INT-001', via: '카운트다운/확인', kind: 'auto' } ] }
```

#### 모달 화면(쿼리스트링) 표현 — C-3

- 모달처럼 같은 파일 + 쿼리로 구분되는 화면은 **별도 page 객체**로 등록하고 `href`에 쿼리 허용:
  `{ id:'SCR-XXX-007', href:'list.html?modal=1', ... }`
- 엔진의 현재화면 판정/역매핑은 **파일명+쿼리스트링 정확 매칭 우선**(기존 `currentKey()`/`findCurrentPage()`/`currentFlowNode()` 규칙 유지).
- `__flowGo(id)`는 `id→href` 조회 시 쿼리까지 포함한 href로 이동.
- `templates/_screen.modal.html`이 이 시나리오의 골격을 제공.

### 3.4 Description 항목 ↔ 요소 매핑

- 각 `description[i].target` = 스켈레톤 요소의 CSS 셀렉터.
- hover 시 `is-dimming`/`is-highlighted`/`contains-highlight`로 강조(기존 엔진 로직 재사용).
- 셀렉터 규칙: `/pdk-wireframe`가 요소 생성 시 `.pdk-<역할>`(예: `.pdk-btn-next`) 형태의 안정적 클래스를 부여하고 동일 값을 `target`에 기록.

---

## 4. Command Specification (`.claude/commands/*.md`)

> 각 커맨드는 Claude를 안내하는 프롬프트 문서. 인자 파싱 → 질문 → 파일 변경(config/HTML) 수행.

### 4.1 `/pdk-init`
- **인자**: 없음 (대화형)
- **질문**: ① 프로젝트 이름 ② 설명 ③ 디바이스(레지스트리 목록에서 선택)
- **출력**: `config/project.js` 작성, `config/screens.js`(빈 배열)·`config/devices.js`(내장4) 보장, `index.html` 생성(템플릿 기반, 빈 골격), 엔진 파일 존재 확인
- **반응형**: `device==='responsive'`면 상단 데스크탑/모바일 토글 노출

### 4.2 `/pdk-mockup [디바이스명] [소스경로]`
- **인자**: 디바이스명(키), 소스경로(이미지 디렉토리 또는 Figma URL)
- **동작**: ① 이미지 디렉토리면 파일 목록 제시 → **여러 장이면 사용자가 선택** / Figma URL이면 MCP로 프레임 참고 ② **캔버스 규격(가로×세로) 대화로 입력** ③ 프레임 이미지를 `assets/mockups/<디바이스명>/`에 저장 ④ `config/devices.js`에 항목 추가
- **결과**: `/pdk-init` 디바이스 선택지에 노출

### 4.3 `/pdk-screen [카테고리] [화면ID] [화면이름]`
- **인자**: 카테고리, 화면ID, 화면이름
- **질문**: ① 이 화면이 **언제·어떻게** 보이나(context) ② **진입 출처**(from: 어느 화면에서/무슨 버튼·조건) ③ **다음 이동**(to: 어디로/버튼·조건, **분기 포함**)
- **출력**: `config/screens.js`에 해당 카테고리로 page 객체 추가(`designed:false`, flow 포함), `<화면ID 기반 파일>.html` 생성 — **화면이름 + 화면ID만 노출**
- **자동 반영**: 페이지목록 행 + Description 패널 메타 + 플로우 노드/연결. 아직 없는 `to.screen`은 placeholder 노드로 그려짐

### 4.4 `/pdk-wireframe [화면ID]`
- **인자**: 화면ID
- **동작**: 대화형으로 화면 구성요소를 하나씩 정의 → `<id>.html`에 **스켈레톤 UI**(레이아웃/박스/리스트/버튼 자리) 추가, 각 요소에 `.pdk-*` 셀렉터 부여
- **Description 자동 작성**: 요소의 **기능·동작·흐름**만 기록(색/폰트/간격 등 **디자인·CSS 제외**), `screens.js`의 `description[]`에 `{text, target}`로 누적
- **검증**: hover 시 해당 요소 highlight + 나머지 dim 동작 확인

### 4.5 `/pdk-figma-sync [화면ID] [figma url]`
- **인자**: 화면ID, Figma URL
- **동작**: Figma MCP(`get_design_context`/`get_screenshot`/`get_metadata`)로 디자인을 가져와 기존 스켈레톤(`.pdk-*` 구조)에 스타일/콘텐츠 적용
- **출력**: `<id>.html` 디자인 반영, `screens.js`의 `designed:true` + `figmaLink:url` 갱신
- **원칙**: 스켈레톤 요소 식별자는 유지(Description hover 매핑 보존), sync는 스타일 입힘 위주

---

## 5. Flow Auto-Generation (buildFlowGraph 재설계)

### 5.1 생성 알고리즘

```
입력: PDK_SCREENS (모든 page의 id/label/flow.to)
0) 간선 소스는 오직 각 page.flow.to. (from은 사용/저장하지 않음)
1) 진입점 산정: 모든 to.screen을 모은 집합 = targets.
   어떤 page의 id가 targets에 없으면 진입점 → s0(터미네이터) --> 그 page
2) 각 page → 화면 노드 생성: ID("label<br/>(id)")  class screen
3) 각 page(src)의 flow.to 항목마다:
   - branch 있음 → 분기 마름모 키 = `${src.id}::${branch}` (출발화면+라벨로 스코프).
                   같은 키는 1개로 병합. 진입 소스는 항상 src(자기 화면):
                   src --> diamond,  diamond -->|via| target
   - branch 없고 via 있음 → 액션 노드(a_<srcId>_<idx>): src --> action --> target
   - kind:'auto' → 점선 엣지(src -. via .-> target)  (via 없으면 라벨 생략)
   - target이 미등록 ID → ghost 노드(id 그대로, class ghost, 점선) 생성 후 연결
4) 클래스/스타일 정의(screen/action/decision/term/ghost/cur) 부여
5) 현재 화면 노드에 cur 클래스. 노드 클릭 → __flowGo(id) → href 이동
   (ghost 노드는 클릭 비활성)

※ ghost 자동 연결: ghost 노드 id = 미등록 화면 id 그대로 사용. 이후 /pdk-screen으로
  같은 id가 등록되면 다음 렌더 시 screen 노드로 승격되어 자동 연결(별도 마이그레이션 불필요).
  매 페이지 로드 시 config 기준 전체 재생성하므로 상태 동기화 문제 없음.
```

### 5.2 노드 타입/스타일 (기존 유지 + 추가)

| 타입 | 모양/색 | 비고 |
|------|---------|------|
| screen | 파랑 둥근사각 | 화면 페이지 |
| action | 연파랑 | 클릭/동작 |
| decision | 노랑 마름모 | 분기(branch 라벨) |
| term | 회색 원 | 시작/종료 |
| **ghost (신규)** | 점선 테두리 회색 | 미등록 화면(placeholder) |
| cur | 굵은 빨강 테두리 | 현재 화면 강조 |

### 5.3 href 매핑
- 기존 `FLOW_HREFS` 하드코딩 제거 → `PDK_SCREENS`의 `id→href`로 동적 생성. `__flowGo(nodeId)`는 id로 href 조회 후 이동.

---

## 6. UI/UX Design

### 6.1 디바이스 목업 적용
- `common.js`가 `PDK_PROJECT.device` 기준으로 `.device-mockup`에 CSS 변수 주입.
- **변수 집합(W-2 반영)**: 기존 `common.css`는 `.device-screen` 400×640 외에 **`.device-frame` 460×820 + 패딩(상하/좌우)** 도 하드코딩돼 있으므로, 단순 `--screen-w/h`만이 아니라 다음을 변수화한다:
  - `--screen-w / --screen-h` (콘텐츠 캔버스)
  - `--frame-w / --frame-h` 또는 `--frame-pad-x / --frame-pad-y` (외곽 프레임/베젤)
  - `--device-frame` (커스텀 프레임 이미지, 없으면 CSS 베젤)
  - 프레임 외곽은 가능하면 `캔버스 + 패딩`으로 **파생**하여 디바이스별 비율 깨짐 방지.
- 참고: 기존 `.device-stand`/`.device-base`는 현재 CSS에서 **`display:none`(미사용 잔재)** → 일반화 시 정리 대상.
- 화면 HTML 템플릿은 표준 래퍼(`device-stage > device-mockup > device-frame > device-screen > {화면 콘텐츠}`)만 갖고, 규격은 변수로 결정.
- **경로 이행(W-1)**: 현재 `styles/common.css`·`scripts/common.js` → `engine/`로 이동 시, **전 화면 HTML의 `<link>`/`<script>` 참조 경로**와 **`index.html`의 viewport 메타(현재 `width=400` 하드코딩)** 를 디바이스 규격에 맞게 일괄 갱신한다.
- **반응형 토글**: 상단 고정 토글 버튼(데스크탑/모바일) → 변수 세트를 해당 변형으로 교체. 초기 변형 = 기본 `desktop`, 토글 상태는 세션 내 유지(W-7).

### 6.2 사이드바 (기존 3종 유지, 데이터만 config 출처)
- 좌상단 페이지목록 / 좌하단 플로우(자동생성) / 우측 Description(+hover 하이라이트).

### 6.3 스켈레톤 스타일
- `common.css`에 `.pdk-skeleton` 계열 추가: 회색 박스(`#E9ECEF`), 라운드, 텍스트 자리(라인), 버튼 자리 등. 시각 스타일 미니멀(디자인은 Figma).
- **단일 래퍼 강제(W-3)**: 스켈레톤 루트는 반드시 `.device-screen`의 **직속 단일 자식 `.pdk-screen`** 이어야 한다. 기존 hover dimming은 `getScreenEl()=device-screen.firstElementChild`와 `.is-dimming > *` 구조를 전제하므로, `/pdk-wireframe`·템플릿이 이 규칙을 반드시 따른다.

---

## 7. Error Handling / Edge Cases

| 상황 | 처리 |
|------|------|
| `to.screen`가 미등록 ID | ghost placeholder 노드로 표시, 추후 등록 시 자동 연결 |
| 화면 0개(init 직후) | 페이지목록/플로우에 빈 상태(empty) 안내 표시 |
| Description target 셀렉터 부재 | hover 시 no-op(기존 동작), 콘솔 경고 없이 무시 |
| Mermaid CDN 로드 실패 | "네트워크 필요" 안내(기존 처리 유지) |
| 커스텀 목업 규격 미입력 | 커맨드가 기본값 제안 후 확인 요청 |
| 중복 화면 ID | 커맨드가 등록 전 중복 검사 → 경고/재입력 |

---

## 8. Test Plan (무빌드 정적 — Zero Script / 수동 점검)

| 유형 | 대상 | 방법 |
|------|------|------|
| 렌더 점검 | 빈 config 골격 | 디바이스 4종에서 `index.html` 열어 사이드바·목업 정상, 콘솔 에러 0 |
| 플로우 자동생성 | 화면 3~4개 + 분기 1개 | 노드·액션·마름모·ghost·현재강조·노드클릭이동 확인 |
| 하이라이트 | 스켈레톤 화면 | Description hover→요소 highlight/나머지 dim |
| 커맨드 E2E | 중립 예제(A→B 등) | init→mockup→screen×n→wireframe→figma-sync 전 과정 재현 |
| 반응형 | responsive 디바이스 | 토글로 데스크탑/모바일 캔버스 전환 |

---

## 9. Clean Architecture (정적 프로젝트 적용)

### 9.1 레이어/폴더

| 레이어 | 책임 | 위치 |
|--------|------|------|
| Config(데이터) | 프로젝트·디바이스·화면 데이터 | `config/*.js` |
| Engine(로직) | 목업·사이드바·플로우·하이라이트 렌더 | `engine/common.js`, `engine/common.css` |
| Content(화면) | 화면별 스켈레톤/디자인 마크업 | `*.html` (루트) |
| Templates | 화면 HTML 골격 | `templates/*.html` |
| Authoring | 저작 커맨드 | `.claude/commands/*.md` |
| Assets | 범용 아이콘·커스텀 목업 프레임 | `assets/`, `assets/mockups/<device>/` |
| Docs | 가이드/예제 | `README.md`, `docs/GUIDE.md`, `example/` |

### 9.2 의존 규칙
```
Content/HTML ─→ Engine ←─ Config(window 전역)
Templates ─(복제)→ Content
Commands ─(수정)→ Config + Content
Engine은 특정 화면을 모름 (데이터만 참조)
```

---

## 10. Coding Convention

| 대상 | 규칙 | 예시 |
|------|------|------|
| 화면 ID | `SCR-<카테고리약어>-<3자리>` | `SCR-MAN-001` |
| 화면 파일 | kebab-case + `.html` | `main.html` |
| 스켈레톤 루트 | `.device-screen` 직속 단일 `.pdk-screen` | (W-3 강제 규칙) |
| 스켈레톤 요소 셀렉터 | `.pdk-<역할>`, 한 화면 내 동일 역할 2개↑면 `-<n>` 접미 | `.pdk-btn-next`, `.pdk-btn-next-2` (W-4) |
| config 전역 | `PDK_` 대문자 prefix | `PDK_SCREENS` |
| 상수 | UPPER_SNAKE_CASE | `SWIPE_THRESHOLD` |
| 들여쓰기/포맷 | 기존 코드 스타일 유지(2-space) | - |

---

## 11. Implementation Guide (마일스톤 매핑)

### 11.1 파일 구조 (최종)
```
README.md
docs/GUIDE.md
.claude/commands/{pdk-init,pdk-mockup,pdk-screen,pdk-wireframe,pdk-figma-sync}.md
config/{project.js,devices.js,screens.js}
engine/{common.css,common.js}
templates/{_screen.blank.html,_screen.countdown.html,_screen.modal.html}
assets/                (범용 아이콘) + assets/mockups/<device>/
example/               (중립 예제 A→B)
index.html
```

### 11.2 구현 순서 (로드맵 M0~M8)
1. [ ] **M1** 골프 콘텐츠 제거 (화면 18 HTML·골프 assets·pptx)
2. [ ] **M2** 엔진 일반화: config 3종 도입, `common.js`가 `PDK_*` 읽도록 리팩터링. **기존 `common.css`의 토스프론트2 목업(400×640)을 그대로 두고, 하드코딩 규격만 CSS 변수(`--screen-w/h`)로 추출** → 이를 baseline으로 확장. **내장 3종 전부 구현**(데스크탑·모바일은 사용자 제공 Figma 링크 기반 미니멀 프레임 CSS) + **반응형 토글**. `buildFlowGraph(config)` 자동생성+ghost, `engine/`로 이동
   - ⚠️ 선행: 데스크탑·모바일 **Figma 링크 필요**(M2 착수 시 사용자에게 요청)
3. [ ] **M3** `/pdk-init` 커맨드 + index 템플릿
4. [ ] **M3b** `/pdk-mockup` 커맨드 (이미지 선택/Figma, 규격 입력, devices.js 갱신)
5. [ ] **M4** `/pdk-screen` 커맨드 (메타+flow 추가, 화면 HTML 생성)
6. [ ] **M5** `/pdk-wireframe` 커맨드 (스켈레톤+description+target)
7. [ ] **M6** `/pdk-figma-sync` 커맨드 (Figma MCP 적용)
8. [ ] **M7** README/GUIDE/example 작성
9. [ ] **M8** 검증(`/pdca analyze`) → 보고/배포

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-01 | 초안 — config 스키마·커맨드 5종 명세·플로우 자동생성·디바이스 레지스트리 설계 | psh@thebestpay.co.kr |
| 0.2 | 2026-06-02 | design-validator 검증 반영(82→) — C-1 to 단일소스(from 제거), C-2 분기키 `srcId::라벨` 스코프, C-3 모달 쿼리스트링 표현, W-1 경로이행, W-2 프레임 변수, W-3 스켈레톤 단일래퍼, W-4 중복셀렉터 규칙 | psh@thebestpay.co.kr |
