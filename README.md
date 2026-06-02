# PDK — Prototype Design Kit

비개발자(기획자)가 **클론 → Claude 실행 → 슬래시 커맨드 5개**만으로
화면설계서(페이지 목록 + 유저플로우 + Description + 스켈레톤 + 피그마 디자인)를 만드는 **무빌드 정적 템플릿**.

- 빌드/서버 불필요 — HTML 파일을 브라우저로 열면 바로 동작
- 디바이스 목업 4종 내장(데스크탑 / 모바일 / 토스프론트2 / 반응형) + 커스텀 등록
- 화면 플로우·페이지 목록·Description은 **설정(config)에서 자동 생성**

---

## 5분 퀵스타트

1. 이 레포를 **클론/복제**한다.
2. 폴더에서 **Claude Code**를 실행한다.
3. 아래 커맨드를 **순서대로** 사용한다.

```
/pdk-init                                  # 프로젝트 이름·설명·디바이스 선택 → 빈 골격 생성
/pdk-mockup [디바이스명] [소스]            # (선택) 커스텀 디바이스 목업 추가
/pdk-screen [카테고리] [화면ID] [화면이름] # 화면을 유저플로우 순서대로 등록 (반복)
/pdk-wireframe [화면ID]                    # 화면별 스켈레톤 UI + 설명 자동 작성
/pdk-figma-sync [화면ID] [figma url]       # 스켈레톤에 Figma 디자인 입히기
```

4. `index.html`을 브라우저로 열어 결과를 확인한다.

> 미리보기 서버(선택): `python -m http.server 8124` 실행 후 http://localhost:8124

---

## 커맨드 5종

| 커맨드 | 하는 일 |
|---|---|
| `/pdk-init` | 이름·설명·디바이스(데스크탑/모바일/토스프론트2/반응형)를 받아 `config/project.js`와 `index.html` 빈 골격 생성 |
| `/pdk-mockup` | 이미지 폴더 또는 Figma URL을 참고해 커스텀 디바이스 목업(프레임+캔버스 규격)을 등록 |
| `/pdk-screen` | 카테고리·ID·이름 + 진입/이동(분기) 질문 → 화면 HTML 생성, 목록·플로우·Description 자동 갱신 |
| `/pdk-wireframe` | 대화형으로 스켈레톤 UI 구성 + Description 자동 작성(디자인 제외, 기능·흐름만) |
| `/pdk-figma-sync` | Figma 시안을 가져와 스켈레톤에 디자인 적용 (`designed: true`) |

자세한 단계별 사용법은 **[docs/GUIDE.md](docs/GUIDE.md)** 참고.

---

## 폴더 구조

```
config/                사용자가 채우는 단일 소스 (커맨드가 자동 갱신)
  project.js           프로젝트명·설명·선택 디바이스
  devices.js           디바이스 레지스트리(내장 4종 + 커스텀)
  screens.js           화면 메타·Description·플로우 연결
engine/                엔진(직접 수정 불필요)
  common.css           디바이스 목업 + 사이드바 + 스켈레톤 스타일
  common.js            페이지목록·플로우·Description 자동 렌더
templates/             화면/인덱스 골격 템플릿
.claude/commands/      슬래시 커맨드 5종
assets/                범용 아이콘 + 커스텀 목업 프레임(assets/mockups/)
index.html             현재 프로젝트의 진입 화면
preview-*.html         디바이스별 미리보기 샘플
samples/               디바이스 프레임 단독 데모
docs/                  GUIDE, 설계·계획 문서
```

---

## 포함된 예제

이 레포에는 **중립 샘플 화면설계서**(메인 → 상품목록 → 상품상세 → 결제 →〈성공/실패 분기〉→ 완료/실패)가
들어 있어, 클론 직후 바로 동작을 확인할 수 있다.

- 진입: `index.html` (또는 `preview-desktop.html` / `preview-mobile.html` / `preview-tossfront2.html` / `preview-responsive.html`)
- 새 프로젝트로 시작하려면 `/pdk-init`을 실행한다. (기존 샘플을 보존하려면 먼저 복사해 둘 것)

---

## 화면의 3단계 성숙

```
/pdk-screen   →  화면 등록 (이름·ID만, 플로우/목록 자동)      designed: false
/pdk-wireframe →  스켈레톤 UI + 기능 Description (디자인 제외)  designed: false
/pdk-figma-sync → Figma 디자인 적용                            designed: true
```

> 디자인 디테일(색·폰트·간격 등)은 **Figma에서 관리**한다. 와이어프레임 단계에서는 다루지 않는다.
