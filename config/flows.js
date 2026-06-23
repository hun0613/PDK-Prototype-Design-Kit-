/* PDK 기능 플로우 — 화면의 상위 그룹. 플로우 Dock · 다이어그램 필터링에 사용.
 *
 * flow 스키마:
 *   id          — 플로우 고유 ID (예: FLW-AUTH-001)
 *   label       — 플로우 표시 이름 (예: 도착 인증)
 *   description — 기능 한 줄 설명
 *   screens     — 소속 화면 ID 배열 (사용자 여정 순서)
 *
 * 예시:
 *   { id: 'FLW-AUTH-001', label: '도착 인증',
 *     description: 'QR 인증으로 예약을 확인하고 도착 완료 처리',
 *     screens: ['SCR-ATH-001', 'SCR-ATH-002', 'SCR-ATH-003'] }
 */
window.PDK_FLOWS = [];
