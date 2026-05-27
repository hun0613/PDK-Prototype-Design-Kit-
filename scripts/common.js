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
          designed: false,
          description: [], // 미작성 → empty UI
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
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'qr-output.html',
          label: 'QR출력페이지',
          id: 'LCN-ATH-002',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'qr-fail.html',
          label: 'QR인증 실패페이지',
          id: 'LCN-ATH-003',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'reservation-empty.html',
          label: '예약목록 미존재 알림페이지',
          id: 'LCN-ATH-004',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'reservation-list.html',
          label: '예약목록 페이지',
          id: 'LCN-ATH-005',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'arrival-complete.html',
          label: '도착인증 완료 페이지',
          id: 'LCN-ATH-006',
          designed: false,
          description: [], // 미작성 → empty UI
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
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'phone-input.html',
          label: '휴대폰번호 입력페이지',
          id: 'LCN-PCH-002',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'seat-select.html',
          label: '타석 선택페이지',
          id: 'LCN-PCH-003',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'selection-confirm.html',
          label: '선택내용 확인페이지',
          id: 'LCN-PCH-004',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'card-payment.html',
          label: '카드결제(우리 에이전트) 화면',
          id: 'LCN-PCH-005',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'payment-success.html',
          label: '결제 성공페이지',
          id: 'LCN-PCH-006',
          designed: false,
          description: [], // 미작성 → empty UI
        },
        {
          href: 'payment-fail.html',
          label: '결제 실패페이지',
          id: 'LCN-PCH-007',
          designed: false,
          description: [], // 미작성 → empty UI
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
    function getScreenEl() {
      return document.querySelector('.main-screen, .screen');
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
      });
      li.addEventListener('mouseleave', () => {
        const screen = getScreenEl();
        if (!screen) return;
        const target = screen.querySelector(selector);
        screen.classList.remove('is-dimming');
        if (target) target.classList.remove('is-highlighted');
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
