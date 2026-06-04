---
description: 화면 등록 — 카테고리·ID·이름 + 진입/이동(분기) 질문으로 화면 HTML 생성 및 목록·플로우 자동 갱신
argument-hint: [카테고리] [화면ID] [화면이름]
allowed-tools: Read, Write, Edit, AskUserQuestion, Glob
---

# /pdk-screen — 화면 등록

유저플로우 **순서대로** 실행하며 화면을 하나씩 등록한다. 각 호출은 `config/screens.js`에 화면을 추가하고
**이름·ID만 표기된** 화면 HTML을 생성한다. 페이지 목록·Description·화면 플로우는 엔진이 config에서 **자동 생성**한다.

인자: `$1`=카테고리, `$2`=화면ID, `$3`=화면이름. (없으면 대화로 물어본다)

## 절차

### 1) 인자 확인
- 카테고리/화면ID/화면이름을 확정한다. 누락 시 사용자에게 물어본다.
- 화면ID 규칙 권장: `SCR-<카테고리약어>-<3자리>` (예: `SCR-MAIN-001`). 강제는 아님.
- `config/screens.js`를 읽어 **중복 ID**가 있으면 경고하고 다른 ID를 요청한다.

### 2) 맥락 + 플로우 질문 (대화형)
다음을 물어본다(짧고 쉽게):
1. **언제·어떻게 보이는 화면인가?** → `context`에 저장.
2. **진입 출처**: 어느 화면에서, 무슨 버튼/조건으로 이 화면에 오나? (없으면 "진입점")
3. **다음 이동**: 이 화면에서 어디로 가나? 버튼/조건. **분기 있으면**(예: 성공/실패) 분기명과 각 목적지를 함께.
   - 자동 이동(카운트다운/타임아웃 등)이면 그렇게 표시.

### 3) `config/screens.js` 갱신
`config/screens.js`를 Read 후 Edit한다.

**(a) 이 화면 page 객체 추가** — 카테고리 그룹을 찾고(없으면 새 그룹 `{ category, pages: [] }` 생성) 그 `pages`에 추가:
```js
{
  id: '<화면ID>', label: '<화면이름>', href: '<href>',
  designed: false, figmaLink: '',
  context: '<언제/어떻게 보이는지>',
  description: [],                 // Description은 /pdk-wireframe 에서 자동 작성
  flow: { to: [ /* (3-c) 다음 이동 */ ] },
}
```
- `href` = 화면ID를 소문자로 바꾼 파일명. 예: `SCR-MAIN-001` → `scr-main-001.html`. (사용자가 원하면 다른 파일명 허용)

**(b) 진입 출처 연결 — ★중요: 간선은 `to`가 유일 소스다.**
- "출처 화면 → 이 화면" 연결은 **출처 화면의 `flow.to`** 에 추가한다(이 화면에 `from`을 저장하지 말 것).
- 출처 화면을 ID 또는 이름으로 `config/screens.js`에서 찾아 그 `flow.to`에 `{ screen: '<이 화면ID>', via: '<버튼/조건>' }` 추가.
- 출처 화면이 아직 등록 전이면: 연결을 보류하고 "출처 화면(<ID>)을 만들 때 자동으로 이어집니다"라고 안내(유저플로우 순서대로 만들면 출처가 먼저 생긴다). 진입점이면 생략.

**(c) 다음 이동 — 이 화면의 `flow.to` 항목**
- 단순 이동: `{ screen: '<목적지ID>', via: '<버튼/조건>' }`
- 분기: 같은 `branch` 라벨로 여러 개. 예:
  ```js
  { screen: 'SCR-DONE-001', via: '성공', branch: '결제 성공 여부' },
  { screen: 'SCR-FAIL-001', via: '실패', branch: '결제 성공 여부' },
  ```
- 자동 이동(점선): `{ screen: '<목적지ID>', via: '카운트다운/확인', kind: 'auto' }`
- 목적지가 아직 미등록 ID여도 그대로 적는다 → 플로우에 **ghost(점선) 노드**로 표시되고, 나중에 등록되면 자동 연결된다.

### 4) 화면 HTML 생성
- `templates/_screen.blank.html`을 복사해 `{{SCREEN_NAME}}`·`{{SCREEN_ID}}`를 치환하고 `<href>` 파일명으로 저장한다.
- 템플릿이 없으면 동일 구조(`.placeholder-screen` 안에 이름·ID)로 직접 작성한다.
- 화면 안에는 **이름·ID만** 표기한다(UI는 `/pdk-wireframe`, 디자인은 `/pdk-figma-sync`).

### 5) 안내
- 추가된 화면ID/이름/카테고리, 만든 파일명, 연결(진입/다음) 요약.
- `index.html` 또는 방금 만든 화면을 열면 페이지 목록·플로우·Description에 자동 반영됨을 알린다.
- 다음 화면을 이어서 `/pdk-screen`으로 등록하도록 안내. 모든 화면 등록 후 `/pdk-wireframe`로 진행.

## 주의
- `description`은 비워둔다(빈 배열). 내용은 `/pdk-wireframe`가 채운다.
- `designed: false` 고정(디자인은 `/pdk-figma-sync` 이후 true).
- `to`만이 간선 소스다. `from` 필드는 만들지 않는다.
- 기존 화면/연결을 덮어쓰지 말고 **추가만** 한다.
