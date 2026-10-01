/* PDK 기능명세서 — 프로젝트 전체의 기능 단위 명세. 상단 바 "기능명세서" 버튼의 표 모달로 본다.
 * /pdk-description 이 작성·수정하고, /pdk-wireframe 이 Description 작성 시 끌어다 쓴다.
 * 양식 기준: templates/기능명세서_양식.xlsx (컬럼 순서·작성 방식 동일)
 *
 * 행 스키마:
 *   id          — '<프로젝트 코드>-FUC-<3자리>' (예: 'PDK-FUC-001'). 프로젝트 코드 = config/project.js 의 code
 *   location    — 기능 위치 계층 배열, 1Depth 부터 최대 6Depth (예: ['회원', '회원가입', '약관동의'])
 *                 엑셀의 빈 상위 칸(병합)은 여기선 생략하지 않고 전체 경로로 적는다. 표시할 때 엔진이 병합한다.
 *   pageId      — 연결 화면 ID (config/screens.js). 아직 화면이 없으면 '미정'
 *                 Page Name 은 적지 않는다 — 엔진이 pageId 로 screens.js 에서 찾아 표시한다.
 *   target      — 사용 대상 (예: '일반 회원')
 *   content     — 기능명. 짧게 (예: '휴대폰 번호 입력')
 *   description — 상세. 번호 매긴 여러 줄('\n' 구분), "~할 수 있다 / ~한다" 문체
 *   priority    — 'High' | 'Medium' | 'Low'
 *
 * 예시:
 *   { id: 'PDK-FUC-001', location: ['회원', '회원가입'], pageId: 'SCR-JOIN-001',
 *     target: '일반 회원', content: '회원가입 진입',
 *     description: '1. 비로그인 사용자는 회원가입에 진입할 수 있다.\n2. 이미 로그인된 경우 메인으로 이동한다.',
 *     priority: 'High' }
 */
window.PDK_SPECS = [];
