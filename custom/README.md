# custom/ — 공통(framework) 커스터마이징 보관소

이 디렉토리는 **`/pdk-update`의 공통 동기화(덮어쓰기) 대상**(`engine/`, `templates/`,
`.claude/commands/`, `docs/GUIDE.md`, `RELEASES.md`)에 가한 **이 프로젝트 고유의 변경**을
patch로 보관·관리하는 곳이다.

> `custom/` 은 `/pdk-update` 매니페스트에 없으므로 **업데이트 시 덮어쓰이지 않는다.**
> 변경분을 patch로 남겨두면, 공통 파일이 upstream으로 갱신돼도 안전하게 재적용된다.

---

## 왜 필요한가
- `engine/` 등 공통 파일은 `/pdk-update` 실행 시 upstream 버전으로 **덮어써진다.**
- 이 프로젝트에서 공통 파일을 직접 수정한 부분이 있으면, 업데이트 후 그 변경이 사라진다.
- 변경분을 `custom/patches/*.patch` 로 기록해 두면 → 업데이트 후 자동 재적용으로 복구된다.

## `/pdk-update` 와의 연동 (자동)
- **동기화 전**: 아직 patch로 빼지 않은 공통 직접수정이 있으면 감지해 `custom/patches/` 로 추출(보존).
- **동기화 후**: `custom/patches/*.patch` 를 순정 공통 위에 자동 재적용
  (`git apply --check` → `git apply`, 실패 시 `git apply --3way`). 충돌은 사용자에게 보고.

## 패치 만들기 / 갱신 (공통 파일을 직접 손봤을 때)
```bash
mkdir -p custom/patches
# upstream 기준(HEAD)과의 현재 차이를 파일별로 추출
git diff HEAD -- engine/common.js > custom/patches/engine-common.js.patch
```
파일명은 대상 경로를 알아볼 수 있게(예: `engine-common.js.patch`, `engine-common.css.patch`).

## 수동 재적용 (필요 시)
```bash
git apply --check custom/patches/engine-common.js.patch   # 적용 가능 확인(출력 없으면 OK)
git apply        custom/patches/engine-common.js.patch     # 적용
git apply --3way custom/patches/engine-common.js.patch     # 충돌 시 3-way 시도
```

## 보관하지 않는 것
- 화면 데이터(`config/screens.js`)와 화면 HTML(`*.html`)은 `/pdk-update`의 **보존 대상**이라
  덮어쓰이지 않으므로 여기서 관리하지 않는다.

## 장기 권장
- 이 커스터마이징이 일반적으로 유용하면, **upstream PDK 원본에 직접 반영(기여)** 하는 것이 가장 깔끔하다
  (그러면 patch 재적용 자체가 불필요).
