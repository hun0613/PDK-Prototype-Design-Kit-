---
description: 공통(framework) 최신화 — PDK 원본(upstream)에서 엔진·커맨드·템플릿을 받아 내 프로젝트에 반영(내 화면·설정은 보존)
argument-hint: (인자 없음 · 선택: 브랜치명)
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
---

# /pdk-update — 공통 부분 최신화

PDK 원본 레포(upstream)에서 **공통 부분(엔진·커맨드·템플릿·가이드)** 만 최신으로 받아 현재 프로젝트에 반영한다.
**내 화면·설정(config, *.html, index.html, 커스텀 목업)은 절대 건드리지 않는다.** 덮어쓰기 전 백업한다.

> 전제: 현재 프로젝트는 git 저장소이며 네트워크로 PDK 원본에 접근 가능.
> 사용 도구: Bash(git), Read/Write/Glob, AskUserQuestion.

## 공통 경로 매니페스트 (덮어쓰기 대상)
```
engine/                 # 레이아웃·기능 엔진 (common.css, common.js)
templates/              # 화면/인덱스 골격 템플릿
.claude/commands/       # 슬래시 커맨드 5종 + 이 커맨드 자신
docs/GUIDE.md           # 사용 가이드
```

## 보존 대상 (절대 안 건드림)
```
config/project.js, config/screens.js, config/devices.js   # 내 설정·디바이스(커스텀 포함)
index.html, *.html                                        # 내 화면
assets/mockups/                                           # 내 커스텀 목업
README.md                                                 # 프로젝트별로 다를 수 있어 자동 갱신 제외
```

## 절차

### 1) upstream 원격 확인/설정
```bash
git remote
```
- `upstream` 원격이 없으면 사용자에게 **PDK 원본 레포 URL**을 묻는다(기본 제안:
  `http://git.hanuriit.co.kr/biz-planning/thebestpay-prototype-design-kit.git`).
  ```bash
  git remote add upstream <URL>
  ```
- 브랜치는 인자 `$1`이 있으면 그것, 없으면 `main`.

### 2) 최신 가져오기
```bash
git fetch upstream
```
- 동기화 대상 커밋 확인: `git rev-parse --short upstream/<branch>` (보고용).

### 3) 변경 미리 확인
```bash
git diff --stat upstream/<branch> -- engine templates .claude/commands docs/GUIDE.md
```
- 바뀌는 공통 파일이 없으면 "이미 최신입니다" 안내하고 종료.

### 4) 백업 (덮어쓰기 전)
- 매니페스트 경로 중 **현재 프로젝트에 존재하는 파일**을 `.pdk-backup/<타임스탬프>/` 아래 동일 구조로 복사.
  (`.pdk-backup/`은 .gitignore됨)
- Bash 예: `mkdir -p .pdk-backup/<ts>/engine && cp -r engine .pdk-backup/<ts>/ ...` (존재하는 경로만).

### 5) 공통 파일 반영 (upstream 기준으로 교체)
```bash
git checkout upstream/<branch> -- engine templates .claude/commands docs/GUIDE.md
```
- 이렇게 하면 워킹트리+인덱스가 upstream 버전으로 갱신된다(스테이징됨). **보존 대상 경로는 매니페스트에 없으므로 그대로 유지.**
- 만약 upstream에서 삭제된 공통 파일이 있어 충돌/잔존이 의심되면 사용자에게 알린다(자동 삭제는 하지 않음).

### 6) 결과 보고
- 동기화한 upstream 커밋(short hash), 변경된 파일 목록, 백업 위치를 요약.
- "내 화면·설정은 보존됨"을 명시.
- 검토 후 커밋하도록 안내: `git add -A && git commit -m "chore: PDK 공통 최신화(upstream <hash>)"`.
- 브라우저에서 화면을 열어 레이아웃·기능이 정상인지 확인하도록 안내(엔진 캐시버스트 로더가 있어 새로고침만으로 반영됨).

## 주의
- **보존 대상(config·*.html·index.html·assets/mockups·README)은 절대 덮어쓰지 않는다.**
- 덮어쓰기 전 반드시 백업한다(`.pdk-backup/`).
- `config/devices.js`의 내장 디바이스 규격이 원본에서 바뀐 경우는 자동 병합하지 않는다 → 필요 시 백업본과 비교해 수동 반영하도록 안내.
- 네트워크/git 미설정이면 그 사실을 알리고 중단(임의로 파일을 생성·삭제하지 않는다).
