---
description: 화면 설계 — 대화형으로 스켈레톤 UI를 구성하고 Description을 자동 작성(요소↔target 매핑, 디자인/CSS 제외)
argument-hint: [화면ID]
allowed-tools: Read, Write, Edit, AskUserQuestion, Glob
---

# /pdk-wireframe — 화면 설계 (스켈레톤 + Description)

`$1`=화면ID. 해당 화면을 **대화형으로 설계**한다. 결과로 화면 HTML에는 **스켈레톤 UI**(회색 블록 수준의
레이아웃/요소 자리)가 들어가고, `config/screens.js`의 해당 화면 `description[]`이 **자동 작성**된다.
Description 항목에 마우스를 올리면 해당 요소가 강조(나머지 dim)되도록 **요소↔target 매핑**을 부여한다.

> 중요한 원칙: **디자인/CSS(색·폰트·간격·이미지 등 시각 스타일)는 다루지 않는다.** 그건 `/pdk-figma-sync`가 Figma에서 입힌다.
> 여기서는 **무엇이 있고(요소) / 무슨 역할이며(기능) / 어디로 이어지는지(흐름)** 만 정의한다.

## 절차

### 1) 대상 화면 확인
- `config/screens.js`에서 `$1`(화면ID)로 page를 찾는다. 없으면 "먼저 /pdk-screen 으로 등록하세요"라고 안내하고 중단.
- 그 화면의 `label`, `context`, `flow.to`(다음 이동/버튼)를 읽어 설계의 출발점으로 삼는다.

### 2) 대화형 구성
- 화면에 어떤 요소가 필요한지 사용자와 짧게 주고받으며 정한다. 막막해하면 `context`와 `flow`를 근거로 **초안을 먼저 제안**한다.
  - 예: 헤더(뒤로/홈), 타이틀, 리스트/카드, 입력 필드, 키패드, 하단 CTA 버튼 등.
- 각 요소마다 **역할(기능)**과 **연결(클릭 시 이동 등)**을 확인한다. 연결은 이미 `flow.to`에 있으면 그것과 일치시킨다.

### 3) 화면 HTML 작성 (스켈레톤)
- 대상 화면의 HTML 파일(`page.href`)을 열어 `.device-screen` 내부를 **단일 래퍼 `.pdk-screen`** 으로 교체한다.
  - ★ W-3 규칙: 스켈레톤 루트는 반드시 `.device-screen`의 **직속 단일 자식 `.pdk-screen`** 이어야 한다(hover dim이 이 구조를 가정).
- 요소는 스켈레톤 수준으로만 표현한다. 공용 유틸 사용 권장:
  - `.pdk-sk-title`(제목 자리), `.pdk-sk-line`(텍스트 줄), `.pdk-sk-hero`(큰 영역), `.pdk-sk-box`(박스/카드), `.pdk-sk-btn`(버튼)
- **각 의미 요소에 안정적 역할 클래스 `.pdk-<역할>`을 부여**한다(Description 매핑 키).
  - 예: `.pdk-btn-next`, `.pdk-list`, `.pdk-input`, `.pdk-back`, `.pdk-home`
  - ★ W-4 규칙: 한 화면에 같은 역할이 2개 이상이면 `-1`, `-2` 접미(예: `.pdk-btn-next-2`).
- 시각 스타일(색/폰트/여백 등)은 넣지 않는다. 레이아웃 골격만(`.pdk-sk-*` 유틸로 충분).

예시:
```html
<div class="pdk-screen">
  <div class="pdk-sk-title pdk-title"></div>
  <div class="pdk-sk-box pdk-list"></div>
  <button class="pdk-sk-btn pdk-btn-next">다음</button>
</div>
```

### 4) Description 자동 작성 (`config/screens.js`)
- 대상 page의 `description`을 **기능·동작·흐름 중심**으로 채운다. 각 항목은 `{ text, target }`.
  - `text`: 그 요소가 무슨 역할인지/누르면 어떻게 되는지(이동 대상 화면ID 포함 권장). **디자인 묘사 금지.**
  - `target`: 3)에서 부여한 `.pdk-<역할>` 셀렉터.
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
- `designed`는 **false 유지**(디자인은 아직 미반영). 디자인은 `/pdk-figma-sync [화면ID] [figma url]`로 입힌다.

## 주의
- 디자인/CSS는 절대 작성하지 않는다(피그마 위임). 스켈레톤은 무채색 골격만.
- `.pdk-screen` 단일 래퍼 + `.pdk-<역할>` 셀렉터 + `description.target` 일치를 반드시 지킨다.
- `flow.to`(이동 관계)는 이미 `/pdk-screen`에서 정의됨 — 여기서 새로 만들지 말고 Description 문구에 반영만 한다.
