---
template: plan
version: 1.2
feature: pdk-template
project: thebestpay-prototype-design-kit (PDK)
date: 2026-06-01
author: psh@thebestpay.co.kr
status: Draft
---

# PDK (Prototype Design Kit) Planning Document

> **Summary**: 비개발자가 레포 복제 → Claude 실행 → 슬래시 커맨드 5개를 순서대로 사용하면 화면설계서(페이지 목록 + 유저플로우 + Description + 스켈레톤 + 피그마 디자인)가 완성되는 클린 템플릿 레포.
>
> **Project**: thebestpay-prototype-design-kit
> **Version**: 0.1 (fork 기반 재구성)
> **Author**: psh@thebestpay.co.kr
> **Date**: 2026-06-01
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

기존 골프 키오스크 프로토타입(엘커넥트 × 토스 프론트2)을 만들며 다져진 **"화면설계서 틀(framework)"** — 디바이스 목업 + 개발 사이드바(페이지 목록 / 유저플로우 다이어그램 / Description 패널) — 을 골프 콘텐츠와 분리하여, **비개발자(기획자)가 순서대로 따라 하면 자기만의 화면설계서를 만들 수 있는 재사용 템플릿 레포**로 일반화·배포한다.

### 1.2 Background

- 현재 레포는 골프 전용 화면 18개 + `CATEGORIES`/플로우가 `common.js`에 하드코딩된 상태(설정과 엔진이 결합).
- 기획자가 매번 HTML/JS를 직접 손대야 해서 비개발자가 재사용하기 어렵다.
- → 엔진(재사용 코드)과 설정/콘텐츠(사용자가 채움)를 분리하고, Claude 슬래시 커맨드로 작성 과정을 안내하면 비개발자도 사용 가능.

### 1.3 Related Documents

- 기존 현황: `docs/reference/legacy-lconnect-prototype.md` (골프 프로토타입 작업 기록 — 패턴 참고용 동결 문서)
- 엔진 원본: `scripts/common.js`, `styles/common.css`

---

## 2. Scope

### 2.1 In Scope

- [ ] 골프 전용 화면 18개 HTML · 골프/브랜드 assets · 스토리보드 pptx **완전 제거**(git 히스토리로 보존)
- [ ] 엔진 일반화: `CATEGORIES`/플로우 하드코딩 → **`config/screens.js` 단일 소스**로 분리, 엔진은 config 기반 렌더
- [ ] 디바이스 **4종 규격**(데스크탑 / 모바일 / 토스프론트2 / 반응형) 엔진 내장 + **반응형 데스크탑/모바일 토글** 버튼
- [ ] 슬래시 커맨드 5종 작성 (`.claude/commands/`)
  - `/pdk-init` — 이름·설명·디바이스 입력 → `index.html` + 빈 골격 생성
  - `/pdk-mockup [디바이스명] [소스 경로]` — 이미지 디렉토리 또는 Figma를 참고해 **커스텀 디바이스 목업(외곽 프레임 + 캔버스 규격)** 을 디바이스 레지스트리에 등록 → `/pdk-init` 선택지로 사용 가능
  - `/pdk-screen [카테고리] [화면ID] [화면이름]` — 맥락 + 진입출처/다음이동(분기) 질문 → 화면 HTML(이름·ID만) 생성, 목록·Description·플로우 자동 갱신
  - `/pdk-wireframe [화면ID]` — 대화형 스켈레톤 UI 구성 + Description 자동 작성(CSS/디자인 제외) + 요소↔Description target 매핑
  - `/pdk-figma-sync [화면ID] [figma url]` — Figma MCP로 디자인을 스켈레톤에 입힘
- [ ] 디바이스 **레지스트리**: 내장 4종 + `/pdk-mockup`으로 등록한 커스텀 목업을 함께 관리, `/pdk-init`에서 선택 가능
- [ ] 화면 HTML 템플릿(빈/카운트다운/모달 등) — `templates/`
- [ ] 플로우 자동 생성(연결 정보 기반) + 미등록 대상 **placeholder 노드** 처리
- [ ] 스켈레톤 UI 모드 + Description hover → 요소 highlight / 나머지 dim
- [ ] 가이드 문서 (`README.md`, `docs/GUIDE.md` + 체크리스트)
- [ ] 동작 참고용 **중립 예제**(`example/`, 골프 아님, 화면 1~2개 A→B)

### 2.2 Out of Scope

- 디자인/CSS 디테일 작성(색·폰트·간격 등) — **Figma에서 관리**, Description에서 의도적으로 제외
- 백엔드·DB·인증 등 기능 구현 (본 키트는 화면설계서 프로토타입 도구)
- npm 패키지/CLI 스캐폴더 배포 형태 (이번엔 **템플릿 레포(복제형)** 으로 한정)
- 실제 빌드/번들 파이프라인 (정적 HTML, 빌드 없음 유지)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `/pdk-init`: 이름·설명·디바이스 대화형 입력 후 `index.html` + 빈 골격(페이지목록·플로우·Description 패널) 생성 | High | Pending |
| FR-02 | 반응형 선택 시 상단 데스크탑/모바일 토글 버튼 표시 및 목업/캔버스 전환 | High | Pending |
| FR-11 | `/pdk-mockup [디바이스명] [소스경로]`: 이미지 디렉토리(여러 장이면 실행 시 선택) 또는 Figma 참고 → 외곽 프레임 + **대화로 입력한 캔버스 규격**으로 커스텀 디바이스 목업을 레지스트리에 등록, `/pdk-init` 선택지에 노출 | Medium | Pending |
| FR-03 | `/pdk-screen`: 인자(카테고리·ID·이름) + 맥락/진입출처/다음이동(분기) 질문 → 화면 HTML(이름·ID만) 생성 | High | Pending |
| FR-04 | 화면 등록 시 페이지 목록 행·Description 항목·플로우 노드/연결 자동 갱신 (미등록 대상은 placeholder 노드) | High | Pending |
| FR-05 | `/pdk-wireframe`: 대화형으로 스켈레톤 UI 구성 + Description 자동 작성 (디자인/CSS 내용 제외) | High | Pending |
| FR-06 | 각 Description 항목 ↔ 스켈레톤 요소(target) 매핑, hover 시 해당 요소 highlight + 나머지 dim | High | Pending |
| FR-07 | `/pdk-figma-sync`: Figma MCP로 디자인을 가져와 기존 스켈레톤에 입힘 | High | Pending |
| FR-08 | 엔진(`common.js`/`common.css`)이 `config/screens.js` 단일 소스 기반으로 동작 (하드코딩 제거) | High | Pending |
| FR-09 | 골프/브랜드 콘텐츠·assets 완전 제거, 범용 자산만 유지 | Medium | Pending |
| FR-10 | README + GUIDE(순차 가이드·체크리스트) + 중립 예제 제공 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 사용성(비개발자) | 커맨드 5개만으로 화면설계서 완성, 코드 직접 수정 최소화 | 가이드대로 예제 재현 가능 여부 |
| 무빌드 | `index.html`을 브라우저로 열면 즉시 동작 (빌드/서버 불필요) | file:// 또는 Live Server에서 동작 확인 |
| 이식성 | 디바이스 4종 + 반응형에서 목업·사이드바 정상 렌더 | 디바이스별 미리보기 점검 |
| 유지보수성 | 화면 추가가 단일 소스(config + HTML 1개)만 수정 | 플로우/목록 2중 수정 불필요 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 골프 콘텐츠 제거 + 엔진 일반화 완료, 빈 골격이 디바이스 4종에서 정상 렌더
- [ ] 커맨드 5종으로 중립 예제 화면 흐름(A→B 등)을 처음부터 끝까지 생성 가능
- [ ] Description hover highlight/dim 정상 동작 (스켈레톤·디자인 적용 후 모두)
- [ ] README + GUIDE 문서로 비개발자가 따라 할 수 있음

### 4.2 Quality Criteria

- [ ] `index.html` 무빌드 즉시 실행
- [ ] 콘솔 에러 0
- [ ] config 외 코드 수정 없이 화면 추가 가능

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 골프 콘텐츠 일괄 제거 시 엔진 의존 코드 동반 삭제 | High | Medium | 새 브랜치(`feat/pdk-template`)에서 작업, 단계별 미리보기 점검, git 히스토리 보존 |
| 플로우 자동 생성 로직 복잡도(분기·placeholder) | Medium | Medium | 연결 데이터 스키마를 먼저 확정 후 엔진 구현, 예제로 검증 |
| Figma MCP 동기화가 스켈레톤 구조와 충돌 | Medium | Medium | 스켈레톤 요소에 안정적 target/식별자 부여, sync는 스타일 입힘 위주로 범위 한정 |
| 디바이스 4종 규격/반응형 토글 레이아웃 깨짐 | Medium | Low | 규격 상수화, 디바이스별 점검 체크리스트 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | 단순 구조, 정적 HTML/CSS/JS, 빌드 없음 | 정적 사이트, 프로토타입 키트 | ☑ |
| **Dynamic** | feature 모듈, BaaS 연동 | 백엔드 있는 웹앱 | ☐ |
| **Enterprise** | 레이어 분리, MSA | 고트래픽 시스템 | ☐ |

→ **Starter** (무빌드 정적 템플릿, 백엔드 없음).

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 배포 형태 | 템플릿레포 / 드롭인번들 / npm / CLI | **템플릿 레포(복제형)** | 비개발자·무빌드에 가장 적합 |
| 화면 저작 방식 | 설정파일만 / HTML직접+가이드 / 위저드 | **HTML 직접 작성 + 가이드(커맨드)** | 자유도 + Claude 커맨드 안내 |
| 디바이스 목록 | 고정 4종 / 확장형 레지스트리 | **확장형 레지스트리(내장4 + 커스텀)** | `/pdk-mockup`으로 사용자 목업 추가 |
| 설정 소스 | 코드 내 하드코딩 / 단일 config | **`config/screens.js` 단일 소스** | 2중 수정 제거, 비개발자 친화 |
| 플로우 생성 | 수동 / 연결정보 기반 자동 | **자동(A안) + placeholder 노드** | "순서대로 등록하면 자동" 의도 충족 |
| 스타일 | 인라인 페이지 스타일 + 공용 CSS | 공용 엔진 CSS + 화면별 최소 | 디자인 디테일은 Figma에 위임 |
| 디자인 연동 | 수동 / Figma MCP | **Figma MCP(`/pdk-figma-sync`)** | 스켈레톤에 실제 디자인 입힘 |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter (무빌드 정적)

폴더 구조 (예정):
┌───────────────────────────────────────────────┐
│ README.md                  소개 + 퀵스타트       │
│ docs/GUIDE.md              비개발자 순차 가이드    │
│ .claude/commands/          슬래시 커맨드 5종      │
│   ├ pdk-init.md / pdk-mockup.md / pdk-screen.md │
│   └ pdk-wireframe.md / pdk-figma-sync.md        │
│ config/screens.js          ★화면·연결·디바이스 단일 소스★│
│ config/devices.js          디바이스 레지스트리(내장4+커스텀)│
│ assets/mockups/<디바이스명>/ 커스텀 목업 프레임 이미지 │
│ engine/common.css          목업+사이드바+토글     │
│ engine/common.js           config기반 렌더 엔진    │
│ templates/                 화면 HTML 골격(빈/변형)  │
│ assets/                    범용 아이콘만           │
│ example/                   중립 예제(A→B)         │
└───────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] `CLAUDE.md` 코딩 컨벤션 — 없음 (신규 정의 가능)
- [x] 무빌드 정적 HTML/CSS/JS, Pretendard(CDN), 절대좌표 기반 화면 — 기존 패턴 존재
- [ ] ESLint/Prettier/tsconfig — 없음 (정적 프로젝트라 미사용)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| 화면 ID 규칙 | 기존 `LCN-XXX-000` 패턴 | 범용 ID 규칙(예: `SCR-카테고리-순번`) | High |
| 폴더 구조 | 루트 평면 | engine/config/templates/example 분리 | High |
| config 스키마 | `CATEGORIES`(코드 내) | `config/screens.js` 스키마(화면·연결·디바이스) | High |
| 화면 target 셀렉터 | 화면별 임의 | 스켈레톤 요소 식별 규칙(Description 매핑용) | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| (없음) | 정적 무빌드, 환경변수 불필요 | - | ☐ |

### 7.4 Pipeline Integration

해당 없음(Starter, 무빌드). PDCA Plan → Design → Do → Check 흐름으로 진행.

---

## 8. Next Steps

1. [ ] 본 Plan 컨펌
2. [ ] `/pdca design pdk-template` — config 스키마·커맨드 명세·엔진 리팩터링 설계 문서화
3. [ ] `feat/pdk-template` 브랜치에서 구현 시작 (`/pdca do`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-06-01 | 초안 작성 (커맨드 4종·엔진 일반화·클린 템플릿) | psh@thebestpay.co.kr |
