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

## v23 — 작은 화면(노트북) 레이아웃 겹침 해결 (2026-10-01)

### 요약
- 노트북처럼 작은 화면에서 **목업이 아래로 밀려 잘리고**, **오른쪽 패널이 목업을 덮거나 서로 겹치던** 문제를 고쳤습니다.
  1280×620 · 1366×657 · 1440×789 · 1920×1080 (브라우저 실제 표시 영역)에서 겹침 0 을 확인했습니다.
- **목업이 실제로 남는 공간 안에서 가운데 맞춰집니다** — 상단 바 아래 · 페이지 목록 오른쪽 · 오른쪽 패널 왼쪽 · 하단 문의 문구 위.
  - 원인: 목업을 `transform: scale` 로 줄이면 보이는 크기만 작아지고 **자리는 원래 크기로 남아**, 그 중심에 그려진 목업이 아래로 밀렸습니다.
    또 화면 전체 폭 기준으로 가운데 정렬해 왼쪽 목록(280px)과 오른쪽 패널(436px)을 제대로 빼지 않았습니다.
- **오른쪽 패널이 한 열로 정리됩니다** — Description(위, 내용만큼 · 최대 절반) + Flow(아래, 나머지), 간격 12px.
  한쪽을 닫으면 다른 쪽이 열 전체를 쓰고, 둘 다 닫으면 목업 영역이 오른쪽 끝까지 넓어집니다.
- 드래그로 **떼어낸 패널은 지금처럼 자유 배치**이며 열에서 빠집니다(남은 패널이 열을 차지).
- 창 크기 변경 · 패널 열기/닫기 · 떼어내기 · 반응형 디바이스 전환 때마다 다시 배치합니다.
- 하단 시스템 문의 문구가 목업 영역 아래 가운데로 옮겨져 목업과 겹치지 않습니다.

### 코드 변경(자동)
- `engine/common.js`: `fitStage()`(스테이지 영역 계산 + 목업을 `.device-fit` 래퍼로 감싸 줄인 크기만큼만 자리 차지),
  `layoutDock()`(오른쪽 열 배치), `watchLayout()`(resize · 패널 class/떼어내기 감시 → 재배치).
  기존 `applyDevice()` 안의 `fit()` 은 `fitStage()` 로 교체. 케이스 패널의 상단 여백 인라인 계산 제거(스테이지가 처리).
- `engine/common.css`: `.device-stage.is-fitted`(고정 영역 · `--pdk-stage-*` 변수), `.device-fit`, 문의 문구 위치.

### 마이그레이션(필요 시)
- 없음. 화면 HTML 구조는 그대로이며 엔진이 실행 시 `.device-mockup` 을 `.device-fit` 으로 감싼다.
- 화면 HTML 에서 `.device-stage > .device-mockup` 처럼 **직속 자식 선택자**로 목업을 지정한 커스텀 CSS 가 있다면
  `.device-stage .device-mockup` 으로 바꾼다(래퍼가 하나 끼므로).

## v22 — 기능명세서 (/pdk-description · 상단 바 표 모달 · Description 자동 연결) (2026-10-01)

### 요약
- **`/pdk-description [화면ID]` 커맨드를 추가했습니다.** 화면을 그리기 전에, 그 화면의 기능을
  **기능명세서(엑셀 양식과 같은 표)** 로 먼저 정리합니다. UI와 아직 짝짓지 않은 요구사항·정책·예외를
  텍스트로 확인하고 남겨 두기 위한 단계입니다.
  - 컬럼: `ID · Location(1~6Depth) · Page ID · Page Name · Target · Content · Description · Priority`
  - 양식 원본: `templates/기능명세서_양식.xlsx`
- **상단 바에 기능명세서 버튼**(Description·Flow 버튼 옆)이 생겼습니다. 누르면 표 모달이 열립니다.
  - **이 화면** 탭: 지금 화면의 기능만 / **전체** 탭: 프로젝트 전체(아직 화면이 정해지지 않은 "미정" 포함)
  - 같은 상위 위치(Depth)가 이어지면 엑셀처럼 **병합**해서 보여주고, 상세의 줄바꿈을 그대로 살립니다.
- **`/pdk-wireframe` 이 기능명세를 끌어와 Description 을 만듭니다.** 끌어온 항목에는 **기능 ID 칩**이 붙고,
  칩을 누르면 기능명세서 표의 그 행으로 이동합니다. 화면에 반영되지 않은 기능은 따로 알려줍니다.
- 작업 순서에 기능명세 단계가 들어갑니다:
  **init → screen → description → flow → wireframe → figma-sync**
- `/pdk-init` 이 **프로젝트 코드**(기능명세 ID 접두어, 예: `GFC` → `GFC-FUC-001`)를 함께 묻습니다.

### 코드 변경(자동)
- `engine/common.js`: `config/specs.js` 를 엔진이 직접 불러온다(화면 HTML 로더 수정 없음 · 파일 없으면 빈 명세).
  상단 바 `.pdk-topbar-spec` 버튼, `injectSpecModal()`(탭·Depth 병합 표·빈 상태·ESC/바깥 클릭 닫기),
  Description 항목의 `spec` 필드 → ID 칩(`.page-detail-spec`) 렌더.
- `engine/common.css`: `.pdk-spec-*` 모달·표·우선순위 배지, `.page-detail-spec` 칩.
- `engine/icons/topbar-spec.svg`: 기능명세서 버튼 아이콘.
- `templates/기능명세서_양식.xlsx`: 기능명세서 엑셀 양식(중립 예시 행 포함).
- `.claude/commands/pdk-description.md`: 신규.
- `.claude/commands/pdk-wireframe.md`: 1) 기능명세 확인, 4) 「기능명세에서 끌어오기」(`spec` 필드), 5) 반영 현황 보고.
- `.claude/commands/pdk-init.md`: 프로젝트 코드 입력, `config/specs.js` 보장, 순서 안내.
- `.claude/commands/pdk-screen.md`·`pdk-flow.md`: 다음 단계 안내를 새 순서로.
- `.claude/commands/pdk-update.md`: `config/specs.js` 를 보존 대상에 추가.
- `.claude/commands/pdk-figma-sync.md`: Description 의 `spec` 필드 보존.
- `docs/GUIDE.md`: 3단계 `/pdk-description` 추가(이후 단계 번호 한 칸씩 밀림), 체크리스트 갱신.

### 마이그레이션(필요 시)
- 없음. `config/specs.js` 가 없으면 기능명세서 버튼은 "작성된 기능명세가 없습니다"를 보여준다.
  파일은 `/pdk-description` 을 처음 실행할 때 만들어진다.
- `config/project.js` 에 `code` 가 없으면 `/pdk-description` 이 처음 실행될 때 물어서 추가한다.

## v21 — 작업 순서 확정 (init → screen → flow → wireframe → figma-sync) · /pdk-screen 보강 모드 (2026-09-30)

### 요약
- PDK의 공식 작업 순서를 **`/pdk-init` → `/pdk-screen` → `/pdk-flow` → `/pdk-wireframe` → `/pdk-figma-sync`** 로 확정하고,
  모든 커맨드의 "다음 단계" 안내와 문서를 이 순서에 맞췄습니다.
  - 가이드(`docs/GUIDE.md`)에 빠져 있던 **`/pdk-flow` 단계(3단계)** 를 추가했습니다. 체크리스트에도 넣었습니다.
  - `/pdk-screen` 이 끝나면 `/pdk-wireframe` 가 아니라 **`/pdk-flow`** 를 다음 단계로 안내합니다.
  - `/pdk-flow` 가 끝나면 **`/pdk-wireframe`** 를 다음 단계로 안내합니다.
- **`/pdk-screen <기존 화면ID>` 보강 모드**를 추가했습니다.
  - 이전에는 이미 있는 화면 ID를 주면 "중복"이라며 다른 ID를 요구했습니다. 그런데 `/pdk-flow` 는
    새로 만든 화면을 "`/pdk-screen <화면ID>` 로 마저 채우라"고 안내하고 있어서, **안내대로 하면 막혔습니다.**
  - 이제 기존 화면 ID를 주면 **비어 있는 항목(맥락·진입·다음 이동)만** 물어서 채웁니다.
    이미 적힌 내용과 간선은 덮어쓰지 않고, 와이어프레임·디자인이 들어간 화면 HTML도 건드리지 않습니다.

### 코드 변경(자동)
- `.claude/commands/pdk-screen.md`: 1) 인자 확인에서 기존 ID → 보강 모드 분기, 「기존 화면 보강 모드」 절 추가,
  다음 단계 안내를 `/pdk-flow` 로 변경.
- `.claude/commands/pdk-flow.md`: 전체 순서 명시, 등록 화면이 없을 때 안내, 다음 단계 안내를 `/pdk-wireframe` 로 변경.
- `.claude/commands/pdk-init.md`: 다음 단계 안내에 전체 순서 표시.
- `docs/GUIDE.md`: 3단계 `/pdk-flow` 추가(이후 단계 번호 한 칸씩 밀림), `/pdk-screen` 보강 사용법, 체크리스트 갱신.
- `README.md`: 퀵스타트에 순서 한 줄, 커맨드 표에 보강 모드 설명.

### 마이그레이션(필요 시)
- 없음. 커맨드·문서만 바뀌며 `config/`·`pages/` 는 영향이 없다.

## v20 — 반응형 디바이스 토글을 상단 바로 이동 (2026-09-07)

### 요약
- 반응형 프로젝트의 **데스크탑/모바일 토글이 클릭되지 않던 문제**를 고쳤습니다.
- 원인: 토글이 화면 상단 중앙에 `z-index: 60` 으로 떠 있었는데, **상단 바가 `z-index: 150`** 이라
  토글을 덮고 있었습니다. 데스크탑처럼 목업이 큰 경우 목업에 가리기도 했습니다.
- 이제 토글이 **상단 바 우측 도구 영역**(Description·Flow·PRD 버튼 옆)에 들어갑니다.
  겹치는 요소가 없어 항상 클릭할 수 있고, 다른 도구 버튼과 높이(48px)가 맞습니다.
- 활성 표시도 파란 채움에서 **흰 알약 + 그림자**로 바꿔 상단 바 톤에 맞췄습니다.

### 코드 변경(자동)
- `engine/common.js`: `injectDeviceToggle()` 이 `.pdk-topbar-tools` 안에 토글을 넣는다.
  상단 바가 없는 페이지에서는 `.is-floating` 으로 좌상단에 떠 있는 형태로 대체(`z-index: 160`).
- `engine/common.css`: `.pdk-device-toggle` 을 `position: fixed` 에서 **인라인 배치**로 변경,
  상단 바 버튼과 높이·모서리 정렬. `.is-floating` 대체 배치 추가.
- `docs/GUIDE.md`: 토글 위치 안내 갱신.

### 마이그레이션(필요 시)
- 없음. 반응형(`device: 'responsive'`)을 쓰지 않는 프로젝트에는 영향이 없다.

## v19 — 와이어프레임을 실제 UI로 (shadcn 기반 흑백 UI 키트) (2026-09-07)

### 요약
- `/pdk-wireframe` 가 **회색 블록(스켈레톤) 대신 실제 UI**를 그립니다.
  버튼에는 버튼 이름, 목록에는 예시 항목, 입력칸에는 라벨과 placeholder가 들어갑니다.
  회색 덩어리만으로는 **기획 의도가 전달되지 않는다**는 실사용 피드백을 반영한 변경입니다.
- 대신 **색은 쓰지 않습니다(흑백).** 색·이미지·브랜드 요소는 여전히 `/pdk-figma-sync` 가 Figma에서 입힙니다.
- 엔진에 **흑백 와이어프레임 UI 키트(`.pdk-w-*`)** 를 추가했습니다. 화면마다 CSS를 새로 짜지 않고
  키트를 조합만 하므로, 화면이 늘어나도 생김새가 일관됩니다.
- 이 키트는 **shadcn/ui 의 디자인 토큰과 컴포넌트 치수를 순수 CSS로 이식**한 것입니다.
  React·Radix·Tailwind 를 쓰지 않으므로 **무빌드 원칙은 그대로**이고, 외부 의존성도 늘지 않습니다.
  shadcn 기본 테마가 채도 0 의 무채색이라 와이어프레임의 "흑백" 원칙과 정확히 맞습니다.
  - 토큰: `--pdk-background/foreground/primary/secondary/muted/accent/border/input/ring` +
    `--pdk-radius`(0.625rem) 파생 `sm·md·lg·xl` — 값은 shadcn 공식 테마 그대로
  - 치수: Button `h-9/px-4/text-sm/font-medium`, Input `h-9/px-3/focus ring`,
    Card `rounded-xl + shadow`, Tabs `h-9 muted 배경 + active 흰 알약`, Badge `px-2.5/py-0.5/text-xs`
  - 버튼 기본형은 **outline**, 화면의 주 행동 1개만 `is-primary`(검정 채움)
- **화면 골격을 3단 구조로 고정** — 목업에 꽉 차지 않거나 UI가 틀어지던 문제를 해결합니다.
  ```
  .pdk-screen        캔버스를 정확히 꽉 채움(absolute inset:0) — padding·gap 금지
  ├─ .pdk-w-header   상단 고정
  ├─ .pdk-w-body     남는 높이 전부 + 여기서만 스크롤
  └─ .pdk-w-footer   하단 고정 CTA (+.is-raised)
  ```
  - 기존에는 `.pdk-screen` 에 `padding: 28px` · `gap: 16px` 가 걸려 있어, 모바일(360px)에서 가로 56px를 잃고
    헤더·하단 CTA·전체폭 목록이 가장자리에 닿지 못했습니다. 루트 여백을 없애고 **각 단이 여백을 갖도록** 바꿨습니다.
  - `width/height: 100%` → **`absolute + inset: 0`** 으로 변경. 부모의 padding·flex 영향으로 높이가 무너지지 않습니다.
  - 본문에 `min-height: 0` 을 보장해 **하단 CTA가 화면 밖으로 밀리는 현상**을 막습니다.
  - 보조 유틸: `.pdk-w-sticky`(본문 상단 고정 탭·필터) · `.pdk-w-bleed`(좌우 여백 무시, 전체폭)
  - 레이아웃 `header`/`body`/`footer`/`row`/`col`/`divider`, 텍스트 `title`~`caption`,
    `tabs`·`list`/`item`·`card`, 이미지 자리 `thumb`/`avatar`/`icon`, `btn`(primary·ghost·disabled·block·sm),
    입력 `field`/`label`/`input`/`textarea`/`select`/`check`, 상태 `badge`/`banner`/`empty`,
    오버레이 `dim`/`modal`/`sheet`/`toast`
- 역할 클래스(`.pdk-<역할>`)는 그대로 함께 붙입니다 → Description hover 매핑은 변함없이 동작합니다.
- `/pdk-figma-sync` 는 디자인 적용 시 `.pdk-w-*` 를 제거해도 됩니다 — **역할 클래스만 유지**하면 됩니다.

### 코드 변경(자동)
- `engine/common.css`: `.pdk-w-*` 와이어프레임 UI 키트(약 230줄) 추가 — shadcn 토큰·치수 이식.
  `.pdk-screen` 을 `absolute + inset:0` · `overflow:hidden` · 루트 여백 0 으로 교체,
  `.pdk-w-header/body/footer` 에 자체 여백 부여, `.pdk-w-sticky`·`.pdk-w-bleed`·`.pdk-w-footer.is-raised` 추가.
  기존 `.pdk-sk-*` 스켈레톤 클래스는 **이전 버전 화면 호환용으로 남겨** 둔다.
- `.claude/commands/pdk-wireframe.md`: 3단계를 전면 교체 — shadcn↔PDK 컴포넌트 대응표,
  실제 문구 작성 규칙, 색·이미지 금지 규칙(상태는 색이 아니라 배지 문구로), 예시 HTML.
- `.claude/commands/pdk-figma-sync.md`·`pdk-screen.md`: "스켈레톤" → "와이어프레임" 용어 및 인계 규칙 정리.
- `README.md`·`docs/GUIDE.md`: 3단계 성숙 설명과 용어 갱신.
- `examples/case-panel.html`: 키트로 만든 실제 UI 예시(조건 분기 포함).

### 마이그레이션(필요 시)
- 기존 화면이 `.pdk-screen` 바로 아래에 콘텐츠를 두고 **루트 padding(28px)에 의존**했다면, 이제 여백 없이
  가장자리에 붙는다. 해당 화면은 콘텐츠를 **`.pdk-w-body` 로 감싸면** 원래대로 여백이 생긴다(스크롤도 정상화).
  화면 HTML에 `position`·`width`·`height` 를 직접 지정한 부분이 있으면 제거한다 — 루트가 이미 캔버스에 맞춰져 있다.
- 그 외 `.pdk-sk-*` 로 만든 요소 자체는 그대로 렌더된다.
- 참고: 색 토큰에 `oklch()` 를 쓴다(shadcn 원본 표기 유지). 2023년 이후 브라우저에서 지원되며,
  구형 브라우저에서 색이 빠져 보이면 `engine/common.css` 상단 `.pdk-screen` 의 토큰만 hex 로 바꾸면 된다.
- 이미 만든 화면을 새 방식으로 바꾸고 싶으면 그 화면에 `/pdk-wireframe` 를 다시 실행한다(선택).

## v18 — 조건 분기 케이스 전환 (목업 위 라디오) (2026-09-07)

### 요약
- 한 화면이 조건에 따라 다르게 보이는 경우(**목록 있음/없음, 인증 성공/실패, 권한 있음/없음** 등),
  **목업 위 라디오 버튼으로 상태를 전환**해 볼 수 있습니다.
- `config/screens.js` 의 화면에 `cases` 를 선언하고, 화면 HTML의 해당 요소에 `data-case="<id>"` 만 붙이면
  **엔진이 라디오 패널을 만들고 표시/숨김을 처리**합니다. 화면마다 전환용 스크립트를 짤 필요가 없습니다.
  ```js
  cases: [
    { id: 'has-data', label: '등록 있음', default: true },
    { id: 'empty',    label: '등록 없음' },
  ],
  ```
  ```html
  <div class="pdk-sk-box pdk-list"  data-case="has-data"></div>
  <div class="pdk-sk-box pdk-empty" data-case="empty"></div>
  ```
- `data-case` 가 **없는 요소는 모든 케이스에서 보입니다**(헤더·탭 등 공통 UI).
  한 요소가 여러 케이스에 속하면 공백으로 나열합니다: `data-case="empty error"`.
- 케이스가 **2개 이상일 때만** 패널이 나타납니다. `default: true` 가 없으면 첫 항목이 기본입니다.
- `/pdk-wireframe` 가 설계 중 **"이 화면이 상황에 따라 다르게 보이나요?"** 를 묻고 위 구조를 자동으로 작성합니다.

> 같은 화면 안에서 **UI만** 달라지는 경우를 다룹니다. 화면 자체가 갈라지면 기존대로
> `/pdk-screen` 의 분기(`flow.to` 의 `branch`)로 처리합니다.

### 코드 변경(자동)
- `engine/common.js`: `injectCasePanel()`·`applyCase()` 추가. `init()` 에서 `applyDevice()` **보다 먼저** 호출해
  패널 높이가 목업 축소 계산에 반영되도록 하고, `fit()` 이 패널 높이(56px)만큼 여유를 뺀다.
- `engine/common.css`: `.pdk-case-panel`·`.pdk-case-option`·`.pdk-case-radio` 스타일,
  `.device-stage.has-case-panel`(세로 배치), `[hidden] { display: none !important; }` 추가.
- `.claude/commands/pdk-wireframe.md`: 조건 분기 질문(2단계), `data-case` 마킹 규칙(3단계),
  `cases` 기록 규칙(4단계), 케이스 전환 검증 안내(5단계).
- `config/screens.js`(주석)·`README.md`·`docs/GUIDE.md`: `cases` 스키마 반영.

### 마이그레이션(필요 시)
- 없음. `cases` 가 없는 화면은 이전과 동일하게 동작한다.
- 이미 화면 HTML에 **직접 만든 케이스 전환 UI/스크립트**가 있다면, `cases` + `data-case` 방식으로 옮기면
  중복 코드를 지울 수 있다(선택). 그대로 둬도 엔진과 충돌하지 않는다.

## v17 — /pdk-init 에서 PRD 문서 지정 (2026-09-07)

### 요약
- 상단 바의 **"PRD 문서 보기" 버튼**(v8)은 `config/project.js` 의 `prdFile` 값이 있을 때만 표시되는데,
  **어떤 커맨드도 이 값을 쓰지 않아** 사실상 손으로 파일을 고쳐야만 켤 수 있었습니다.
  게다가 `/pdk-init` 을 다시 실행하면 손으로 넣은 값이 **지워졌습니다.**
- 이제 `/pdk-init` 이 **PRD 문서를 함께 묻습니다.** `docs/prd/*.html` 을 찾아 후보로 제시하고,
  없으면 파일명을 직접 받거나 건너뜁니다.
- **재실행해도 기존 `prdFile` 이 유지**됩니다. 나아가 `project.js` 를 덮어쓰기 전에 읽어,
  스키마에 없는 필드까지 **그대로 보존**합니다.
- 아직 없는 파일명을 지정하면 저장은 하되 "버튼은 보이지만 문서를 찾지 못한다"고 알려 줍니다.

### 코드 변경(자동)
- `.claude/commands/pdk-init.md`: 입력 수집에 PRD 항목 추가(후보 탐색·기본값 제시·재실행 보존),
  `config/project.js` 출력 스키마에 `prdFile` 추가 + 기존 값 보존 규칙.
- `engine/common.js`: PRD 버튼의 경로 계산을 `ENGINE_BASE + '../'` → `ROOT_BASE` 로 통일(동작 동일).
- `README.md`·`docs/GUIDE.md`: `/pdk-init` 이 묻는 항목 갱신.

### 마이그레이션(필요 시)
- 없음. 기존 프로젝트의 `config/project.js` 에 `prdFile` 이 없으면 버튼이 안 보일 뿐이며,
  `docs/prd/` 에 문서를 넣고 `/pdk-init` 을 다시 실행하면 지정된다.

## v16 — /pdk-init 이 PDK 원본과의 push 연결을 끊음 (2026-09-07)

### 요약
- PDK를 클론해 시작하면 `origin`이 **PDK 원본 레포를 가리킨 채** 남아, 내 화면을 커밋해 push하면
  템플릿 레포로 밀게 되는 문제가 있었습니다.
- 이제 **`/pdk-init` 이 "작업 결과를 push할 내 레포 주소가 있나요?"를 묻고** 정리합니다.
  - 주소를 주면 → `origin`을 그 주소로 변경
  - 없으면 → `origin`을 **제거**(원본과 연결 끊기). 나중에 `git remote add origin <주소>` 로 붙이면 됩니다.
  - 이미 내 레포를 가리키고 있으면 → **건드리지 않습니다.**
- **커밋 히스토리와 파일은 그대로**입니다. 원격 설정만 바뀝니다.
- `upstream`은 등록하지 않습니다 — PDK 원본 주소는 `/pdk-update`가 고정값으로 갖고 있어 실행 시 자동 등록합니다.
  **origin을 지워도 `/pdk-update`는 정상 동작합니다.**

### 코드 변경(자동)
- `.claude/commands/pdk-init.md`: 7단계(git 원격 정리) 신설, `allowed-tools`에 `Bash` 추가.
  PDK 원본 주소는 `pdk-update.md`의 「고정값」을 읽어 비교한다(주소를 두 곳에 적지 않음).
- `.claude/commands/pdk-update.md`: 고정값이 원본 주소의 **단일 출처**임을 명시.
- `README.md`·`docs/GUIDE.md`: `/pdk-init`이 묻는 항목과 원격 정리 동작 반영.

### 마이그레이션(필요 시)
- **이미 진행 중인 프로젝트**는 `/pdk-init`을 다시 돌리지 않으므로 자동으로 정리되지 않는다.
  업데이트 후 `origin`을 확인해, PDK 원본을 가리키고 있으면 사용자에게 알리고 정리 방법을 안내한다.
  ```bash
  git remote get-url origin          # PDK 원본이면 아래 중 하나
  git remote set-url origin <내 레포 주소>
  git remote remove origin           # 나중에 정할 때
  ```
  (사용자 확인 없이 임의로 remote를 바꾸지 않는다.)

## v15 — README 정리 · 문서 분리 (2026-09-07)

### 요약
- README가 길어져(165줄) 정작 필요한 퀵스타트·커맨드 표가 묻혀 있었습니다. **105줄로 줄이고**
  성격이 다른 내용은 별도 문서로 분리했습니다.
- **[`docs/UPDATING.md`](docs/UPDATING.md) 신설** — `/pdk-update`·`/pdk-custom` 사용법, 기존 프로젝트에
  커맨드만 먼저 설치하는 절차, 브랜치·버전 파일 관련 주의사항.
- **[`docs/MAINTAINING.md`](docs/MAINTAINING.md) 신설** — 유지보수자의 공통 변경 배포 절차,
  동기화 대상/보존 대상 경로, `custom/` 압축 전달로 개선 요청하는 방법.
- README에는 **퀵스타트 · 커맨드 표 · 폴더 구조 · 3단계 성숙**만 남기고, 나머지는 링크로 연결했습니다.
  최초 설치는 자주 쓰이므로 명령 2줄만 README에 남기고 주의사항은 `docs/UPDATING.md`로 옮겼습니다.

### 코드 변경(자동)
- `docs/UPDATING.md`·`docs/MAINTAINING.md` 추가.
- `.claude/commands/pdk-update.md`: 공통 매니페스트·동기화 경로에 두 문서 추가.
- `README.md`: 재작성(※ README는 보존 대상이라 각 프로젝트에 자동 반영되지 않는다 — 아래 참고).

### 마이그레이션(필요 시)
- 없음. `docs/UPDATING.md`·`docs/MAINTAINING.md` 는 이번 동기화로 함께 받아진다.
- `README.md` 는 **보존 대상**(프로젝트별로 고쳐 쓰는 문서)이라 자동으로 갱신되지 않는다.
  원본의 정리된 README를 쓰고 싶으면 직접 가져온다:
  ```bash
  git checkout upstream/main -- README.md
  ```

## v14 — Description 문안 규칙(간단명료) (2026-09-07)

### 요약
- Description은 읽는 문서가 아니라 **화면을 훑기 위한 라벨**입니다. 이제 커맨드가 **짧고 명료하게** 작성합니다.
- 규칙: **한 항목 = 한 요소 = 한 문장**, **30자 내외(최대 50자)**, 형식은 `<요소> — <역할>` 또는 `<액션> → <결과·이동>`.
  배경 설명·`~할 수 있습니다` 같은 늘어지는 어미는 쓰지 않고, 항목 수도 **8개 내외**로 제한합니다.
- 설명이 길어지면 문장을 다듬는 대신 **항목을 나누거나 덜어냅니다**(hover 매핑도 그편이 정확해집니다).
- 화면 전체에 대한 설명은 항목이 아니라 `context`에 둡니다.

### 코드 변경(자동)
- `.claude/commands/pdk-wireframe.md`: 「Description 문안 규칙」 신설(길이·형식·금지 표현·항목 수).
- `.claude/commands/pdk-figma-sync.md`: 디자인 적용으로 항목을 추가할 때도 같은 규칙을 따르도록 명시.
- `config/screens.js`(주석)·`docs/GUIDE.md`·`examples/README.md`: 문안 기준 반영.
- `examples/kiosk.html`: 예제 문구를 표준형으로 정리(예제는 사용자가 그대로 따라 쓰므로).

### 마이그레이션(필요 시)
- 없음. 기존에 작성된 Description은 그대로 둔다.
  다시 `/pdk-wireframe`를 실행하는 화면부터 새 기준으로 정리된다.

## v13 — 언급된 화면·흐름을 그 자리에서 생성 (2026-09-07)

### 요약
- 작업 도중 **아직 없는 화면을 언급하면 그 화면의 등록(`config/screens.js`)과 HTML 파일(`pages/…html`)이 즉시 만들어집니다.**
  `/pdk-screen`으로 화면부터 등록하든, `/pdk-flow`로 흐름을 이야기하며 화면을 언급하든 **어느 쪽으로 시작해도 동일**합니다.
- 지금까지는 "나중에 그 화면을 만들면 자동으로 이어집니다"라며 미뤄서, 플로우에 ghost(점선) 노드만 쌓이고
  실제로 몇 개의 화면을 만들어야 하는지 알기 어려웠습니다.
- 자동 생성되는 화면은 **이름·카테고리만** 물어봅니다. 그 화면의 진입·다음 이동은 나중에 그 화면 차례에 채웁니다
  (안 그러면 "다음 화면은?" 질문이 꼬리를 물고 끝나지 않습니다).
- 작업이 끝나면 **이번에 자동 생성된 화면 목록**을 따로 보고합니다.
- `/pdk-wireframe`도 config에는 있는데 HTML이 없는 화면이면 먼저 파일을 만들고 진행합니다.
- **`/pdk-flow`가 여정 순서대로 화면 간 이동(간선)까지 이어 붙입니다.** 플로우만 등록되고 연결선 없는
  노드만 남던 문제가 없어집니다. 단, 여정 순서가 곧 일직선 흐름은 아니므로(성공/실패처럼 갈라지는 지점이 섞임)
  **이어 붙일 목록을 먼저 보여주고 확인받은 뒤** 반영하며, 이미 있는 간선은 덮어쓰지 않습니다.

### 코드 변경(자동)
- `.claude/commands/pdk-screen.md`: **「화면 파일 즉시 생성 규칙」** 섹션 신설(공용 절차의 단일 출처).
  진입 출처·다음 이동 목적지가 미등록이면 보류 대신 즉시 생성하도록 3-(b)·3-(c) 변경.
- `.claude/commands/pdk-screen.md`: **「간선(이동) 기록 규칙」** 섹션 신설 — `flow.to` 단일 저장, 중복 간선 금지,
  기존 `via`/`branch` 덮어쓰기 금지. `/pdk-flow`도 이 규칙을 참조한다.
- `.claude/commands/pdk-flow.md`: 소속 화면 중 미등록이 있으면 위 규칙을 그대로 수행해 생성(ghost 허용 문구 제거),
  **3-b 단계 신설** — 여정 인접 쌍을 확인 후 `flow.to`에 추가.
- `.claude/commands/pdk-wireframe.md`: 대상 HTML이 없으면 템플릿으로 먼저 생성.
- `README.md`·`docs/GUIDE.md`: 즉시 생성 정책 반영, ghost 관련 설명 수정.

### 마이그레이션(필요 시)
- 파일/구조 변경은 없다.
- 다만 **기존 프로젝트에는 이미 ghost 상태로 남은 화면**이 있을 수 있다. 업데이트 후 다음을 점검해 사용자에게 보고한다.
  - `config/screens.js`의 모든 `flow.to[].screen` 값과 `config/flows.js`의 `screens[]` 값을 모아,
    **등록된 화면 ID 집합에 없는 것**을 목록으로 뽑는다.
  - 등록돼 있는데 `href` 파일이 실제로 없는 화면도 함께 뽑는다.
  - 이 목록을 "아직 만들어지지 않은 화면"으로 안내하고, `/pdk-screen <화면ID>` 로 만들도록 권한다.
    (이름·카테고리를 물어야 하므로 `/pdk-update`가 임의로 만들지는 않는다.)

## v12 — 패널 8방향 리사이즈 + 배치 유지 (2026-09-07)

### 요약
- **화면 플로우·Description 패널을 네 변과 네 모서리 모두로 크기 조절**할 수 있습니다.
  (기존에는 좌측 테두리로 가로 폭만 조절 가능했습니다.)
- **바꾼 위치·크기가 새로고침·화면 이동 후에도 유지**됩니다. 세션 저장이라 탭/브라우저를 닫으면 초기 배치로 돌아갑니다.
- 패널을 넓힌 뒤 다른 화면으로 이동해도 그대로 유지되므로, 플로우를 크게 펼쳐 놓고 화면을 훑어볼 수 있습니다.
- 최소 크기(260×150)와 화면 밖 이탈 방지가 적용돼, 패널을 잃어버려 다시 잡을 수 없게 되는 상황을 막습니다.
- 창을 줄인 뒤 새로고침하면 저장된 배치를 현재 창 크기에 맞춰 보정해 복원합니다.

### 코드 변경(자동)
- `engine/common.js`: `makePanelMovableResizable()` → **`makePanelFloating(panel, header, key)`** 로 교체.
  8방향 핸들 생성, 변/모서리별 앵커 고정 계산, `sessionStorage`(`pdk:panel:flow`·`pdk:panel:detail`) 저장·복원 추가.
- `engine/common.css`: `.pdk-resize-grip`(좌측 전용) → **`.pdk-rz` + `.pdk-rz-n/s/e/w/nw/ne/sw/se`** 로 교체.
  우측 리사이즈 핸들과 겹치지 않도록 `.page-flow-body`·`.page-detail-body`의 스크롤바를 6px 안쪽으로 들임(실제 여백은 동일).

### 마이그레이션(필요 시)
- 없음.
- 다만 `custom/patches/` 에 **`.pdk-resize-grip` 또는 `makePanelMovableResizable` 을 건드리는 패치**를 보관 중이라면,
  대상 코드가 사라졌으므로 `/pdk-update` 재적용 시 충돌로 보고된다. 그 패치는 새 이름(`.pdk-rz*` / `makePanelFloating`)
  기준으로 다시 만들거나, 더 이상 필요 없으면 삭제한다.

## v11 — 화면 HTML을 pages/ 로 분리 (2026-09-07)

### 요약
- 이제 **`index.html`만 루트에 남고, 나머지 화면 HTML은 전부 `pages/` 폴더**에 생성됩니다.
  화면이 늘어나도 프로젝트 루트가 지저분해지지 않습니다.
- `config/screens.js`의 `href` 는 **항상 프로젝트 루트 기준 경로**입니다 (예: `pages/scr-main-001.html`).
  엔진이 루트를 기준으로 링크를 만들기 때문에, 루트의 `index.html`에서든 `pages/` 안의 화면에서든
  페이지 목록·플로우 노드 클릭 이동이 동일하게 동작합니다.
- 화면 HTML은 한 단계 아래에 있으므로 공통 파일을 `../engine/`, `../config/`, `../assets/` 로 참조합니다
  (템플릿과 `/pdk-screen`이 자동으로 그렇게 만듭니다).

### 코드 변경(자동)
- `engine/common.js`: `ROOT_BASE`·`pageUrl()`·`baseName()` 추가 — href를 루트 기준으로 해석하고,
  현재 화면 판별은 파일명으로 비교. `window.go()`·페이지 목록 행 클릭·플로우 노드 클릭(`__flowGo`)이 모두 `pageUrl()` 경유.
- `templates/_screen.*.html` (3개): 공통 경로를 `../` 로 변경.
- `.claude/commands/pdk-screen.md`: `href` = `pages/<파일명>.html`, 저장 위치 `pages/`.
- `.claude/commands/pdk-init.md`: `pages/` 디렉토리 보장 단계(4-c).
- `.claude/commands/pdk-flow.md`·`pdk-mockup.md`·`pdk-figma-sync.md`: `pages/` 기준 경로 안내.
- `.claude/commands/pdk-update.md`: 보존 대상에 `pages/` 추가.
- `examples/*.html`: 예제 href를 루트 기준(`examples/...`)으로 수정.
- `config/screens.js`(주석)·`README.md`·`docs/GUIDE.md`·`examples/README.md`: 폴더 구조·href 규칙 반영.

### 마이그레이션(필요 시)
루트에 화면 HTML이 흩어져 있는 기존 프로젝트는 아래를 수행한다. (`.pdk-backup/`에 백업된 뒤 진행)

1. `pages/` 디렉토리를 만든다.
2. **프로젝트 루트의 `*.html` 중 `index.html`을 제외한 전부**를 `pages/` 로 옮긴다
   (git 저장소면 `git mv` 사용). `examples/`·`docs/`·`templates/` 안의 HTML은 **대상이 아니다.**
3. 옮긴 각 파일 안의 **공통 경로 앞에 `../` 를 붙인다**. 이미 `../` 로 시작하면 그대로 둔다.
   - `href="engine/common.css"` → `href="../engine/common.css"`
   - 로더 배열의 `'config/devices.js'`·`'config/project.js'`·`'config/screens.js'`·`'config/flows.js'`·`'engine/common.js'`
     → 각각 `'../config/...'`, `'../engine/common.js'`
   - `src="assets/..."` / CSS `url(assets/...)` → `../assets/...`
4. `config/screens.js`의 모든 `href` 값 앞에 `pages/` 를 붙인다
   (예: `href: 'scr-main-001.html'` → `href: 'pages/scr-main-001.html'`). 이미 `pages/`면 그대로 둔다.
5. 화면 HTML 안에서 **`go('<파일>.html')`** 로 다른 화면을 여는 코드가 있으면 `go('pages/<파일>.html')` 로 바꾼다.
   `go()`는 루트 기준으로 해석되므로 `go('index.html')` 는 **그대로 두어야** 한다.
   반면 `<a href="...">`·`location.href='...'` 같은 문서 기준 상대링크는 같은 `pages/` 안이라 수정하지 않아도 된다.
6. `index.html`은 루트에 그대로 두고 경로도 바꾸지 않는다.

> 옮긴 뒤 `index.html`을 열어 페이지 목록·플로우 노드 클릭 이동이 정상인지 확인한다.

## v10 — 레거시 작업기록 문서 정리 (docs/reference/ 동결) (2026-09-07)

### 요약
- 템플릿에 남아 있던 **`docs/PROJECT_STATUS.md`**(엘커넥트 골프 키오스크 프로토타입의 작업 기록)를
  **`docs/reference/legacy-lconnect-prototype.md`** 로 옮기고 **동결 참고자료**로 명시했습니다.
- 이 문서는 PDK 이전 구조(`scripts/common.js`·`styles/common.css`, 하드코딩 `CATEGORIES`)를 설명하고 있어
  **현재 프로젝트의 현황으로 오해**되기 쉬웠습니다. 이제 상단 배너에 "현재 현황이 아님 / 어디를 봐야 하는지"가 명시됩니다.
- "컨텍스트 복구 시 이 파일을 먼저 읽으라"는 지시(15장)를 제거했습니다 — 새 프로젝트에서 이 안내를 따르면
  엉뚱한 프로젝트 정보를 현황으로 읽게 됩니다. 대신 재사용할 만한 화면 패턴 목록으로 대체했습니다.
- 문서에 있던 작성자 로컬 경로를 삭제했습니다.
- 앞으로 `docs/reference/` 는 공통 동기화 대상이라 `/pdk-update` 로 함께 최신화됩니다.

### 코드 변경(자동)
- `docs/PROJECT_STATUS.md` → `docs/reference/legacy-lconnect-prototype.md` (내용 동결 + 상단 배너 추가).
- `.claude/commands/pdk-update.md`: 공통 매니페스트·동기화 경로에 `docs/reference/` 추가.
- `docs/01-plan/*`: 옮겨진 경로로 참조 갱신.

### 마이그레이션(필요 시)
- 프로젝트에 **`docs/PROJECT_STATUS.md` 가 남아 있으면** 다음을 수행한다.
  1. 파일 첫 줄(제목)을 확인한다.
  2. 제목이 **`# 엘커넥트 × 토스 프론트2 프로토타입 — 작업 현황`** 인 경우에만(= 템플릿에서 딸려온 레거시 문서)
     `.pdk-backup/<타임스탬프>/docs/` 로 백업한 뒤 **삭제**한다.
     같은 내용은 이번 동기화로 받은 `docs/reference/legacy-lconnect-prototype.md` 에 배너와 함께 들어 있다.
  3. 제목이 다르면 **사용자가 직접 작성한 프로젝트 현황 문서**이므로 **절대 건드리지 않는다.**
- 프로젝트 문서에서 `docs/PROJECT_STATUS.md` 를 참조하는 링크가 있으면
  `docs/reference/legacy-lconnect-prototype.md` 로 바꾼다.

## v9 — /pdk-flow 기능 플로우 커맨드 + 엔진 플로우 Dock (2026-06-23)

### 요약
- **`/pdk-flow` 커맨드 신규** — 기능(feature) 단위 사용자 여정을 정의하고 소속 화면을 묶는 상위 플로우를 등록합니다.
- **플로우 Dock** — 좌측 페이지 목록 패널 상단에 `[전체] [도착 인증] [1회권 구매]` 같은 칩 버튼이 표시됩니다.
- **다이어그램 필터링** — 플로우 칩을 클릭하면 해당 플로우의 소속 화면만 다이어그램에 표시됩니다. 플로우 외부 연결은 ghost 노드(점선)로 컨텍스트를 유지합니다. "전체"를 클릭하면 기존처럼 모든 화면이 표시됩니다.
- **패널 타이틀 갱신** — 플로우 선택 시 FLOW DIAGRAM 타이틀이 `FLOW — <플로우명>`으로 변경됩니다.
- **모달(크게보기)** 도 선택된 플로우 필터를 반영합니다.
- **`config/flows.js`** 신규 설정 파일 — `window.PDK_FLOWS` 배열로 플로우 데이터를 관리합니다.

### 코드 변경(자동)
- `engine/common.js`: `PDK_FLOWS` 읽기, `activeFlowId` 상태 관리, 플로우 Dock UI 렌더(`injectPageNav` 확장), `buildFlowGraph(filterFlowId)` 필터링 지원, `rerenderFlowDiagram()` 동적 재렌더, 패널 타이틀 갱신, 모달 재렌더 플래그 관리.
- `engine/common.css`: `.flow-dock`, `.flow-dock-label`, `.flow-dock-chips`, `.flow-dock-chip` 스타일 추가.
- `.claude/commands/pdk-flow.md`: 신규 커맨드.
- `.claude/commands/pdk-init.md`: `config/flows.js` 보장 단계(4-b) + 로더에 `flows.js` 추가.
- `.claude/commands/pdk-update.md`: 보존 대상에 `config/flows.js` 추가.
- `templates/*.html` (4개): 로더에 `config/flows.js` 추가.
- `README.md`: 커맨드 6종으로 갱신, 폴더 구조에 `flows.js` 추가.

### 마이그레이션(필요 시)
- `index.html` 및 각 화면 HTML의 스크립트 로더 `files` 배열에 `'config/flows.js'`를 `'config/screens.js'` 뒤에 추가한다.
  ```js
  var files = ['config/devices.js', 'config/project.js', 'config/screens.js', 'config/flows.js', 'engine/common.js'];
  ```
- `config/flows.js`가 없으면 빈 상태로 생성한다:
  ```js
  window.PDK_FLOWS = [];
  ```

## v8 — 상단 바 + 플로우 줌 + PRD 바로가기 (2026-06-09)

### 요약
- **상단 바** 추가 — 좌측에 현재 화면 정보(이름·ID·Figma 링크), 중앙에 프로젝트명·설명, 우측에 Description/Flow 토글 + PRD 바로가기 버튼.
- **플로우 패널 줌** — 패널 우측 하단에 `＋`/`−` 버튼으로 다이어그램 확대/축소.
- **PRD 바로가기** — `config/project.js`에 `prdFile`이 설정되면 상단 바에 PRD 문서 보기 버튼 표시.

### 코드 변경(자동)
- `engine/common.js`: `injectTopBar()`, `applyPanelFlowZoom()`, PRD 버튼 로직 추가.
- `engine/common.css`: `.pdk-topbar-*`, `.page-flow-zoom-*` 스타일 추가.
- `engine/icons/`: 상단 바·줌 관련 SVG 아이콘 추가.

### 마이그레이션(필요 시)
- 없음.

## v7 — 플로우·Description 패널 이동·width 리사이즈 (2026-06-09)

### 요약
- 화면 플로우와 Description 패널을 **팝업처럼 자유롭게 이동**(헤더 드래그)할 수 있습니다.
- 패널 **좌측 테두리를 드래그**해 width를 늘리고 줄일 수 있습니다(오른쪽 모서리 고정).

### 코드 변경(자동)
- `engine/common.js`: `makePanelMovableResizable()` 추가 → `.page-flow`·`.page-detail`에 적용.
- `engine/common.css`: `.pdk-resize-grip`(좌측 리사이즈 그립) 추가, 헤더 `cursor: move`.

### 마이그레이션(필요 시)
- 없음.

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
