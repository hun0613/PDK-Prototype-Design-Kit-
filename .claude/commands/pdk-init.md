---
description: PDK 프로젝트 초기화 — 이름·설명·디바이스를 입력받아 config와 index.html 빈 골격 생성
argument-hint: (인자 없음 · 대화형)
allowed-tools: Read, Write, Edit, AskUserQuestion, Glob
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
};
```

### 4) `config/screens.js` 보장
- 파일이 **없으면** 빈 상태로 생성한다. 이미 있으면 **유지**(기존 화면 보존).

```js
// 화면은 /pdk-screen 으로 추가됩니다. (스키마는 주석 참고)
window.PDK_SCREENS = [];
```

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
      var files = ['config/devices.js', 'config/project.js', 'config/screens.js', 'engine/common.js'];
      for (var i = 0; i < files.length; i++) document.write('<scr' + 'ipt src="' + files[i] + '?_=' + v + '"></scr' + 'ipt>');
    })();
  </script>
</body>
</html>
```

> 위 골격의 스크립트 로더는 config를 캐시 없이 로드해, `/pdk-*` 변경이 새로고침만으로 즉시 반영되게 한다(강력 새로고침 불필요).

### 7) 안내
- 생성된 파일 목록을 요약하고, `index.html`을 브라우저로 열면 빈 골격(디바이스 목업 + 3개 패널)이 보인다고 알린다.
- 다음 단계 안내: **`/pdk-screen [카테고리] [화면ID] [화면이름]`** 으로 화면을 유저플로우 순서대로 추가.

## 주의
- 디자인/CSS 세부는 다루지 않는다(이후 `/pdk-figma-sync`가 담당).
- 기존 `config/screens.js`·`config/devices.js`를 덮어써서 사용자 작업을 지우지 않는다.
- 라벨→key 매핑: 데스크탑=desktop, 모바일=mobile, 토스프론트2=tossfront2, 반응형=responsive.
