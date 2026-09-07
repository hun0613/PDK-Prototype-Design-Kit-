# 업데이트 · 최초 설치

PDK 원본(upstream)의 공통 부분을 내 프로젝트에 받아 오는 방법.
평소에는 **`/pdk-update` 한 번**이면 되고, 이 문서는 그때 알아 두면 좋은 것들을 모아 둔 것이다.

---

## 평소 — `/pdk-update`

```
/pdk-update
```

한 번 실행하면 순서대로 자동 수행된다.

1. upstream 자동 등록 (`git remote add`까지 커맨드가 한다)
2. 공통 부분(엔진·커맨드·템플릿·가이드) 동기화
3. `RELEASES.md`의 구조/정책 변경 **자동 마이그레이션**
4. `custom/patches/` 에 보관된 내 공통 수정 **자동 재적용**
5. 변경점(릴리즈노트) 요약 표시

- **내 화면·설정은 건드리지 않는다** — `config/*.js`, `index.html`, `pages/`, `assets/mockups/`, `README.md`
- 덮어쓰기 전 `.pdk-backup/<타임스탬프>/` 에 백업한다
- 현재 적용 버전은 `config/pdk-version.json`, 전체 이력은 [`RELEASES.md`](../RELEASES.md)
- git 작업은 커맨드가 전부 처리한다 — 직접 `git pull` 할 필요 없다

## 공통 파일을 직접 고쳤다면 — `/pdk-custom` 먼저

`engine/` 같은 공통 파일은 `/pdk-update` 때 **덮어써진다.**
직접 고친 게 있으면 먼저 빼둔다.

```
/pdk-custom     # 내 수정을 custom/patches/*.patch 로 추출
/pdk-update     # 최신화 → 그 patch를 자동 재적용
```

- `/pdk-update`도 아직 안 빼둔 공통 수정을 감지해 자동 추출하지만, **먼저 `/pdk-custom`을 돌리는 편이 안전**하다.
- patch 작성·재적용 규칙: [`custom/README.md`](../custom/README.md)
- 충돌이 나면 어떤 파일인지 보고되며, 백업(`.pdk-backup/`)과 patch 파일이 그대로 남는다.

---

## 최초 1회 — 기존 프로젝트에 커맨드 설치

`/pdk-update`·`/pdk-custom` 이 아직 없는 오래된 클론은 **커맨드와 안내 문서만** 먼저 가져온다.

> ❌ 전체 `git pull` 은 하지 않는다 — `config/screens.js`(내 화면) 등을 덮어쓰고 불필요한 변경까지 끌려온다.

```bash
# origin이 PDK 원본 레포인 경우
git fetch origin
git checkout origin/main -- .claude/commands README.md custom/README.md

# origin이 내 레포인 경우 (PDK를 upstream으로 추가)
git remote add upstream http://git.hanuriit.co.kr/biz-planning/thebestpay-prototype-design-kit.git
git fetch upstream
git checkout upstream/main -- .claude/commands README.md custom/README.md
```

가져오는 것:

| 경로 | 내용 |
|---|---|
| `.claude/commands/` | PDK 커맨드 전체 (`/pdk-update`·`/pdk-custom`·`/pdk-init` …) |
| `README.md` | 최신 개요 |
| `custom/README.md` | 공통 커스터마이징(patch) 규칙 |

엔진·템플릿·`docs/`·`RELEASES.md`·버전 기록은 **다음 단계 `/pdk-update` 가 자동으로** 가져온다.

**다음 단계 (필수)**
1. 공통 파일을 고친 적이 있으면 → `/pdk-custom`
2. → `/pdk-update`

### 알아 둘 것

- **브랜치는 바뀌지 않는다.** `git checkout <ref> -- <경로>` 처럼 `--` 뒤에 경로를 주면 "그 경로만 가져오기"라
  현재 브랜치 그대로 해당 파일만 갱신된다. (`--` 없는 `git checkout <ref>` 는 브랜치 전환이니 혼동 주의.)
  `git fetch` 도, `/pdk-update` 도 브랜치를 바꾸지 않는다.
- **프로젝트 전용 커맨드는 지워지지 않는다.** `.claude/commands` 를 통째로 가져와도 upstream에 있는 파일만
  갱신되고, 내가 추가한 커맨드는 그대로 남는다.
- **`config/pdk-version.json` 은 일부러 받지 않는다.** 없어야 `/pdk-update`가 "첫 적용"으로 보고
  누적된 변경을 모두 반영한다.
- **README를 직접 수정한 프로젝트**라면 위 명령에서 `README.md` 만 빼고 실행한다.
  (README는 평소 `/pdk-update`의 보존 대상이라 덮어써지지 않는다. 최초 설치 때만 최신 개요를 받으려고 포함한 것.)
- **아주 오래된 클론**(엔진이 `engine/` + `config/*.js` 구조가 아니던 시절)이라면 첫 `/pdk-update`가
  단순 동기화로 끝나지 않는다. 해당 변경을 `RELEASES.md`의 "마이그레이션"에 명세한 뒤 적용하거나,
  한 번은 수동으로 구조를 맞춰 준다.
