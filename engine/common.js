// PDK (Prototype Design Kit) 엔진 공용 스크립트
// config(PDK_PROJECT/PDK_DEVICES/PDK_SCREENS)를 읽어 디바이스 목업 + 사이드바
// (페이지 목록 / 화면 플로우 / Description) 를 자동 렌더한다.

(function () {
  // ── 엔진 위치 자동 감지 (아이콘 등 에셋 경로 기준) ───────
  // 이 스크립트(engine/common.js)의 실제 URL에서 디렉토리를 추출 →
  // 페이지가 루트든 examples/ 같은 하위 폴더든 에셋 경로가 깨지지 않는다.
  var ENGINE_BASE = (function () {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/[^/]*$/, '');   // ".../engine/"
    return 'engine/';
  })();

  // ── 프로젝트 루트 경로 ────────────────────
  // 화면 HTML은 pages/ 안에, index.html은 루트에 있다.
  // config의 href는 항상 "루트 기준"(예: 'pages/scr-main-001.html')이므로,
  // 현재 문서 위치와 무관하게 루트를 기준으로 URL을 만들어야 한다.
  var ROOT_BASE = ENGINE_BASE.replace(/[^/]*\/$/, '');   // ".../engine/" → ".../"

  // 루트 기준 href → 현재 문서에서 열 수 있는 URL
  function pageUrl(href) {
    var h = String(href || '');
    if (/^(https?:)?\/\//.test(h) || h.charAt(0) === '/') return h;   // 절대경로는 그대로
    return ROOT_BASE + h;
  }
  // href에서 파일명만 (루트/pages 어디에 있든 현재 화면 판별에 사용)
  function baseName(u) { return String(u || '').split('/').pop(); }

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

  // ── 패널 이동 + 8방향 리사이즈 + 위치·크기 세션 저장 ──
  // .page-flow / .page-detail 을 팝업처럼 이동하고, 네 변·네 모서리로 크기를 조절한다.
  // 바꾼 위치·크기는 sessionStorage에 저장돼 새로고침·화면 이동 후에도 유지된다
  // (탭/브라우저를 닫으면 초기 배치로 돌아간다).
  var PANEL_MIN_W = 260, PANEL_MIN_H = 150;
  var PANEL_STORE = 'pdk:panel:';
  var RESIZE_DIRS = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];

  function loadPanelGeom(key) {
    try {
      var g = JSON.parse(sessionStorage.getItem(PANEL_STORE + key) || 'null');
      if (!g || typeof g.left !== 'number' || typeof g.width !== 'number') return null;
      return g;
    } catch (_) { return null; }   // 프라이빗 모드 등 저장소 접근 불가
  }
  function savePanelGeom(key, panel) {
    if (!key) return;
    try {
      var r = panel.getBoundingClientRect();
      sessionStorage.setItem(PANEL_STORE + key, JSON.stringify({
        left: Math.round(r.left), top: Math.round(r.top),
        width: Math.round(r.width), height: Math.round(r.height),
      }));
    } catch (_) {}
  }

  function makePanelFloating(panel, header, key) {
    if (!panel || !header) return;

    // right/bottom 앵커 + vh 높이 → left/top/width/height 절대값으로 1회 전환
    function detach() {
      if (panel.dataset.pdkDetached) return;
      var r = panel.getBoundingClientRect();
      setGeom(r.left, r.top, r.width, r.height);
    }
    function setGeom(left, top, w, h) {
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.style.maxHeight = 'none';   // 42vh/46vh 제약 해제 → 높이 자유 조절
      panel.style.left = Math.round(left) + 'px';
      panel.style.top = Math.round(top) + 'px';
      panel.style.width = Math.round(w) + 'px';
      panel.style.height = Math.round(h) + 'px';
      panel.dataset.pdkDetached = '1';
    }

    // 저장된 배치 복원 — 창이 작아졌을 수 있으므로 현재 뷰포트에 맞춰 보정
    var saved = key && loadPanelGeom(key);
    if (saved) {
      var w = Math.max(PANEL_MIN_W, Math.min(saved.width, window.innerWidth));
      var h = Math.max(PANEL_MIN_H, Math.min(saved.height, window.innerHeight));
      setGeom(
        Math.max(0, Math.min(saved.left, window.innerWidth - 40)),
        Math.max(0, Math.min(saved.top, window.innerHeight - 40)),
        w, h
      );
    }

    // 포인터 드래그 공통 처리 (capture로 패널 밖으로 나가도 계속 추적)
    function onDrag(el, e, move) {
      e.preventDefault();
      e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      function up() {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        savePanelGeom(key, panel);       // 조작이 끝난 시점의 배치를 저장
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    }

    // 1) 헤더 드래그 → 이동 (헤더의 버튼 클릭은 제외)
    header.style.cursor = 'move';
    header.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button')) return;
      detach();
      var r = panel.getBoundingClientRect();
      var offX = e.clientX - r.left, offY = e.clientY - r.top;
      onDrag(header, e, function (ev) {
        // 완전히 화면 밖으로 나가 다시 잡을 수 없게 되는 것만 막는다
        var nl = Math.max(0, Math.min(ev.clientX - offX, window.innerWidth - 40));
        var nt = Math.max(0, Math.min(ev.clientY - offY, window.innerHeight - 40));
        panel.style.left = nl + 'px';
        panel.style.top = nt + 'px';
      });
    });

    // 2) 네 변 + 네 모서리 핸들 → 크기 조절
    RESIZE_DIRS.forEach(function (dir) {
      var handle = document.createElement('div');
      handle.className = 'pdk-rz pdk-rz-' + dir;
      panel.appendChild(handle);
      handle.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        detach();
        var r = panel.getBoundingClientRect();
        var x0 = e.clientX, y0 = e.clientY;
        var right0 = r.right, bottom0 = r.bottom;
        onDrag(handle, e, function (ev) {
          var left = r.left, top = r.top, w = r.width, h = r.height;
          var dx = ev.clientX - x0, dy = ev.clientY - y0;

          if (dir.indexOf('e') > -1) {
            w = Math.max(PANEL_MIN_W, r.width + dx);
          } else if (dir.indexOf('w') > -1) {
            left = Math.max(0, Math.min(r.left + dx, right0 - PANEL_MIN_W));
            w = right0 - left;                 // 오른쪽 모서리 고정
          }
          if (dir.indexOf('s') > -1) {
            h = Math.max(PANEL_MIN_H, r.height + dy);
          } else if (dir.indexOf('n') > -1) {
            top = Math.max(0, Math.min(r.top + dy, bottom0 - PANEL_MIN_H));
            h = bottom0 - top;                 // 아래 모서리 고정
          }
          setGeom(left, top, w, h);
        });
      });
    });
  }

  // ── 화면 이동 헬퍼 ──────────────────────
  window.go = function (href) {
    location.href = pageUrl(href);
  };

  // ── 개발용 페이지 네비게이션 사이드바 ─────
  // 카테고리별 페이지 구조. 새 페이지는 해당 카테고리 pages 배열에 추가하면 됨.
  // description: [{ text, target }] 형식. target은 hover 시 강조할 UI의 CSS 선택자.
  //              빈 배열([])이면 empty state UI 표시.
  const CATEGORIES = Array.isArray(window.PDK_SCREENS) ? window.PDK_SCREENS : [];
  const FLOWS = Array.isArray(window.PDK_FLOWS) ? window.PDK_FLOWS : [];

  // 현재 선택된 플로우 ID (null = 전체 보기)
  var activeFlowId = null;

  // 현재 페이지 파일명 + 쿼리스트링 (모달 상태 구분용: file.html?modal=1)
  // window.PDK_CURRENT 가 지정되면 해당 화면 href로 강제 (샘플/프리뷰 페이지가
  // 자신이 어떤 화면을 대표하는지 선언할 때 사용)
  function currentKey() {
    if (window.PDK_CURRENT) return window.PDK_CURRENT;
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
        const hrefKey = baseName(p.href);
        if (hrefKey === current) return { page: p, category: cat.name || cat.category };
        if (!byFile && hrefKey.split('?')[0] === file) byFile = { page: p, category: cat.name || cat.category };
      }
    }
    return byFile;
  }

  function injectPageNav() {
    const current = currentKey();
    const found = findCurrentPage(current);

    // 본문: 카테고리 그룹 + 행 (원형 상태 뱃지)
    let groupsHtml = '';
    CATEGORIES.forEach(cat => {
      let rows = '';
      (cat.pages || []).forEach(p => {
        const active = current === baseName(p.href);
        // 디자인 확정(designed) 여부가 우선 — 미확정이면 선택 상태여도 체크(X), 마이너스 유지
        const badgeFile = !p.designed ? 'badge-pending' : (active ? 'badge-active' : 'badge-done');
        rows += `
          <div class="nav-row${active ? ' is-active' : ''}" data-href="${escapeHtml(p.href)}">
            <span class="nav-row-title">${escapeHtml(p.label)}</span>
            <img class="nav-bdg" src="${ENGINE_BASE}icons/${badgeFile}.svg" width="20" height="20" alt="" title="${p.designed ? '디자인 반영' : '미반영'}">
          </div>`;
      });
      groupsHtml += `
        <div class="nav-group">
          <div class="nav-cat">${escapeHtml(cat.name || cat.category || '')}</div>
          ${rows}
        </div>`;
    });

    // 화면이 하나도 없을 때(예: /pdk-init 직후) 빈 상태 안내
    if (!groupsHtml.trim()) {
      groupsHtml = `<div class="nav-empty-row">아직 화면이 없습니다.<br><code>/pdk-screen</code> 으로 추가하세요.</div>`;
    }

    // 플로우 Dock (PDK_FLOWS가 있을 때만 표시)
    let flowDockHtml = '';
    if (FLOWS.length > 0) {
      const chips = FLOWS.map(f =>
        `<button class="flow-dock-chip" data-flow-id="${escapeHtml(f.id)}" title="${escapeHtml(f.description || '')}">${escapeHtml(f.label)}</button>`
      ).join('');
      flowDockHtml = `
        <div class="flow-dock">
          <div class="flow-dock-label">FLOW</div>
          <div class="flow-dock-chips">
            <button class="flow-dock-chip is-active" data-flow-id="">전체</button>
            ${chips}
          </div>
        </div>`;
    }

    const nav = document.createElement('aside');
    nav.className = 'page-nav';
    nav.innerHTML = `
      ${flowDockHtml}
      <div class="page-nav-scroll">
        <div class="page-nav-cols"><span>PAGE NAME</span><span>UI DESIGN</span></div>
        ${groupsHtml}
      </div>
    `;

    // 행 클릭 → 페이지 이동 + 플로우 필터 해제(전체로 복귀)
    nav.addEventListener('click', (e) => {
      const row = e.target.closest('.nav-row');
      if (row && row.dataset.href) {
        location.href = pageUrl(row.dataset.href);
      }
    });

    // 플로우 Dock 칩 클릭 → 다이어그램 필터링
    nav.querySelectorAll('.flow-dock-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const flowId = chip.dataset.flowId || null;
        activeFlowId = flowId;
        // 활성 칩 갱신
        nav.querySelectorAll('.flow-dock-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        // 플로우 다이어그램 재렌더
        rerenderFlowDiagram();
      });
    });

    document.body.appendChild(nav);
  }

  // ── 우측 페이지 상세 정보 패널 ──────────────
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── 상단 바 (화면 정보 + 프로젝트명 + 토글 버튼) ────────
  function injectTopBar() {
    if (document.querySelector('.pdk-topbar')) return;
    var current = currentKey();
    var found = findCurrentPage(current);
    var headPage = found && found.page;
    var proj = window.PDK_PROJECT || {};

    // 좌측: 현재 화면 정보
    var headTitle = headPage ? headPage.label : '—';
    var headId = headPage ? (headPage.id || '-') : '';
    var isTbd = headPage && headPage.id === 'TBD';
    var figmaLink = headPage && headPage.figmaLink;
    var figmaBtn = figmaLink
      ? '<a class="pdk-topbar-figma" href="' + escapeHtml(figmaLink) + '" target="_blank" rel="noopener noreferrer">↗ Figma</a>'
      : '<span class="pdk-topbar-figma is-disabled" title="등록된 Figma 링크 없음">↗ Figma</span>';

    // 우측: PRD 버튼 (prdFile이 있을 때만)
    var prdBtn = '';
    if (proj.prdFile) {
      prdBtn = '<button class="pdk-topbar-btn pdk-topbar-prd" type="button" title="PRD 문서 보기">'
        + '<img src="' + ENGINE_BASE + 'icons/topbar-prd.svg" width="24" height="24" alt="">'
        + '<span>PRD 문서 보기↗</span>'
        + '</button>';
    }

    var bar = document.createElement('div');
    bar.className = 'pdk-topbar';
    bar.innerHTML =
      '<div class="pdk-topbar-left">'
        + '<div class="pdk-topbar-left-info">'
          + '<div class="pdk-topbar-page-title">' + escapeHtml(headTitle) + '</div>'
          + '<div class="pdk-topbar-page-id' + (isTbd ? ' is-tbd' : '') + '">' + escapeHtml(headId) + '</div>'
        + '</div>'
        + figmaBtn
      + '</div>'
      + '<div class="pdk-topbar-center">'
        + '<div class="pdk-topbar-project">'
          + (proj.name ? '<div class="pdk-topbar-project-name">' + escapeHtml(proj.name) + '</div>' : '')
          + (proj.description ? '<div class="pdk-topbar-project-desc">' + escapeHtml(proj.description) + '</div>' : '')
        + '</div>'
        + '<div class="pdk-topbar-tools">'
          + '<button class="pdk-topbar-btn" type="button" data-topbar-toggle="detail" data-tooltip="DESCRIPTION">'
            + '<img src="' + ENGINE_BASE + 'icons/topbar-desc.svg" width="24" height="24" alt="">'
          + '</button>'
          + '<button class="pdk-topbar-btn" type="button" data-topbar-toggle="flow" data-tooltip="FLOW DIAGRAM">'
            + '<img src="' + ENGINE_BASE + 'icons/topbar-flow.svg" width="24" height="24" alt="">'
          + '</button>'
          + '<button class="pdk-topbar-btn pdk-topbar-spec" type="button" data-tooltip="기능명세서">'
            + '<img src="' + ENGINE_BASE + 'icons/topbar-spec.svg" width="24" height="24" alt="">'
          + '</button>'
          + prdBtn
        + '</div>'
      + '</div>';

    document.body.appendChild(bar);

    // 토글 버튼 이벤트
    bar.querySelectorAll('[data-topbar-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.topbarToggle;
        var sel = key === 'detail' ? '.page-detail' : '.page-flow';
        var panel = document.querySelector(sel);
        if (panel) panel.classList.toggle('is-hidden');
      });
    });

    // PRD 버튼 이벤트
    var prdEl = bar.querySelector('.pdk-topbar-prd');
    if (prdEl && proj.prdFile) {
      prdEl.addEventListener('click', function () {
        window.open(ROOT_BASE + 'docs/prd/' + proj.prdFile, '_blank');
      });
    }
  }

  function injectPageDetail() {
    const current = currentKey();
    const found = findCurrentPage(current);
    if (!found) return;

    const { page } = found;
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
              <span class="page-detail-item-text">${escapeHtml(item.text)}${specChips(item.spec)}</span>
            </li>
          `).join('')}
        </ol>
      `;

    const detail = document.createElement('aside');
    detail.className = 'page-detail';
    detail.innerHTML = `
      <div class="page-detail-header">
        <div class="page-detail-title">DESCRIPTION</div>
        <button class="page-detail-close" type="button" aria-label="Description 최소화">
          <img src="${ENGINE_BASE}icons/desc-minimize.svg" width="32" height="32" alt="">
        </button>
      </div>
      <div class="page-detail-body">
        ${descriptionBlock}
      </div>
    `;

    // 최소화 → 패널 숨김 (우하단 dock 버튼으로 재열기)
    detail.querySelector('.page-detail-close').addEventListener('click', () => {
      detail.classList.add('is-hidden');
    });

    // 기능명세 ID 칩 → 기능명세서 모달에서 해당 행으로 이동
    detail.querySelectorAll('.page-detail-spec').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.__pdkOpenSpec) window.__pdkOpenSpec(chip.dataset.spec);
      });
    });

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
        li.classList.add('is-active');         // 강조 중인 항목 = 파랑
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
        li.classList.remove('is-active');
        const screen = getScreenEl();
        if (!screen) return;
        screen.classList.remove('is-dimming');
        screen.querySelectorAll('.is-highlighted').forEach(e => e.classList.remove('is-highlighted'));
        screen.querySelectorAll('.contains-highlight').forEach(e => e.classList.remove('contains-highlight'));
      });
    });

    document.body.appendChild(detail);
    makePanelFloating(detail, detail.querySelector('.page-detail-header'), 'detail');
  }

  // ── 우하단 통합 dock (Description / 화면 플로우 표시 토글) ──

  // ── 좌측 하단 화면 플로우 다이어그램 (Mermaid) ──────────
  // 각 화면 파일 → 다이어그램 노드 ID
  // ── 좌측 하단 화면 플로우 다이어그램 (Mermaid) — config(PDK_SCREENS) 기반 자동 생성 ──
  function flatPages() {
    const out = [];
    CATEGORIES.forEach(cat => (cat.pages || []).forEach(p => out.push(p)));
    return out;
  }
  function sanitize(s) { return String(s).replace(/[^a-zA-Z0-9]/g, '_'); }
  function sid(id) { return 's_' + sanitize(id); }   // 화면 노드
  function gid(id) { return 'g_' + sanitize(id); }   // 미등록(ghost) 노드
  function escLabel(s) { return String(s == null ? '' : s).replace(/"/g, '”'); }
  function escEdge(s)  { return String(s == null ? '' : s).replace(/[|"]/g, ' ').trim(); }

  function buildNodeHrefMap() {
    const map = {};
    flatPages().forEach(p => { if (p.id && p.href) map[sid(p.id)] = p.href; });
    return map;
  }

  // 노드 클릭 → 해당 페이지로 이동 (mermaid 콜백, 인자로 nodeId 전달됨)
  window.__flowGo = function (nodeId) {
    const map = window.__PDK_NODE_HREF || {};
    const href = map[nodeId];
    if (href) location.href = pageUrl(href);
  };

  function currentFlowNode() {
    const found = findCurrentPage(currentKey());
    return found && found.page && found.page.id ? sid(found.page.id) : null;
  }

  function buildFlowGraph(filterFlowId) {
    const allPages = flatPages();
    // 플로우 필터: filterFlowId가 있으면 해당 플로우의 소속 화면만 표시
    var pages;
    if (filterFlowId) {
      const flow = FLOWS.find(f => f.id === filterFlowId);
      const screenSet = flow ? new Set(flow.screens || []) : new Set();
      pages = allPages.filter(p => screenSet.has(p.id));
    } else {
      pages = allPages;
    }
    const idSet = new Set(pages.map(p => p.id));
    const targetSet = new Set();
    pages.forEach(p => ((p.flow && p.flow.to) || []).forEach(t => targetSet.add(t.screen)));

    // 진입점(어떤 화면의 to 에도 없는 화면)이 있을 때만 시작 터미널을 만든다.
    // 모든 화면이 서로를 가리키는 순환 플로우에서 s0 가 고아 노드로 떠 있는 것을 막는다.
    const hasEntry = pages.some(p => !targetSet.has(p.id));
    const lines = hasEntry ? ['graph TD', 's0(( ))'] : ['graph TD'];
    const screenNids = [], actionNids = [], decisionNids = [], ghostNids = [];
    const ghostSeen = new Set(), diamondSeen = new Map();
    let aCount = 0;

    // 화면 노드
    pages.forEach(p => {
      const n = sid(p.id);
      lines.push(`${n}("${escLabel(p.label)}<br/>(${escLabel(p.id)})")`);
      screenNids.push(n);
    });

    function ensureGhost(targetId) {
      const n = gid(targetId);
      if (!ghostSeen.has(n)) {
        ghostSeen.add(n);
        lines.push(`${n}("미등록<br/>(${escLabel(targetId)})")`);
        ghostNids.push(n);
      }
      return n;
    }
    function targetNid(targetId) {
      return idSet.has(targetId) ? sid(targetId) : ensureGhost(targetId);
    }

    // 진입점: 어떤 화면의 to에도 등장하지 않는 화면 → s0 연결
    pages.forEach(p => { if (!targetSet.has(p.id)) lines.push(`s0 --> ${sid(p.id)}`); });

    // 간선 (to가 유일 소스)
    pages.forEach(p => {
      const src = sid(p.id);
      ((p.flow && p.flow.to) || []).forEach(t => {
        const tgt = targetNid(t.screen);
        if (t.branch) {
          const key = p.id + '::' + t.branch;
          let dn = diamondSeen.get(key);
          if (!dn) {
            dn = 'd_' + sanitize(p.id) + '_' + diamondSeen.size;
            diamondSeen.set(key, dn);
            lines.push(`${dn}{"${escLabel(t.branch)}"}`);
            decisionNids.push(dn);
            lines.push(`${src} --> ${dn}`);
          }
          const via = escEdge(t.via);
          lines.push(via ? `${dn} -->|${via}| ${tgt}` : `${dn} --> ${tgt}`);
        } else if (t.kind === 'auto') {
          const via = escEdge(t.via);
          lines.push(via ? `${src} -. ${via} .-> ${tgt}` : `${src} -.-> ${tgt}`);
        } else if (t.via) {
          const an = 'a_' + sanitize(p.id) + '_' + (aCount++);
          lines.push(`${an}("${escLabel(t.via)}")`);
          actionNids.push(an);
          lines.push(`${src} --> ${an}`);
          lines.push(`${an} --> ${tgt}`);
        } else {
          lines.push(`${src} --> ${tgt}`);
        }
      });
    });

    // 클래스 지정
    if (screenNids.length)   lines.push(`class ${screenNids.join(',')} screen`);
    if (actionNids.length)   lines.push(`class ${actionNids.join(',')} action`);
    if (decisionNids.length) lines.push(`class ${decisionNids.join(',')} decision`);
    if (ghostNids.length)    lines.push(`class ${ghostNids.join(',')} ghost`);
    if (hasEntry) lines.push('class s0 term');

    // 스타일 정의
    lines.push('classDef screen fill:#3182F6,stroke:#2f74e0,color:#ffffff;');
    lines.push('classDef action fill:#D9E8FF,stroke:#AFCDF5,color:#1f3a63;');
    lines.push('classDef decision fill:#FFD43B,stroke:#EBB400,color:#5a4500;');
    lines.push('classDef term fill:#8b95a1,stroke:#6b7280,color:#8b95a1;');
    lines.push('classDef ghost fill:#f3f4f6,stroke:#c5ccd6,stroke-dasharray:4 3,color:#8b95a1;');
    lines.push('classDef cur stroke:#FF3B30,stroke-width:4px;');

    // 노드ID→href 맵 + 클릭 바인딩(실제 화면 노드만)
    window.__PDK_NODE_HREF = buildNodeHrefMap();
    screenNids.forEach(n => lines.push(`click ${n} call __flowGo()`));

    // 현재 화면 강조
    const cur = currentFlowNode();
    if (cur) lines.push(`class ${cur} cur`);

    return lines.join('\n');
  }

  // 패널 플로우 줌 상태
  var panelFlowNatW = 0, panelFlowNatH = 0, panelFlowZoom = 1;

  function applyPanelFlowZoom(recenter) {
    var svg = document.querySelector('.page-flow .mermaid svg');
    if (!svg || !panelFlowNatW) return;
    svg.style.width = Math.round(panelFlowNatW * panelFlowZoom) + 'px';
    svg.style.height = Math.round(panelFlowNatH * panelFlowZoom) + 'px';
    if (recenter) requestAnimationFrame(function () { requestAnimationFrame(centerCurrentFlowNode); });
  }

  async function renderFlowMermaid() {
    if (!window.mermaid) return;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'neutral',
        // useMaxWidth:false → 패널 폭에 맞춰 축소하지 않고 다이어그램 자연 크기로 렌더
        flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 28, rankSpacing: 55, padding: 16, useMaxWidth: false },
      });
      await window.mermaid.run({ querySelector: '.page-flow .mermaid' });
      // 렌더된 SVG를 viewBox 자연 크기로 고정 → 좌우/상하 스크롤로 보기
      const svg = document.querySelector('.page-flow .mermaid svg');
      if (svg) {
        svg.style.maxWidth = 'none';
        const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
        if (vb.length === 4 && vb[2] && vb[3]) {
          panelFlowNatW = vb[2];
          panelFlowNatH = vb[3];
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

  // 플로우 다이어그램 재렌더 (Dock 칩 전환 시 호출)
  async function rerenderFlowDiagram() {
    if (!window.mermaid) return;
    var body = document.querySelector('.page-flow-body');
    var panel = document.querySelector('.page-flow');
    if (!body || !panel) return;

    // 기존 Mermaid SVG를 새 그래프 텍스트로 교체
    var graphText = buildFlowGraph(activeFlowId);
    // mermaid.render()로 새 SVG를 받아 교체 (id는 유니크해야 함)
    var renderId = 'pdk-flow-' + Date.now();
    try {
      var result = await window.mermaid.render(renderId, graphText);
      body.innerHTML = '<div class="mermaid">' + result.svg + '</div>';
      // 패널 타이틀 갱신 (플로우명 표시)
      var titleEl = document.querySelector('.page-flow-title');
      if (titleEl) {
        var activeFlow = activeFlowId && FLOWS.find(function (f) { return f.id === activeFlowId; });
        titleEl.textContent = activeFlow ? 'FLOW — ' + activeFlow.label : 'FLOW DIAGRAM';
      }
      var svg = body.querySelector('svg');
      if (svg) {
        svg.style.maxWidth = 'none';
        var vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
        if (vb.length === 4 && vb[2] && vb[3]) {
          panelFlowNatW = vb[2];
          panelFlowNatH = vb[3];
          svg.setAttribute('width', vb[2]);
          svg.setAttribute('height', vb[3]);
          svg.style.width = Math.round(vb[2] * panelFlowZoom) + 'px';
          svg.style.height = Math.round(vb[3] * panelFlowZoom) + 'px';
        }
      }
      // 노드 클릭 바인딩 재연결
      window.__PDK_NODE_HREF = buildNodeHrefMap();
      body.querySelectorAll('.node').forEach(function (node) {
        node.style.cursor = 'pointer';
        node.addEventListener('click', function () {
          var nid = node.id.replace(/^flowchart-/, '').replace(/-\d+$/, '');
          window.__flowGo(nid);
        });
      });
      // 현재 노드 중앙으로
      requestAnimationFrame(function () { requestAnimationFrame(centerCurrentFlowNode); });
    } catch (e) { /* noop */ }

    // 모달도 다음 열기 시 재렌더되도록 플래그 리셋
    var modalPre = document.querySelector('.mermaid-modal');
    if (modalPre) {
      modalPre.removeAttribute('data-processed');
      modalPre.textContent = graphText;
    }
    window.__pdkModalRendered = false;
  }

  function injectFlowDiagram() {
    const aside = document.createElement('aside');
    aside.className = 'page-flow is-loading';
    aside.innerHTML = `
      <div class="page-flow-header">
        <div class="page-flow-title">FLOW DIAGRAM</div>
        <div class="page-flow-header-tools">
          <button class="page-flow-locate" type="button" aria-label="현재 위치" title="현재 화면으로 이동">
            <img src="${ENGINE_BASE}icons/flow-locate.svg" width="16" height="16" alt="">
          </button>
          <button class="page-flow-expand" type="button" aria-label="크게 보기" title="크게 보기">
            <img src="${ENGINE_BASE}icons/flow-expand.svg" width="32" height="32" alt="">
          </button>
          <button class="page-flow-toggle" type="button" aria-label="플로우 최소화"><img src="${ENGINE_BASE}icons/flow-minimize.svg" width="32" height="32" alt=""></button>
        </div>
      </div>
      <div class="page-flow-body">
        <div class="page-flow-loading">화면 플로우를 불러오는 중…</div>
        <pre class="mermaid">${buildFlowGraph(activeFlowId)}</pre>
      </div>
      <div class="page-flow-zoom-ctrl">
        <button class="page-flow-zoom-btn" type="button" data-panel-zoom="in" aria-label="확대" title="확대">＋</button>
        <div class="page-flow-zoom-divider"></div>
        <button class="page-flow-zoom-btn" type="button" data-panel-zoom="out" aria-label="축소" title="축소">−</button>
      </div>
    `;
    document.body.appendChild(aside);

    // 패널 이동(헤더) + 8방향 리사이즈 + 배치 세션 저장
    makePanelFloating(aside, aside.querySelector('.page-flow-header'), 'flow');

    // 드래그(grab) 패닝 활성화
    enableFlowPan(aside.querySelector('.page-flow-body'));

    // 현재 위치(현재 화면 노드 중앙으로 이동)
    aside.querySelector('.page-flow-locate').addEventListener('click', () => {
      centerCurrentFlowNode(true);
    });

    // 패널 확대/축소 버튼
    aside.querySelectorAll('[data-panel-zoom]').forEach(btn => {
      btn.addEventListener('click', () => {
        var m = btn.dataset.panelZoom;
        if (m === 'in') panelFlowZoom = Math.min(panelFlowZoom * 1.2, 4);
        else if (m === 'out') panelFlowZoom = Math.max(panelFlowZoom / 1.2, 0.3);
        applyPanelFlowZoom(false);
      });
    });

    // 최소화 → 패널 완전 숨김 (우하단 dock 버튼으로 재열기)
    aside.querySelector('.page-flow-toggle').addEventListener('click', () => {
      aside.classList.add('is-hidden');
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
        <div class="page-flow-modal-body"><pre class="mermaid mermaid-modal">${buildFlowGraph(activeFlowId)}</pre><div class="page-flow-modal-loading">화면 플로우를 불러오는 중…</div></div>
      </div>
    `;
    document.body.appendChild(modal);

    const modalBody = modal.querySelector('.page-flow-modal-body');
    const zoomLabel = modal.querySelector('.page-flow-modal-zoom');
    enableFlowPan(modalBody);

    let modalNatW = 0, modalNatH = 0, modalZoom = 1;
    // 모달 렌더 플래그 — window에 노출해 rerenderFlowDiagram()에서 리셋 가능
    window.__pdkModalRendered = false;

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
      if (window.__pdkModalRendered || !window.mermaid) return;
      window.__pdkModalRendered = true;
      try {
        window.mermaid.initialize({
          startOnLoad: false, securityLevel: 'loose', theme: 'neutral',
          flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 28, rankSpacing: 55, padding: 16, useMaxWidth: false },
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
      // 플로우 필터 변경 시 모달 그래프도 갱신
      var modalPre = modal.querySelector('.mermaid-modal');
      if (!window.__pdkModalRendered && modalPre) {
        modalPre.textContent = buildFlowGraph(activeFlowId);
      }
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

  // ── 조건 분기 케이스 전환 (상단 라디오 패널) ─────────
  // 화면 하나가 조건에 따라 다른 UI를 보이는 경우(등록 있음/없음, 성공/실패 등),
  // config의 page.cases 를 읽어 목업 위에 라디오 패널을 만들고 케이스를 전환한다.
  //   config:  cases: [{ id: 'has-data', label: '등록 있음' }, { id: 'empty', label: '등록 없음' }]
  //   화면HTML: 해당 요소에 data-case="has-data" (여러 케이스면 공백 구분: data-case="a b")
  // data-case 가 없는 요소는 항상 보인다(공통 UI).
  function applyCase(caseId) {
    var root = document.querySelector('.device-screen .pdk-screen')
      || document.querySelector('.device-screen');
    if (!root) return;
    root.setAttribute('data-active-case', caseId);
    root.querySelectorAll('[data-case]').forEach(function (el) {
      var list = String(el.getAttribute('data-case') || '').split(/\s+/).filter(Boolean);
      el.hidden = list.length > 0 && list.indexOf(caseId) === -1;
    });
  }

  function injectCasePanel() {
    var found = findCurrentPage(currentKey());
    var page = found && found.page;
    var cases = page && Array.isArray(page.cases) ? page.cases.filter(function (c) { return c && c.id; }) : [];
    if (cases.length < 2) return;               // 선택지가 1개 이하면 분기가 아니다
    var stage = document.querySelector('.device-stage');
    var mockup = stage && stage.querySelector('.device-mockup');
    if (!stage || !mockup) return;

    // 기본 케이스: default:true 인 항목, 없으면 첫 항목
    var initial = (cases.filter(function (c) { return c.default; })[0] || cases[0]).id;

    var panel = document.createElement('div');
    panel.className = 'pdk-case-panel';
    panel.innerHTML =
      '<div class="pdk-case-panel-title">' + escapeHtml(page.label || '조건 분기') + '</div>'
      + '<div class="pdk-case-panel-divider"></div>'
      + cases.map(function (c) {
        return '<button class="pdk-case-option' + (c.id === initial ? ' is-active' : '') + '"'
          + ' type="button" data-case-id="' + escapeHtml(c.id) + '"'
          + (c.description ? ' title="' + escapeHtml(c.description) + '"' : '') + '>'
          + '<span class="pdk-case-radio"><span class="pdk-case-radio-dot"></span></span>'
          + '<span>' + escapeHtml(c.label || c.id) + '</span>'
          + '</button>';
      }).join('');

    stage.classList.add('has-case-panel');
    stage.insertBefore(panel, mockup);

    // 상단 바 높이는 프로젝트명·설명 길이에 따라 달라진다 → 실제 높이를 재서 여백 확보
    // (CSS의 padding-top: 72px 는 상단 바가 없을 때를 위한 기본값)
    var topbar = document.querySelector('.pdk-topbar');
    if (topbar) stage.style.paddingTop = Math.round(topbar.getBoundingClientRect().height + 16) + 'px';

    panel.addEventListener('click', function (e) {
      var opt = e.target.closest('.pdk-case-option');
      if (!opt) return;
      panel.querySelectorAll('.pdk-case-option').forEach(function (o) {
        o.classList.toggle('is-active', o === opt);
      });
      applyCase(opt.dataset.caseId);
    });

    applyCase(initial);
  }

  // ── 디바이스 목업 적용 (config: PDK_PROJECT / PDK_DEVICES) ──
  function activeDeviceKey() {
    const proj = window.PDK_PROJECT || {};
    const devs = window.PDK_DEVICES || {};
    let key = proj.device || 'tossfront2';
    const d = devs[key];
    if (d && d.toggle) key = window.__pdkVariant || d.default || d.toggle[0];
    return key;
  }
  function applyDevice() {
    const devs = window.PDK_DEVICES || {};
    const key = activeDeviceKey();
    const d = devs[key];
    if (!d) return;
    const root = document.documentElement;
    const bezel = d.bezel || 0;
    root.style.setProperty('--pdk-screen-w', d.width + 'px');
    root.style.setProperty('--pdk-screen-h', d.height + 'px');
    root.style.setProperty('--pdk-bezel-w', bezel + 'px');
    root.style.setProperty('--pdk-radius', (d.radius || 0) + 'px');
    root.style.setProperty('--pdk-screen-radius', Math.max(0, (d.radius || 0) - bezel) + 'px');
    root.style.setProperty('--pdk-bezel-color', d.bezelColor || '#404040');
    const stage = document.querySelector('.device-stage');
    if (stage) stage.setAttribute('data-device-type', d.type || 'frame');

    function fit() {
      const outerW = d.width + bezel * 2, outerH = d.height + bezel * 2;
      const availW = Math.max(260, window.innerWidth - 640);  // 좌(280)+우(280) 패널 여유
      // 세로 여유: 기본 90px. 케이스 패널이 있으면 스테이지 여백 + 패널 높이를 실측해 뺀다.
      let overhead = 90;
      const stageEl = document.querySelector('.device-stage');
      const casePanel = document.querySelector('.pdk-case-panel');
      if (stageEl && casePanel) {
        const cs = getComputedStyle(stageEl);
        overhead = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
          + casePanel.getBoundingClientRect().height + 12 + 10;   // 12=패널 아래 여백
      }
      const availH = Math.max(340, window.innerHeight - overhead);
      const scale = Math.min(1, availW / outerW, availH / outerH);
      root.style.setProperty('--pdk-device-scale', scale.toFixed(3));
    }
    fit();
    if (!window.__pdkFitBound) { window.addEventListener('resize', fit); window.__pdkFitBound = true; }

    const proj = window.PDK_PROJECT || {};
    const respDev = devs[proj.device];
    if (respDev && respDev.toggle) injectDeviceToggle(respDev);
  }
  function injectDeviceToggle(respDev) {
    let wrap = document.querySelector('.pdk-device-toggle');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'pdk-device-toggle';
      respDev.toggle.forEach(k => {
        const dev = (window.PDK_DEVICES || {})[k] || {};
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.variant = k;
        b.textContent = dev.label || k;
        b.addEventListener('click', () => { window.__pdkVariant = k; applyDevice(); refreshToggleActive(respDev); });
        wrap.appendChild(b);
      });
      // 상단 바의 우측 도구 영역에 넣는다.
      // (예전처럼 body에 fixed로 띄우면 상단 바(z-index 150) 아래로 깔려 클릭이 막힌다)
      const tools = document.querySelector('.pdk-topbar-tools');
      if (tools) {
        tools.insertBefore(wrap, tools.firstChild);
      } else {
        // 상단 바가 없는 페이지(예제 등) — 화면 좌상단에 떠 있는 형태로 대체
        wrap.classList.add('is-floating');
        document.body.appendChild(wrap);
      }
    }
    refreshToggleActive(respDev);
  }
  function refreshToggleActive(respDev) {
    const cur = window.__pdkVariant || respDev.default || respDev.toggle[0];
    document.querySelectorAll('.pdk-device-toggle button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.variant === cur);
    });
  }

  // ── 기능명세서 (config/specs.js → 상단 바 버튼 + 표 모달) ──
  // specs.js 는 화면 HTML 로더에 넣지 않고 엔진이 직접 불러온다(기존 화면 수정 불필요).
  // 파일이 없으면 명세가 없는 상태로 본다.
  //   행: { id, location: ['1Depth', '2Depth', ...], pageId, target, content, description, priority }
  function loadSpecs() {
    if (window.PDK_SPECS || window.__pdkSpecsLoading) return;
    window.__pdkSpecsLoading = true;
    var s = document.createElement('script');
    s.src = ROOT_BASE + 'config/specs.js?_=' + Date.now();
    s.onload = s.onerror = function () {
      if (!Array.isArray(window.PDK_SPECS)) window.PDK_SPECS = [];
      if (window.__pdkSpecsReady) window.__pdkSpecsReady();
    };
    document.head.appendChild(s);
  }
  loadSpecs();

  // Description 항목의 spec 필드(문자열 또는 배열) → ID 칩
  function specChips(spec) {
    var ids = Array.isArray(spec) ? spec : (spec ? [spec] : []);
    return ids.map(function (id) {
      return ' <button type="button" class="page-detail-spec" data-spec="' + escapeHtml(id) + '"'
        + ' title="기능명세서에서 보기">' + escapeHtml(id) + '</button>';
    }).join('');
  }

  function injectSpecModal() {
    var btn = document.querySelector('.pdk-topbar-spec');
    if (!btn) return;
    var proj = window.PDK_PROJECT || {};
    var found = findCurrentPage(currentKey());
    var curId = found && found.page ? found.page.id : '';
    var pageNames = {};
    flatPages().forEach(function (p) { pageNames[p.id] = p.label; });
    var tab = curId ? 'page' : 'all';
    var focusId = '';

    var modal = document.createElement('div');
    modal.className = 'pdk-spec-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="pdk-spec-panel">'
        + '<div class="pdk-spec-header">'
          + '<div class="pdk-spec-title">기능명세서</div>'
          + '<div class="pdk-spec-meta">' + escapeHtml([proj.code, proj.name].filter(Boolean).join(' · ')) + '</div>'
          + '<div class="pdk-spec-tabs">'
            + '<button type="button" data-spec-tab="page"' + (curId ? '' : ' disabled') + '>이 화면</button>'
            + '<button type="button" data-spec-tab="all">전체</button>'
          + '</div>'
          + '<button type="button" class="pdk-spec-close" aria-label="닫기">✕</button>'
        + '</div>'
        + '<div class="pdk-spec-body"></div>'
      + '</div>';
    document.body.appendChild(modal);
    var body = modal.querySelector('.pdk-spec-body');

    function isUnassigned(r) { return !r.pageId || r.pageId === '미정'; }
    function samePrefix(a, b, d) {
      for (var i = 0; i <= d; i++) if ((a[i] || '') !== (b[i] || '')) return false;
      return true;
    }

    function render() {
      var all = Array.isArray(window.PDK_SPECS) ? window.PDK_SPECS : [];
      var mine = all.filter(function (r) { return curId && r.pageId === curId; });
      modal.querySelector('[data-spec-tab="page"]').textContent = '이 화면 (' + mine.length + ')';
      modal.querySelector('[data-spec-tab="all"]').textContent = '전체 (' + all.length + ')';
      modal.querySelectorAll('[data-spec-tab]').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.specTab === tab);
      });

      var rows = tab === 'page' ? mine : all;
      if (!rows.length) {
        body.innerHTML = '<div class="pdk-spec-empty">'
          + '<div class="pdk-spec-empty-title">작성된 기능명세가 없습니다</div>'
          + '<div class="pdk-spec-empty-sub">'
          + (tab === 'page' ? '<code>/pdk-description ' + escapeHtml(curId) + '</code> 로 이 화면의 기능명세를 작성하세요.'
                            : '<code>/pdk-description [화면ID]</code> 로 기능명세를 작성하세요.')
          + '</div></div>';
        return;
      }

      // Location 은 엑셀처럼 Depth 열로 펼치고, 같은 상위 경로가 이어지면 병합(rowspan)한다
      var locs = rows.map(function (r) { return Array.isArray(r.location) ? r.location : []; });
      var depth = Math.max(1, Math.max.apply(null, locs.map(function (l) { return l.length; })));
      var span = locs.map(function () { return []; });   // span[i][d]: 0=병합돼 생략, n=rowspan
      for (var d = 0; d < depth; d++) {
        for (var i = 0; i < rows.length; i++) {
          if (locs[i].length > d && i > 0 && locs[i - 1].length > d && samePrefix(locs[i], locs[i - 1], d)) {
            span[i][d] = 0;
            for (var k = i - 1; k >= 0; k--) { if (span[k][d]) { span[k][d]++; break; } }
          } else {
            span[i][d] = 1;
          }
        }
      }

      var depthHead = '';
      for (var h = 0; h < depth; h++) depthHead += '<th class="is-depth">' + (h + 1) + 'Depth</th>';
      var html = '<table class="pdk-spec-table"><thead>'
        + '<tr><th rowspan="2">ID</th><th colspan="' + depth + '">Location</th>'
        + '<th rowspan="2">Page ID</th><th rowspan="2">Page Name</th><th rowspan="2">Target</th>'
        + '<th colspan="2">Detail</th><th rowspan="2">Priority</th></tr>'
        + '<tr>' + depthHead + '<th>Content</th><th>Description</th></tr>'
        + '</thead><tbody>';
      rows.forEach(function (r, i) {
        var cls = [];
        if (tab === 'all' && curId && r.pageId === curId) cls.push('is-current');
        if (focusId && r.id === focusId) cls.push('is-focus');
        var tr = '<tr data-spec-row="' + escapeHtml(r.id || '') + '"' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>'
          + '<td class="is-id">' + escapeHtml(r.id || '') + '</td>';
        for (var d2 = 0; d2 < depth; d2++) {
          var n = span[i][d2];
          if (n === 0) continue;
          tr += '<td class="is-depth"' + (n > 1 ? ' rowspan="' + n + '"' : '') + '>' + escapeHtml(locs[i][d2] || '') + '</td>';
        }
        var unassigned = isUnassigned(r);
        var pr = String(r.priority || '');
        tr += '<td class="is-page' + (unassigned ? ' is-tbd' : '') + '">' + escapeHtml(unassigned ? '미정' : r.pageId) + '</td>'
          + '<td class="is-page' + (unassigned ? ' is-tbd' : '') + '">' + escapeHtml(unassigned ? '미정' : (pageNames[r.pageId] || '(미등록 화면)')) + '</td>'
          + '<td>' + escapeHtml(r.target || '') + '</td>'
          + '<td class="is-content">' + escapeHtml(r.content || '') + '</td>'
          + '<td class="is-desc">' + escapeHtml(r.description || '') + '</td>'
          + '<td>' + (pr ? '<span class="pdk-spec-pri is-' + escapeHtml(pr.toLowerCase()) + '">' + escapeHtml(pr) + '</span>' : '') + '</td>'
          + '</tr>';
        html += tr;
      });
      body.innerHTML = html + '</tbody></table>';
    }

    function open(specId) {
      focusId = specId || '';
      if (focusId) {
        var hit = (window.PDK_SPECS || []).filter(function (r) { return r.id === focusId; })[0];
        tab = hit && curId && hit.pageId === curId ? 'page' : 'all';
      }
      render();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      var row = focusId && body.querySelector('[data-spec-row="' + focusId.replace(/"/g, '') + '"]');
      if (row) row.scrollIntoView({ block: 'center' });
      else body.scrollTop = 0;
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    window.__pdkOpenSpec = function (specId) {
      if (Array.isArray(window.PDK_SPECS)) open(specId);
      else window.__pdkSpecsReady = function () { open(specId); };   // 로드 전 클릭 → 로드 후 열기
    };

    btn.addEventListener('click', function () { window.__pdkOpenSpec(); });
    modal.querySelector('.pdk-spec-close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
    modal.querySelectorAll('[data-spec-tab]').forEach(function (b) {
      b.addEventListener('click', function () { tab = b.dataset.specTab; focusId = ''; render(); body.scrollTop = 0; });
    });
  }

  // ── 하단 시스템 문의 푸터 (저작권 표기처럼 아주 작게) ──
  function injectFooter() {
    if (document.querySelector('.pdk-sys-footer')) return;
    const el = document.createElement('div');
    el.className = 'pdk-sys-footer';
    el.textContent = '시스템 관련 문의: 박성훈 (psh@thebestpay.co.kr)';
    document.body.appendChild(el);
  }

  function init() {
    injectTopBar();        // 케이스 패널이 상단 바 높이를 재야 하므로 먼저
    injectCasePanel();     // applyDevice 보다 먼저 — 패널 높이가 목업 스케일 계산에 반영되도록
    applyDevice();
    injectPageNav();
    injectPageDetail();
    injectFlowDiagram();
    injectSpecModal();
    injectFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
