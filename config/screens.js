/* PDK 화면 단일 소스 — 페이지 목록·Description·화면 플로우가 모두 이 데이터에서 자동 생성된다.
 * 화면은 /pdk-screen 으로 추가하고, /pdk-wireframe·/pdk-figma-sync 로 채운다. (초기엔 비어 있음)
 *
 * page 스키마:
 *   id, label, href, designed(bool), figmaLink, context,
 *   description: [{ text, target }]      // target = 스켈레톤 요소 CSS 셀렉터(hover 강조)
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
 *       { id: 'SCR-MAIN-001', label: '메인', href: 'scr-main-001.html',
 *         designed: false, figmaLink: '', context: '앱 진입 화면',
 *         description: [],
 *         flow: { to: [ { screen: 'SCR-NEXT-001', via: '시작하기' } ] } },
 *     ],
 *   }
 */
window.PDK_SCREENS = [];
