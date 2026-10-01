/* PDK 데스크탑 예제 — 가맹점센터(매출·정산 관리자 웹) 공용 설정
 * 실제 프로젝트의 config/devices.js · project.js · screens.js · flows.js · specs.js 를 한 파일로 합친 것.
 * (examples/ 는 참고용이라 파일을 나누지 않았을 뿐, 구조와 스키마는 동일하다)
 *
 * 확인 가능한 것 (v22~v27)
 *   - 기능명세서 — 상단 바 버튼 → 표 모달(이 화면/전체 · Depth 병합 · 셀 선택 시 소속 행 강조), Description 의 ID 칩
 *   - 포커스 모드 — 상단 바 버튼 · Ctrl+ → 목업만, 가장자리 hover 로 도구 호출
 *   - 클릭 이동 — 화면 안 버튼으로 이동(goScreen), 분기 선택창(goBranch: 결제 취소 요청 → 취소 요청)
 *   - 자동 이동 — 취소 완료(포커스 모드에서 3초 후 매출 내역으로)
 *   - 오른쪽 패널 섹션 — 떼어내기 / 다시 붙이기 / 구분선 비율
 *   - 데스크탑 레이아웃 — 노트북 화면에서도 겹치지 않는 배치
 *   - 단계 섞음 — 와이어프레임 5개(조건 분기 2개 포함) · 등록만 된 화면 4개
 *
 * 시연 경로: 로그인 → 대시보드 → 전체보기 → 거래 행 → 결제 취소 → 취소 요청(성공/실패 선택)
 */
window.PDK_DEVICES = {
  desktop: {
    label: '데스크탑',
    type: 'frame',
    width: 1440, height: 1024,
    bezel: 10, radius: 20, bezelColor: '#404040',
  },
  mobile: {
    label: '모바일',
    type: 'frame',
    width: 360, height: 782,
    bezel: 10, radius: 40, bezelColor: '#404040',
  },
  tossfront2: {
    label: '토스프론트2',
    type: 'kiosk',          // 기존 common.css의 상세 키오스크 목업 사용
    width: 400, height: 640,
    radius: 18,
  },
  responsive: {
    label: '반응형',
    toggle: ['desktop', 'mobile'],   // 상단 토글로 전환
    default: 'desktop',
  },
};

window.PDK_PROJECT = {
  name: '가맹점센터 (예제)',
  code: 'GFC',              // 프로젝트 코드 — 기능명세 ID 접두어
  description: '가맹점주가 매출을 조회·취소하고 정산 내역을 확인하는 관리자 웹',
  device: 'desktop',
  responsive: false,
  prdFile: 'sample.html',   // → 상단 바 "PRD 문서 보기" (docs/prd/sample.html)
};

window.PDK_SCREENS = [
  {
    category: '공통',
    pages: [
      { id: 'SCR-AUTH-001', label: '로그인', href: 'examples/admin/scr-auth-001.html',
        designed: false, figmaLink: '',
        context: '가맹점센터 첫 진입 화면. 로그인 전 모든 접근은 여기로 이동',
        cases: [
          { id: 'default', label: '기본', default: true },
          { id: 'error',   label: '로그인 실패' },
        ],
        description: [
          { text: '아이디·비밀번호 입력', target: '.pdk-login-form' },
          { text: '아이디 저장 — 다음 접속 시 자동 입력', target: '.pdk-save-id' },
          { text: '로그인 → 대시보드 (SCR-MAIN-001)', target: '.pdk-btn-login', spec: 'GFC-FUC-001' },
          { text: '[로그인 실패] 오류 안내 — 5회 실패 시 잠금', target: '.pdk-login-error', spec: 'GFC-FUC-002' },
          { text: '아이디 찾기·비밀번호 재설정 링크', target: '.pdk-find-links' },
        ],
        flow: { to: [
          { screen: 'SCR-MAIN-001', via: '로그인 성공' },
        ] } },
      { id: 'SCR-MAIN-001', label: '대시보드', href: 'examples/admin/scr-main-001.html',
        designed: false, figmaLink: '',
        context: '로그인 직후 화면. 오늘 매출·최근 거래·정산 예정을 한눈에 확인',
        description: [
          { text: '상단 메뉴 — 대시보드·매출·정산 이동', target: '.pdk-gnb' },
          { text: '공지 배너 — 정산 일정 변경 등 안내', target: '.pdk-notice' },
          { text: '오늘 매출·거래 건수·정산 예정 요약', target: '.pdk-summary', spec: 'GFC-FUC-003' },
          { text: '최근 거래 3건 — 전체보기 → SCR-SALE-001', target: '.pdk-recent' },
          { text: '정산 예정 — 정산 내역 보기 → SCR-STL-001', target: '.pdk-settle' },
        ],
        flow: { to: [
          { screen: 'SCR-SALE-001', via: '매출 관리 / 전체보기' },
          { screen: 'SCR-STL-001',  via: '정산 관리 / 정산 내역 보기' },
        ] } },
    ],
  },
  {
    category: '매출',
    pages: [
      { id: 'SCR-SALE-001', label: '매출 내역', href: 'examples/admin/scr-sale-001.html',
        designed: false, figmaLink: '',
        context: '기간·결제수단으로 거래를 조회하는 목록 화면',
        cases: [
          { id: 'has-data', label: '거래 있음', default: true },
          { id: 'empty',    label: '거래 없음' },
        ],
        description: [
          { text: '조회 조건 — 기간·결제수단·승인번호', target: '.pdk-filter', spec: 'GFC-FUC-004' },
          { text: '엑셀 다운로드 — 조회 결과 전체', target: '.pdk-btn-excel', spec: 'GFC-FUC-005' },
          { text: '[거래 있음] 조회 합계 건수·금액', target: '.pdk-total' },
          { text: '[거래 있음] 행 클릭 → 거래 상세 (SCR-SALE-002)', target: '.pdk-sale-table', spec: 'GFC-FUC-006' },
          { text: '[거래 있음] 페이지 이동 (20건씩)', target: '.pdk-pagination' },
          { text: '[거래 없음] 빈 상태 + 기간 초기화', target: '.pdk-empty', spec: 'GFC-FUC-006' },
        ],
        flow: { to: [
          { screen: 'SCR-SALE-002', via: '거래 행 클릭' },
        ] } },
      { id: 'SCR-SALE-002', label: '거래 상세', href: 'examples/admin/scr-sale-002.html',
        designed: false, figmaLink: '',
        context: '거래 1건의 승인 정보를 확인하고 영수증 출력·결제 취소',
        description: [
          { text: '목록으로 → 매출 내역 (SCR-SALE-001)', target: '.pdk-back' },
          { text: '거래 상태 배지 — 승인·취소', target: '.pdk-status' },
          { text: '승인 정보 — 승인번호·결제수단·금액', target: '.pdk-detail', spec: 'GFC-FUC-007' },
          { text: '영수증 출력 — 새 창으로 인쇄', target: '.pdk-btn-receipt', spec: 'GFC-FUC-008' },
          { text: '결제 취소 → 취소 요청 (SCR-SALE-003)', target: '.pdk-btn-cancel', spec: 'GFC-FUC-009' },
        ],
        flow: { to: [
          { screen: 'SCR-SALE-003', via: '결제 취소' },
          { screen: 'SCR-SALE-001', via: '목록으로' },
        ] } },
      { id: 'SCR-SALE-003', label: '결제 취소 요청', href: 'examples/admin/scr-sale-003.html',
        designed: false, figmaLink: '',
        context: '거래 상세 위에 뜨는 취소 확인 모달',
        description: [
          { text: '취소 대상 금액·승인번호', target: '.pdk-cancel-target' },
          { text: '취소 사유 선택 (필수)', target: '.pdk-cancel-reason', spec: 'GFC-FUC-010' },
          { text: '취소 확인 체크 — 체크해야 요청 가능', target: '.pdk-cancel-agree' },
          { text: '취소 요청 → 성공/실패 분기', target: '.pdk-btn-request', spec: ['GFC-FUC-009', 'GFC-FUC-010'] },
          { text: '닫기 → 거래 상세 (SCR-SALE-002)', target: '.pdk-btn-close' },
        ],
        flow: { to: [
          { screen: 'SCR-SALE-004', via: '성공', branch: '취소 결과' },
          { screen: 'SCR-SALE-005', via: '실패', branch: '취소 결과' },
          { screen: 'SCR-SALE-002', via: '닫기' },
        ] } },
      { id: 'SCR-SALE-004', label: '취소 완료', href: 'examples/admin/scr-sale-004.html',
        designed: false, figmaLink: '',
        context: '',
        description: [],
        flow: { to: [
          { screen: 'SCR-SALE-001', via: '3초 후 목록으로', kind: 'auto' },
        ] } },
      { id: 'SCR-SALE-005', label: '취소 실패', href: 'examples/admin/scr-sale-005.html',
        designed: false, figmaLink: '',
        context: '',
        description: [],
        flow: { to: [
          { screen: 'SCR-SALE-002', via: '확인' },
        ] } },
    ],
  },
  {
    category: '정산',
    pages: [
      { id: 'SCR-STL-001', label: '정산 내역', href: 'examples/admin/scr-stl-001.html',
        designed: false, figmaLink: '',
        context: '정산일별 입금 예정·완료 내역 목록',
        description: [],
        flow: { to: [
          { screen: 'SCR-STL-002', via: '정산일 클릭' },
        ] } },
      { id: 'SCR-STL-002', label: '정산 상세', href: 'examples/admin/scr-stl-002.html',
        designed: false, figmaLink: '',
        context: '',
        description: [],
        flow: { to: [] } },
    ],
  },
];

window.PDK_FLOWS = [
  { id: 'FLW-AUTH-001', label: '로그인',
    description: '아이디·비밀번호로 가맹점센터에 로그인',
    screens: ['SCR-AUTH-001', 'SCR-MAIN-001'] },
  { id: 'FLW-SALE-001', label: '매출 조회·취소',
    description: '매출 내역을 조회하고 거래 상세에서 결제를 취소',
    screens: ['SCR-MAIN-001', 'SCR-SALE-001', 'SCR-SALE-002', 'SCR-SALE-003', 'SCR-SALE-004', 'SCR-SALE-005'] },
  { id: 'FLW-STL-001', label: '정산 확인',
    description: '정산 예정·완료 내역과 정산일별 상세를 확인',
    screens: ['SCR-MAIN-001', 'SCR-STL-001', 'SCR-STL-002'] },
];

window.PDK_SPECS = [
  { id: 'GFC-FUC-001', location: ['인증', '로그인'], pageId: 'SCR-AUTH-001',
    target: '가맹점주', content: '로그인',
    description: '1. 사용자는 아이디·비밀번호로 가맹점센터에 로그인할 수 있다.\n2. 아이디 저장을 선택하면 다음 접속 시 아이디를 자동으로 채운다.\n3. 로그인 성공 시 대시보드로 이동한다.',
    priority: 'High' },
  { id: 'GFC-FUC-002', location: ['인증', '로그인'], pageId: 'SCR-AUTH-001',
    target: '가맹점주', content: '로그인 실패 처리',
    description: '1. 아이디 또는 비밀번호가 틀리면 "아이디 또는 비밀번호가 올바르지 않습니다"와 실패 횟수를 보여준다.\n2. 5회 연속 실패하면 계정을 잠그고, 비밀번호 재설정 후에만 로그인할 수 있다.',
    priority: 'High' },
  { id: 'GFC-FUC-003', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '오늘 매출 요약',
    description: '1. 오늘 매출 합계, 거래 건수(취소 포함), 다음 정산 예정 금액·입금일을 보여준다.\n2. 매출 합계는 어제 같은 시각 대비 증감률을 함께 보여준다.\n3. 화면 진입 시점 기준으로 집계하며, 기준 시각을 표시한다.',
    priority: 'High' },
  { id: 'GFC-FUC-015', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '공지 배너',
    description: '1. 정산 일정 변경 등 가맹점주에게 알릴 공지를 보여준다.\n2. 사용자는 배너를 눌러 공지 내용을 배너 안에서 펼쳐 볼 수 있다.\n3. 노출할 공지가 없으면 배너 영역을 보여주지 않는다.',
    priority: 'Medium' },
  { id: 'GFC-FUC-016', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '최근 거래',
    description: '1. 최신 거래 3건을 최신순으로 보여준다.\n2. 각 거래의 거래일시·결제수단·금액·상태(승인/취소)를 보여준다.\n3. 사용자는 거래를 눌러 거래 상세로 이동할 수 있다.\n4. 오늘 거래가 없으면 "오늘 거래가 없습니다"를 보여준다.',
    priority: 'High' },
  { id: 'GFC-FUC-017', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '최근 거래 전체보기',
    description: '1. 사용자는 전체보기를 눌러 매출 내역으로 이동할 수 있다.\n2. 매출 내역은 기본 조회 조건(최근 7일 · 결제수단 전체)으로 연다.',
    priority: 'High' },
  { id: 'GFC-FUC-018', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '정산 예정',
    description: '1. 가장 가까운 정산 예정일과 입금 예정 금액을 보여준다.\n2. 정산 예정 내역이 없으면 "정산 예정 내역이 없습니다"를 보여준다.',
    priority: 'High' },
  { id: 'GFC-FUC-019', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '정산 내역 보기',
    description: '1. 사용자는 정산 내역 보기를 눌러 정산 내역으로 이동할 수 있다.',
    priority: 'Medium' },
  { id: 'GFC-FUC-021', location: ['대시보드'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '기준 시각 새로고침',
    description: '1. 사용자는 새로고침을 눌러 오늘 매출 요약·최근 거래·정산 예정을 최신 상태로 다시 불러올 수 있다.\n2. 새로고침이 끝나면 기준 시각을 갱신된 시각으로 바꿔 보여준다.\n3. 불러오는 중에는 새로고침을 다시 누를 수 없다.\n4. 연속 요청을 막기 위해 마지막 새로고침 후 10초 동안은 다시 누를 수 없다.\n5. 불러오기에 실패하면 "정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요"를 보여주고, 이전 데이터를 유지한다.',
    priority: 'Medium' },
  { id: 'GFC-FUC-020', location: ['공통'], pageId: 'SCR-MAIN-001',
    target: '가맹점주', content: '상단 메뉴(GNB)',
    description: '1. 사용자는 상단 메뉴로 대시보드·매출·정산 화면으로 이동할 수 있다.\n2. 현재 보고 있는 메뉴를 선택된 상태로 표시한다.\n3. 모든 화면에 같은 메뉴를 보여준다.',
    priority: 'High' },
  { id: 'GFC-FUC-004', location: ['매출', '매출 조회'], pageId: 'SCR-SALE-001',
    target: '가맹점주', content: '조회 조건 설정',
    description: '1. 사용자는 기간·결제수단·승인번호로 거래를 조회할 수 있다.\n2. 기간은 오늘 / 최근 7일 / 최근 1개월 / 직접 선택 중 고를 수 있다.\n  - 직접 선택은 최대 3개월까지\n3. 기본 조건은 최근 7일 · 결제수단 전체다.',
    priority: 'High' },
  { id: 'GFC-FUC-005', location: ['매출', '매출 조회'], pageId: 'SCR-SALE-001',
    target: '가맹점주', content: '엑셀 다운로드',
    description: '1. 조회 결과 전체를 엑셀 파일로 내려받을 수 있다.\n2. 조회 결과가 없으면 버튼이 비활성화된다.',
    priority: 'Medium' },
  { id: 'GFC-FUC-006', location: ['매출', '매출 조회'], pageId: 'SCR-SALE-001',
    target: '가맹점주', content: '거래 목록',
    description: '1. 조회된 거래를 최신순으로 20건씩 보여준다.\n2. 각 거래의 거래일시·승인번호·결제수단·금액·상태(승인/취소)를 보여준다.\n3. 거래를 누르면 거래 상세로 이동한다.\n4. 조회 결과가 없으면 "조회 기간에 거래가 없습니다"와 기간 초기화 버튼을 보여준다.',
    priority: 'High' },
  { id: 'GFC-FUC-007', location: ['매출', '거래 상세'], pageId: 'SCR-SALE-002',
    target: '가맹점주', content: '승인 정보 확인',
    description: '1. 승인번호, 거래일시, 결제수단(카드사·마스킹된 카드번호), 할부, 결제 금액, 공급가액/부가세, 결제 단말을 보여준다.\n2. 카드번호는 뒤 4자리만 보여준다.',
    priority: 'High' },
  { id: 'GFC-FUC-008', location: ['매출', '거래 상세'], pageId: 'SCR-SALE-002',
    target: '가맹점주', content: '영수증 출력',
    description: '1. 영수증을 새 창으로 열어 인쇄할 수 있다.\n2. 취소된 거래는 취소 영수증으로 출력한다.',
    priority: 'Low' },
  { id: 'GFC-FUC-009', location: ['매출', '결제 취소'], pageId: 'SCR-SALE-003',
    target: '가맹점주', content: '결제 취소 요청',
    description: '1. 사용자는 거래 상세에서 결제 취소를 요청할 수 있다.\n2. 취소 가능 기간은 승인일 기준 D+1 23:59까지이며, 이후 거래는 취소 버튼이 비활성화된다.\n3. "취소 후에는 되돌릴 수 없음" 확인을 체크해야 요청할 수 있다.\n4. 부분 취소는 지원하지 않는다.',
    priority: 'High' },
  { id: 'GFC-FUC-010', location: ['매출', '결제 취소'], pageId: 'SCR-SALE-003',
    target: '가맹점주', content: '취소 사유 선택',
    description: '1. 취소 사유를 고객 요청 / 중복 결제 / 기타 중에서 선택해야 한다.\n2. 상세 사유는 선택 입력이며 최대 200자다.',
    priority: 'Medium' },
  { id: 'GFC-FUC-011', location: ['매출', '결제 취소', '취소 결과'], pageId: 'SCR-SALE-004',
    target: '가맹점주', content: '취소 완료 안내',
    description: '1. 취소가 완료되면 취소 금액과 취소 승인번호를 보여준다.\n2. 3초 후 매출 내역으로 자동 이동한다.',
    priority: 'High' },
  { id: 'GFC-FUC-012', location: ['매출', '결제 취소', '취소 결과'], pageId: 'SCR-SALE-005',
    target: '가맹점주', content: '취소 실패 안내',
    description: '1. 취소에 실패하면 실패 사유를 보여준다.\n  - 예: "이미 정산된 거래는 취소할 수 없습니다"\n2. 확인을 누르면 거래 상세로 돌아간다.',
    priority: 'High' },
  { id: 'GFC-FUC-013', location: ['정산', '정산 조회'], pageId: 'SCR-STL-001',
    target: '가맹점주', content: '정산 내역 조회',
    description: '1. 정산일별 입금 예정·완료 내역을 보여준다.\n2. 정산 주기는 D+2 영업일이며, 공휴일이면 다음 영업일로 표시한다.',
    priority: 'High' },
  { id: 'GFC-FUC-014', location: ['정산', '세금계산서'], pageId: '미정',
    target: '가맹점주', content: '수수료 세금계산서 조회',
    description: '1. 월별 결제 수수료 세금계산서를 조회하고 PDF로 내려받을 수 있다.\n2. 화면 위치는 정산 상세 또는 별도 메뉴 중 결정 필요.',
    priority: 'Low' },
];
