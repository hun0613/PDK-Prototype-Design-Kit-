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

## v6 — /pdk-update 공통수정 자동감지 정확도 개선 (2026-06-09)

### 요약
- `/pdk-update`가 custom에 아직 안 넣은 공통 직접수정을 **커밋 여부와 무관하게** 감지해 `custom/patches/`로 자동 보존합니다.
- baseline을 `git diff HEAD`(커밋 안 한 것만) → **`merge-base`(내 시작/마지막 동기화 버전) 기준**으로 변경해, 이미 커밋한 공통 수정도 누락 없이 추출합니다.

### 코드 변경(자동)
- `.claude/commands/pdk-update.md` 4.5단계(자동 추출) 로직 보강.

### 마이그레이션(필요 시)
- 없음.

## v5 — 시스템 문의 푸터 문구·여백 조정 (2026-06-09)

### 요약
- 푸터 문구에서 "시스템개발자" 제거 → "시스템 관련 문의: 박성훈 (psh@thebestpay.co.kr)".
- 하단 여백 확대(bottom 6px → 16px).

### 코드 변경(자동)
- `engine/common.js`, `engine/common.css` (푸터 문구·여백).

### 마이그레이션(필요 시)
- 없음.

## v4 — 하단 시스템 문의 푸터 추가 (2026-06-09)

### 요약
- 모든 화면 하단 중앙에 작은 안내 문구 추가: "시스템 관련 문의: 시스템개발자 박성훈 (psh@thebestpay.co.kr)".
- 저작권 표기처럼 아주 작게(10px·연회색), 상호작용은 방해하지 않음(pointer-events 없음).

### 코드 변경(자동)
- `engine/common.js`: `injectFooter()` 추가(전 화면 자동 주입).
- `engine/common.css`: `.pdk-sys-footer` 스타일 추가.

### 마이그레이션(필요 시)
- 없음.

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
