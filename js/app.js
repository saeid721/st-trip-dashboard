/* =========================================================
   ST TRIP ADMIN — APP LOGIC
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Sidebar toggle ---------- */
  const shell = $('#appShell');
  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');
  const toggleBtn = $('#toggleSidebar');
  const isMobile = () => window.innerWidth <= 768;

  toggleBtn.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('show');
    } else {
      shell.classList.toggle('sidebar-collapsed');
    }
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('show');
    }
  });

  /* ---------- Collapsed sidebar tooltips ---------- */
  const navTooltip = document.createElement('div');
  navTooltip.className = 'nav-tooltip';
  document.body.appendChild(navTooltip);

  function isSidebarIconOnly() {
    if (sidebar.classList.contains('mobile-open')) return false;
    return shell.classList.contains('sidebar-collapsed') || window.innerWidth <= 1024;
  }

  const sidebarNav = $('.sidebar-nav');

  sidebarNav.addEventListener('mouseover', e => {
    const item = e.target.closest('.nav-item[data-tip]');
    if (!item || !isSidebarIconOnly()) return;
    const r = item.getBoundingClientRect();
    navTooltip.textContent = item.getAttribute('data-tip');
    navTooltip.style.left = `${r.right + 10}px`;
    navTooltip.style.top = `${r.top + r.height / 2}px`;
    navTooltip.classList.add('show');
  });

  sidebarNav.addEventListener('mouseout', e => {
    const item = e.target.closest('.nav-item[data-tip]');
    const toEl = e.relatedTarget;
    if (item && (!toEl || !item.contains(toEl))) {
      navTooltip.classList.remove('show');
    }
  });

  window.addEventListener('scroll', () => navTooltip.classList.remove('show'), true);

  /* ---------- Submenu toggle ---------- */
  $$('.nav-item.has-sub').forEach(item => {
    item.addEventListener('click', () => {
      const sub = item.nextElementSibling;
      const isOpen = sub.classList.contains('open');
      $$('.submenu.open').forEach(s => {
        if (s !== sub) {
          s.classList.remove('open');
          const sib = s.previousElementSibling;
          if (sib && sib.classList.contains('has-sub')) sib.setAttribute('aria-expanded', 'false');
        }
      });
      sub.classList.toggle('open', !isOpen);
      item.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Active nav ---------- */
  $$('.nav-item:not(.has-sub)').forEach(item => {
    item.addEventListener('click', () => {
      $$('.nav-item.active').forEach(a => a.classList.remove('active'));
      item.classList.add('active');
      if (isMobile()) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
      }
    });
  });

  /* ---------- Notifications panel ---------- */
  const notifBtn = $('#notifBtn');
  const notifPanel = $('#notifPanel');
  notifBtn.addEventListener('click', e => {
    e.stopPropagation();
    notifPanel.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
      notifPanel.classList.remove('open');
    }
  });

  /* ---------- Profile dropdown ---------- */
  const profileBtn = $('#profileBtn');
  const profileMenu = $('#profileMenu');
  profileBtn.addEventListener('click', e => {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
  });
  document.addEventListener('click', e => {
    if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
      profileMenu.classList.remove('show');
    }
  });

  /* ---------- Chips toggle ---------- */
  $$('.chips-group').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('.chip', group).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  /* ---------- Toast system ---------- */
  function showToast(type, title, message) {
    const icons = {
      success: 'bi-check-circle-fill',
      info: 'bi-info-circle-fill',
      warn: 'bi-exclamation-triangle-fill',
      error: 'bi-x-circle-fill'
    };
    const toast = document.createElement('div');
    toast.className = `toast-st ${type}`;
    toast.innerHTML = `
      <div class="ic"><i class="bi ${icons[type]}"></i></div>
      <div style="flex: 1;">
        <div class="t">${title}</div>
        <div class="m">${message}</div>
      </div>
      <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; font-size: 14px;" aria-label="Close"><i class="bi bi-x"></i></button>
    `;
    $('#toastContainer').appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    const close = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 280);
    };
    toast.querySelector('button').addEventListener('click', close);
    setTimeout(close, 4000);
  }

  setTimeout(() => showToast('info', 'Welcome back, Admin', 'You have 32 pending actions today.'), 600);

  /* ---------- Quick add dropdown ---------- */
  const quickAddBtn = $('#quickAddBtn');
  const quickAddMenu = $('#quickAddMenu');

  quickAddBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = quickAddMenu.classList.toggle('show');
    quickAddBtn.setAttribute('aria-expanded', String(isOpen));
    profileMenu.classList.remove('show');
    notifPanel.classList.remove('open');
  });

  $$('.quick-add-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const action = item.dataset.action || item.textContent.trim();
      quickAddMenu.classList.remove('show');
      quickAddBtn.setAttribute('aria-expanded', 'false');
      showToast('success', action, `Opening ${action.toLowerCase()} form...`);
    });
  });

  document.addEventListener('click', e => {
    if (!quickAddMenu.contains(e.target) && !quickAddBtn.contains(e.target)) {
      quickAddMenu.classList.remove('show');
      quickAddBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Bottom navigation (mobile) ---------- */
  const bnItems = $$('.bn-item');
  bnItems.forEach(item => {
    item.addEventListener('click', () => {
      bnItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  const bnFabBtn = $('#bnFabBtn');
  if (bnFabBtn) {
    bnFabBtn.addEventListener('click', () => {
      showToast('success', 'Quick Add', 'Opening quick create menu...');
    });
  }

  /* ---------- Row actions ---------- */
  $$('.row-actions button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = btn.getAttribute('title');
      showToast('info', t, 'Action triggered for this booking.');
    });
  });

  /* =========================================================
     SVG CHARTS — lightweight, theme-aware
     ========================================================= */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderRevenueChart() {
    const wrap = $('#revenueChart');
    if (!wrap) return;
    const w = wrap.clientWidth || 600;
    const h = wrap.clientHeight || 260;
    const pad = { l: 40, r: 12, t: 16, b: 28 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;

    const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    const bookings = [420, 510, 480, 620, 580, 720, 680, 820, 780, 920, 880, 1040];
    const packages = [180, 220, 240, 280, 310, 340, 380, 420, 460, 480, 520, 560];
    const visa = [80, 90, 110, 120, 140, 130, 160, 170, 190, 210, 220, 240];

    const max = Math.max(...bookings.map((b, i) => b + packages[i] + visa[i])) * 1.1;
    const xStep = cw / (labels.length - 1);
    const yOf = v => pad.t + ch - (v / max) * ch;

    const baseBook = bookings.map((v, i) => [pad.l + i * xStep, yOf(v)]);
    const basePack = bookings.map((v, i) => [pad.l + i * xStep, yOf(v + packages[i])]);
    const baseVisa = bookings.map((v, i) => [pad.l + i * xStep, yOf(v + packages[i] + visa[i])]);

    const toPath = pts => pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    const toArea = (top, bottom) => {
      const down = [...bottom].reverse();
      return `${toPath(top)} L${down[0][0]},${down[0][1]} ` + down.slice(1).map(p => `L${p[0]},${p[1]}`).join(' ') + ' Z';
    };
    const bottomLine = [[pad.l, pad.t + ch], [w - pad.r, pad.t + ch]];

    let yAxis = '';
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i;
      const y = yOf(v);
      yAxis += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="${cssVar('--divider')}" stroke-dasharray="3,3"/>`;
      yAxis += `<text x="${pad.l - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="${cssVar('--text-muted')}">${(v / 1000).toFixed(1)}k</text>`;
    }
    let xLabels = '';
    labels.forEach((l, i) => {
      const x = pad.l + i * xStep;
      xLabels += `<text x="${x}" y="${h - 8}" text-anchor="middle" font-size="10" fill="${cssVar('--text-muted')}">${l}</text>`;
    });

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" role="img" aria-label="Revenue chart">
        <defs>
          <linearGradient id="revBook" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${cssVar('--st-blue')}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${cssVar('--st-blue')}" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="revPack" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${cssVar('--st-cyan')}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${cssVar('--st-cyan')}" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="revVisa" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${cssVar('--st-green')}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${cssVar('--st-green')}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yAxis}
        ${xLabels}
        <path d="${toArea(baseBook, bottomLine)}" fill="url(#revBook)"/>
        <path d="${toPath(baseBook)}" stroke="${cssVar('--st-blue')}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${toArea(basePack, baseBook)}" fill="url(#revPack)"/>
        <path d="${toPath(basePack)}" stroke="${cssVar('--st-cyan')}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${toArea(baseVisa, basePack)}" fill="url(#revVisa)"/>
        <path d="${toPath(baseVisa)}" stroke="${cssVar('--st-green')}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${baseVisa.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${cssVar('--bg-surface')}" stroke="${cssVar('--st-green')}" stroke-width="2"/>`).join('')}
      </svg>
    `;
    wrap.innerHTML = svg;
  }

  function renderBookingDonut() {
    const wrap = $('#bookingDonut');
    if (!wrap) return;

    const size = wrap.clientWidth || 160;
    const strokeWidth = size <= 100 ? 11 : 16;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const data = [
      { v: 42, c: '#0072BC', label: 'Flights' },
      { v: 21, c: '#06B0EF', label: 'Hotels' },
      { v: 16, c: '#00A651', label: 'Tours' },
      { v: 13, c: '#1e3a5f', label: 'Umrah/Hajj' },
      { v: 8, c: '#cbd5e1', label: 'Visa' },
    ];

    let offset = 0;
    let segments = '';

    data.forEach((d, i) => {
      const dashArray = (d.v / 100) * circumference;
      const dashOffset = -offset;

      segments += `
      <circle 
        cx="${center}" 
        cy="${center}" 
        r="${radius}" 
        fill="none" 
        stroke="${d.c}" 
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dashArray} ${circumference}"
        stroke-dashoffset="${dashOffset}"
        transform="rotate(-90 ${center} ${center})"
      />
    `;

      offset += dashArray;
    });

    wrap.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle 
        cx="${center}" 
        cy="${center}" 
        r="${radius}" 
        fill="none" 
        stroke="#f1f5f9" 
        stroke-width="${strokeWidth}"
      />
      ${segments}
    </svg>
  `;
  }

  function renderCustomerChart() {
    const wrap = $('#customerChart');
    if (!wrap) return;
    const w = wrap.clientWidth || 400;
    const h = 160;
    const pad = { l: 32, r: 10, t: 10, b: 24 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const newC = [120, 148, 182, 210, 248, 284, 342, 428];
    const retC = [180, 210, 242, 268, 298, 324, 362, 398];
    const max = Math.max(...newC.map((n, i) => n + retC[i])) * 1.1;
    const bw = cw / labels.length * 0.55;
    const step = cw / labels.length;

    const yOf = v => pad.t + ch - (v / max) * ch;

    let yAxis = '';
    for (let i = 0; i <= 3; i++) {
      const v = (max / 3) * i;
      const y = yOf(v);
      yAxis += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="${cssVar('--divider')}" stroke-dasharray="3,3"/>`;
      yAxis += `<text x="${pad.l - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="${cssVar('--text-muted')}">${Math.round(v)}</text>`;
    }

    let bars = '';
    labels.forEach((l, i) => {
      const cx = pad.l + i * step + step / 2;
      const hNew = (newC[i] / max) * ch;
      const hRet = (retC[i] / max) * ch;
      const base = pad.t + ch;
      bars += `<rect x="${cx - bw / 2}" y="${base - hNew}" width="${bw}" height="${hNew}" fill="${cssVar('--st-blue')}" rx="2"/>`;
      bars += `<rect x="${cx - bw / 2}" y="${base - hNew - hRet}" width="${bw}" height="${hRet}" fill="${cssVar('--st-green')}" rx="2"/>`;
      bars += `<text x="${cx}" y="${h - 6}" text-anchor="middle" font-size="9" fill="${cssVar('--text-muted')}">${l}</text>`;
    });

    wrap.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Customer growth">
        ${yAxis}
        ${bars}
      </svg>
    `;
  }

  function renderPaymentDonut() {
    const wrap = $('#paymentDonut');
    if (!wrap) return;

    const size = wrap.clientWidth || 120;
    const strokeWidth = size <= 100 ? 10 : 14;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const data = [
      { v: 38, c: '#E11D74' },
      { v: 24, c: '#E74F2C' },
      { v: 22, c: cssVar('--st-blue') },
      { v: 11, c: '#1A1F71' },
      { v: 5, c: cssVar('--st-green') },
    ];

    let offset = 0;
    let segments = '';

    data.forEach((d) => {
      const dashArray = (d.v / 100) * circumference;
      const dashOffset = -offset;

      segments += `
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="none"
        stroke="${d.c}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dashArray} ${circumference}"
        stroke-dashoffset="${dashOffset}"
        transform="rotate(-90 ${center} ${center})"
      />
    `;

      offset += dashArray;
    });

    wrap.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="none"
        stroke="#f1f5f9"
        stroke-width="${strokeWidth}"
      />
      ${segments}
    </svg>
  `;
  }

  function renderAllCharts() {
    renderRevenueChart();
    renderBookingDonut();
    renderCustomerChart();
    renderPaymentDonut();
  }

  /* ---------- Scroll reveal ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), idx * 50);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- Resize ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderAllCharts, 150);
  });

  requestAnimationFrame(() => renderAllCharts());
})();