// Quick Add dropdown — open on hover, close on mouse leave (desktop feel)
const quickAddDropdown = document.querySelector('.quick-add-dropdown');
if (quickAddDropdown) {
  const quickAddToggle = quickAddDropdown.querySelector('.dropdown-toggle');
  const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(quickAddToggle);
  let quickAddCloseTimer;

  quickAddDropdown.addEventListener('mouseenter', () => {
    clearTimeout(quickAddCloseTimer);
    bsDropdown.show();
  });
  quickAddDropdown.addEventListener('mouseleave', () => {
    quickAddCloseTimer = setTimeout(() => bsDropdown.hide(), 150);
  });
}

// Profile dropdown — open on hover, close on mouse leave
const profileDropdownWrap = document.querySelector('.header-profile-dropdown');
if (profileDropdownWrap) {
  const profileToggle = profileDropdownWrap.querySelector('.dropdown-toggle');
  const bsProfileDropdown = bootstrap.Dropdown.getOrCreateInstance(profileToggle);
  let profileCloseTimer;

  profileDropdownWrap.addEventListener('mouseenter', () => {
    clearTimeout(profileCloseTimer);
    bsProfileDropdown.show();
  });
  profileDropdownWrap.addEventListener('mouseleave', () => {
    profileCloseTimer = setTimeout(() => bsProfileDropdown.hide(), 150);
  });
}

// Loading screen
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 600);
});

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const hamburger = document.getElementById('hamburgerBtn');

const mainContent = document.querySelector('.main-content');
const dashboardFooter = document.querySelector('.dashboard-footer');

// Auto-generate tooltips from nav labels (used when collapsed)
document.querySelectorAll('.nav-item-custom').forEach(item => {
  const label = item.querySelector('span:not(.badge-count)');
  if (label) item.setAttribute('data-tooltip', label.textContent.trim());
});

// Floating tooltip logic for collapsed sidebar
const floatingTooltip = document.getElementById('sidebarTooltip');

function attachSidebarTooltip(el) {
  el.addEventListener('mouseenter', () => {
    if (!sidebar.classList.contains('collapsed')) return;
    const text = el.getAttribute('data-tooltip');
    if (!text) return;
    const rect = el.getBoundingClientRect();
    floatingTooltip.textContent = text;
    floatingTooltip.style.top = (rect.top + rect.height / 2) + 'px';
    floatingTooltip.style.left = (rect.right + 10) + 'px';
    floatingTooltip.classList.add('show');
  });
  el.addEventListener('mouseleave', () => {
    floatingTooltip.classList.remove('show');
  });
}

document.querySelectorAll('.nav-item-custom').forEach(attachSidebarTooltip);

// Flyout submenu for collapsed sidebar
const sidebarFlyout = document.getElementById('sidebarFlyout');

document.querySelectorAll('.nav-item-custom.has-submenu').forEach(item => {
  item.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('collapsed')) return; // expanded: let Bootstrap collapse handle it normally

    e.preventDefault();
    e.stopPropagation();

    const targetSelector = item.getAttribute('data-bs-target');
    const submenuWrap = document.querySelector(targetSelector);
    const submenuInner = submenuWrap ? submenuWrap.querySelector('.nav-submenu') : null;
    if (!submenuInner) return;

    const label = item.querySelector('span:not(.badge-count)')?.textContent.trim() || '';
    sidebarFlyout.innerHTML = `<div class="sidebar-flyout-title">${label}</div>` + submenuInner.innerHTML;

    const rect = item.getBoundingClientRect();
    sidebarFlyout.style.top = rect.top + 'px';
    sidebarFlyout.style.left = (rect.right + 10) + 'px';
    sidebarFlyout.classList.add('show');
  });
});

// Close flyout when clicking a submenu link inside it, or clicking anywhere outside
sidebarFlyout.addEventListener('click', (e) => {
  if (e.target.closest('.nav-subitem')) sidebarFlyout.classList.remove('show');
});
document.addEventListener('click', (e) => {
  if (!sidebarFlyout.contains(e.target) && !e.target.closest('.has-submenu')) {
    sidebarFlyout.classList.remove('show');
  }
});

// Tooltip for the user profile block at the bottom of the sidebar
const sidebarUserBlock = document.querySelector('.sidebar-user');
const sidebarUserName = document.querySelector('.sidebar-user-name');
if (sidebarUserBlock && sidebarUserName) {
  sidebarUserBlock.setAttribute('data-tooltip', sidebarUserName.textContent.trim());
}
if (sidebarUserBlock) attachSidebarTooltip(sidebarUserBlock);

const hamburgerIcon = hamburger.querySelector('i');

function setSidebarState(collapsed) {
  sidebarFlyout.classList.remove('show');
  sidebar.classList.toggle('collapsed', collapsed);
  mainContent.classList.toggle('sidebar-collapsed', collapsed);
  dashboardFooter.classList.toggle('sidebar-collapsed', collapsed);
  hamburgerIcon.classList.toggle('fa-bars', !collapsed);
  hamburgerIcon.classList.toggle('fa-angle-double-right', collapsed);
  localStorage.setItem('sttrip-sidebar-collapsed', collapsed ? '1' : '0');
}

hamburger.addEventListener('click', () => {
  if (window.innerWidth >= 992) {
    setSidebarState(!sidebar.classList.contains('collapsed'));
  } else {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  }
});

// Restore saved state on load (desktop only)
if (window.innerWidth >= 992 && localStorage.getItem('sttrip-sidebar-collapsed') === '1') {
  setSidebarState(true);
}

// Keep state clean when resizing across the breakpoint
window.addEventListener('resize', () => {
  if (window.innerWidth >= 992) {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    setSidebarState(localStorage.getItem('sttrip-sidebar-collapsed') === '1');
  } else {
    sidebar.classList.remove('collapsed');
    mainContent.classList.remove('sidebar-collapsed');
    dashboardFooter.classList.remove('sidebar-collapsed');
  }
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }
});

// Tab pills
document.querySelectorAll('.tab-pills').forEach(group => {
  group.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      group.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
});

// Pagination
document.querySelectorAll('.pagination-custom').forEach(pag => {
  pag.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.textContent.includes('chevron') || btn.textContent === '...') return;
      pag.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// Charts
const chartFont = { family: 'Inter', size: 11 };
const gridColor = '#f1f5f9';

// Revenue Chart
const revenueCtx = document.getElementById('revenueChart').getContext('2d');
const revenueLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
new Chart(revenueCtx, {
  type: 'line',
  data: {
    labels: revenueLabels,
    datasets: [
      {
        label: 'Bookings',
        data: [0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 1.0, 1.1, 1.2],
        borderColor: '#4f6bff',
        backgroundColor: 'rgba(79,107,255,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Packages',
        data: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 0.9, 1.0],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Visa',
        data: [0.15, 0.2, 0.22, 0.25, 0.28, 0.3, 0.32, 0.35, 0.38, 0.42, 0.48, 0.55],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: chartFont, color: '#94a3b8' }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          font: chartFont,
          color: '#94a3b8',
          callback: v => v + 'k'
        },
        beginAtZero: true,
        max: 2
      }
    },
    interaction: { intersect: false, mode: 'index' }
  }
});

// Booking Donut Chart
const bookingCtx = document.getElementById('bookingChart').getContext('2d');
new Chart(bookingCtx, {
  type: 'doughnut',
  data: {
    labels: ['Flights', 'Hotels', 'Tours', 'Umrah/Hajj', 'Visa'],
    datasets: [{
      data: [42, 21, 16, 13, 8],
      backgroundColor: ['#4f6bff', '#22c55e', '#06b6d4', '#8b5cf6', '#cbd5e1'],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { display: false } }
  }
});

// Customer Bar Chart
const customerCtx = document.getElementById('customerChart').getContext('2d');
new Chart(customerCtx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'New customers',
        data: [120, 150, 180, 200, 220, 250, 280, 300],
        backgroundColor: '#4f6bff',
        borderRadius: 3,
        barPercentage: 0.6,
      },
      {
        label: 'Returning customers',
        data: [200, 220, 250, 280, 310, 340, 380, 420],
        backgroundColor: '#22c55e',
        borderRadius: 3,
        barPercentage: 0.6,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { ...chartFont, size: 9 }, color: '#94a3b8' },
        stacked: true,
      },
      y: {
        grid: { color: gridColor },
        ticks: { font: { ...chartFont, size: 9 }, color: '#94a3b8' },
        stacked: true,
        beginAtZero: true,
        max: 900,
      }
    }
  }
});

// Payment Donut Chart
const paymentCtx = document.getElementById('paymentChart').getContext('2d');
new Chart(paymentCtx, {
  type: 'doughnut',
  data: {
    labels: ['bKash', 'Nagad', 'Bank Transfer', 'Visa/Mastercard', 'Cash'],
    datasets: [{
      data: [38, 24, 22, 11, 5],
      backgroundColor: ['#ec4899', '#f97316', '#3b82f6', '#8b5cf6', '#22c55e'],
      borderWidth: 0,
      hoverOffset: 3,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: { legend: { display: false } }
  }
});

// Counter animation
function animateCounters() {
  document.querySelectorAll('.kpi-value, .ops-stat-value, .ca-stat-value').forEach(el => {
    const text = el.textContent;
    if (text.includes('৳') || text.includes('%') || text.includes('L')) return;
    const num = parseInt(text.replace(/,/g, ''));
    if (isNaN(num) || num > 100000) return;
    let current = 0;
    const step = Math.ceil(num / 30);
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { current = num; clearInterval(timer); }
      el.textContent = current.toLocaleString();
    }, 30);
  });
}
setTimeout(animateCounters, 800);

// Nav item click
document.querySelectorAll('.nav-item-custom').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item-custom').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    if (window.innerWidth < 992) {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    }
  });
});

// Mobile bottom nav active state
document.querySelectorAll('.mbn-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.mbn-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Mobile search icon toggles the search bar under the header
const mobileSearchBtn = document.querySelector('.mobile-search-btn');
const headerSearchEl = document.querySelector('.header-search');
if (mobileSearchBtn && headerSearchEl) {
  mobileSearchBtn.addEventListener('click', () => {
    headerSearchEl.classList.toggle('mobile-open');
  });
}