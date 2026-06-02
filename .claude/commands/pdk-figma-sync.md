---
description: 디자인 입히기 — Figma MCP로 시안을 가져와 기존 스켈레톤에 적용하고 designed:true·figmaLink 갱신
argument-hint: [화면ID] [figma url]
---

# /pdk-figma-sync — Figma 디자인 적용

`$1`=화면ID, `$2`=Figma URL. **Figma MCP**로 시안을 가져와, `/pdk-wireframe`로 만든 **기존 스켈레톤에 디자인을 입힌다**.
스켈레톤의 `.pdk-<역할>` 식별자는 보존해 Description hover 매핑이 계속 동작하게 한다.

> 이 커맨드는 Figma MCP(`get_design_context`, `get_screenshot`, `get_metadata`)를 사용한다.
> Figma 데스크탑 앱/계정 연결이 필요하다. 사용 도구: Read, Write, Edit, Glob, Bash, Figma MCP.

## 절차

### 1) 대상 확인
- `config/screens.js`에서 `$1`(화면ID)로 page를 찾는다. 없으면 "먼저 /pdk-screen 으로 등록(가능하면 /pdk-wireframe 까지) 하세요"라고 안내하고 중단.
- 이 화면의 `href`(HTML 파일), 현재 `description[]`(target 셀렉터들)을 기억한다 — **디자인 적용 후에도 이 target 들이 유지되어야 한다.**

### 2) Figma URL 파싱
- `$2`에서 `fileKey`와 `nodeId`를 추출한다.
  - `figma.com/design/:fileKey/:name?node-id=1-2` → fileKey=`:fileKey`, nodeId=`1:2` (node-id의 `-`를 `:`로 변환)
  - `node-id`가 없으면 사용자에게 노드 지정 URL을 요청한다.

### 3) 디자인 컨텍스트 가져오기
- `get_design_context`(fileKey, nodeId)로 참조 코드(React+Tailwind)와 에셋 URL, 메타데이터를 받는다.
- 필요 시 `get_screenshot`으로 시각 확인, `get_metadata`로 구조 파악.

### 4) 스켈레톤에 디자인 적용 (화면 HTML 변환)
- 받은 참조 코드를 **이 프로젝트 스택(무빌드 정적 HTML/CSS)** 으로 변환한다:
  1. Tailwind/React → **순수 HTML + 화면 전용 `<style>` 블록**(파일 `<head>`)으로 변환. (Tailwind 의존성 추가 금지)
  2. 시각 디자인(색·폰트·간격·라운드·그림자 등)을 시안에 맞춰 재현. 가능하면 절대좌표 대신 자연스러운 레이아웃 사용.
  3. **레이아웃 루트는 계속 `.device-screen` 직속 단일 `.pdk-screen`** 으로 유지(W-3).
- **★ 식별자 보존**: 스켈레톤의 `.pdk-<역할>` 클래스를 대응되는 실제 요소에 그대로 남긴다(디자인 클래스는 함께 추가). → `description.target` 매핑/ hover 강조가 계속 동작.
- 에셋: 시안에 이미지/아이콘이 있으면 `get_design_context`가 준 에셋 URL을 `Bash`(curl)로 `assets/`에 내려받아 참조한다. (SVG는 인라인도 가능)
- 캔버스 규격: 해당 화면이 쓰는 디바이스(`config/project.js`·`config/devices.js`) 화면 크기에 맞춰 디자인이 들어가도록 한다.

### 5) config 갱신 (`config/screens.js`)
- 이 화면의 `designed: true`로 변경.
- `figmaLink: '<$2 원본 URL>'` 저장(Description 패널의 "Figma 링크"가 채워짐).
- `description`은 유지(기능 설명). target 셀렉터가 4)에서 보존됐는지 확인.

### 6) 검증 안내
- 화면 HTML을 열어 디자인이 반영됐는지, 페이지 목록 뱃지가 "반영"으로 바뀌었는지, Description hover 강조가 여전히 동작하는지 확인하도록 안내.
- 미세 차이는 시안과 비교(`get_screenshot`)하며 조정.

## 주의
- 스켈레톤의 `.pdk-<역할>` 식별자를 **삭제하지 말 것**(Description 매핑 유지).
- Tailwind 등 의존성을 설치하지 말 것(무빌드 정적 유지). 스타일은 화면 전용 `<style>`로.
- `flow`/이동 관계는 건드리지 않는다(디자인만 적용).
- 시안에 민감정보가 있을 수 있으니 에셋 URL은 노출 주의.
