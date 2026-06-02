/* PDK 디바이스 레지스트리
 * 내장 4종 + /pdk-mockup으로 추가되는 커스텀 목업.
 * width/height = 화면(콘텐츠) 캔버스 규격(px). bezel/radius = 외곽 프레임.
 * type: 'kiosk'(상세 프레임) | 'frame'(미니멀 베젤)
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
