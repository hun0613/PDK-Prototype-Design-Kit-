/* PDK 데모 세트 공용 설정
 * 실제 프로젝트의 config/devices.js · project.js · screens.js · flows.js 를 한 파일로 합친 것.
 * (examples/ 는 참고용이라 파일을 나누지 않았을 뿐, 구조와 스키마는 동일하다)
 *
 * 확인 가능한 것
 *   - 디바이스 목업 / 상단 바(프로젝트명·화면정보·Figma·PRD)
 *   - 페이지 목록(카테고리 · 뱃지 3종) / 플로우 Dock(필터링)
 *   - 플로우 다이어그램(진입점 · 액션 노드 · 분기 마름모 · 자동이동 점선 · ghost)
 *   - Description(케이스 접두 표기 · hover 강조)
 *   - 조건 분기 케이스 라디오
 */
window.PDK_DEVICES = {
  desktop:    { label: '데스크탑',    type: 'frame', width: 1440, height: 1024, bezel: 10, radius: 20, bezelColor: '#404040' },
  mobile:     { label: '모바일',      type: 'frame', width: 360,  height: 782,  bezel: 10, radius: 40, bezelColor: '#404040' },
  tossfront2: { label: '토스프론트2', type: 'kiosk', width: 400,  height: 640,  radius: 18 },
  responsive: { label: '반응형',      toggle: ['desktop', 'mobile'], default: 'mobile' },
};

window.PDK_PROJECT = {
  name: 'PDK 데모',
  description: '와이어프레임 UI · 조건 분기 · 플로우를 한 번에 확인하는 예제',
  device: 'mobile',
  responsive: false,
  prdFile: 'sample.html',        // → 상단 바 "PRD 문서 보기" 버튼 (docs/prd/sample.html)
};

/* 데모 전용 — 목업을 바꿔가며 레이아웃이 깨지지 않는지 확인한다.
 *   ?device=desktop | mobile | tossfront2
 * (실제 프로젝트에서는 config/project.js 의 device 값 하나로 고정한다) */
(function () {
  var m = /[?&]device=([a-zA-Z0-9_-]+)/.exec(location.search);
  if (m && window.PDK_DEVICES[m[1]]) window.PDK_PROJECT.device = m[1];
})();

window.PDK_SCREENS = [
  {
    category: '공통',
    pages: [
      {
        id: 'DEMO-INT-001', label: '가족 관리 진입', href: 'examples/demo/intro.html',
        designed: false, figmaLink: '',
        context: '가족 관리 메뉴 진입 시 첫 화면 (플로우 진입점)',
        description: [
          { text: '히어로 배너 — 전체폭 배치', target: '.pdk-hero' },
          { text: '안내 문구 — 기능 소개', target: '.pdk-intro-msg' },
          { text: '시작하기 → 보호자 목록 (DEMO-LST-001)', target: '.pdk-btn-start' },
        ],
        flow: { to: [{ screen: 'DEMO-LST-001', via: '시작하기' }] },
      },
    ],
  },
  {
    category: '목록',
    pages: [
      {
        id: 'DEMO-LST-001', label: '보호자 목록', href: 'examples/demo/list.html',
        designed: false, figmaLink: '',
        context: '가족 관리 진입 시 첫 화면. 등록된 보호자를 확인한다',
        cases: [
          { id: 'has-data', label: '등록 있음', default: true },
          { id: 'empty', label: '등록 없음' },
          { id: 'error', label: '오류' },
        ],
        description: [
          { text: '뒤로가기 → 이전 화면', target: '.pdk-back' },
          { text: '도움말 → 등록 절차 안내', target: '.pdk-help' },
          { text: '탭 — 보호자/환자 목록 전환', target: '.pdk-tabs' },
          { text: '안내 배너 — 승인 시 가능한 기능', target: '.pdk-banner' },
          { text: '[등록 있음] 보호자 목록·승인 상태', target: '.pdk-guard-list' },
          { text: '[등록 있음] 재요청 → 문자 재발송', target: '.pdk-btn-resend' },
          { text: '[등록 없음] 빈 상태 안내', target: '.pdk-empty' },
          { text: '[오류] 불러오기 실패 안내', target: '.pdk-error' },
          { text: '[등록 없음·오류] 다시 시도', target: '.pdk-retry' },
          { text: '보호자 추가 → 등록 폼 (DEMO-REG-001)', target: '.pdk-btn-add' },
        ],
        flow: { to: [{ screen: 'DEMO-REG-001', via: '보호자 추가' }] },
      },
    ],
  },
  {
    category: '등록',
    pages: [
      {
        id: 'DEMO-REG-001', label: '보호자 등록', href: 'examples/demo/form.html',
        designed: false, figmaLink: '',
        context: '보호자 정보를 입력하고 약관에 동의한다',
        cases: [
          { id: 'editing', label: '입력 중', default: true },
          { id: 'filled', label: '입력 완료' },
        ],
        description: [
          { text: '내 정보 — 이름·환자번호 표시', target: '.pdk-myinfo' },
          { text: '관계 선택 — 배우자/부모/자녀', target: '.pdk-field-relation' },
          { text: '이름 입력', target: '.pdk-field-name' },
          { text: '휴대폰 입력 — 숫자만', target: '.pdk-field-phone' },
          { text: '메모 입력 — 선택 항목', target: '.pdk-field-memo' },
          { text: '알림 수신 동의 체크', target: '.pdk-agree' },
          { text: '[입력 중] 등록 요청 — 비활성', target: '.pdk-btn-submit-off' },
          { text: '[입력 완료] 등록 요청 → 약관 시트', target: '.pdk-btn-submit' },
          { text: '약관 동의 시트 — 등록 요청 시 표시', target: '.pdk-sheet-agree' },
        ],
        flow: {
          to: [
            { screen: 'DEMO-CFM-001', via: '동의하고 등록요청' },
            { screen: 'DEMO-LST-001', via: '닫기', kind: 'auto' },
          ],
        },
      },
      {
        id: 'DEMO-CFM-001', label: '본인인증 확인', href: 'examples/demo/confirm.html',
        designed: false, figmaLink: '',
        context: '입력 내용을 확인하고 본인인증을 진행한다',
        description: [
          { text: '입력 요약 카드', target: '.pdk-summary' },
          { text: '유의사항 안내', target: '.pdk-notice' },
          { text: '인증하기 → 결과 분기', target: '.pdk-btn-verify' },
          { text: '확인 모달 — 인증 진행 여부', target: '.pdk-modal-confirm' },
        ],
        flow: {
          to: [
            { screen: 'DEMO-DON-001', via: '성공', branch: '본인인증 결과' },
            { screen: 'DEMO-ERR-001', via: '실패', branch: '본인인증 결과' },
          ],
        },
      },
      {
        id: 'DEMO-DON-001', label: '등록 완료', href: 'examples/demo/done.html',
        designed: true,
        figmaLink: 'https://www.figma.com/design/EXAMPLE/PDK-Demo?node-id=1-2',
        context: '등록 요청이 접수된 뒤 보이는 화면. 5초 후 목록으로 돌아간다',
        description: [
          { text: '완료 아이콘·안내 문구', target: '.pdk-done-msg' },
          { text: '요청 내역 카드', target: '.pdk-done-card' },
          { text: '완료 토스트', target: '.pdk-toast' },
          { text: '목록으로 → 보호자 목록 (DEMO-LST-001)', target: '.pdk-btn-home' },
        ],
        flow: { to: [{ screen: 'DEMO-LST-001', via: '5초 후 자동', kind: 'auto' }] },
      },
    ],
  },
];

window.PDK_FLOWS = [
  {
    id: 'FLW-REG-001', label: '보호자 등록',
    description: '목록에서 보호자를 추가해 본인인증까지 마치는 여정',
    screens: ['DEMO-INT-001', 'DEMO-LST-001', 'DEMO-REG-001', 'DEMO-CFM-001', 'DEMO-DON-001'],
  },
  {
    id: 'FLW-VIEW-001', label: '목록 조회',
    description: '등록된 보호자를 확인만 하는 짧은 여정',
    screens: ['DEMO-INT-001', 'DEMO-LST-001'],
  },
];
