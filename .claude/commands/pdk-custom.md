---
description: 내 공통 수정 보관 — 공통(engine 등)에 직접 가한 변경을 custom/patches로 추출해 둠(업데이트 후 자동 재적용 대상)
argument-hint: (인자 없음 · 선택: 브랜치명)
allowed-tools: Read, Write, Edit, Bash, Glob
---

# /pdk-custom — 내 공통 수정을 custom/으로 추출·보관

공통 파일(`engine/`, `templates/`, `.claude/commands/`, `docs/GUIDE.md`)에 **이 프로젝트에서 직접 가한 변경**을
`custom/patches/*.patch` 로 떠서 보관한다. 이렇게 해두면 나중에 `/pdk-update`가 공통을 최신으로 덮어써도
그 patch를 **자동 재적용**해 내 수정이 보존된다.

> 언제 쓰나: `/pdk-update`를 처음 돌리기 **전에**, 이미 공통을 고쳐둔 내용을 먼저 custom으로 빼두고 싶을 때.
> (업데이트 도중에도 자동 추출되지만, 이 커맨드로 **미리·명시적으로** 보관할 수 있다.)
> 사용 도구: Bash(git), Read/Write/Glob.

## 공통 경로 (추출 대상)
```
engine/  templates/  .claude/commands/  docs/GUIDE.md
```

## 절차

### 1) upstream 보장 + 최신 참조
```bash
git remote get-url upstream 2>/dev/null || \
  git remote add upstream http://git.hanuriit.co.kr/biz-planning/thebestpay-prototype-design-kit.git
git fetch upstream
```
- 브랜치: 인자 `$1` 있으면 그것, 없으면 `main`. git 저장소/네트워크 불가면 알리고 중단.

### 2) baseline 결정 (★중요)
- "내 수정만" 정확히 추출하려면, **내가 시작한 upstream 버전**을 기준으로 diff해야 한다.
  ```bash
  git merge-base HEAD upstream/<branch>
  ```
- merge-base를 baseline으로 사용한다. (구할 수 없으면 `upstream/<branch>`를 baseline으로 쓰되,
  내 파일이 옛 버전이면 업데이트 차이가 섞일 수 있음을 사용자에게 경고.)

### 3) 변경된 공통 파일 찾기
```bash
git diff --name-only <baseline> -- engine templates .claude/commands docs/GUIDE.md
```
- 변경이 없으면 "추출할 공통 수정이 없습니다" 안내 후 종료.
- `.claude/commands/` 의 `pdk-*` 표준 커맨드를 직접 고친 경우만 대상(프로젝트 전용 커맨드는 어차피 보존됨).

### 4) patch로 추출
```bash
mkdir -p custom/patches
# 변경된 파일마다 (파일명은 경로의 / 를 - 로 치환)
git diff <baseline> -- engine/common.js > custom/patches/engine-common.js.patch
```
- 이미 같은 이름의 patch가 있으면 사용자에게 알리고 **갱신(덮어쓰기)** 여부 확인.
- 원본 작업 파일은 **그대로 둔다**(내 수정 유지). patch는 보존용 사본이다.

### 5) custom/README.md 갱신
- `custom/README.md` 가 없으면 생성(보관 규칙 설명).
- 추출한 각 patch에 대해 **대상 파일 / 변경 요약 / 변경 이유 / 일반·프로젝트 한정 여부** 를 기록한다.
  - 변경 요약·이유는 diff를 읽고 초안을 만들되, 모호하면 사용자에게 한 줄 확인.
  - 이 메타데이터는 나중에 개선 요청(기여) 시 유지보수자 리뷰를 빠르게 한다.

### 6) 보고
- 추출된 patch 목록(대상 파일)과 위치(`custom/patches/`)를 요약.
- 다음 단계 안내: 이제 `/pdk-update` 를 실행하면 공통이 최신으로 갱신된 뒤 이 patch들이 자동 재적용된다.
- 이 커스터마이징을 모두에게 반영하고 싶으면 `custom/` 을 압축해 유지보수자에게 전달(README 참고).

## 주의
- baseline은 반드시 **merge-base**(내 시작점)로 — 그래야 업데이트 내용이 아닌 *내 수정만* 떠진다.
- 추출은 작업 파일을 바꾸지 않는다(읽기+패치 저장만).
- 화면 데이터(`config/screens.js`)·화면 HTML(`*.html`)은 `/pdk-update` 보존 대상이라 custom 추출 불필요.
