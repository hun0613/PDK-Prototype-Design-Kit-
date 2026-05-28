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
          href: 'index.html',
          label: '메인페이지',
          id: 'LCN-MAN-001',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=308-87',
          description: [
            { text: '도착 인증 버튼을 클릭하면 인증방법 선택페이지(LCN-ATH-001)로 이동',    target: '.menu-button.primary'   },
            { text: '1회권 구매 버튼을 클릭하면 1회권상품 선택페이지(LCN-PCH-001)로 이동', target: '.menu-button.secondary' },
            { text: '공지 배너 문구는 기기에서 수정 가능 (경로: 프론트 설정 > 플러그인 선택 > 플러그인 설정)', target: '.notice-banner' },
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
            { text: 'QR 인증 성공 시 → 예약목록 페이지(LCN-ATH-005) / 예약 없음 시 → 예약목록 미존재 알림페이지(LCN-ATH-004)', target: '.qr-box' },
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
          label: '예약목록 페이지',
          id: 'LCN-ATH-005',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=339-339',
          description: [
            { text: '뒤로가기 버튼을 클릭하면 이전 화면(QR출력페이지 LCN-ATH-002)로 이동',  target: '.reservation-back'         },
            { text: '홈 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                      target: '.reservation-home'         },
            { text: '예약 카드 — 골프 아이콘 + 기간제 뱃지 + 위치(3F 15번) + 시작/종료 시간',  target: '.reservation-card'         },
            { text: '도착 완료하기 버튼을 클릭하면 도착인증 완료 페이지(LCN-ATH-006)로 이동', target: '.reservation-confirm-btn'  },
          ],
        },
        {
          href: 'arrival-complete.html',
          label: '도착인증 완료 페이지',
          id: 'LCN-ATH-006',
          designed: true,
          figmaLink: 'https://www.figma.com/design/UfaTo8FaMLnsqzAvGkNUQq/%F0%9F%8E%A8-%ED%86%A0%EC%8A%A4-%ED%94%84%EB%A1%A0%ED%8A%B8?node-id=313-2757',
          description: [
            { text: '5초 카운트다운 (0초까지 감소 후 메인페이지 LCN-MAN-001로 자동 이동)',       target: '.complete-close-hint'  },
            { text: '확인 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                       target: '.complete-confirm-btn' },
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
            { text: '상품 카드(상품명 + 가격 + 골프 아이콘) 클릭 시 상품 상세페이지(LCN-PCH-009)로 이동',     target: '.purchase-product-list' },
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
            { text: '하단 fixed: [초기화] = 모든 층 선택 해제, [다음] = 1개 이상 선택 시 활성 → 선택내용 확인페이지(LCN-PCH-004)로 이동', target: '.seat-footer' },
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
            { text: '헤더 "이대로 결제할까요?" — 28px Bold',                                                target: '.confirm-title'   },
            { text: '상품 카드 — 골프 아이콘 + 상품명/수량/금액 + 선택된 타석 목록 (층+번호)',           target: '.confirm-card'    },
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
            { text: '제목 "60,000원 결제해요" — 28px SemiBold',                                                           target: '.card-pay-title'   },
            { text: '삼성페이 버튼 — 카드 아이콘 + "삼성페이" 텍스트, 클릭 시 결제 성공페이지(LCN-PCH-006)로 이동',     target: '.card-pay-methods' },
            { text: '애플·NFC 버튼 — NFC 아이콘 + "애플 · NFC" 텍스트, 클릭 시 결제 성공페이지(LCN-PCH-006)로 이동',   target: '.card-pay-methods' },
            { text: 'QR 간편결제 버튼 — QR 아이콘 + "QR 간편결제" 텍스트, 클릭 시 결제 성공페이지(LCN-PCH-006)로 이동', target: '.card-pay-qr'      },
            { text: '하단 파란 카드투입 안내 영역 — 위쪽 꺽새 아이콘, 화면 아래로 부분 노출',                            target: '.card-pay-cta'     },
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
            { text: '결제 금액 안내 "60,000원 결제완료" — 26px Bold',                                   target: '.success-title' },
            { text: '안내 문구 "카드를 빼주세요" — 28px Bold (그라데이션 텍스트)',                       target: '.success-sub'   },
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
            { text: '결제 금액 안내 "60,000원 결제실패" — 26px Bold',                                   target: '.pay-fail-title' },
            { text: '안내 문구 "카드를 빼주세요" — 28px Bold (그라데이션 텍스트)',                       target: '.pay-fail-sub'   },
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
            { text: '서브 라벨 "환영합니다!" — 17px Bold (그라데이션 텍스트)',                            target: '.final-subtitle'    },
            { text: '메인 타이틀 "5분 뒤 시간이 활성화돼요" — 28px Bold',                                  target: '.final-title'       },
            { text: '시작/종료 시간 박스 (radius 24, 시간 정보 표시)',                                     target: '.final-info'        },
            { text: '배정된 타석 리스트 (radius 16, 영역 초과 시 세로 스크롤 가능)',                       target: '.final-seat-list'   },
            { text: '10초 카운트다운 (0초까지 감소 후 메인페이지 LCN-MAN-001로 자동 이동)',             target: '.final-close-hint'  },
            { text: '확인 버튼을 클릭하면 메인페이지(LCN-MAN-001)로 이동',                                target: '.final-confirm-btn' },
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
            { text: '큰 골프 이미지(상단 230px)와 상품 정보(상품명/설명/단가) 표시',                          target: '.product-detail-info'    },
            { text: '수량 선택기 (- / 카운트 / +) — 단가 × 수량을 안내 문구에 실시간 반영, 최소 1. 가운데 숫자 영역은 좌/우 스와이프로도 -1/+1 가능', target: '.product-detail-qty' },
            { text: '하단 안내 문구 — "총 금액 N원은 타석 선택 후 결제해요" (수량 변경 시 자동 갱신)',     target: '.product-detail-bottom-hint' },
            { text: '"다음" 버튼 클릭 시 휴대폰번호 입력페이지(LCN-PCH-002)로 이동 (실제 결제는 타석 선택 이후 LCN-PCH-005에서 진행)', target: '.product-detail-pay-btn' },
          ],
        },
      ],
    },
  ];

  // 현재 페이지 정보 찾기
  function findCurrentPage(current) {
    for (const cat of CATEGORIES) {
      const page = cat.pages.find(p => p.href === current);
      if (page) return { page, category: cat.name };
    }
    return null;
  }

  function injectPageNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    const current = path === '' ? 'index.html' : path;

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
    const path = location.pathname.split('/').pop() || 'index.html';
    const current = path === '' ? 'index.html' : path;
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

  function init() {
    injectPageNav();
    injectPageDetail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
