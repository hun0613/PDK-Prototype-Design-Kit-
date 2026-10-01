# 📚 examples — PDK 셸 예제 모음

처음 시작하는 분들이 **프로토타입 뷰어(셸 UI)가 어떻게 구성되는지** 보고 따라 할 수 있도록 만든 참고용 예제입니다.
각 파일은 디바이스 종류만 다르고 구조는 동일합니다. 열어서 화면을 보고, 안의 `<script>` 설정을 그대로 흉내 내면 됩니다.

> ⚠️ 이 폴더는 **참고용**입니다. 실제 프로젝트 화면은 루트의 `index.html` + `config/`로 관리되고, `/pdk-screen`·`/pdk-wireframe` 커맨드로 추가합니다.

---

## 예제 목록

| 파일 | 디바이스 | 보는 포인트 |
|------|----------|-------------|
| [kiosk.html](kiosk.html) | 키오스크(tossfront2, 400×640) | 상세 키오스크 목업(카메라/카드슬롯), 세로 플로우 |
| [desktop.html](desktop.html) | 데스크탑(1440×1024) | 큰 캔버스 자동 축소, GNB+히어로+카드 레이아웃 |
| [mobile.html](mobile.html) | 모바일(360×782) | 둥근 베젤 폰 목업, 분기 플로우 |

### 데스크탑 예제 — `admin/` (가맹점센터 · 최신 기능 모음)

커맨드 흐름(`init → screen → description → flow → wireframe`)을 거친 결과물이 어떤 모습인지 보여주는 **프로젝트형 예제**입니다.
가맹점주가 매출을 조회·취소하고 정산을 확인하는 관리자 웹(데스크탑) — 화면 9개 · 기능 플로우 3개 · 기능명세 21행.
설정은 [admin/_config.js](admin/_config.js) 한 파일에 모여 있습니다.

| 확인할 것 | 어디서 |
|---|---|
| **기능명세서** — 표 모달(이 화면/전체), Depth 병합, 셀 클릭 시 소속 행 강조 | 상단 바 기능명세서 버튼 · Description 의 `GFC-FUC-…` 칩 |
| **포커스 모드** — 목업만 남기고 가장자리 hover 로 도구 호출 | 상단 바 포커스 모드 버튼 / `Ctrl + \` |
| **클릭 이동** — 화면 안 버튼으로 넘어가기, 분기 선택창 | [admin/scr-auth-001.html](admin/scr-auth-001.html) 의 로그인부터 → … → 결제 취소 요청의 **취소 요청** |
| **자동 이동** — 포커스 모드에서 3초 후 이동 | [admin/scr-sale-004.html](admin/scr-sale-004.html) (취소 완료) |
| **조건 분기 라디오** | 로그인(기본/로그인 실패) · 매출 내역(거래 있음/없음) |
| **오른쪽 패널 섹션** — 떼어내기 · 다시 붙이기 · 구분선 비율 | Description / Flow 헤더를 끌어 보기 |
| **단계 섞임** — 와이어프레임 5개 · 등록만 된 화면 4개(정산·취소 결과) | 페이지 목록 |

> 시연 경로: 로그인 → 대시보드 → 전체보기 → 거래 행 → 결제 취소 → 취소 요청(성공/실패 선택)

각 페이지에 공통으로 들어 있는 셸 구성:
- **좌측 레일** — 페이지 목록(카테고리 + 반영/미반영 뱃지) + 상단 현재화면 헤더(타이틀·코드·Figma 링크)
- **우상단 Description** — 화면 구성 설명(항목에 마우스 올리면 해당 UI 강조)
- **우하단 Flow Diagram** — 화면 간 이동 흐름(Mermaid 자동 렌더)
- **우하단 dock** — Description / Flow 표시 토글

---

## 보는 방법

정적 파일이라 **로컬 서버**로 열면 됩니다 (그냥 더블클릭해도 대부분 동작하지만, 서버 권장).

```bash
# 프로젝트 루트에서
python -m http.server 8765
# 브라우저에서 접속
#  http://localhost:8765/examples/kiosk.html
#  http://localhost:8765/examples/desktop.html
#  http://localhost:8765/examples/mobile.html
```

---

## 내 화면을 만들려면 (예제 따라하기)

각 예제의 `<script>` 안에 있는 **3개 설정 객체**가 핵심입니다.

```js
// 1) 어떤 디바이스 틀을 쓸지
window.PDK_DEVICES = {
  mobile: { label: '모바일', type: 'frame', width: 360, height: 782, bezel: 10, radius: 40 },
};

// 2) 이 페이지가 쓰는 디바이스
window.PDK_PROJECT = { name: '내 프로젝트', device: 'mobile' };

// 3) 화면 목록 (좌측 레일 / Description / Flow 가 전부 여기서 생성됨)
window.PDK_SCREENS = [
  { category: '지갑', pages: [
    { id: 'APP-WLT-001', label: '내 지갑', href: 'pages/app-wlt-001.html', designed: true,
      figmaLink: 'https://figma.com/...',
      description: [
        { text: '잔액 카드', target: '.pdk-card' },     // target = 화면 안 요소의 CSS 선택자(hover 강조)
      ],
      flow: { to: [ { screen: 'APP-PAY-001', via: '결제하기' } ] }, // 화면 이동(간선)
    },
  ] },
];

// 4) 지금 보고 있는 화면이 무엇인지 (화면 파일명)
window.PDK_CURRENT = 'app-wlt-001.html';
```

| 필드 | 의미 |
|------|------|
| `href` | **프로젝트 루트 기준 경로.** 화면은 `pages/` 안에 만들어지므로 `pages/...` 가 된다 (이 예제 파일들은 `examples/` 안에 있어서 `examples/...`). |
| `id` / `label` | 화면 ID / 이름 (레일·플로우에 표시) |
| `designed` | `true`=반영(초록 체크) / `false`=미반영(회색 −) |
| `figmaLink` | 헤더의 `↗ Figma` 버튼 연결 |
| `description[].text` | 요소의 역할/이동을 **짧게** — 30자 내외(최대 50자), 한 항목에 한 요소. `결제하기 → 결제 진행 (SCR-PAY-001)` 형태 |
| `description[].target` | 마우스 올리면 강조할 화면 속 요소의 CSS 선택자 |
| `flow.to[]` | `screen`(이동 대상 id), `via`(액션 라벨), `kind:'auto'`(점선=자동 이동) |

> 디바이스 종류는 루트 `config/devices.js`에 더 정의돼 있고, `/pdk-mockup`으로 커스텀 추가도 가능합니다.
