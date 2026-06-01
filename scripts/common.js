// 엘커넥트 × 토스 프론트2 프로토타입 공용 스크립트

(function () {
  // ── 상단 상태바 시계 ─────────────────────
  function updateClock() {
    const el = document.querySelector('.status-bar .time');
    if (!el) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${hh}:${mm}`;
  }
  updateClock();
  setInterval(updateClock, 1000 * 30);

  // ── 화면 이동 헬퍼 ──────────────────────
  window.go = function (href) {
    location.href = href;
  };

  // ── 개발용 페이지 네비게이션 사이드바 ─────
  // 카테고리별 페이지 구조. 새 페이지는 해당 카테고리 pages 배열에 추가하면 됨.
  // description: [{ text, target }] 형식. target은 hover 시 강조할 UI의 CSS 선택자.
  //              빈 배열([])이면 empty state UI 표시.
  const CATEGORIES = [
    {
      name: '공통',
      pages: [
        {
          href: 'landing.html',
          label: '랜딩페이지',
          id: 'LCN-INT-001',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=386-294',
          description: [
            { text: '최초 진입(랜딩) 화면 — 골프 연습장 배경 + "더베스트 골프클럽" 로고', target: '.landing-logo' },
            { text: '가용 타석 안내 박스 — "이용 가능한 타석 수 16/20" (반투명, 기기 실시간 값 연동 의도)', target: '.landing-info' },
            { text: '"환영합니다(Welcome)" 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동', target: '.landing-welcome-btn' },
            { text: '하단 toss 로고', target: '.landing-toss' },
          ],
        },
        {
          href: 'index.html',
          label: '메인페이지',
          id: 'LCN-MAN-001',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=308-87',
          description: [
            { text: '도착 인증 버튼을 클릭하면 인증방법 선택페이지(LCN-ATH-001)로 이동',    target: '.menu-button.primary'   },
            { text: '1회권 구매 버튼을 클릭하면 1회권상품 선택페이지(LCN-PCH-001)로 이동', target: '.menu-button.secondary' },
            { text: '공지 배너 문구는 기기에서 수정 가능 (경로: 프론트 설정 > 플러그인 선택 > 플러그인 설정)', target: '.notice-banner' },
            { text: '별다른 액션 없이 30초가 경과되면 랜딩페이지(LCN-INT-001)로 자동 이동 (터치/클릭 시 타이머 초기화)', target: '' },
          ],
        },
      ],
    },
    {
      name: '도착인증',
      pages: [
        {
          href: 'arrival.html',
          label: '인증방법 선택페이지',
          id: 'LCN-ATH-001',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=308-11',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(메인페이지 LCN-MAN-001)로 이동',  target: '.auth-back'   },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                  target: '.auth-home'   },
            { text: 'QR 인증 버튼을 클릭하면 QR출력페이지(LCN-ATH-002)로 이동',          target: '.auth-qr-btn' },
          ],
        },
        {
          href: 'qr-output.html',
          label: 'QR출력페이지',
          id: 'LCN-ATH-002',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-619',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(인증방법 선택페이지 LCN-ATH-001)로 이동', target: '.qr-back'      },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                            target: '.qr-home'      },
            { text: '스윙와일 앱으로 QR 코드를 스캔해 도착 인증을 진행',                              target: '.qr-box'       },
            { text: '60초 카운트다운 (0초까지 감소 후 메인페이지 LCN-MAN-001로 자동 이동)',         target: '.qr-countdown' },
            { text: 'QR 인증 성공 시 → 예약 1개면 예약목록 페이지-1개(LCN-ATH-005), 2개 이상(주로 횟수권)이면 예약목록 페이지-2개이상(LCN-ATH-008) / 예약 없음 시 → 예약목록 미존재 알림페이지(LCN-ATH-004)', target: '.qr-box' },
            { text: 'QR 인증 실패 시 → QR인증 실패페이지(LCN-ATH-003)',                              target: '.qr-box'       },
          ],
        },
        {
          href: 'qr-fail.html',
          label: 'QR인증 실패페이지',
          id: 'LCN-ATH-003',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-2679',
          description: [
            { text: '10초 카운트다운 (0초까지 감소 후 메인페이지 LCN-MAN-001로 자동 이동)',     target: '.fail-close-hint'   },
            { text: '확인 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                       target: '.fail-confirm-btn'  },
          ],
        },
        {
          href: 'reservation-empty.html',
          label: '예약목록 미존재 알림페이지',
          id: 'LCN-ATH-004',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=338-305',
          description: [
            { text: '10초 카운트다운 (0초까지 감소 후 메인페이지 LCN-MAN-001로 자동 이동)',    target: '.empty-close-hint'   },
            { text: '확인 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                     target: '.empty-confirm-btn'  },
          ],
        },
        {
          href: 'reservation-list.html',
          label: '예약목록 페이지-1개',
          id: 'LCN-ATH-005',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=339-339',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(QR출력페이지 LCN-ATH-002)로 이동',  target: '.reservation-back'         },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                      target: '.reservation-home'         },
            { text: '예약 카드 — 티켓 아이콘 + 기간제 뱃지 + 타석 위치 + 시작/종료 시간',  target: '.reservation-card'         },
            { text: '도착 완료하기 버튼을 클릭하면 도착인증 완료 페이지(LCN-ATH-006)로 이동', target: '.reservation-confirm-btn'  },
          ],
        },
        {
          href: 'reservation-list-multi.html',
          label: '예약목록 페이지-2개이상',
          id: 'LCN-ATH-008',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=380-563',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(QR출력페이지 LCN-ATH-002)로 이동',  target: '.reservation-multi-back'  },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                      target: '.reservation-multi-home' },
            { text: 'QR 인증 후 예약이 2개 이상(주로 횟수권)일 때 노출되는 선택 목록. 타이틀 "예약한 내역을 선택해주세요"', target: '.reservation-multi-title' },
            { text: '예약 카드 — 티켓 아이콘 + 횟수권 뱃지 + 타석 위치 + 시작/종료 시간',  target: '.reservation-multi-item' },
            { text: '예약 카드를 클릭(선택)하면 dim 배경 위로 예약최종확인 모달(LCN-ATH-007)이 열림',     target: '.reservation-multi-list' },
          ],
        },
        {
          href: 'reservation-list-multi.html?modal=1',
          label: '예약최종확인 모달',
          id: 'LCN-ATH-007',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=385-286',
          description: [
            { text: '예약목록(LCN-ATH-008)에서 카드 선택 시 dim 처리된 배경 위로 뜨는 하단 시트 모달', target: '.rm-backdrop' },
            { text: '선택한 타석명(예: 3F 15번) + "선택하신 자리가 맞나요?" 안내', target: '.rm-modal-title' },
            { text: '[맞아요] 클릭 시 도착인증 완료 페이지(LCN-ATH-006)로 이동', target: '.rm-modal-btn.confirm' },
            { text: '[다시 고를래요] 또는 dim 배경 클릭 시 모달을 닫고 예약목록으로 복귀', target: '.rm-modal-btn.cancel' },
          ],
        },
        {
          href: 'arrival-complete.html',
          label: '도착인증 완료 페이지',
          id: 'LCN-ATH-006',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=313-2757',
          description: [
            { text: '5초 카운트다운 (0초까지 감소 후 랜딩페이지 LCN-INT-001로 자동 이동)',       target: '.complete-close-hint'  },
            { text: '확인 버튼을 클릭하면 랜딩페이지(LCN-INT-001)로 이동',                       target: '.complete-confirm-btn' },
          ],
        },
      ],
    },
    {
      name: '1회권 구매',
      pages: [
        {
          href: 'purchase.html',
          label: '1회권상품 선택 페이지',
          id: 'LCN-PCH-001',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=313-2719',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(메인페이지 LCN-MAN-001)로 이동',     target: '.purchase-back'           },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                       target: '.purchase-home'           },
            { text: '상단 탭("일일권") + 구분선까지 sticky, 아래 카테고리 라벨과 상품 리스트는 스크롤', target: '.purchase-header' },
            { text: '상품 카드(상품명 + 가격 + 골퍼 일러스트) 클릭 시 상품 상세페이지(LCN-PCH-009)로 이동',     target: '.purchase-product-list' },
          ],
        },
        {
          href: 'phone-input.html',
          label: '휴대폰번호 입력페이지',
          id: 'LCN-PCH-002',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=308-356',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(상품 상세 LCN-PCH-009)로 이동',                  target: '.phone-back'   },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                                  target: '.phone-home'   },
            { text: '입력 필드 — "010" prefix로 시작, 키패드 입력 시 010-XXXX-XXXX 형식으로 자동 포맷', target: '.phone-input'  },
            { text: '키패드(1-9, 0) — 숫자 입력, 우하단 백스페이스로 마지막 자리 삭제',                 target: '.phone-keypad' },
            { text: '11자리 모두 입력 시 자동으로 타석 선택페이지(LCN-PCH-003)로 진행',                  target: '.phone-input'  },
            { text: '"안 할래요" 클릭 시 휴대폰번호 입력 스킵하고 타석 선택페이지(LCN-PCH-003)로 이동',  target: '.phone-skip'   },
          ],
        },
        {
          href: 'seat-select.html',
          label: '타석 선택페이지',
          id: 'LCN-PCH-003',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-700',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(휴대폰번호 입력 LCN-PCH-002)로 이동',     target: '.seat-back'  },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                            target: '.seat-home'  },
            { text: '상단 영역(헤더 + 층 탭 + divider)까지 sticky, 타석 그리드만 스크롤',           target: '.seat-top'   },
            { text: '층 탭 (2층/3층/4층/5층) — 클릭 시 그리드 데이터 전환, 층별 선택은 유지됨',  target: '.seat-tabs'  },
            { text: '타석 그리드 (5×5) — 가용/이용중/예약석 상태 표시, 모든 층 합쳐 최대 3개까지 선택 가능. 3/3 도달 시 비선택 타석은 dim + 클릭 비활성', target: '.seat-grid' },
            { text: '이용중 타석의 잔여시간은 항상 분 단위로 표시되며, 5분 미만 남은 경우 강조 표시', target: '.seat-time.urgent' },
            { text: '하단 fixed: [초기화] = 모든 층 선택 해제, [다음] = 필요 타석 수(3개)를 모두 선택해야 활성 → 선택내용 확인페이지(LCN-PCH-004)로 이동', target: '.seat-footer' },
          ],
        },
        {
          href: 'selection-confirm.html',
          label: '선택내용 확인페이지',
          id: 'LCN-PCH-004',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-2702',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(타석 선택 LCN-PCH-003)로 이동',                   target: '.confirm-back'    },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                                    target: '.confirm-home'    },
            { text: '헤더 "이대로 결제할까요?"',                                                            target: '.confirm-title'   },
            { text: '선택 항목 리스트 — 항목별(골퍼 아이콘 + 상품명/수량/금액 + 타석 층·번호)', target: '.confirm-list'    },
            { text: '모든 항목은 개별 리스트로 표시 — 같은 상품(예: 주중 90분)이라도 선택한 타석마다 각각 별도의 행으로 나열(타석별 1행, 수량 1)', target: '.confirm-list' },
            { text: '결제 버튼 (수량 뱃지 + 총 금액 결제하기) 클릭 시 카드결제 화면(LCN-PCH-005)로 이동', target: '.confirm-pay-btn' },
          ],
        },
        {
          href: 'card-payment.html',
          label: '카드결제 화면',
          id: 'LCN-PCH-005',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=339-332',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(선택내용 확인 LCN-PCH-004)로 이동',                              target: '.card-pay-back'    },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                                                  target: '.card-pay-home'    },
            { text: '제목 "60,000원 결제해요"',                                                                          target: '.card-pay-title'   },
            { text: '삼성페이 버튼 — 카드 아이콘 + "삼성페이" 텍스트, 클릭 시 결제 성공페이지(LCN-PCH-006)로 이동',     target: '.card-pay-methods' },
            { text: '애플·NFC 버튼 — NFC 아이콘 + "애플 · NFC" 텍스트, 클릭 시 결제 성공페이지(LCN-PCH-006)로 이동',   target: '.card-pay-methods' },
            { text: 'QR 간편결제 버튼 — QR 아이콘 + "QR 간편결제" 텍스트, 클릭 시 결제 성공페이지(LCN-PCH-006)로 이동', target: '.card-pay-qr'      },
            { text: '하단 카드투입 안내 영역 — 위쪽 꺽새 아이콘, 화면 아래로 부분 노출',                                 target: '.card-pay-cta'     },
          ],
        },
        {
          href: 'payment-success.html',
          label: '결제 성공페이지',
          id: 'LCN-PCH-006',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-653',
          description: [
            { text: '체크 아이콘 (성공 표시)',                                                          target: '.success-icon'  },
            { text: '결제 금액 안내 "60,000원 결제완료"',                                                target: '.success-title' },
            { text: '안내 문구 "카드를 빼주세요"',                                                       target: '.success-sub'   },
            { text: '뒤로/홈 버튼이 없는 미니멀 페이지. 카드를 빼면 자동으로 메인페이지로 복귀 (외부 단말기 동작)', target: '.success-text' },
            { text: '엘커넥트 측에서 우리 에이전트로 결제 성공 결과를 전달하는 API 개발이 필요. 우리 에이전트가 본 페이지를 우리 플러그인으로 띄움', target: '.success-text' },
          ],
        },
        {
          href: 'payment-fail.html',
          label: '결제 실패페이지',
          id: 'LCN-PCH-007',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-668',
          description: [
            { text: '경고 아이콘 (실패 표시)',                                                          target: '.pay-fail-icon'  },
            { text: '결제 금액 안내 "60,000원 결제실패"',                                                target: '.pay-fail-title' },
            { text: '안내 문구 "카드를 빼주세요"',                                                       target: '.pay-fail-sub'   },
            { text: '뒤로/홈 버튼이 없는 미니멀 페이지. 카드를 빼면 자동으로 메인페이지로 복귀 (외부 단말기 동작)', target: '.pay-fail-text' },
            { text: '엘커넥트 측에서 우리 에이전트로 결제 실패 결과를 전달하는 API 개발이 필요. 우리 에이전트가 본 페이지를 우리 플러그인으로 띄움', target: '.pay-fail-text' },
          ],
        },
        {
          href: 'final-complete.html',
          label: '타석배정 최종완료 페이지',
          id: 'LCN-PCH-010',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=310-687',
          description: [
            { text: '서브 라벨 "환영합니다!"',                                                            target: '.final-subtitle'    },
            { text: '메인 타이틀 "5분 뒤 시간이 활성화돼요"',                                              target: '.final-title'       },
            { text: '시작/종료 시간 박스 (시간 정보 표시)',                                                target: '.final-info'        },
            { text: '배정된 타석 리스트 (영역 초과 시 세로 스크롤 가능)',                                  target: '.final-seat-list'   },
            { text: '10초 카운트다운 (0초까지 감소 후 랜딩페이지 LCN-INT-001로 자동 이동)',             target: '.final-close-hint'  },
            { text: '확인 버튼을 클릭하면 랜딩페이지(LCN-INT-001)로 이동',                                target: '.final-confirm-btn' },
            { text: 'LCN-PCH-006 결제 성공 후, 외부 단말기에서 카드 제거를 감지하면 자동으로 본 페이지로 진입', target: '' },
          ],
        },
        {
          href: 'product-detail.html',
          label: '상품 상세페이지',
          id: 'LCN-PCH-009',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=339-474',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(1회권상품 선택 페이지 LCN-PCH-001)로 이동',          target: '.product-detail-back'    },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                                       target: '.product-detail-home'    },
            { text: '큰 골퍼 일러스트 + 상품명 + 단가/총액("총 N원") 표시',                                  target: '.product-detail-info'    },
            { text: '수량 선택기 (- / 카운트 / +) — 단가 × 수량을 "총 N원" 라인에 실시간 반영, 최소 1. 가운데 숫자 영역은 좌/우 스와이프로도 -1/+1 가능', target: '.product-detail-qty' },
            { text: '하단 안내 문구 — "총 금액은 타석 선택 후 결제해요" (고정 문구)',                       target: '.product-detail-bottom-hint' },
            { text: '"다음" 버튼 클릭 시 휴대폰번호 입력페이지(LCN-PCH-002)로 이동 (실제 결제는 타석 선택 이후 LCN-PCH-005에서 진행)', target: '.product-detail-pay-btn' },
          ],
        },
      ],
    },
  ];

  // 현재 페이지 파일명 + 쿼리스트링 (모달 상태 구분용: file.html?modal=1)
  function currentKey() {
    const path = location.pathname.split('/').pop();
    const file = (!path || path === '') ? 'index.html' : path;
    return file + location.search;
  }

  // 현재 페이지 정보 찾기 (쿼리 포함 정확 매칭 우선, 없으면 파일명만으로 매칭)
  function findCurrentPage(current) {
    const file = current.split('?')[0];
    let byFile = null;
    for (const cat of CATEGORIES) {
      for (const p of cat.pages) {
        if (p.href === current) return { page: p, category: cat.name };
        if (!byFile && p.href.split('?')[0] === file) byFile = { page: p, category: cat.name };
      }
    }
    return byFile;
  }

  function injectPageNav() {
    const current = currentKey();

    // 테이블 본문 행들 (카테고리 헤더 + 페이지 행)
    let rowsHtml = '';
    CATEGORIES.forEach(cat => {
      rowsHtml += `
        <tr class="nav-cat-row">
          <th colspan="3">${cat.name}</th>
        </tr>
      `;
      cat.pages.forEach(p => {
        const isActive = current === p.href;
        const isTbd = p.id === 'TBD';
        rowsHtml += `
          <tr class="nav-page-row${isActive ? ' is-active' : ''}" data-href="${p.href}">
            <td class="cell-id${isTbd ? ' is-tbd' : ''}">${p.id || '-'}</td>
            <td class="cell-name">${p.label}</td>
            <td class="cell-status">
              <span class="status-badge status--${p.designed ? 'done' : 'pending'}"
                    title="${p.designed ? '디자인 반영 완료' : '디자인 미반영'}">
                ${p.designed ? '반영' : '미반영'}
              </span>
            </td>
          </tr>
        `;
      });
    });

    const nav = document.createElement('aside');
    nav.className = 'page-nav';
    nav.innerHTML = `
      <div class="page-nav-title">페이지 목록</div>
      <table class="page-nav-table">
        <thead>
          <tr>
            <th class="col-id">화면ID</th>
            <th class="col-name">화면이름</th>
            <th class="col-status">디자인</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    // 행 클릭 → 페이지 이동
    nav.addEventListener('click', (e) => {
      const row = e.target.closest('.nav-page-row');
      if (row && row.dataset.href) {
        location.href = row.dataset.href;
      }
    });

    const toggle = document.createElement('button');
    toggle.className = 'page-nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', '페이지 목록 열기');
    toggle.textContent = '☰';
    toggle.addEventListener('click', () => {
      nav.classList.remove('is-hidden');
    });

    // 사이드바 자체에도 닫기 더블클릭 비활성화. 우상단 X로 닫기 가능하게.
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '페이지 목록 닫기');
    closeBtn.style.cssText = [
      'position:absolute', 'top:8px', 'right:8px',
      'width:24px', 'height:24px',
      'border:none', 'background:transparent',
      'font-size:16px', 'color:#9ca3af',
      'cursor:pointer', 'border-radius:6px'
    ].join(';');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      nav.classList.add('is-hidden');
    });
    nav.appendChild(closeBtn);

    document.body.appendChild(nav);
    document.body.appendChild(toggle);
  }

  // ── 우측 페이지 상세 정보 패널 ──────────────
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function injectPageDetail() {
    const current = currentKey();
    const found = findCurrentPage(current);
    if (!found) return;

    const { page, category } = found;
    const isTbd = page.id === 'TBD';
    const desc = Array.isArray(page.description) ? page.description : [];

    // Description 본문 렌더 (리스트 or empty state)
    const descriptionBlock = desc.length === 0
      ? `
        <div class="page-detail-empty">
          <div class="page-detail-empty-icon">📝</div>
          <div class="page-detail-empty-title">등록된 Description이 없습니다</div>
          <div class="page-detail-empty-sub">디자인이 반영되면 화면 구성 요소를<br>여기에 정리해 주세요.</div>
        </div>
      `
      : `
        <ol class="page-detail-list">
          ${desc.map((item, i) => `
            <li class="page-detail-item" data-target="${escapeHtml(item.target || '')}">
              <span class="page-detail-item-num">${i + 1}</span>
              <span class="page-detail-item-text">${escapeHtml(item.text)}</span>
            </li>
          `).join('')}
        </ol>
      `;

    const detail = document.createElement('aside');
    detail.className = 'page-detail';
    detail.innerHTML = `
      <div class="page-detail-header">
        <div class="page-detail-title">Description</div>
        <button class="page-detail-close" type="button" aria-label="닫기">×</button>
      </div>
      <div class="page-detail-body">
        <div class="page-detail-field">
          <div class="page-detail-label">화면 ID</div>
          <div class="page-detail-value${isTbd ? ' is-tbd' : ''}">${escapeHtml(page.id || '-')}</div>
        </div>
        <div class="page-detail-field">
          <div class="page-detail-label">화면명</div>
          <div class="page-detail-value">${escapeHtml(page.label)}</div>
        </div>
        <div class="page-detail-field">
          <div class="page-detail-label">카테고리</div>
          <div class="page-detail-value">${escapeHtml(category)}</div>
        </div>
        <div class="page-detail-field">
          <div class="page-detail-label">디자인 반영</div>
          <div class="page-detail-value">
            <span class="status-badge status--${page.designed ? 'done' : 'pending'}">
              ${page.designed ? '반영' : '미반영'}
            </span>
          </div>
        </div>
        <div class="page-detail-field">
          <div class="page-detail-label">Figma 링크</div>
          <div class="page-detail-value">
            ${page.figmaLink
              ? `<a href="${escapeHtml(page.figmaLink)}" target="_blank" rel="noopener noreferrer" class="page-detail-link">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                     <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                     <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                   </svg>
                   Figma에서 열기
                 </a>`
              : `<span class="page-detail-empty-value">미등록</span>`
            }
          </div>
        </div>
        <div class="page-detail-divider"></div>
        ${descriptionBlock}
      </div>
    `;

    const toggle = document.createElement('button');
    toggle.className = 'page-detail-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Description 열기');
    toggle.textContent = 'i';
    toggle.addEventListener('click', () => detail.classList.remove('is-hidden'));

    detail.querySelector('.page-detail-close')
      .addEventListener('click', () => detail.classList.add('is-hidden'));

    // 항목 hover → 해당 UI만 또렷, 나머지는 dim
    // device-screen 의 첫 자식을 화면 래퍼로 간주 (페이지별로 .main-screen, .auth-screen, .placeholder-screen 등 다양함)
    function getScreenEl() {
      const ds = document.querySelector('.device-screen');
      return ds ? ds.firstElementChild : null;
    }
    detail.querySelectorAll('.page-detail-item').forEach(li => {
      const selector = li.dataset.target;
      if (!selector) return;
      li.addEventListener('mouseenter', () => {
        const screen = getScreenEl();
        const target = screen && screen.querySelector(selector);
        if (!screen || !target) return;
        screen.classList.add('is-dimming');
        target.classList.add('is-highlighted');
        // 타겟이 nested 일 경우: 모든 부모(스크린 직전까지)에 contains-highlight 클래스 부여
        // → CSS 가 해당 분기는 dim 하지 않도록 처리
        let p = target.parentElement;
        while (p && p !== screen) {
          p.classList.add('contains-highlight');
          p = p.parentElement;
        }
      });
      li.addEventListener('mouseleave', () => {
        const screen = getScreenEl();
        if (!screen) return;
        screen.classList.remove('is-dimming');
        screen.querySelectorAll('.is-highlighted').forEach(e => e.classList.remove('is-highlighted'));
        screen.querySelectorAll('.contains-highlight').forEach(e => e.classList.remove('contains-highlight'));
      });
    });

    document.body.appendChild(detail);
    document.body.appendChild(toggle);
  }

  // ── 좌측 하단 화면 플로우 다이어그램 (Mermaid) ──────────
  // 각 화면 파일 → 다이어그램 노드 ID
  const FLOW_HREFS = {
    INT:  'landing.html',
    MAN:  'index.html',
    ATH1: 'arrival.html',
    ATH2: 'qr-output.html',
    ATH3: 'qr-fail.html',
    ATH4: 'reservation-empty.html',
    ATH5: 'reservation-list.html',
    ATH8: 'reservation-list-multi.html',
    ATH7: 'reservation-list-multi.html?modal=1',
    ATH6: 'arrival-complete.html',
    PCH1: 'purchase.html',
    PCH9: 'product-detail.html',
    PCH2: 'phone-input.html',
    PCH3: 'seat-select.html',
    PCH4: 'selection-confirm.html',
    PCH5: 'card-payment.html',
    PCH6: 'payment-success.html',
    PCH7: 'payment-fail.html',
    PCH10:'final-complete.html',
  };
  // 노드 클릭 → 해당 페이지로 이동 (mermaid 콜백, 인자로 nodeId 전달됨)
  window.__flowGo = function (nodeId) {
    const href = FLOW_HREFS[nodeId];
    if (href) location.href = href;
  };

  function currentFlowNode() {
    const file = currentKey().split('?')[0];
    if (file === 'reservation-list-multi.html' && /(?:^|[?&])modal=1(?:&|$)/.test(location.search)) {
      return 'ATH7';
    }
    // 파일명 → 노드 ID 역매핑
    for (const node in FLOW_HREFS) {
      if (FLOW_HREFS[node].split('?')[0] === file) return node;
    }
    return null;
  }

  function buildFlowGraph() {
    const lines = [
      'graph TD',

      // ── 노드 정의 (화면=둥근 사각, 액션=둥근 사각, 분기=마름모, 시작/종료=원) ──
      's0(( ))',
      'INT("랜딩페이지<br/>(LCN-INT-001)")',
      'MAN("메인페이지<br/>(LCN-MAN-001)")',
      'ATH1("인증방법 선택페이지<br/>(LCN-ATH-001)")',
      'ATH2("QR 출력페이지<br/>(LCN-ATH-002)")',
      'ATH3("QR인증 실패페이지<br/>(LCN-ATH-003)")',
      'ATH4("예약목록 미존재 알림페이지<br/>(LCN-ATH-004)")',
      'ATH5("예약목록 페이지-1개<br/>(LCN-ATH-005)")',
      'ATH8("예약목록 페이지-2개이상<br/>(LCN-ATH-008)")',
      'ATH7("예약최종확인 모달<br/>(LCN-ATH-007)")',
      'ATH6("도착인증 완료 페이지<br/>(LCN-ATH-006)")',
      'PCH1("1회권상품 선택 페이지<br/>(LCN-PCH-001)")',
      'PCH9("상품 상세페이지<br/>(LCN-PCH-009)")',
      'PCH2("휴대폰번호 입력페이지<br/>(LCN-PCH-002)")',
      'PCH3("타석 선택페이지<br/>(LCN-PCH-003)")',
      'PCH4("선택내용 확인페이지<br/>(LCN-PCH-004)")',
      'PCH5("카드결제 화면<br/>(LCN-PCH-005)")',
      'PCH6("결제 성공페이지<br/>(LCN-PCH-006)")',
      'PCH7("결제 실패페이지<br/>(LCN-PCH-007)")',
      'PCH10("타석배정 최종완료 페이지<br/>(LCN-PCH-010)")',
      // 액션(클릭) 노드
      'aWel("환영합니다 클릭")',
      'aArr("도착 인증 클릭")',
      'aQr("QR로 인증하기 클릭")',
      'aDone("도착 완료하기 클릭")',
      'aSel("예약목록 클릭")',
      'aOk("맞아요 클릭")',
      'aBuy("1회권 구매 클릭")',
      'aProd("상품 선택 클릭")',
      'aNext1("다음 클릭")',
      'aNext2("다음 클릭")',
      'aPay("결제하기 클릭")',
      // 분기(판단) 노드
      'dOk{"인증 성공 여부"}',
      'dRes{"예약 목록 존재 여부"}',
      'dCnt{"예약 개수"}',
      'dPay{"결제 성공 여부"}',

      // ── 엣지 ──
      's0 --> INT',
      'INT --> aWel',
      'aWel --> MAN',
      'MAN -. 30초 무동작 .-> INT',   // 메인에서 무동작 30초 경과 시 랜딩으로 자동 복귀
      // 도착인증
      'MAN -->|도착 인증| aArr',
      'aArr --> ATH1',
      'ATH1 --> aQr',
      'aQr --> ATH2',
      'ATH2 -->|QR 리딩| dOk',
      'dOk -->|실패| ATH3',
      'dOk -->|성공| dRes',
      'dRes -->|미존재| ATH4',
      'dRes -->|존재| dCnt',
      'dCnt -->|1개| ATH5',
      'ATH5 --> aDone',
      'aDone --> ATH6',
      'dCnt -->|2개 이상| ATH8',
      'ATH8 --> aSel',
      'aSel --> ATH7',
      'ATH7 --> aOk',
      'aOk --> ATH6',
      'ATH6 -. 카운트다운/확인 .-> INT',
      // 1회권 구매
      'MAN -->|1회권 구매| aBuy',
      'aBuy --> PCH1',
      'PCH1 --> aProd',
      'aProd --> PCH9',
      'PCH9 --> aNext1',
      'aNext1 --> PCH2',
      'PCH2 -->|번호 입력/안 할래요| PCH3',
      'PCH3 --> aNext2',
      'aNext2 --> PCH4',
      'PCH4 --> aPay',
      'aPay --> PCH5',
      'PCH5 --> dPay',
      'dPay -->|성공| PCH6',
      'PCH6 --> PCH10',
      'PCH10 -. 카운트다운/확인 .-> INT',
      'dPay -->|실패| PCH7',

      // ── 클래스 지정 ──
      'class INT,MAN,ATH1,ATH2,ATH3,ATH4,ATH5,ATH8,ATH7,ATH6,PCH1,PCH9,PCH2,PCH3,PCH4,PCH5,PCH6,PCH7,PCH10 screen',
      'class aWel,aArr,aQr,aDone,aSel,aOk,aBuy,aProd,aNext1,aNext2,aPay action',
      'class dOk,dRes,dCnt,dPay decision',
      'class s0 term',

      // ── 스타일 정의 ──
      'classDef screen fill:#3182F6,stroke:#2f74e0,color:#ffffff;',
      'classDef action fill:#D9E8FF,stroke:#AFCDF5,color:#1f3a63;',
      'classDef decision fill:#FFD43B,stroke:#EBB400,color:#5a4500;',
      'classDef term fill:#8b95a1,stroke:#6b7280,color:#8b95a1;',
      'classDef cur stroke:#FF3B30,stroke-width:4px;',
    ];

    // 클릭 → 페이지 이동 (실제 화면 노드만)
    Object.keys(FLOW_HREFS).forEach(n => lines.push(`click ${n} call __flowGo()`));

    // 현재 화면 강조 (진한 테두리)
    const cur = currentFlowNode();
    if (cur) lines.push(`class ${cur} cur`);

    return lines.join('\n');
  }

  async function renderFlowMermaid() {
    if (!window.mermaid) return;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'neutral',
        // useMaxWidth:false → 패널 폭에 맞춰 축소하지 않고 다이어그램 자연 크기로 렌더
        flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 28, rankSpacing: 55, padding: 8, useMaxWidth: false },
      });
      await window.mermaid.run({ querySelector: '.page-flow .mermaid' });
      // 렌더된 SVG를 viewBox 자연 크기로 고정 → 좌우/상하 스크롤로 보기
      const svg = document.querySelector('.page-flow .mermaid svg');
      if (svg) {
        svg.style.maxWidth = 'none';
        const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
        if (vb.length === 4 && vb[2] && vb[3]) {
          svg.setAttribute('width', vb[2]);
          svg.setAttribute('height', vb[3]);
          svg.style.width = vb[2] + 'px';
          svg.style.height = vb[3] + 'px';
        }
      }
      // 렌더 완료 → 로딩 상태 해제(원시 텍스트 숨김 풀고 다이어그램 노출)
      const panel = document.querySelector('.page-flow');
      if (panel) panel.classList.remove('is-loading');
      // 현재 화면 노드를 패널 정중앙으로 스크롤 (레이아웃 확정 후)
      requestAnimationFrame(() => requestAnimationFrame(centerCurrentFlowNode));
    } catch (e) { /* noop */ }
  }

  // 현재 화면 노드를 지정한 스크롤 컨테이너의 정중앙에 위치시키기 (패널/모달 공용)
  function centerCurrentNodeIn(body, smooth) {
    const svg = body && body.querySelector('svg');
    if (!body || !svg) return;
    const cur = currentFlowNode();
    if (!cur) return;
    const node = svg.querySelector(`g.node[id^="flowchart-${cur}-"]`)
      || [...svg.querySelectorAll('g.node')].find(n => n.id && n.id.includes(`-${cur}-`));
    if (!node) return;
    const nb = node.getBoundingClientRect();
    const bb = body.getBoundingClientRect();
    // (노드 중심 - 컨테이너 중심)만큼 현재 스크롤에서 이동
    const left = body.scrollLeft + (nb.left + nb.width / 2) - (bb.left + bb.width / 2);
    const top  = body.scrollTop  + (nb.top + nb.height / 2) - (bb.top + bb.height / 2);
    if (smooth) body.scrollTo({ left, top, behavior: 'smooth' });
    else { body.scrollLeft = left; body.scrollTop = top; }
  }
  function centerCurrentFlowNode(smooth) {
    centerCurrentNodeIn(document.querySelector('.page-flow-body'), smooth);
  }

  // 플로우 패널 드래그(grab) 패닝 — 잡고 상하좌우로 끌어 이동
  function enableFlowPan(body) {
    if (!body) return;
    let down = false, sx = 0, sy = 0, sl = 0, st = 0, moved = false, suppressClick = false;
    body.style.cursor = 'grab';

    body.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;            // 좌클릭만
      down = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      sl = body.scrollLeft; st = body.scrollTop;
      body.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      body.scrollLeft = sl - dx;
      body.scrollTop  = st - dy;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      body.style.cursor = 'grab';
      if (moved) {                            // 드래그였으면 직후 click 1회 무시(노드 이동 방지)
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
      }
    });
    // 드래그 후 발생하는 click을 capture 단계에서 차단 → 노드 내비게이션 방지
    body.addEventListener('click', (e) => {
      if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
    }, true);
  }

  function injectFlowDiagram() {
    const aside = document.createElement('aside');
    aside.className = 'page-flow is-loading';
    aside.innerHTML = `
      <div class="page-flow-header">
        <div class="page-flow-title">화면 플로우</div>
        <div class="page-flow-header-tools">
          <button class="page-flow-locate" type="button" aria-label="현재 위치" title="현재 화면으로 이동">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="7"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
            </svg>
          </button>
          <button class="page-flow-expand" type="button" aria-label="크게 보기" title="크게 보기">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
          <button class="page-flow-toggle" type="button" aria-label="플로우 접기/펼치기">▾</button>
        </div>
      </div>
      <div class="page-flow-body">
        <div class="page-flow-loading">화면 플로우를 불러오는 중…</div>
        <pre class="mermaid">${buildFlowGraph()}</pre>
      </div>
    `;
    document.body.appendChild(aside);

    // 드래그(grab) 패닝 활성화
    enableFlowPan(aside.querySelector('.page-flow-body'));

    // 현재 위치(현재 화면 노드 중앙으로 이동)
    aside.querySelector('.page-flow-locate').addEventListener('click', () => {
      if (aside.classList.contains('is-collapsed')) {  // 접혀 있으면 펼친 뒤 이동
        aside.classList.remove('is-collapsed');
        aside.querySelector('.page-flow-toggle').textContent = '▾';
        requestAnimationFrame(() => requestAnimationFrame(() => centerCurrentFlowNode(true)));
      } else {
        centerCurrentFlowNode(true);
      }
    });

    // 접기 토글
    aside.querySelector('.page-flow-toggle').addEventListener('click', (e) => {
      const collapsed = aside.classList.toggle('is-collapsed');
      e.currentTarget.textContent = collapsed ? '▸' : '▾';
    });

    // ── 전체화면(크게보기) 모달 ──────────────────
    const modal = document.createElement('div');
    modal.className = 'page-flow-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="page-flow-modal-panel">
        <div class="page-flow-modal-header">
          <div class="page-flow-modal-title">화면 플로우</div>
          <div class="page-flow-modal-tools">
            <button type="button" data-zoom="out" aria-label="축소">−</button>
            <span class="page-flow-modal-zoom">100%</span>
            <button type="button" data-zoom="in" aria-label="확대">+</button>
            <button type="button" data-zoom="fit" aria-label="맞춤">맞춤</button>
            <button type="button" class="page-flow-modal-locate" aria-label="현재 위치" title="현재 화면으로 이동">현재 위치</button>
            <button type="button" class="page-flow-modal-close" aria-label="닫기">✕</button>
          </div>
        </div>
        <div class="page-flow-modal-body"><pre class="mermaid mermaid-modal">${buildFlowGraph()}</pre><div class="page-flow-modal-loading">화면 플로우를 불러오는 중…</div></div>
      </div>
    `;
    document.body.appendChild(modal);

    const modalBody = modal.querySelector('.page-flow-modal-body');
    const zoomLabel = modal.querySelector('.page-flow-modal-zoom');
    enableFlowPan(modalBody);

    let modalNatW = 0, modalNatH = 0, modalZoom = 1, modalRendered = false;

    function applyModalZoom(recenter) {
      const svg = modalBody.querySelector('svg');
      if (!svg || !modalNatW) return;
      svg.style.width = Math.round(modalNatW * modalZoom) + 'px';
      svg.style.height = Math.round(modalNatH * modalZoom) + 'px';
      zoomLabel.textContent = Math.round(modalZoom * 100) + '%';
      if (recenter) requestAnimationFrame(() => requestAnimationFrame(() => centerCurrentNodeIn(modalBody)));
    }
    function fitModalZoom() {
      const bb = modalBody.getBoundingClientRect();
      if (modalNatW && modalNatH) {
        // 폭 기준으로 채우되 과하게 크지 않도록 cap
        modalZoom = Math.max(0.4, Math.min((bb.width - 56) / modalNatW, 2.4));
      }
      applyModalZoom(true);
    }
    async function ensureModalRendered() {
      if (modalRendered || !window.mermaid) return;
      modalRendered = true;
      try {
        window.mermaid.initialize({
          startOnLoad: false, securityLevel: 'loose', theme: 'neutral',
          flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 28, rankSpacing: 55, padding: 8, useMaxWidth: false },
        });
        await window.mermaid.run({ querySelector: '.page-flow-modal .mermaid-modal' });
        const svg = modalBody.querySelector('svg');
        if (svg) {
          svg.style.maxWidth = 'none';
          const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
          if (vb.length === 4) { modalNatW = vb[2]; modalNatH = vb[3]; }
        }
      } catch (e) { /* noop */ }
    }
    async function openFlowModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      await ensureModalRendered();
      fitModalZoom();
    }
    function closeFlowModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }

    aside.querySelector('.page-flow-expand').addEventListener('click', openFlowModal);
    modal.querySelector('.page-flow-modal-close').addEventListener('click', closeFlowModal);
    modal.querySelector('.page-flow-modal-locate').addEventListener('click', () => centerCurrentNodeIn(modalBody, true));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeFlowModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeFlowModal();
    });
    modal.querySelectorAll('[data-zoom]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.dataset.zoom;
        if (m === 'in') modalZoom = Math.min(modalZoom * 1.2, 4);
        else if (m === 'out') modalZoom = Math.max(modalZoom / 1.2, 0.3);
        else if (m === 'fit') { fitModalZoom(); return; }
        applyModalZoom(false);
      });
    });

    // mermaid 로드 후 렌더
    if (window.mermaid) {
      renderFlowMermaid();
    } else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      s.onload = renderFlowMermaid;
      s.onerror = () => {
        aside.classList.remove('is-loading');
        aside.querySelector('.page-flow-body').innerHTML =
          '<div style="font-size:12px;color:#9ca3af;">플로우 다이어그램을 불러오지 못했습니다(네트워크 필요).</div>';
      };
      document.head.appendChild(s);
    }
  }

  function init() {
    injectPageNav();
    injectPageDetail();
    injectFlowDiagram();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
