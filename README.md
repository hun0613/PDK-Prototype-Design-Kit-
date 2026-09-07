# PDK — Prototype Design Kit

비개발자(기획자)가 **클론 → Claude Code 실행 → 슬래시 커맨드**만으로
화면설계서(페이지 목록 · 유저플로우 · Description · 와이어프레임 · Figma 디자인)를 만드는 **무빌드 정적 템플릿**.

- 빌드·서버 불필요 — HTML을 브라우저로 열면 바로 동작
- 디바이스 목업 4종 내장(데스크탑 / 모바일 / 토스프론트2 / 반응형) + 커스텀 등록
- 페이지 목록 · 플로우 · Description은 `config/` 에서 **자동 생성**

---

## 5분 퀵스타트

1. 이 레포를 클론한다.
2. 폴더에서 **Claude Code**를 실행한다.
3. 커맨드를 순서대로 사용한다.

```
/pdk-init                                  # 이름·설명·디바이스 → 빈 골격 생성
/pdk-mockup [디바이스명] [소스]            # (선택) 커스텀 디바이스 목업 추가
/pdk-screen [카테고리] [화면ID] [화면이름] # 화면 등록 (유저플로우 순서대로 반복)
/pdk-flow   [플로우ID] [플로우이름]        # 기능 단위 플로우 등록
/pdk-wireframe  [화면ID]                   # 흑백 와이어프레임 UI + Description
/pdk-figma-sync [화면ID] [figma url]       # Figma 디자인 적용
```

4. `index.html`을 브라우저로 열어 확인한다.

> 클론 직후는 **빈 상태**다 — 등록된 화면이 없고 `index.html`은 빈 골격이다.
> `/pdk-init`이 PDK 원본과의 push 연결(`origin`)을 끊고, 내 레포 주소를 주면 그걸로 바꾼다.
> 미리보기 서버(선택): `python -m http.server 8124` → http://localhost:8124
> **단계별 사용법 → [docs/GUIDE.md](docs/GUIDE.md)**

---

## 커맨드

| 커맨드 | 하는 일 |
|---|---|
| `/pdk-init` | 이름·설명·디바이스·PRD 문서·push 레포를 받아 `config/project.js` 와 `index.html` 빈 골격 생성 |
| `/pdk-mockup` | 이미지 폴더나 Figma URL을 참고해 커스텀 디바이스 목업 등록 |
| `/pdk-screen` | 화면 등록 + 진입·이동(분기) 연결. 대화 중 언급된 미등록 화면도 **즉시 생성** |
| `/pdk-flow` | 기능 단위 여정 정의 → 다이어그램 필터링. 여정 순서대로 이동(간선)도 확인 후 연결 |
| `/pdk-wireframe` | 흑백 와이어프레임 UI(실제 문구·컴포넌트) + Description 자동 작성. 조건 분기는 목업 위 라디오로 전환 |
| `/pdk-figma-sync` | Figma 시안을 와이어프레임에 적용 (`designed: true`) |

### 유지보수

| 커맨드 | 하는 일 |
|---|---|
| `/pdk-update` | PDK 원본의 공통 부분(엔진·커맨드·템플릿·문서)을 받아 반영. 내 화면·설정은 보존, 덮어쓰기 전 백업 |
| `/pdk-custom` | 공통 파일에 가한 내 수정을 `custom/patches/` 로 추출·보관 |

> 공통 파일을 직접 고쳤다면 **`/pdk-custom` → `/pdk-update`** 순서로. 최신화 후 내 수정이 자동 재적용된다.
> 현재 버전은 `config/pdk-version.json`, 변경 이력은 [`RELEASES.md`](RELEASES.md).

**기존 프로젝트에 커맨드만 먼저 설치 (최초 1회)** — 전체 `git pull` 은 ❌ (내 화면을 덮어쓴다)

```bash
git fetch upstream        # origin이 PDK 원본이면 origin 으로
git checkout upstream/main -- .claude/commands README.md custom/README.md
```

이후 `/pdk-custom`(공통을 고쳤다면) → `/pdk-update`.
**자세한 절차와 주의사항 → [docs/UPDATING.md](docs/UPDATING.md)**

---

## 폴더 구조

```
config/                사용자가 채우는 단일 소스 (커맨드가 자동 갱신)
  project.js           프로젝트명·설명·선택 디바이스
  devices.js           디바이스 레지스트리(내장 4종 + 커스텀)
  screens.js           화면 메타·Description·플로우 연결
  flows.js             기능 플로우 정의(화면 상위 그룹 · 다이어그램 필터링)
engine/                엔진 — 목업·사이드바·플로우·Description 자동 렌더 (직접 수정 불필요)
pages/                 화면 HTML (/pdk-screen 이 생성 — index.html 외 모든 페이지)
templates/             화면/인덱스 골격 템플릿
.claude/commands/      슬래시 커맨드
assets/                범용 아이콘 + 커스텀 목업 프레임(assets/mockups/)
index.html             진입 화면 (/pdk-init 이 생성·갱신)
docs/                  가이드·업데이트·설계 문서
```

---

## 화면의 3단계 성숙

```
/pdk-screen     →  화면 등록 (이름·ID, 플로우·목록 자동)        designed: false
/pdk-wireframe  →  흑백 와이어프레임 UI + Description           designed: false
/pdk-figma-sync →  Figma 디자인 적용(색·이미지·브랜드)           designed: true
```

> 디자인 디테일(색·폰트·간격)은 **Figma에서 관리**한다. 와이어프레임 단계에서는 다루지 않는다.

---

## 더 보기

- [docs/GUIDE.md](docs/GUIDE.md) — 비개발자용 단계별 가이드
- [docs/UPDATING.md](docs/UPDATING.md) — 업데이트 · 기존 프로젝트에 커맨드 설치
- [docs/MAINTAINING.md](docs/MAINTAINING.md) — (유지보수자) 공통 변경 배포 · 개선 요청
- [custom/README.md](custom/README.md) — 공통 커스터마이징(patch) 규칙
- [RELEASES.md](RELEASES.md) — 변경 이력
