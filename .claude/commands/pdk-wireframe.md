---
description: 화면 설계 — 대화형으로 흑백 와이어프레임 UI(실제 문구·컴포넌트)를 구성하고 Description을 자동 작성
argument-hint: [화면ID]
allowed-tools: Read, Write, Edit, AskUserQuestion, Glob
---

# /pdk-wireframe — 화면 설계 (와이어프레임 UI + Description)

`$1`=화면ID. 해당 화면을 **대화형으로 설계**한다. 결과로 화면 HTML에는 **흑백 와이어프레임 UI**
(실제 문구·버튼·목록·입력칸이 들어간 진짜 화면)가 들어가고, `config/screens.js`의 해당 화면
`description[]`이 **자동 작성**된다.
Description 항목에 마우스를 올리면 해당 요소가 강조(나머지 dim)되도록 **요소↔target 매핑**을 부여한다.

> ★ **회색 블록(스켈레톤)으로 만들지 않는다.** 회색 덩어리만으로는 기획 의도가 전달되지 않는다.
> **실제 문구를 넣은 실제 UI**로 만든다 — 버튼에는 버튼 이름, 목록에는 예시 항목, 입력칸에는 라벨과 placeholder.
>
> 대신 **색은 쓰지 않는다(흑백).** 색·브랜드·아이콘·이미지 등 **시각 디자인은 `/pdk-figma-sync`** 가 Figma에서 입힌다.
> 여기서 정하는 것은 **무엇이 있고(요소) / 무슨 역할이며(기능) / 어디로 이어지는지(흐름)** 다.

## 절차

### 1) 대상 화면 확인
- `config/screens.js`에서 `$1`(화면ID)로 page를 찾는다. 없으면 "먼저 /pdk-screen 으로 등록하세요"라고 안내하고 중단.
- 그 화면의 `label`, `context`, `flow.to`(다음 이동/버튼)를 읽어 설계의 출발점으로 삼는다.
- ★ **기능명세 확인**: `config/specs.js` 가 있으면 읽어 **`pageId` 가 이 화면인 행**을 모은다(`/pdk-description` 산출물).
  - 행이 있으면 그것이 이 화면에 **들어가야 할 기능 목록**이다. 2) 초안은 이 목록을 빠짐없이 UI 요소로 옮기는 데서 시작한다.
  - 행의 `description`(상세)에 적힌 조건·검증·예외 메시지는 UI 에도 반영한다
    (예: "입력 전엔 버튼 비활성" → `.is-disabled` 상태나 조건 분기 케이스, "만 14세 미만…" 메시지 → 그 문구 그대로).
  - 파일이 없거나 행이 없으면 기존처럼 진행한다(명세는 선택 단계다).
- config에는 있는데 `page.href`(`pages/...html`) **파일이 없으면**, `templates/_screen.blank.html` 로 **먼저 생성**한 뒤 진행한다.

### 2) 대화형 구성
- 화면에 어떤 요소가 필요한지 사용자와 짧게 주고받으며 정한다. 막막해하면 `context`와 `flow`를 근거로 **초안을 먼저 제안**한다.
  - 예: 헤더(뒤로/홈), 타이틀, 리스트/카드, 입력 필드, 키패드, 하단 CTA 버튼 등.
- 각 요소마다 **역할(기능)**과 **연결(클릭 시 이동 등)**을 확인한다. 연결은 이미 `flow.to`에 있으면 그것과 일치시킨다.
- ★ **조건 분기를 반드시 확인한다** — "이 화면이 상황에 따라 다르게 보이나요?"
  - 예: 목록이 **있을 때 / 없을 때**, 인증 **성공 / 실패**, 권한 **있음 / 없음**, 상태 **대기 / 완료**
  - 분기가 있으면 **케이스 목록**(id·표시이름)을 정하고, 어느 것이 기본인지 확인한다.
  - 분기는 **다른 화면으로 나뉘는 것(`flow.to`의 branch)과 다르다.** 여기서 다루는 것은
    **같은 화면 안에서 UI만 달라지는** 경우다. 화면 자체가 갈라지면 `/pdk-screen`의 분기로 처리한다.

### 3) 화면 HTML 작성 (흑백 와이어프레임 UI)

- 대상 화면의 HTML 파일(`page.href`)을 열어 `.device-screen` 내부를 **단일 래퍼 `.pdk-screen`** 으로 교체한다.
  - ★ W-3 규칙: 루트는 반드시 `.device-screen`의 **직속 단일 자식 `.pdk-screen`** 이어야 한다(hover dim이 이 구조를 가정).

#### ★ 화면 골격은 항상 3단 구조 — 목업을 꽉 채우기 위한 규칙
```
.pdk-screen                 ← 캔버스를 꽉 채움(absolute inset:0). padding·gap 금지
├─ .pdk-w-header            ← 상단 고정 (뒤로/타이틀/우측 액션)
├─ .pdk-w-body              ← 남는 높이 전부 차지 + 여기서만 스크롤
└─ .pdk-w-footer            ← 하단 고정 (CTA). 필요하면 .is-raised
```
- **루트(`.pdk-screen`)에 `padding`·`gap`·`height`를 주지 않는다.** 엔진이 캔버스에 정확히 맞춰 놓았다.
  루트에 여백을 주면 헤더·하단 CTA·전체폭 목록이 가장자리에 닿지 못해 "꽉 안 찬" 화면이 된다.
- **여백은 각 단이 갖는다** — header `8px 16px`, body `16px`, footer `16px`. 추가 여백을 덧대지 않는다.
- **스크롤은 `.pdk-w-body` 하나만 담당한다.** 다른 곳에 `overflow`를 주지 않는다.
  (본문에 `min-height: 0` 이 걸려 있어야 하단 CTA가 화면 밖으로 밀리지 않는다 — 키트가 이미 처리)
- 헤더·푸터가 필요 없는 화면이면 그 단을 생략해도 된다. 단 **본문은 항상 `.pdk-w-body`** 에 담는다.
- 보조 유틸
  - `.pdk-w-sticky` — 본문 안에서 상단에 붙는 영역(탭·필터). 본문 여백을 자동 보정한다.
  - `.pdk-w-bleed` — 좌우 여백을 무시하고 **화면 폭을 꽉 채우는** 요소(전체폭 목록·배너·이미지).
- 화면 전용 `<style>`로 `position`·`width`·`height`를 다시 지정하지 않는다. 레이아웃이 틀어지는 가장 흔한 원인이다.
- **엔진의 와이어프레임 UI 키트(`.pdk-w-*`)를 조합**해 만든다. 화면마다 CSS를 새로 짜지 않는다.
  이 키트는 **shadcn/ui 의 디자인 토큰·컴포넌트 치수를 순수 CSS로 이식**한 것이다
  (React·Tailwind 의존성 없음). shadcn 컴포넌트를 안다면 그 구조 그대로 생각하면 된다.

| shadcn 대응 | PDK 클래스 |
|---|---|
| (레이아웃) | `.pdk-w-header`(+`.pdk-w-header-title`) · `.pdk-w-body`(스크롤) · `.pdk-w-footer` · `.pdk-w-row` · `.pdk-w-col` · `.pdk-w-spacer` |
| Separator | `.pdk-w-divider` |
| (타이포) | `.pdk-w-title` · `.pdk-w-subtitle` · `.pdk-w-text` · `.pdk-w-caption` |
| Tabs | `.pdk-w-tabs` > `.pdk-w-tab`(+`.is-active`) |
| Card | `.pdk-w-card` · 목록은 `.pdk-w-list` > `.pdk-w-item`(+`.pdk-w-item-main` / `.pdk-w-item-sub`) |
| Avatar | `.pdk-w-avatar` · 이미지 자리 `.pdk-w-thumb` · 아이콘 자리 `.pdk-w-icon` |
| Button | `.pdk-w-btn` + `.is-primary` / `.is-secondary` / `.is-ghost` / `.is-link` / `.is-disabled`, 크기 `.pdk-w-btn-sm` / `-lg` / `-icon` / `-block` |
| Input · Label · Textarea | `.pdk-w-field` > `.pdk-w-label` + `.pdk-w-input` / `.pdk-w-textarea` / `.pdk-w-select` |
| Checkbox · RadioGroup | `.pdk-w-check`(+`.is-radio` / `.is-checked`) |
| Badge | `.pdk-w-badge`(+`.is-strong` / `.is-outline`) |
| Alert | `.pdk-w-banner` |
| (빈 상태) | `.pdk-w-empty` |
| Dialog · Sheet · Toast | `.pdk-w-dim` > `.pdk-w-modal` · `.pdk-w-sheet` · `.pdk-w-toast` |

- 버튼은 **기본이 outline**(테두리)이다. 화면의 주 행동 1개에만 `.is-primary`(검정 채움)를 쓴다.

- **실제 문구를 넣는다.** `Lorem ipsum`·`텍스트`·빈 블록 금지.
  - 버튼: `다음` `결제하기` 처럼 실제 레이블
  - 목록: 그럴듯한 예시 항목 **2~3개**(많이 넣어 화면을 채우지 않는다)
  - 입력: 라벨 + placeholder (`휴대폰 번호`, `010-0000-0000`)
  - 숫자·금액·날짜도 예시값으로 (`12,000원`, `2026-06-01`)
- **각 의미 요소에 역할 클래스 `.pdk-<역할>`을 함께 부여**한다(Description 매핑 키).
  - 예: `<button class="pdk-w-btn is-primary pdk-btn-next">다음</button>`
  - ★ W-4 규칙: 한 화면에 같은 역할이 2개 이상이면 `-1`, `-2` 접미.
- **금지 사항**
  - 색상 지정 금지 — 브랜드색·강조색·상태색 모두. 키트 토큰(`--pdk-*`, shadcn 무채색 테마)만 쓴다.
    상태 구분이 필요하면 색이 아니라 **`.pdk-w-badge` 문구**(승인완료 / 승인대기)로 표현한다.
  - 이미지·아이콘 파일 참조 금지 — `.pdk-w-thumb` / `.pdk-w-icon` 자리표시로 대신한다.
  - 화면 전용 `<style>`은 **레이아웃 보정(정렬·간격·너비)** 에 한해 최소한만. 색·폰트·그림자는 넣지 않는다.
#### ★ 클릭 이동 연결 — 실제 앱처럼 눌러서 넘어가게
포커스 모드로 클라이언트에게 시연할 때 **UI 를 눌러 화면을 넘긴다.** 그래서 `flow.to` 의 이동을 버튼에 연결한다.
- `flow.to` 의 각 항목(`via` = 버튼/조건 이름)에 대응하는 요소에 `onclick` 을 붙인다. **화면 ID 로 연결**한다(href 아님):
  - 단순 이동: `onclick="goScreen('SCR-PAY-001')"`
  - 분기(`branch` 가 같은 항목이 여럿): `onclick="goBranch(this, '<branch 라벨>')"`
    → 누르면 선택창(예: 성공 / 실패)이 떠서 시연자가 고른다. 라벨은 `flow.to` 의 `branch` 값과 **정확히 같게**.
  - 자동 이동(`kind: 'auto'`)은 연결하지 않는다 — 엔진이 포커스 모드에서 카운트다운 후 넘긴다.
    같은 화면에 "확인" 같은 버튼이 있고 그 버튼도 같은 곳으로 가면 그 버튼에는 `goScreen` 을 붙인다.
- 목록 행·카드처럼 **반복 요소**는 예시 항목 모두에 같은 이동을 붙인다(어느 행을 눌러도 상세로).
- 뒤로가기(←)는 진입 출처가 하나면 `goScreen('<출처 화면ID>')`, 여럿이면 `onclick="history.back()"`.
- `flow.to` 에 없는 이동은 만들지 않는다. 필요해 보이면 `/pdk-screen <화면ID>` 로 이동을 먼저 추가하자고 안내한다.
  - 예외: **전역 메뉴(GNB · 탭바 · 로그아웃)** 처럼 모든 화면에 반복되는 이동은 `flow.to` 없이 `goScreen` 으로 연결해도 된다
    (다이어그램에 넣으면 선이 너무 많아진다). 목적지 화면이 등록돼 있을 때만.
- 모달·시트를 여는 버튼처럼 **같은 화면 안 동작**은 아래 인라인 `<script>` 규칙을 따른다(화면 이동 아님).
- 이미 만든 화면에 다시 실행하면, 연결이 빠진 요소에 `onclick` 을 채운다(기존 UI 는 그대로 두고 연결만 추가).

- 동작(탭 전환, 모달 열기 등)이 이해에 필요하면 **짧은 인라인 `<script>`** 로 붙여도 된다.
  단, **조건 분기 전환은 엔진이 처리**하므로 직접 만들지 않는다(아래 `data-case` 참고).

예시:
```html
<div class="pdk-screen">
  <!-- 상단 고정 -->
  <div class="pdk-w-header">
    <button class="pdk-w-btn pdk-w-btn-sm is-ghost pdk-back">←</button>
    <div class="pdk-w-header-title pdk-title">가족 관리</div>
  </div>

  <!-- 본문(여기서만 스크롤) -->
  <div class="pdk-w-body">
    <div class="pdk-w-sticky">
      <div class="pdk-w-tabs pdk-tabs">
        <button class="pdk-w-tab is-active">내 보호자</button>
        <button class="pdk-w-tab">내 환자</button>
      </div>
    </div>

    <div class="pdk-w-banner pdk-banner">보호자가 승인하면 대리 예약·결제가 가능합니다.</div>

    <div class="pdk-w-list pdk-guard-list" data-case="has-data">
      <div class="pdk-w-item">
        <div class="pdk-w-avatar"></div>
        <div class="pdk-w-col">
          <span class="pdk-w-item-main">박성모</span>
          <span class="pdk-w-item-sub">부모</span>
        </div>
        <div class="pdk-w-spacer"></div>
        <span class="pdk-w-badge is-strong">승인완료</span>
      </div>
    </div>

    <div class="pdk-w-empty pdk-empty" data-case="empty">등록된 보호자가 없습니다</div>
  </div>

  <!-- 하단 고정 -->
  <div class="pdk-w-footer is-raised">
    <button class="pdk-w-btn is-primary pdk-w-btn-block pdk-btn-add">보호자 추가</button>
  </div>
</div>
```


### 4) Description 자동 작성 (`config/screens.js`)
- 대상 page의 `description`을 **기능·동작·흐름 중심**으로 채운다. 각 항목은 `{ text, target, spec? }`.
  - `text`: 그 요소가 무슨 역할인지/누르면 어떻게 되는지(이동 대상 화면ID 포함 권장). **디자인 묘사 금지.**
  - `target`: 3)에서 부여한 `.pdk-<역할>` 셀렉터.
  - `spec`: 이 항목의 근거가 된 **기능명세 ID**(있을 때만). 여러 행이면 배열 `['GFC-FUC-004', 'GFC-FUC-005']`.

#### ★ 기능명세에서 끌어오기 (1)에서 모은 행이 있을 때)
- 각 UI 요소에 대응하는 명세 행을 찾아 **그 행에서 Description 을 만든다.** 새로 지어내지 않는다.
  - `text` 는 행의 `content`(기능명)를 뼈대로, `description`(상세)의 **핵심 한 가지**(결과·이동·조건)만 덧붙여
    아래 「Description 문안 규칙」(30자 내외·최대 50자) 형식으로 줄인다. 상세 전체를 옮겨 적지 않는다 — 그건 기능명세서 표에 있다.
    - 예: 행 `content: '등록하기(CTA) 버튼'`, 상세 `1. 이름·주민번호 모두 입력 전엔 클릭되지 않는다. 2. …`
      → `{ text: '등록하기 → 입력 완료 시에만 활성', target: '.pdk-btn-submit', spec: 'MJK-FUC-005' }`
  - `spec` 에 그 행의 `id` 를 적는다 → Description 패널에 **ID 칩**이 붙고, 누르면 기능명세서 표의 그 행으로 간다.
- 한 요소가 여러 행에 걸치면 `spec` 을 배열로, 한 행이 여러 요소에 걸치면 각 항목에 같은 ID 를 적는다.
- 명세에 없는 요소(뒤로가기·공통 헤더 등)는 기존처럼 `spec` 없이 작성한다.
- **UI 에 반영하지 못한 행**(대응 요소가 없는 행)은 버리지 말고 5) 안내에서 따로 보고한다.

#### 조건 분기가 있으면 `cases` 를 함께 기록한다
```js
cases: [
  { id: 'has-data', label: '등록 있음', default: true },
  { id: 'empty',    label: '등록 없음' },
],
```
- `id` 는 HTML의 `data-case` 값과 **정확히 일치**해야 한다(영문 소문자·하이픈 권장).
- `label` 은 라디오에 표시될 짧은 이름. `default: true` 가 없으면 첫 항목이 기본이다.
- **2개 이상일 때만** 라디오 패널이 나타난다(1개면 분기가 아니므로 넣지 않는다).
- ★ **케이스 전용 항목은 Description 문구 앞에 `[케이스이름] ` 를 붙인다.**
  - 형식: `[<케이스 label>] <설명>` — 대괄호 안은 `cases[].label` 을 **그대로** 쓴다(id 아님).
  - 여러 케이스에 걸치면 `·` 로 묶는다: `[등록 없음·오류] 다시 시도`
  - **공통 요소(`data-case` 없음)에는 붙이지 않는다.** 접두사가 없다는 것이 곧 "항상 보임"을 뜻한다.
  - 예:
    ```js
    { text: '목록 — 최근 이용 매장',      target: '.pdk-list' },      // 공통이면 접두사 없음
    { text: '[등록 있음] 항목 카드 목록',   target: '.pdk-list' },
    { text: '[등록 없음] 빈 상태 안내',     target: '.pdk-empty' },
    { text: '[등록 없음·오류] 다시 시도',   target: '.pdk-retry' },
    ```
  - 이렇게 두면 목록만 훑어도 **어느 상태의 UI인지** 바로 구분되고, 숨겨진 케이스의 항목에
    hover 강조가 안 걸리는 이유도 설명된다(라디오로 그 케이스를 켜야 보인다).

#### ★ Description 문안 규칙 — 간단명료하게, 짧게
Description은 **읽는 문서가 아니라 화면을 훑기 위한 라벨**이다. 길면 패널에서 읽히지 않는다.

- **한 항목 = 한 요소 = 한 문장.** 한 항목에 두 가지를 설명하지 않는다(나누면 hover 매핑도 정확해진다).
- **길이: 30자 내외, 최대 50자.** 패널 기본 폭(420px)에서 한 줄~두 줄 분량이다. 넘으면 줄여 쓴다.
- **형식은 둘 중 하나로 고정한다.**
  - `<요소> — <역할>` 예: `공지 배너 — 기기에서 문구 수정`
  - `<액션> → <결과·이동>` 예: `결제하기 → 결제 진행 (SCR-PAY-001)`
  - 조건 분기 화면에서 **특정 케이스에만 보이는 요소**는 앞에 케이스를 붙인다:
    `[<케이스이름>] <위 두 형식 중 하나>` 예: `[등록 없음] 빈 상태 안내`
    (접두사도 길이에 포함되므로 `cases[].label` 은 짧게 짓는다)
- **빼는 것**: 배경 설명·이유·디자인 묘사, `~할 수 있습니다` 같은 늘어지는 어미. 명사형이나 화살표로 끝낸다.
  - 나쁨: `사용자가 하단의 결제하기 버튼을 누르면 결제가 진행되며 결제 화면으로 이동하게 됩니다`
  - 좋음: `결제하기 → 결제 진행 (SCR-PAY-001)`
- **화면 전체에 대한 설명은 항목이 아니라 `context`에 둔다.**
- **항목 수도 과하지 않게 — 8개 내외.** 의미 있는 요소만 넣고, 자잘한 장식 요소는 빼거나 묶는다.
- 예:
```js
description: [
  { text: '다음 버튼을 누르면 결제 화면(SCR-PAY-001)으로 이동', target: '.pdk-btn-next' },
  { text: '상품 목록 — 항목 선택 시 상세로 이동', target: '.pdk-list' },
],
```
- target이 마땅치 않은 안내 문구 등은 `target: ''`로 둘 수 있다(hover 시 무동작).

### 5) 검증 안내
- 화면 HTML을 열어 우측 Description 항목에 hover 시 해당 요소가 강조(나머지 dim)되는지 확인하도록 안내.
- **연결한 이동**을 `요소 → 목적지` 로 요약하고, 버튼을 눌러 넘어가는지 확인하도록 안내한다
  (상단 바 포커스 모드 버튼 또는 `Ctrl+\` 로 시연 화면에서 확인 가능).
- 기능명세를 끌어왔으면 **반영 현황**을 보고한다:
  - Description 에 연결된 행: `ID → Description 문구` 목록
  - ★ **UI 에 반영되지 않은 행**: `ID · Content` 목록 + 이유(화면에 둘 자리가 없음 / 다른 화면 기능으로 보임 / 서버 처리라 UI 없음 등).
    다른 화면 기능으로 보이면 `/pdk-description` 으로 `pageId` 를 옮기자고 제안한다(직접 고치지 않는다).
- 조건 분기를 넣었으면 **목업 위 라디오로 케이스를 전환**해 각 상태가 의도대로 보이는지 확인하도록 안내.
- `designed`는 **false 유지**(디자인은 아직 미반영). 디자인은 `/pdk-figma-sync [화면ID] [figma url]`로 입힌다.

## 주의
- **실제 UI로 만든다** — 회색 블록·빈 자리·더미 텍스트로 채우지 않는다. 실제 문구가 들어가야 기획 의도가 전달된다.
- **색은 쓰지 않는다(흑백).** 색·이미지·브랜드 요소는 `/pdk-figma-sync`가 입힌다.
- 화면 전용 CSS는 레이아웃 보정에 한해 최소한만. 컴포넌트는 `.pdk-w-*` 키트를 쓴다.
- **3단 골격(header/body/footer)을 지킨다.** 루트에 padding·gap·height 를 주면 목업에 꽉 차지 않거나 UI가 틀어진다.
- `.pdk-screen` 단일 래퍼 + `.pdk-<역할>` 셀렉터 + `description.target` 일치를 반드시 지킨다.
- 케이스 전환 UI(라디오)와 표시/숨김 로직은 **엔진이 만든다.** 화면 HTML에 중복 구현하지 않는다.
- ★ **`data-case` 를 붙인 요소를 스크립트로 따로 열고 닫지 말 것.** 엔진이 케이스 전환 때 그 요소의
  `hidden` 을 덮어쓰므로, 모달·바텀시트처럼 버튼으로 여는 요소에 `data-case` 를 같이 주면 즉시 열려 버린다.
  → **여는 버튼 쪽에만** `data-case` 를 주고, 모달·시트 자체에는 붙이지 않는다.
- `cases[].id` 와 HTML의 `data-case` 값이 어긋나면 그 요소는 **어느 케이스에서도 보이지 않는다.** 반드시 대조한다.
- `flow.to`(이동 관계)는 이미 `/pdk-screen`에서 정의됨 — 여기서 새로 만들지 말고 Description 문구에 반영만 한다.
- `config/specs.js`(기능명세)는 **읽기만 한다.** 명세를 고쳐야 하면 `/pdk-description` 으로 안내한다.
- Description은 **짧고 명료하게**(30자 내외·최대 50자). 설명이 길어지면 문장을 다듬지 말고 **항목을 나누거나 덜어낸다.**
