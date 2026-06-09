---
description: 공통(framework) 최신화 — upstream에서 코드·레이아웃을 받아 반영하고, 릴리즈노트의 정책/구조 변경까지 자동 적용 후 변경점 요약 표시
argument-hint: (인자 없음 · 선택: 브랜치명)
allowed-tools: Read, Write, Edit, Bash, Glob
---

# /pdk-update — 공통 부분 최신화 (올인원)

비개발자가 **이 커맨드 하나만 실행**하면 PDK 원본(upstream)의 공통 변경을 알아서 받아 반영한다.
코드·레이아웃 변경은 파일 동기화로, 디렉토리/정책 등 구조 변경은 **릴리즈노트(`RELEASES.md`)** 지시대로 자동 수행한다.
완료 후 **무엇이 바뀌었는지 릴리즈노트 요약을 보여준다.** 내 화면·설정은 보존하고, 덮어쓰기 전 백업한다.

> 사용 도구: Bash(git), Read/Write/Glob. 사용자에게 git을 시키지 않는다 — 모든 git 작업은 이 커맨드가 수행.

## 고정값
- PDK 원본 URL: `http://git.hanuriit.co.kr/biz-planning/thebestpay-prototype-design-kit.git`
- 동기화 브랜치: 인자 `$1` 있으면 그것, 없으면 `main`
- 버전 파일: `config/pdk-version.json` (현재 프로젝트가 적용한 마지막 릴리즈)

## 공통 경로 매니페스트 (코드 동기화 = 덮어쓰기)
```
engine/                 # 레이아웃·기능 엔진
templates/              # 화면/인덱스 골격 템플릿
.claude/commands/       # 슬래시 커맨드 (이 커맨드 자신 포함)
docs/GUIDE.md           # 사용 가이드
RELEASES.md             # 릴리즈노트(읽기 + 사용자 사본 갱신)
```

## 보존 대상 (절대 안 건드림)
```
config/project.js, config/screens.js, config/devices.js   # 내 설정·디바이스
config/pdk-version.json                                    # 내 버전 기록(이 커맨드가 갱신)
index.html, *.html, assets/mockups/, README.md            # 내 화면·자산·프로젝트 README
```

## 절차 (순서대로 — 사용자 개입 없이 자동)

### 1) upstream 자동 등록
```bash
git remote get-url upstream 2>/dev/null
```
- 없으면 **자동으로 추가**(묻지 않음):
  ```bash
  git remote add upstream http://git.hanuriit.co.kr/biz-planning/thebestpay-prototype-design-kit.git
  ```
- 현재 프로젝트가 git 저장소가 아니거나 네트워크 불가면, 그 사실만 알리고 중단(파일을 임의 생성·삭제하지 않음).

### 2) 최신 가져오기
```bash
git fetch upstream
```
- 대상 커밋: `git rev-parse --short upstream/<branch>` (보고용).

### 3) 현재/최신 버전 파악
- 현재: `config/pdk-version.json` 의 `release` (파일 없으면 첫 적용으로 간주 → 모든 릴리즈노트가 "새 항목").
- 최신: upstream의 `RELEASES.md` 최상단 `## v<N>` 버전. (`git show upstream/<branch>:RELEASES.md`)
- 이미 같은 버전이고 변경 파일도 없으면 "이미 최신입니다" 안내 후 종료.

### 4) 백업
- 매니페스트 경로 중 현재 존재하는 것을 `.pdk-backup/<타임스탬프>/` 에 동일 구조로 복사(`.pdk-backup/`은 gitignore됨).

### 5) 코드·레이아웃 반영 (파일 동기화)
```bash
git checkout upstream/<branch> -- engine templates .claude/commands docs/GUIDE.md RELEASES.md
```
- 워킹트리+인덱스가 upstream 버전으로 갱신(스테이징). 보존 대상은 매니페스트에 없으므로 유지.

### 6) 정책/구조 마이그레이션 (릴리즈노트 지시 수행)
- 이제 로컬 `RELEASES.md`(방금 최신화됨)를 읽는다.
- **현재 버전(3에서 파악)보다 위(최신)인 모든 `## v<N>` 항목**을 오래된 것 → 새것 순으로 처리:
  - 각 항목의 **"마이그레이션(필요 시)"** 섹션 지시를 현재 프로젝트에 **그대로 수행**한다.
    예: 디렉토리 이동/이름변경, `config/*.js` 스키마 필드 변경, 파일 분리/병합 등.
  - 지시가 "없음"이면 건너뛴다.
  - 마이그레이션은 **사용자 화면/설정 데이터를 보존**하는 방향으로 적용한다(데이터 유실 금지). 5)의 백업이 안전망.
  - 지시가 모호하거나 데이터 유실 위험이 크면, 그 항목만 보류하고 사용자에게 알린다(나머지는 진행).

### 7) 버전 기록 갱신
- `config/pdk-version.json` 을 최신으로:
  ```json
  { "release": "v<최신N>", "commit": "<upstream short hash>", "updatedAt": "<오늘 날짜>" }
  ```

### 8) 변경점 요약 표시 (릴리즈노트 출력)
- 3)의 현재 버전 이후 새로 적용된 모든 릴리즈 항목의 **"요약"** 을 프롬프트에 보기 좋게 출력한다.
- 함께 보고: 동기화한 upstream 커밋 hash, 변경된 파일 목록, 수행한 마이그레이션, 백업 위치.
- 마지막에 안내: 검토 후 커밋(`git add -A && git commit -m "chore: PDK 공통 최신화 v<N>"`), 브라우저 새로고침으로 반영 확인(엔진 캐시버스트 로더 적용됨).

## 주의
- 보존 대상은 절대 덮어쓰지 않는다. 덮어쓰기 전 항상 백업한다.
- 모든 git 작업은 이 커맨드가 수행한다(비개발자는 `/pdk-update`만 입력).
- 마이그레이션은 릴리즈노트의 지시를 단일 출처로 삼는다(임의 구조 변경 금지).
