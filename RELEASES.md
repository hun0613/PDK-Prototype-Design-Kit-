# PDK 릴리즈 노트 (Release Notes)

> `/pdk-update` 가 이 파일을 읽어 **새 버전의 변경사항을 반영**하고, 완료 후 요약을 사용자에게 보여준다.
> 각 프로젝트의 현재 버전은 `config/pdk-version.json` 의 `release` 값에 기록된다.
>
> **유지보수자(원본 작성자)용 작성 규칙**
> - 공통(framework)을 의미있게 바꿀 때마다 맨 위에 새 `## v<N>` 항목을 추가한다(내림차순).
> - **요약**: 사용자에게 보여줄 한국어 변경 요약.
> - **코드 변경(자동)**: 단순 코드/레이아웃 변경은 `/pdk-update`의 파일 동기화로 자동 반영되므로 설명만.
> - **마이그레이션(필요 시)**: 디렉토리 개편·설정 스키마 변경 등 *파일 동기화만으론 안 되는* 작업을
>   `/pdk-update`(Claude)가 사용자 프로젝트에 수행하도록 **명확한 지시**로 적는다. 없으면 "없음".
> - 형식을 지키면 비개발자는 `/pdk-update` 한 번으로 자동 적용된다.

---

<!-- 새 릴리즈는 이 줄 아래에 추가 -->

## v3 — /pdk-custom 커맨드 추가 (내 공통 수정 추출·보관) (2026-06-09)

### 요약
- 공통 파일을 직접 고쳤다면, `/pdk-update` 전에 **`/pdk-custom`** 으로 내 수정을 `custom/patches/`에 미리 빼둘 수 있습니다.
- baseline(merge-base) 기준으로 "내 수정만" 정확히 추출 → 이후 `/pdk-update`가 자동 재적용.

### 코드 변경(자동)
- `.claude/commands/pdk-custom.md` 추가.
- README: 유지보수 커맨드 표에 `/pdk-custom` 추가.

### 마이그레이션(필요 시)
- 없음(커맨드 추가). `/pdk-update`로 커맨드가 배포되면 바로 사용 가능.

## v2 — /pdk-update custom 패치 보존·재적용 (2026-06-09)

### 요약
- 공통 파일(`engine/` 등)을 이 프로젝트에서 직접 고쳤어도 `/pdk-update` 시 사라지지 않습니다.
- `custom/patches/*.patch` 에 보관된 내 수정이 **업데이트 후 자동으로 다시 적용**됩니다.
- 업데이트 전, 아직 patch로 빼지 않은 공통 직접수정은 자동 감지해 `custom/`으로 추출·보존합니다.

### 코드 변경(자동)
- `.claude/commands/pdk-update.md`: 동기화 전 추출(4.5) + 동기화 후 `git apply`/`--3way` 재적용(5.5), `custom/` 보존 대상 추가.
- `custom/README.md`: 커스터마이징 patch 보관 규칙 문서.

### 마이그레이션(필요 시)
- 없음. `custom/` 디렉토리는 필요 시 자동 생성된다. 기존에 공통 파일을 직접 수정한 프로젝트는
  다음 `/pdk-update` 때 그 수정이 자동으로 `custom/patches/`로 추출된 뒤 재적용된다.

## v1 — 초기 릴리즈 (2026-06-09)

### 요약
- PDK(Prototype Design Kit) 기본 구성: 엔진(목업·플로우·Description), 커맨드 5종(init/mockup/screen/wireframe/figma-sync), `/pdk-update`.

### 코드 변경(자동)
- 해당 없음(초기 버전).

### 마이그레이션(필요 시)
- 없음.
