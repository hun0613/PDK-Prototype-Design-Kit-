/* PDK 화면 단일 소스 — 페이지 목록·Description·화면 플로우가 모두 이 데이터에서 자동 생성된다.
 * 화면은 /pdk-screen 으로 추가하고, /pdk-wireframe·/pdk-figma-sync 로 채운다. (초기엔 비어 있음)
 *
 * page 스키마:
 *   id, label, href, designed(bool), figmaLink, context,
 *   href = 프로젝트 루트 기준 경로. 화면 HTML은 pages/ 안에 생성된다 (index.html만 루트).
 *          예: 'pages/scr-main-001.html'
 *   description: [{ text, target }]      // target = 스켈레톤 요소 CSS 셀렉터(hover 강조)
 *     text 는 짧게 — 30자 내외(최대 50자), 한 항목에 한 요소. 예: '결제하기 → 결제 진행 (SCR-PAY-001)'
 *     케이스 전용 요소는 앞에 케이스명을 붙인다: '[등록 없음] 빈 상태 안내' (공통 요소엔 붙이지 않음)
 *   cases: [{ id, label, default? }]     // 조건 분기 — 목업 위 라디오로 전환(2개 이상일 때만 표시)
 *     화면 HTML의 해당 요소에 data-case="<id>" 를 붙인다(공백 구분으로 여러 케이스 가능).
 *     data-case 가 없는 요소는 모든 케이스에서 보인다(공통 UI).
 *   flow: { to: [ { screen, via?, branch?, kind? } ] }  // 간선의 유일 소스
 *     - via: 액션(클릭/조건) 라벨
 *     - branch: 분기 라벨(같은 화면+라벨이면 하나의 마름모로 병합)
 *     - kind: 'auto' → 점선(자동 이동/복귀)
 *   진입점 = 어떤 화면의 to에도 등장하지 않는 화면
 *
 * 예시:
 *   {
 *     category: '공통',
 *     pages: [
 *       { id: 'SCR-MAIN-001', label: '메인', href: 'pages/scr-main-001.html',
 *         designed: false, figmaLink: '', context: '앱 진입 화면',
 *         description: [],
 *         flow: { to: [ { screen: 'SCR-NEXT-001', via: '시작하기' } ] } },
 *     ],
 *   }
 */
window.PDK_SCREENS = [];
