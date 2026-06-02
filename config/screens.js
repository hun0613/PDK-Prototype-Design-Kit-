/* PDK 화면 단일 소스 (/pdk-screen, /pdk-wireframe, /pdk-figma-sync가 갱신)
 * 페이지 목록·Description·화면 플로우가 모두 이 데이터에서 자동 생성된다.
 *
 * page 스키마:
 *   id, label, href, designed(bool), figmaLink, context,
 *   description: [{ text, target }]      // target = 스켈레톤 요소 CSS 셀렉터(hover 강조)
 *   flow: { to: [ { screen, via?, branch?, kind? } ] }  // 간선의 유일 소스
 *     - via: 액션(클릭/조건) 라벨
 *     - branch: 분기 라벨(같은 화면+라벨이면 하나의 마름모로 병합)
 *     - kind: 'auto' → 점선(자동 이동/복귀)
 *   진입점 = 어떤 화면의 to에도 등장하지 않는 화면
 */
window.PDK_SCREENS = [
  {
    category: '공통',
    pages: [
      {
        id: 'SCR-MAIN-001', label: '메인', href: 'index.html',
        designed: false, figmaLink: '',
        context: '앱 진입 시 최초로 보이는 화면',
        description: [
          { text: '시작하기 버튼을 누르면 상품 목록으로 이동', target: '.pdk-btn-start' },
          { text: '상단 타이틀 영역', target: '.pdk-title' },
        ],
        flow: { to: [ { screen: 'SCR-LIST-001', via: '시작하기' } ] },
      },
    ],
  },
  {
    category: '주문',
    pages: [
      {
        id: 'SCR-LIST-001', label: '상품 목록', href: 'list.html',
        designed: false, figmaLink: '',
        context: '구매 가능한 상품을 나열',
        description: [
          { text: '상품 카드를 누르면 상세로 이동', target: '.pdk-card' },
        ],
        flow: { to: [ { screen: 'SCR-DETAIL-001', via: '상품 선택' } ] },
      },
      {
        id: 'SCR-DETAIL-001', label: '상품 상세', href: 'detail.html',
        designed: false, figmaLink: '',
        context: '선택한 상품의 상세 정보',
        description: [
          { text: '결제하기 버튼', target: '.pdk-btn-pay' },
        ],
        flow: { to: [ { screen: 'SCR-PAY-001', via: '결제하기' } ] },
      },
      {
        id: 'SCR-PAY-001', label: '결제', href: 'pay.html',
        designed: false, figmaLink: '',
        context: '결제 수단 선택 및 진행',
        description: [
          { text: '결제 화면 제목 영역', target: '.pdk-title' },
          { text: '결제 수단 선택 영역', target: '.pdk-methods' },
          { text: '결제 진행 버튼 — 결과(성공/실패)에 따라 완료(SCR-DONE-001) 또는 실패(SCR-FAIL-001)로 분기', target: '.pdk-btn-pay' },
        ],
        flow: { to: [
          { screen: 'SCR-DONE-001', via: '성공', branch: '결제 성공 여부' },
          { screen: 'SCR-FAIL-001', via: '실패', branch: '결제 성공 여부' },
        ] },
      },
      {
        id: 'SCR-DONE-001', label: '완료', href: 'done.html',
        designed: false, figmaLink: '',
        context: '결제 성공 안내',
        description: [
          { text: '카운트다운 후 메인으로 자동 복귀', target: '.pdk-hint' },
        ],
        flow: { to: [ { screen: 'SCR-MAIN-001', via: '카운트다운/확인', kind: 'auto' } ] },
      },
      {
        id: 'SCR-FAIL-001', label: '실패', href: 'fail.html',
        designed: false, figmaLink: '',
        context: '결제 실패 안내',
        description: [
          { text: '다시 시도 버튼', target: '.pdk-btn-retry' },
        ],
        flow: { to: [ { screen: 'SCR-PAY-001', via: '다시 시도' } ] },
      },
    ],
  },
];
