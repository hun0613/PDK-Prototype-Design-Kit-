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

### 유지보수 커맨드

| 커맨드 | 하는 일 |
|---|---|
| `/pdk-update` | PDK 원본(upstream)에서 **공통 부분(엔진·커맨드·템플릿·가이드)** 을 받아 반영. ① upstream 자동 등록 ② 코드·레이아웃 자동 동기화 ③ `RELEASES.md`의 구조/정책 변경 자동 마이그레이션 ④ **`custom/patches/` 내 공통 수정 자동 보존·재적용** ⑤ 완료 후 변경점(릴리즈노트) 요약 표시. 내 화면·설정 보존, 덮어쓰기 전 `.pdk-backup/` 백업 |
| `/pdk-custom` | 공통(`engine/` 등)에 직접 가한 **내 수정을 `custom/patches/`로 추출·보관**. 주로 `/pdk-update`를 처음 돌리기 **전에** 기존 공통 수정을 먼저 빼둘 때 사용 |

> **공통 파일을 직접 고쳤다면**: 먼저 **`/pdk-custom`** 으로 내 수정을 `custom/patches/`에 빼두세요.
> 그러면 `/pdk-update` 시 공통이 최신으로 갱신된 뒤 그 patch가 **자동 재적용**되어 내 수정이 보존됩니다.
> (자세한 규칙: [`custom/README.md`](custom/README.md))

> 비개발자는 **`/pdk-update` 한 번**만 실행하면 됩니다 — git 작업·구조 변경까지 알아서 처리됩니다.
> 현재 적용 버전은 `config/pdk-version.json`, 변경 이력은 `RELEASES.md`에서 확인할 수 있습니다.

#### (최초 1회) 기존 프로젝트에 PDK 커맨드 설치하기

`/pdk-update`·`/pdk-custom` 등이 아직 없는 기존 프로젝트는 **커맨드와 안내 문서만** 먼저 가져옵니다.
(전체 `git pull`은 ❌ — `config/screens.js`(내 화면) 등을 덮어쓰고 불필요한 변경까지 끌려옵니다.)

```bash
# 프로젝트의 origin이 PDK 원본 레포인 경우
git fetch origin
git checkout origin/main -- .claude/commands README.md custom/README.md

# origin이 내 레포인 경우 (PDK를 upstream으로 추가)
git remote add upstream http://git.hanuriit.co.kr/biz-planning/thebestpay-prototype-design-kit.git
git fetch upstream
git checkout upstream/main -- .claude/commands README.md custom/README.md
```

가져오는 것:
- `.claude/commands/` — **PDK 커맨드 전체**(`/pdk-update`, `/pdk-custom`, `/pdk-init` 등 최신본)
- `README.md` — 최신 가이드(이 문서)
- `custom/README.md` — 공통 커스터마이징(patch) 규칙

> 엔진·템플릿·`docs/GUIDE.md`·`RELEASES.md`·버전 기록은 **다음 단계 `/pdk-update`가 자동으로** 가져옵니다.
> (`config/pdk-version.json`은 일부러 받지 않습니다 — 없어야 `/pdk-update`가 "첫 적용"으로 보고 누적 변경을 모두 반영합니다.)

**다음 단계 (필수):**
1. 공통 파일을 직접 고친 적이 있으면 먼저 **`/pdk-custom`** — 내 수정을 `custom/patches/`로 보관
2. **`/pdk-update`** — 엔진·템플릿 최신화 + (있다면) custom 패치 자동 재적용 + 변경점(릴리즈노트) 표시

> 💡 **브랜치는 바뀌지 않습니다.** `git checkout <ref> -- <경로>` 처럼 `--` 뒤에 경로를 주면
> "그 경로만 가져오기"라서, **현재 브랜치 그대로** 해당 파일만 갱신(스테이징)됩니다.
> (`--` 없는 `git checkout <ref>` 는 브랜치 전환이니 혼동 주의.) `git fetch` 도 브랜치를 바꾸지 않습니다.
> 사용자는 있던 브랜치에서 그대로 커밋하면 됩니다. `/pdk-update` 도 같은 경로 지정 방식이라 브랜치를 바꾸지 않습니다.

> ⚠️ `.claude/commands` 를 통째로 가져와도, 그 디렉토리에 있는 **프로젝트 전용 커맨드는 지워지지 않습니다**
> (경로 지정 checkout은 upstream에 있는 파일만 갱신하고, 내 추가 파일은 그대로 둡니다).

> ⚠️ config 기반 구조(엔진이 `engine/` + `config/*.js`) **이전의 오래된 클론**이라면, 첫 `/pdk-update`는
> 단순 동기화가 아닌 **1회 마이그레이션**이 필요합니다 — 해당 변경을 `RELEASES.md`의 "마이그레이션"에
> 명세한 뒤 `/pdk-update`로 적용하거나, 한 번은 수동으로 맞춰 주세요.

> 📌 README는 평소 `/pdk-update`의 보존 대상(프로젝트별 수정 가능)이지만, **이 최초 설치 때는** 최신 가이드를
> 받기 위해 함께 가져옵니다. README를 직접 수정한 프로젝트라면 이 줄만 빼고 실행하세요.

#### (유지보수자) 공통 변경 배포 방법
1. 이 원본 레포에서 `engine`/`templates`/`.claude/commands` 등 공통 부분을 수정·커밋·푸시
2. 의미있는 변경이면 `RELEASES.md` 맨 위에 새 `## v<N>` 항목 추가
   - 단순 코드/레이아웃 변경 → 자동 동기화됨(요약만 기재)
   - 디렉토리/정책 등 구조 변경 → **마이그레이션 지시**를 명확히 기재(=> /pdk-update가 각 프로젝트에 수행)
3. 각 사용자는 `/pdk-update` 실행 → 자동 반영 + 변경점 확인

#### 개선 요청(공통에 반영하고 싶을 때)

이 레포는 **공통(framework) 작업용**입니다. 각 프로젝트에서 공통 부분을 개선해 보고
**모두에게 반영하고 싶다면**, 직접 이 레포를 고치는 대신:

1. 내 프로젝트의 **`custom/` 디렉토리를 압축**한다 (`custom/patches/*.patch` + `custom/README.md` 포함).
2. 압축 파일을 **유지보수자에게 전달**한다.
3. 유지보수자가 patch와 설명을 검토 → 일반적으로 유용하면 원본 공통(`engine/` 등)에 반영하고
   `RELEASES.md`에 기록 → 다음 `/pdk-update` 때 **모든 프로젝트에 전파**된다.
   (반영되면 그 프로젝트는 해당 patch가 더 이상 필요 없어진다.)

> 리뷰가 빠르도록 `custom/README.md`에 **대상 파일 / 변경 요약 / 변경 이유 / 일반·프로젝트 한정 여부**를
> 적어 주세요. (patch만으로도 내용은 읽히지만, 설명이 있으면 반영 판단이 정확해집니다.)

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
index.html             진입 화면 (초기엔 빈 골격, /pdk-init 이 생성·갱신)
docs/                  GUIDE, 설계·계획 문서
```

---

## 초기 상태 (빈 프로젝트)

클론 직후에는 **빈 상태**다 — `config/screens.js`에 화면이 없고, `index.html`은 빈 골격이다.
`index.html`을 열면 디바이스 목업과 3개 패널(페이지 목록·화면 플로우·Description)이 **비어 있는 채로** 나타난다.

여기서 위 [5분 퀵스타트](#5분-퀵스타트)대로 `/pdk-init` → `/pdk-screen` → … 순서로 자신의 화면설계서를 만든다.

---

## 화면의 3단계 성숙

```
/pdk-screen   →  화면 등록 (이름·ID만, 플로우/목록 자동)      designed: false
/pdk-wireframe →  스켈레톤 UI + 기능 Description (디자인 제외)  designed: false
/pdk-figma-sync → Figma 디자인 적용                            designed: true
```

> 디자인 디테일(색·폰트·간격 등)은 **Figma에서 관리**한다. 와이어프레임 단계에서는 다루지 않는다.
