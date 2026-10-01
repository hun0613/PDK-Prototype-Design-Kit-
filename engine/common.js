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

  // ── 포커스 모드 즉시 복원 ───────────────
  // 도구(상단 바·목록·패널)를 그리기 전에 적용해야 화면 이동 시 평소 화면이 잠깐 보이지 않는다.
  // 첫 화면에서는 슬라이드 애니메이션도 끈다(pdk-no-anim — init 이 끝난 뒤 해제).
  var FOCUS_STORE = 'pdk:focus';
  document.documentElement.classList.add('pdk-no-anim');
  try {
    if (sessionStorage.getItem(FOCUS_STORE) === '1' && document.body) document.body.classList.add('pdk-focus');
  } catch (_) {}

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

  // ── 오른쪽 패널 섹션(dock) + 떼어내기 · 다시 붙이기 ─────────
  // Description / Flow 패널은 기본으로 오른쪽 섹션(.pdk-dock)에 붙어 위아래로 섹션을 나눠 채운다.
  //   · 헤더를 잡고 섹션 밖으로 끌면 떠 있는 패널(.is-floating)이 된다 — 이동 + 8방향 크기 조절.
  //     섹션에 남은 패널이 빈 높이를 채우고, 둘 다 떠나면 섹션이 사라진다(목업 영역이 넓어짐).
  //   · 떠 있는 패널을 섹션 위로 끌어오면 위/아래 절반 중 놓은 쪽에 다시 붙는다.
  //     헤더의 "다시 붙이기" 버튼은 원래 순서(Description 위 · Flow 아래)로 붙인다.
  //   · 두 패널 사이 구분선을 끌면 위아래 비율이 바뀐다.
  // 붙은 순서·비율·떠 있는 위치는 sessionStorage 에 저장(탭을 닫으면 초기 배치로).
  var PANEL_MIN_W = 260, PANEL_MIN_H = 150;
  var PANEL_STORE = 'pdk:panel:';
  var DOCK_STORE = 'pdk:dock';
  var DOCK_W = 420;
  var DRAG_THRESHOLD = 5;               // 이만큼 움직여야 드래그로 본다(헤더 클릭과 구분)
  var RESIZE_DIRS = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
  var PANEL_SEL = { detail: '.page-detail', flow: '.page-flow' };
  var PANEL_BASE_ORDER = ['detail', 'flow'];

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

  // order: 섹션에 붙은 패널 키(위→아래) · ratio: 위 패널이 차지하는 비율(null = 자동)
  var dockState = (function () {
    try {
      var s = JSON.parse(sessionStorage.getItem(DOCK_STORE) || 'null');
      if (s && Array.isArray(s.order)) return { order: s.order, ratio: typeof s.ratio === 'number' ? s.ratio : null };
    } catch (_) {}
    return { order: PANEL_BASE_ORDER.slice(), ratio: null };
  })();
  function saveDockState() {
    try { sessionStorage.setItem(DOCK_STORE, JSON.stringify(dockState)); } catch (_) {}
  }

  function panelEl(key) { return document.querySelector(PANEL_SEL[key]); }

  function getDock() {
    var dock = document.querySelector('.pdk-dock');
    if (!dock) {
      dock = document.createElement('aside');
      dock.className = 'pdk-dock';
      dock.innerHTML = '<div class="pdk-dock-drop" aria-hidden="true"></div>';
      document.body.appendChild(dock);
    }
    return dock;
  }

  function clearGeom(panel) {
    ['left', 'top', 'right', 'bottom', 'width', 'height', 'maxHeight', 'flex'].forEach(function (p) { panel.style[p] = ''; });
  }
  function setGeom(panel, left, top, w, h) {
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.maxHeight = 'none';
    panel.style.flex = '';
    panel.style.left = Math.round(left) + 'px';
    panel.style.top = Math.round(top) + 'px';
    panel.style.width = Math.round(w) + 'px';
    panel.style.height = Math.round(h) + 'px';
  }

  // 섹션에 붙이기 — at: 'top' | 'bottom' | 없으면 원래 순서
  function dockPanel(key, at) {
    var panel = panelEl(key);
    if (!panel) return;
    var order = dockState.order.filter(function (k) { return k !== key; });
    if (at === 'top') order.unshift(key);
    else if (at === 'bottom') order.push(key);
    else {
      order.push(key);
      order.sort(function (a, b) { return PANEL_BASE_ORDER.indexOf(a) - PANEL_BASE_ORDER.indexOf(b); });
    }
    dockState.order = order;
    dockState.ratio = null;                 // 구성이 바뀌면 비율은 자동으로
    saveDockState();
    panel.classList.remove('is-floating');
    panel.classList.add('is-docked');
    clearGeom(panel);
    renderDock();
    queueFit();
  }

  // 떼어내기 — rect 위치에 떠 있는 패널로
  function floatPanel(key, rect) {
    var panel = panelEl(key);
    if (!panel) return;
    dockState.order = dockState.order.filter(function (k) { return k !== key; });
    dockState.ratio = null;
    saveDockState();
    panel.classList.remove('is-docked');
    panel.classList.add('is-floating');
    document.body.appendChild(panel);
    setGeom(panel, rect.left, rect.top, rect.width, rect.height);
    renderDock();
    queueFit();
  }

  // 섹션 안 배치 — 붙은 패널을 순서대로 놓고 높이를 나눈다. 섹션의 왼쪽 x(비었으면 null)를 돌려준다.
  function renderDock() {
    var dock = getDock();
    var keys = dockState.order.filter(function (k) {
      var p = panelEl(k);
      return p && p.classList.contains('is-docked');
    });

    // DOM 순서 맞추기 — 이미 맞으면 옮기지 않는다(옮기면 스크롤·패닝 위치가 초기화된다)
    var divider = dock.querySelector('.pdk-dock-divider');
    var current = Array.prototype.filter.call(dock.children, function (c) {
      return c.classList.contains('page-detail') || c.classList.contains('page-flow');
    });
    var want = keys.map(panelEl);
    if (current.length !== want.length || current.some(function (c, i) { return c !== want[i]; })) {
      want.forEach(function (p) { dock.appendChild(p); });
    }

    var visible = want.filter(function (p) { return !p.classList.contains('is-hidden'); });
    dock.classList.toggle('is-empty', visible.length === 0);

    // 구분선 — 보이는 패널이 둘일 때만, 둘 사이에
    if (visible.length === 2) {
      if (!divider) divider = createDivider(dock);
      if (divider.previousElementSibling !== visible[0] || divider.nextElementSibling !== visible[1]) {
        dock.insertBefore(divider, visible[1]);
      }
      divider.hidden = false;
    } else if (divider) {
      divider.hidden = true;
    }

    if (visible.length === 1) {
      visible[0].style.flex = '1 1 auto';
      visible[0].style.maxHeight = '';
    } else if (visible.length === 2) {
      var first = visible[0], second = visible[1];
      var avail = dock.clientHeight - (divider ? divider.offsetHeight : 0);
      var h1;
      if (dockState.ratio != null) {
        h1 = dockState.ratio * avail;
      } else if (first.classList.contains('page-detail')) {
        // 자동: Description 이 위면 내용만큼, 최대 절반
        first.style.flex = '0 0 auto';
        first.style.maxHeight = Math.floor(avail / 2) + 'px';
        h1 = first.offsetHeight;
        first.style.maxHeight = '';
      } else {
        h1 = avail / 2;
      }
      h1 = Math.max(Math.min(PANEL_MIN_H, avail / 2), Math.min(h1, avail - PANEL_MIN_H));
      first.style.flex = '0 0 ' + Math.floor(h1) + 'px';
      second.style.flex = '1 1 0';
    }
    return visible.length ? dock.offsetLeft : null;   // offset* 는 transform(포커스 모드 슬라이드) 영향 없음
  }

  // 두 패널 사이 구분선 — 끌어서 위아래 비율 조절
  function createDivider(dock) {
    var divider = document.createElement('div');
    divider.className = 'pdk-dock-divider';
    divider.setAttribute('role', 'separator');
    divider.title = '끌어서 높이 조절';
    divider.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      divider.classList.add('is-active');
      trackDrag(e, function (ev) {
        var r = dock.getBoundingClientRect();
        var avail = r.height - divider.offsetHeight;
        var h1 = Math.max(PANEL_MIN_H, Math.min(ev.clientY - r.top, avail - PANEL_MIN_H));
        dockState.ratio = h1 / avail;
        renderDock();
      }, function () {
        divider.classList.remove('is-active');
        saveDockState();
      });
    });
    return divider;
  }

  // 포인터 드래그 공통 — window 에서 추적한다
  // (드래그 중 패널을 섹션 안팎으로 옮기면 pointer capture 가 풀리므로 capture 를 쓰지 않는다)
  function trackDrag(e, move, end) {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.add('pdk-is-dragging');
    function up(ev) {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      document.body.classList.remove('pdk-is-dragging');
      if (end) end(ev);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  // 포인터가 섹션 자리(오른쪽 DOCK_W 영역) 위인지 + 위/아래 절반
  function dockDropAt(x, y) {
    var dock = getDock();
    var r = dock.getBoundingClientRect();
    var top = r.height ? r.top : 95;
    if (x < window.innerWidth - DOCK_W || y < top) return null;
    var hasVisible = !dock.classList.contains('is-empty');
    if (!hasVisible) return 'top';
    return y < top + (window.innerHeight - top) / 2 ? 'top' : 'bottom';
  }
  function showDrop(at) {
    var dock = getDock();
    dock.classList.toggle('is-drop-target', !!at);
    dock.classList.toggle('is-drop-top', at === 'top');
    dock.classList.toggle('is-drop-bottom', at === 'bottom');
  }

  function registerPanel(panel, header, key) {
    if (!panel || !header) return;

    // 다시 붙이기 버튼 (떠 있을 때만 보인다 — CSS)
    var redock = panel.querySelector('.pdk-redock');
    if (redock) redock.addEventListener('click', function () { dockPanel(key); });

    // 처음 위치 — 저장된 상태를 따른다(기본은 섹션에 붙음)
    if (dockState.order.indexOf(key) > -1) {
      panel.classList.add('is-docked');
      getDock().appendChild(panel);
    } else {
      panel.classList.add('is-floating');
      var saved = loadPanelGeom(key);
      var w = saved ? saved.width : DOCK_W, h = saved ? saved.height : 360;
      w = Math.max(PANEL_MIN_W, Math.min(w, window.innerWidth));
      h = Math.max(PANEL_MIN_H, Math.min(h, window.innerHeight));
      var left = saved ? saved.left : window.innerWidth - DOCK_W - w - 32;
      var top = saved ? saved.top : 120;
      setGeom(panel,
        Math.max(0, Math.min(left, window.innerWidth - 40)),
        Math.max(0, Math.min(top, window.innerHeight - 40)), w, h);
    }

    // 1) 헤더 드래그 — 붙어 있으면 떼어내고, 놓은 곳이 섹션이면 다시 붙인다 (헤더의 버튼 클릭은 제외)
    header.style.cursor = 'move';
    header.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button')) return;
      var r0 = panel.getBoundingClientRect();
      var offX = e.clientX - r0.left, offY = e.clientY - r0.top;
      var x0 = e.clientX, y0 = e.clientY;
      var dragging = false;
      trackDrag(e, function (ev) {
        if (!dragging) {
          if (Math.abs(ev.clientX - x0) < DRAG_THRESHOLD && Math.abs(ev.clientY - y0) < DRAG_THRESHOLD) return;
          dragging = true;
          panel.classList.add('is-dragging');
          if (panel.classList.contains('is-docked')) {
            // 붙어 있던 패널 → 지금 크기로 떼어낸다(너무 길면 화면의 60%로)
            floatPanel(key, { left: r0.left, top: r0.top, width: r0.width,
              height: Math.max(PANEL_MIN_H, Math.min(r0.height, window.innerHeight * 0.6)) });
          }
        }
        var nl = Math.max(0, Math.min(ev.clientX - offX, window.innerWidth - 40));
        var nt = Math.max(0, Math.min(ev.clientY - offY, window.innerHeight - 40));
        panel.style.left = nl + 'px';
        panel.style.top = nt + 'px';
        showDrop(dockDropAt(ev.clientX, ev.clientY));
      }, function (ev) {
        if (!dragging) return;
        panel.classList.remove('is-dragging');
        var at = dockDropAt(ev.clientX, ev.clientY);
        showDrop(null);
        if (at) dockPanel(key, at);
        else savePanelGeom(key, panel);
      });
    });

    // 2) 네 변 + 네 모서리 핸들 → 크기 조절 (떠 있을 때만 — 붙어 있으면 CSS 로 숨김)
    RESIZE_DIRS.forEach(function (dir) {
      var handle = document.createElement('div');
      handle.className = 'pdk-rz pdk-rz-' + dir;
      panel.appendChild(handle);
      handle.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || !panel.classList.contains('is-floating')) return;
        var r = panel.getBoundingClientRect();
        var x0 = e.clientX, y0 = e.clientY;
        var right0 = r.right, bottom0 = r.bottom;
        trackDrag(e, function (ev) {
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
          setGeom(panel, left, top, w, h);
        }, function () { savePanelGeom(key, panel); });
      });
    });

    queueFit();
  }

  // ── 화면 이동 헬퍼 ──────────────────────
  window.go = function (href) {
    location.href = pageUrl(href);
  };

  // 화면 ID 로 이동 — href 는 config/screens.js 에서 찾는다(파일 경로가 바뀌어도 연결 유지).
  //   <button onclick="goScreen('SCR-PAY-001')">결제하기</button>
  window.goScreen = function (screenId) {
    var p = flatPages().filter(function (x) { return x.id === screenId; })[0];
    if (p && p.href) location.href = pageUrl(p.href);
    else console.warn('[PDK] goScreen: 등록되지 않은 화면 ' + screenId);
  };

  // 분기 이동 — 누른 요소 옆에 선택창을 띄우고, 고른 경로로 이동한다.
  // 선택지는 현재 화면 flow.to 중 branch 가 같은 항목(via = 선택지 이름).
  //   <button onclick="goBranch(this, '결제 결과')">결제하기</button>
  window.goBranch = function (el, branch) {
    var found = findCurrentPage(currentKey());
    var to = found && found.page.flow && Array.isArray(found.page.flow.to) ? found.page.flow.to : [];
    var opts = to.filter(function (t) { return t.branch === branch; });
    if (!opts.length) { console.warn('[PDK] goBranch: 분기 없음 ' + branch); return; }
    if (opts.length === 1) { window.goScreen(opts[0].screen); return; }

    closeBranchPicker();
    var names = {};
    flatPages().forEach(function (p) { names[p.id] = p.label; });
    var pop = document.createElement('div');
    pop.className = 'pdk-branch-picker';
    pop.innerHTML = '<div class="pdk-branch-picker-title">' + escapeHtml(branch) + '</div>'
      + opts.map(function (t) {
        return '<button type="button" data-go="' + escapeHtml(t.screen) + '">'
          + '<span class="pdk-branch-picker-via">' + escapeHtml(t.via || t.screen) + '</span>'
          + '<span class="pdk-branch-picker-to">→ ' + escapeHtml(names[t.screen] || t.screen) + '</span>'
          + '</button>';
      }).join('');
    document.body.appendChild(pop);

    // 누른 요소 바로 아래(공간이 없으면 위)에, 화면 밖으로 나가지 않게
    var r = el.getBoundingClientRect();
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - pw / 2, window.innerWidth - pw - 8));
    var top = r.bottom + 8 + ph < window.innerHeight ? r.bottom + 8 : Math.max(8, r.top - ph - 8);
    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(top) + 'px';

    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]');
      if (b) window.goScreen(b.dataset.go);
    });
    setTimeout(function () { document.addEventListener('pointerdown', outside, true); }, 0);
    function outside(e) { if (!pop.contains(e.target)) closeBranchPicker(); }
    pop.__outside = outside;
  };
  function closeBranchPicker() {
    var pop = document.querySelector('.pdk-branch-picker');
    if (!pop) return false;
    document.removeEventListener('pointerdown', pop.__outside, true);
    pop.remove();
    return true;
  }

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
        <div class="page-detail-header-tools">
        <button class="pdk-redock" type="button" aria-label="다시 붙이기" title="오른쪽 섹션에 다시 붙이기"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M10 3v10" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 8h3.5M6.5 6l2 2-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button class="page-detail-close" type="button" aria-label="Description 최소화">
          <img src="${ENGINE_BASE}icons/desc-minimize.svg" width="32" height="32" alt="">
        </button>
        </div>
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
    registerPanel(detail, detail.querySelector('.page-detail-header'), 'detail');
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
          <button class="pdk-redock" type="button" aria-label="다시 붙이기" title="오른쪽 섹션에 다시 붙이기"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M10 3v10" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 8h3.5M6.5 6l2 2-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
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
    registerPanel(aside, aside.querySelector('.page-flow-header'), 'flow');

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
    // 목업이 .device-fit 으로 감싸져 있으면 그 래퍼 앞에 넣는다
    var anchor = mockup.parentElement === stage ? mockup : mockup.closest('.device-fit');
    stage.insertBefore(panel, anchor);
    // 상단 바 아래 여백은 fitStage() 가 스테이지 영역(--pdk-stage-top)으로 처리한다

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

  // ── 화면 배치: 목업 스테이지 영역 ─────────
  // 작은 화면(노트북)에서 패널과 목업이 겹치지 않게, 실제 남는 공간을 재서 배치한다.
  //   스테이지: 상단 바 아래 · 페이지 목록 오른쪽 · 오른쪽 섹션(.pdk-dock) 왼쪽 · 하단 문의 문구 위 — 이 영역 안에 목업을 맞춘다.
  //   오른쪽 섹션이 비면(패널이 모두 떠 있거나 닫힘) 화면 오른쪽 끝까지 쓴다.
  var STAGE_BOTTOM = 32;          // 하단 문의 문구 자리
  var STAGE_PAD = 16;             // 스테이지 안쪽 여백(상하좌우)

  function fitStage() {
    var root = document.documentElement;
    var stage = document.querySelector('.device-stage');
    var mockup = stage && stage.querySelector('.device-mockup');
    if (!stage || !mockup) return;

    // 1) 스테이지 영역 = 화면에서 상단 바·페이지 목록·오른쪽 열을 뺀 나머지
    var topbar = document.querySelector('.pdk-topbar');
    var nav = document.querySelector('.page-nav');
    var dockLeft = renderDock();
    // 위치는 offset* 로 잰다 — getBoundingClientRect 는 슬라이드 애니메이션(transform) 도중 값을 돌려준다.
    // (fixed 요소는 offsetParent 가 항상 null 이라 표시 여부는 getClientRects 로 본다)
    var top = topbar ? topbar.offsetTop + topbar.offsetHeight : 0;
    var left = nav && nav.getClientRects().length ? nav.offsetLeft + nav.offsetWidth : 0;
    var right = dockLeft == null ? 0 : Math.max(0, Math.round(window.innerWidth - dockLeft));
    var bottom = STAGE_BOTTOM;
    // 포커스 모드: 주변 도구가 모두 숨으므로 화면 전체를 쓴다(떠오르는 영역은 목업 위에 겹친다)
    if (document.body.classList.contains('pdk-focus')) top = left = right = bottom = 0;
    root.style.setProperty('--pdk-stage-top', top + 'px');
    root.style.setProperty('--pdk-stage-left', left + 'px');
    root.style.setProperty('--pdk-stage-right', right + 'px');
    root.style.setProperty('--pdk-stage-bottom', bottom + 'px');
    stage.classList.add('is-fitted');

    // 2) 목업을 줄인 크기만큼만 자리를 차지하는 래퍼(.device-fit)로 감싼다
    //    (transform: scale 은 보이는 크기만 줄이고 자리는 원래 크기로 남겨, 목업이 아래로 밀려 잘렸다)
    var fitBox = mockup.parentElement;
    if (!fitBox.classList.contains('device-fit')) {
      fitBox = document.createElement('div');
      fitBox.className = 'device-fit';
      stage.insertBefore(fitBox, mockup);
      fitBox.appendChild(mockup);
    }

    // 3) 목업 원래 크기(offset* 는 transform 영향 없음)를 영역에 맞춘다
    var natW = mockup.offsetWidth, natH = mockup.offsetHeight;
    if (!natW || !natH) return;
    var casePanel = stage.querySelector('.pdk-case-panel');
    var availW = stage.clientWidth - STAGE_PAD * 2;
    var availH = stage.clientHeight - STAGE_PAD * 2 - (casePanel ? casePanel.offsetHeight + 12 : 0);
    var scale = Math.max(0.1, Math.min(1, availW / natW, availH / natH));
    root.style.setProperty('--pdk-device-scale', scale.toFixed(3));
    fitBox.style.width = Math.floor(natW * scale) + 'px';
    fitBox.style.height = Math.floor(natH * scale) + 'px';
  }

  var fitQueued = false;
  function queueFit() {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(function () { fitQueued = false; fitStage(); });
  }

  // 패널 열기·닫기(is-hidden) → 다시 배치. (붙이기·떼어내기는 dockPanel/floatPanel 이 직접 queueFit)
  // style 은 감시하지 않는다(renderDock 이 style 을 바꾸므로 무한 반복 방지).
  function watchLayout() {
    if (window.__pdkLayoutBound) return;
    window.__pdkLayoutBound = true;
    window.addEventListener('resize', queueFit);
    if (window.MutationObserver) {
      var mo = new MutationObserver(queueFit);
      document.querySelectorAll('.page-detail, .page-flow').forEach(function (p) {
        mo.observe(p, { attributes: true, attributeFilter: ['class'] });
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);   // 웹폰트로 상단 바 높이가 바뀔 수 있다
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

    fitStage();

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

  // ── 포커스 모드 (클라이언트 시연용) ─────────────
  // 목업 · 분기 라디오만 남기고 나머지(상단 바 · 페이지 목록 · 오른쪽 섹션 · 떠 있는 패널 · 문의 문구)를 숨긴다.
  // 화면 가장자리(왼쪽/오른쪽/위)에 마우스를 잠시 두면 그쪽 영역이 목업 위로 떠오르고, 벗어나면 다시 숨는다.
  // 켜기/끄기: 상단 바 버튼 · Ctrl+\ (mac ⌘+\) · ESC(끄기). 상태는 sessionStorage 로 화면 이동 후에도 유지.
  // 자동 이동(flow.to 의 kind:'auto')은 포커스 모드에서만 카운트다운 후 넘어간다.
  var EDGE_DELAY = 200, HIDE_DELAY = 250, AUTO_GO_SEC = 3;
  var EDGE_TARGET = { left: '.page-nav', right: '.pdk-dock', top: '.pdk-topbar' };
  var autoGoTimer = null;

  function isFocus() { return document.body.classList.contains('pdk-focus'); }

  // Ctrl+\ (mac ⌘+\) — 키보드 배열마다 이 키의 key/code 가 다르다
  //   US·한국: Backslash ('\', 한국 자판은 ₩ 로 표시) · 일본: IntlYen ('¥') · ISO(유럽): IntlBackslash
  function isFocusShortcut(e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return false;
    return ['Backslash', 'IntlBackslash', 'IntlYen'].indexOf(e.code) > -1
      || ['\\', '₩', '¥'].indexOf(e.key) > -1
      || e.keyCode === 220 || e.keyCode === 226;
  }

  function setFocus(on) {
    document.body.classList.toggle('pdk-focus', on);
    ['left', 'right', 'top'].forEach(function (s) { document.body.classList.remove('pdk-reveal-' + s); });
    try { on ? sessionStorage.setItem(FOCUS_STORE, '1') : sessionStorage.removeItem(FOCUS_STORE); } catch (_) {}
    var btn = document.querySelector('.pdk-topbar-focus');
    if (btn) btn.classList.toggle('is-active', on);
    fitStage();
    if (on) startAutoGo(); else stopAutoGo();
  }

  function startAutoGo() {
    stopAutoGo();
    var found = findCurrentPage(currentKey());
    var to = found && found.page.flow && Array.isArray(found.page.flow.to) ? found.page.flow.to : [];
    var auto = to.filter(function (t) { return t.kind === 'auto'; })[0];
    if (!auto) return;
    var dest = flatPages().filter(function (p) { return p.id === auto.screen; })[0];
    var destName = dest ? dest.label : auto.screen;
    var n = AUTO_GO_SEC;
    var badge = document.createElement('div');
    badge.className = 'pdk-autogo';
    document.body.appendChild(badge);
    function tick() {
      badge.textContent = n + '초 후 이동 → ' + destName;
      if (n <= 0) { stopAutoGo(); window.goScreen(auto.screen); return; }
      n -= 1;
      autoGoTimer = setTimeout(tick, 1000);
    }
    tick();
  }
  function stopAutoGo() {
    clearTimeout(autoGoTimer);
    autoGoTimer = null;
    var b = document.querySelector('.pdk-autogo');
    if (b) b.remove();
  }

  function initFocusMode() {
    var body = document.body;

    // 상단 바 버튼 (도구 영역 맨 앞)
    var tools = document.querySelector('.pdk-topbar-tools');
    if (tools && !tools.querySelector('.pdk-topbar-focus')) {
      var btn = document.createElement('button');
      btn.className = 'pdk-topbar-btn pdk-topbar-focus';
      btn.type = 'button';
      btn.setAttribute('data-tooltip', '포커스 모드 (Ctrl+\\)');
      btn.innerHTML = '<img src="' + ENGINE_BASE + 'icons/topbar-focus.svg" width="24" height="24" alt="">';
      btn.addEventListener('click', function () { setFocus(!isFocus()); });
      tools.insertBefore(btn, tools.firstChild);
    }

    // 가장자리 감지 영역 + 떠오른 영역에서 벗어나면 숨김
    Object.keys(EDGE_TARGET).forEach(function (side) {
      var zone = document.createElement('div');
      zone.className = 'pdk-edge pdk-edge-' + side;
      body.appendChild(zone);
      var showT = null, hideT = null;
      function reveal() { clearTimeout(hideT); body.classList.add('pdk-reveal-' + side); }
      function conceal() { clearTimeout(showT); hideT = setTimeout(function () { body.classList.remove('pdk-reveal-' + side); }, HIDE_DELAY); }
      zone.addEventListener('mouseenter', function () { clearTimeout(hideT); showT = setTimeout(reveal, EDGE_DELAY); });
      zone.addEventListener('mouseleave', function () { clearTimeout(showT); if (!body.classList.contains('pdk-reveal-' + side)) return; conceal(); });
      var target = document.querySelector(EDGE_TARGET[side]);
      if (target) {
        target.addEventListener('mouseenter', function () { if (isFocus()) clearTimeout(hideT); });
        target.addEventListener('mouseleave', function () { if (isFocus()) conceal(); });
      }
    });

    // 단축키 — capture 단계에서 먼저 본다(열린 모달의 ESC 처리보다 앞서 상태를 확인해야 한다)
    window.addEventListener('keydown', function (e) {
      if (isFocusShortcut(e)) {
        e.preventDefault();
        setFocus(!isFocus());
        return;
      }
      if (e.key === 'Escape' && isFocus()) {
        if (closeBranchPicker()) return;
        if (document.querySelector('.page-flow-modal.is-open, .pdk-spec-modal.is-open')) return;   // 모달부터 닫는다
        setFocus(false);
      }
    }, true);

    var saved = false;
    try { saved = sessionStorage.getItem(FOCUS_STORE) === '1'; } catch (_) {}
    if (saved) setFocus(true);
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
    fitStage();            // 패널이 생긴 뒤 실제 남는 공간으로 다시 배치
    watchLayout();
    initFocusMode();       // 저장된 포커스 모드 복원(화면 이동 후에도 유지)
    // 첫 화면을 그린 뒤 슬라이드 애니메이션을 다시 켠다(가장자리에서 떠오르는 효과용)
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.documentElement.classList.remove('pdk-no-anim');
    }); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
