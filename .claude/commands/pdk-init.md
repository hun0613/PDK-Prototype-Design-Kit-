---
description: PDK 프로젝트 초기화 — 이름·설명·디바이스·PRD 문서·push 레포를 입력받아 config와 index.html 빈 골격 생성
argument-hint: (인자 없음 · 대화형)
allowed-tools: Read, Write, Edit, AskUserQuestion, Glob, Bash
---

# /pdk-init — PDK 프로젝트 초기화

당신은 비개발자(기획자)가 **PDK(Prototype Design Kit) 화면설계서 프로젝트를 시작**하도록 돕는다.
이 커맨드는 프로젝트 이름·설명·디바이스를 받아 `config/project.js`와 `index.html`(빈 골격)을 생성한다.
실행 후에는 페이지 목록·화면 플로우·Description 패널이 모두 떠 있되 **내용만 비어 있는** 초기 화면이 만들어진다.

## 절차 (순서대로)

### 1) 입력 수집
- **프로젝트 이름**과 **프로젝트 설명**은 일반 대화로 물어본다(자유 입력).
- **디바이스**는 `AskUserQuestion`으로 다음 중 하나를 선택받는다:
  - `데스크탑` → key `desktop`
  - `모바일` → key `mobile`
  - `토스프론트2` → key `tossfront2`
  - `반응형(데스크탑·모바일)` → key `responsive`
- **PRD 문서**(선택) — 상단 바의 "PRD 문서 보기" 버튼을 켤지 정한다.
  1. `Glob`으로 `docs/prd/*.html` 을 확인한다. (`sample.html` 은 PDK 예시 문서이므로 후보에서 제외한다)
  2. 후보가 있으면 `AskUserQuestion`으로 **그중 하나 / 없음**을 고르게 한다.
     후보가 없으면 자유 입력으로 묻는다 — "PRD 문서가 있으면 `docs/prd/` 에 넣고 파일명을 알려주세요(없으면 건너뜁니다)".
  3. 받은 값은 **파일명만** 저장한다. `docs/prd/prd.html` 처럼 경로째 답하면 파일명(`prd.html`)만 남긴다.
  4. ★ **재실행 보존**: 기존 `config/project.js` 에 `prdFile` 값이 있으면 **그 값을 기본값으로 제시**하고,
     사용자가 바꾸지 않으면 **그대로 유지**한다. (묻지 않고 날려버리지 않는다.)
  5. 아직 파일이 없는 이름을 지정하면 그대로 저장하되, **"버튼은 보이지만 누르면 문서를 찾지 못한다"** 고 알린다.
- 이미 인자나 대화로 일부 정보가 주어졌다면 그 항목은 다시 묻지 않는다.

### 2) `config/devices.js` 보장
- 파일이 없으면 아래 내용으로 생성한다(내장 4종). 이미 있으면 **건드리지 않는다**(사용자 커스텀 보존).

```js
window.PDK_DEVICES = {
  desktop:    { label: '데스크탑',    type: 'frame', width: 1440, height: 1024, bezel: 10, radius: 20, bezelColor: '#404040' },
  mobile:     { label: '모바일',      type: 'frame', width: 360,  height: 782,  bezel: 10, radius: 40, bezelColor: '#404040' },
  tossfront2: { label: '토스프론트2', type: 'kiosk', width: 400,  height: 640,  radius: 18 },
  responsive: { label: '반응형',      toggle: ['desktop', 'mobile'], default: 'desktop' },
};
```

### 3) `config/project.js` 작성(덮어쓰기)
- 수집한 값으로 작성한다. 디바이스가 `반응형`이면 `device: 'responsive'`, `responsive: true`.

```js
window.PDK_PROJECT = {
  name: '<입력한 이름>',
  description: '<입력한 설명>',
  device: '<desktop|mobile|tossfront2|responsive>',
  responsive: <true|false>,
  prdFile: '<PRD 파일명 또는 빈 문자열>',   // docs/prd/ 안의 HTML 파일명 (예: 'prd.html')
};
```
- ★ **덮어쓰기 전에 기존 파일을 Read 한다.** 스키마에 없는 필드가 이미 있으면 **그대로 옮겨 적어 보존한다**
  (사용자가 직접 추가한 설정을 초기화가 지우지 않게 한다).
- `prdFile` 이 비면 상단 바의 PRD 버튼은 표시되지 않는다(값이 있을 때만 생성).

### 4) `config/screens.js` 보장
- 파일이 **없으면** 빈 상태로 생성한다. 이미 있으면 **유지**(기존 화면 보존).

```js
// 화면은 /pdk-screen 으로 추가됩니다. (스키마는 주석 참고)
window.PDK_SCREENS = [];
```

### 4-b) `config/flows.js` 보장
- 파일이 **없으면** 빈 상태로 생성한다. 이미 있으면 **유지**(기존 플로우 보존).

```js
// 기능 플로우는 /pdk-flow 로 추가됩니다.
window.PDK_FLOWS = [];
```

### 4-c) `pages/` 디렉토리 보장
- 화면 HTML이 생성될 `pages/` 디렉토리가 없으면 만든다(`index.html`만 루트에 두고, 나머지 화면은 전부 `pages/` 안).
- 이미 있으면 **건드리지 않는다**(기존 화면 보존).

### 5) 엔진 확인
- `engine/common.css`, `engine/common.js`가 있는지 `Glob`으로 확인한다. 없으면 사용자에게 "엔진 파일이 없습니다 — PDK 템플릿이 맞는지 확인하세요"라고 경고한다(생성하지 말 것).

### 6) `index.html` 생성
- `templates/index.template.html`이 있으면 복사 후 `{{PROJECT_TITLE}}`를 프로젝트 이름으로 치환해 `index.html`로 저장한다.
- 템플릿이 없으면 아래 골격을 직접 `index.html`로 작성한다(빈 `.pdk-screen`).

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><프로젝트 이름></title>
  <link rel="stylesheet" href="engine/common.css" />
</head>
<body>
  <div class="device-stage">
    <div class="device-mockup">
      <div class="device-frame">
        <div class="device-screen">
          <div class="pdk-screen"><!-- /pdk-wireframe 로 설계 --></div>
        </div>
      </div>
      <div class="device-stand"></div>
      <div class="device-base"></div>
    </div>
  </div>
  <script>
    (function () {
      var v = Date.now();
      var files = ['config/devices.js', 'config/project.js', 'config/screens.js', 'config/flows.js', 'engine/common.js'];
      for (var i = 0; i < files.length; i++) document.write('<scr' + 'ipt src="' + files[i] + '?_=' + v + '"></scr' + 'ipt>');
    })();
  </script>
</body>
</html>
```

> 위 골격의 스크립트 로더는 config를 캐시 없이 로드해, `/pdk-*` 변경이 새로고침만으로 즉시 반영되게 한다(강력 새로고침 불필요).

### 7) git 원격(remote) 정리 — PDK 원본과 push 연결 끊기

클론으로 시작한 프로젝트는 `origin`이 **PDK 원본 레포를 가리킨 채로 남는다.**
그대로 두면 내 화면을 커밋해 push할 때 템플릿 레포로 밀게 되므로 여기서 끊는다.

1. git 저장소인지 확인한다.
   ```bash
   git rev-parse --is-inside-work-tree
   ```
   - 저장소가 아니면(ZIP 다운로드 등) 이 단계를 **건너뛰고**, 7-5의 보고에서만 그 사실을 알린다.
     (임의로 `git init` 하지 않는다. 사용자가 원하면 그때 한다.)
2. 현재 `origin`을 확인한다.
   ```bash
   git remote get-url origin
   ```
   - `origin`이 없으면 → 이미 끊긴 상태다. 3)의 질문만 하고 주소를 받으면 `git remote add origin <주소>`.
   - `origin`이 **PDK 원본이 아니면**(이미 내 레포를 가리킴) → **아무것도 하지 않는다.**
     사용자가 직접 설정한 것을 덮어쓰지 않는다.
   - ★ **PDK 원본 주소는 `.claude/commands/pdk-update.md` 의 「고정값」에 적힌 URL을 단일 출처로 읽어서** 비교한다.
     (이 파일에 주소를 다시 적어 두지 않는다 — 두 곳에 적으면 갈라진다.)
     비교는 느슨하게: 스킴(`http`/`https`), 끝의 `.git`, 트레일링 슬래시 차이는 같은 주소로 본다.
3. `origin`이 PDK 원본이면 사용자에게 물어본다 — **"작업 결과를 push할 내 레포 주소가 있나요?"**
   - **주소를 주면**: `git remote set-url origin <주소>`
   - **없다 / 나중에**: `git remote remove origin` — **원본과의 연결을 끊는다.**
     나중에 `git remote add origin <주소>` 로 붙이면 된다고 안내한다.
4. `upstream`은 **여기서 등록하지 않는다.** PDK 원본 주소는 `/pdk-update`가 고정값으로 갖고 있어
   실행 시 자동 등록한다. (origin을 지워도 `/pdk-update`는 정상 동작한다.)
5. 수행 결과를 보고한다 — `origin`을 **바꿨는지 / 지웠는지 / 그대로 뒀는지**, 그리고 지금 push가 가능한 상태인지.

> ⚠️ `git remote remove origin` 은 **원격 연결만** 끊는다. 커밋 히스토리와 파일은 그대로 남는다.

### 8) 안내
- 생성된 파일 목록을 요약하고, `index.html`을 브라우저로 열면 빈 골격(디바이스 목업 + 3개 패널)이 보인다고 알린다.
- PRD 설정 결과를 알린다 — 지정했으면 `docs/prd/<파일명>` 이 상단 바 버튼으로 열린다는 것,
  비워 뒀으면 나중에 `config/project.js` 의 `prdFile` 에 파일명을 적거나 `/pdk-init` 을 다시 실행하면 된다는 것.
- 7)의 원격 정리 결과를 함께 알린다. `origin`을 지운 경우 push하려면 먼저 내 레포를 만들고
  `git remote add origin <주소>` 를 실행하면 된다고 안내한다.
- 다음 단계 안내: **`/pdk-screen [카테고리] [화면ID] [화면이름]`** 으로 화면을 유저플로우 순서대로 추가(화면 파일은 `pages/`에 생성됨).

## 주의
- 디자인/CSS 세부는 다루지 않는다(이후 `/pdk-figma-sync`가 담당).
- 기존 `config/screens.js`·`config/devices.js`를 덮어써서 사용자 작업을 지우지 않는다.
- `config/project.js`는 덮어쓰지만, **기존 `prdFile` 등 이미 있던 값을 유실시키지 않는다**(재실행 안전).
- 라벨→key 매핑: 데스크탑=desktop, 모바일=mobile, 토스프론트2=tossfront2, 반응형=responsive.
- **PDK 원본을 가리키는 `origin`은 남겨두지 않는다**(push 사고 방지). 단, 이미 사용자가 지정한 origin은 건드리지 않는다.
- 원격 조작은 `remote` 설정에 한정한다 — `git commit`·`push`·`reset` 등은 하지 않는다.
