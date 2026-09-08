/* =========================================================
ST TRIP ADMIN — PACKAGES MODULE
========================================================= */
(() => {
    'use strict';
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- Sample Package Data ---------- */
    const PACKAGES = [
        { id: 'PKG-UMR-2026-001', name: 'Exclusive Umrah Package', sub: 'Premium hotels • Makkah + Madinah', type: 'umrah', dest: 'Makkah & Madinah', destFlag: '🇸🇦', duration: '14 days', durationSub: '13 nights', price: 140000, avail: 42, capacity: 60, status: 'published', updated: '2 hrs ago', updatedDate: '2026-09-08', featured: true },
        { id: 'PKG-HJJ-2026-014', name: 'Premium Hajj Package 2026', sub: '5-star accommodation • Full guidance', type: 'hajj', dest: 'Makkah, Madinah & Arafat', destFlag: '🇸🇦', duration: '21 days', durationSub: '20 nights', price: 385000, avail: 18, capacity: 80, status: 'published', updated: '5 hrs ago', updatedDate: '2026-09-08', featured: true },
        { id: 'PKG-TR-2026-028', name: 'Breathtaking Singapore', sub: 'City tour • Sentosa • Marina Bay', type: 'tour', dest: 'Singapore', destFlag: '🇸🇬', duration: '6 days', durationSub: '5 nights', price: 98000, avail: 24, capacity: 30, status: 'published', updated: '1 day ago', updatedDate: '2026-09-07', featured: true },
        { id: 'PKG-HO-2026-042', name: 'Dubai Explorer', sub: 'Desert safari • Burj Khalifa • Mall', type: 'holiday', dest: 'Dubai', destFlag: '🇦🇪', duration: '5 days', durationSub: '4 nights', price: 72000, avail: 8, capacity: 40, status: 'published', updated: '1 day ago', updatedDate: '2026-09-07', featured: false },
        { id: 'PKG-TR-2026-056', name: 'Bangkok Discovery', sub: 'Temples • Floating market • Shopping', type: 'tour', dest: 'Bangkok', destFlag: '🇹🇭', duration: '4 days', durationSub: '3 nights', price: 54000, avail: 32, capacity: 35, status: 'published', updated: '2 days ago', updatedDate: '2026-09-06', featured: false },
        { id: 'PKG-UMR-2026-063', name: 'Classic Umrah Economy', sub: 'Standard hotels • Guided tours', type: 'umrah', dest: 'Makkah & Madinah', destFlag: '🇸🇦', duration: '10 days', durationSub: '9 nights', price: 95000, avail: 0, capacity: 50, status: 'published', updated: '3 days ago', updatedDate: '2026-09-05', featured: false },
        { id: 'PKG-TR-2026-077', name: 'Istanbul Heritage Tour', sub: 'Hagia Sophia • Bosphorus • Cappadocia', type: 'tour', dest: 'Istanbul', destFlag: '🇹🇷', duration: '8 days', durationSub: '7 nights', price: 118000, avail: 15, capacity: 25, status: 'draft', updated: '4 days ago', updatedDate: '2026-09-04', featured: false },
        { id: 'PKG-HO-2026-089', name: 'Maldives Paradise', sub: 'Water villa • All-inclusive resort', type: 'holiday', dest: 'Maldives', destFlag: '🇲🇻', duration: '7 days', durationSub: '6 nights', price: 225000, avail: 6, capacity: 20, status: 'published', updated: '5 days ago', updatedDate: '2026-09-03', featured: true },
        { id: 'PKG-TR-2026-102', name: 'Kuala Lumpur Escape', sub: 'Petronas • Batu Caves • Genting', type: 'tour', dest: 'Kuala Lumpur', destFlag: '🇲🇾', duration: '5 days', durationSub: '4 nights', price: 68000, avail: 28, capacity: 30, status: 'published', updated: '1 week ago', updatedDate: '2026-09-01', featured: false },
        { id: 'PKG-HJJ-2026-115', name: 'Standard Hajj Package', sub: 'Group package • Basic amenities', type: 'hajj', dest: 'Makkah & Madinah', destFlag: '🇸🇦', duration: '18 days', durationSub: '17 nights', price: 285000, avail: 45, capacity: 100, status: 'expired', updated: '2 weeks ago', updatedDate: '2026-08-25', featured: false }
    ];

    /* ---------- Skeleton Loading ---------- */
    const skeletonWrap = $('#skeletonWrap');
    const tableWrap = $('#tableWrap');
    const emptyState = $('#emptyState');

    function showLoading() {
        if (skeletonWrap) skeletonWrap.classList.add('loading');
        if (tableWrap) tableWrap.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }
    function hideLoading() {
        if (skeletonWrap) skeletonWrap.classList.remove('loading');
        if (tableWrap) tableWrap.style.display = '';
    }

    // Simulate loading
    showLoading();
    setTimeout(() => {
        hideLoading();
        renderTable(PACKAGES);
        renderMobileCards(PACKAGES);
        initReveal();
    }, 700);

    /* ---------- Toast ---------- */
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
    <div style="flex:1;">
      <div class="t">${title}</div>
      <div class="m">${message}</div>
    </div>
    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0;font-size:14px;" aria-label="Close"><i class="bi bi-x"></i></button>`;
        $('#toastContainer').appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        const close = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 280);
        };
        toast.querySelector('button').addEventListener('click', close);
        setTimeout(close, 4000);
    }

    /* ---------- Render Table ---------- */
    function formatPrice(n) {
        return 'BDT ' + n.toLocaleString('en-IN');
    }
    function getAvailClass(avail, capacity) {
        if (avail === 0) return 'low';
        const pct = (avail / capacity) * 100;
        if (pct > 50) return 'high';
        if (pct > 20) return 'medium';
        return 'low';
    }
    function getAvailText(avail, capacity) {
        if (avail === 0) return '<span class="pkg-avail-text soldout"><i class="bi bi-x-circle-fill"></i>Sold Out</span>';
        const pct = (avail / capacity) * 100;
        let label = 'Available';
        if (pct <= 20) label = 'Limited';
        return `<span class="pkg-avail-text"><b>${avail}</b> / ${capacity} seats</span>`;
    }

    function renderTable(packages) {
        const tbody = $('#pkgTableBody');
        if (!tbody) return;

        if (packages.length === 0) {
            tableWrap.style.display = 'none';
            emptyState.style.display = '';
            return;
        }

        tbody.innerHTML = packages.map((p, idx) => {
            const availClass = getAvailClass(p.avail, p.capacity);
            const availPct = p.capacity > 0 ? (p.avail / p.capacity) * 100 : 0;
            const initial = p.name.charAt(0);
            return `
    <tr data-id="${p.id}" data-type="${p.type}" data-status="${p.status}" data-dest="${p.dest.toLowerCase()}" data-price="${p.price}">
      <td><input type="checkbox" class="pkg-check pkg-row-check" /></td>
      <td>
        <div class="pkg-cell">
          <div class="pkg-thumb ${p.type}">
            ${initial}
            ${p.featured ? '<div class="pkg-thumb-featured"><i class="bi bi-star-fill"></i></div>' : ''}
          </div>
          <div class="pkg-cell-info">
            <div class="pkg-cell-name">${p.name}</div>
            <div class="pkg-cell-sub">${p.sub}</div>
            <div class="pkg-cell-id">${p.id}</div>
          </div>
        </div>
      </td>
      <td><span style="font-family:'SF Mono',Monaco,monospace;font-size:11.5px;color:var(--text-secondary);">${p.id}</span></td>
      <td><span class="pkg-type-badge ${p.type}"><i class="bi bi-${getTypeIcon(p.type)}"></i>${capitalize(p.type)}</span></td>
      <td><span class="pkg-dest"><span class="pkg-dest-flag">${p.destFlag}</span>${p.dest}</span></td>
      <td><div class="pkg-duration">${p.duration}<small>${p.durationSub}</small></div></td>
      <td><div class="pkg-price">${formatPrice(p.price)}<small>Starts from</small></div></td>
      <td>
        <div class="pkg-avail">
          <div class="pkg-avail-bar ${availClass}"><span style="width:${availPct}%"></span></div>
          ${getAvailText(p.avail, p.capacity)}
        </div>
      </td>
      <td><span class="pkg-status-badge ${p.status}"><span class="pip"></span>${capitalize(p.status)}</span></td>
      <td><div class="pkg-updated">${p.updated}<small>${p.updatedDate}</small></div></td>
      <td>
        <div class="pkg-actions">
          <button class="pkg-action-btn" title="View"><i class="bi bi-eye"></i></button>
          <button class="pkg-action-btn" title="Edit"><i class="bi bi-pencil"></i></button>
          <button class="pkg-action-btn" title="Duplicate"><i class="bi bi-copy"></i></button>
          <div class="pkg-more-wrap">
            <button class="pkg-action-btn pkg-more-trigger" title="More"><i class="bi bi-three-dots-vertical"></i></button>
            <div class="pkg-more-menu">
              <a href="#"><i class="bi bi-eye"></i>View Details</a>
              <a href="#"><i class="bi bi-pencil"></i>Edit Package</a>
              <a href="#"><i class="bi bi-copy"></i>Duplicate</a>
              <div class="divider"></div>
              <button data-action="toggle-status"><i class="bi bi-${p.status === 'published' ? 'slash-circle' : 'check-circle'}"></i>${p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
              <button data-action="archive"><i class="bi bi-archive"></i>Archive</button>
              <div class="divider"></div>
              <button class="danger" data-action="delete"><i class="bi bi-trash"></i>Delete</button>
            </div>
          </div>
        </div>
      </td>
    </tr>`;
        }).join('');

        attachRowHandlers();
    }

    function renderMobileCards(packages) {
        let container = $('.pkg-mobile-cards');
        if (!container) {
            container = document.createElement('div');
            container.className = 'pkg-mobile-cards';
            tableWrap.appendChild(container);
        }

        if (packages.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = packages.map(p => {
            const availClass = getAvailClass(p.avail, p.capacity);
            const availPct = p.capacity > 0 ? (p.avail / p.capacity) * 100 : 0;
            const initial = p.name.charAt(0);
            return `
    <div class="pkg-mobile-card" data-id="${p.id}">
      <div class="pkg-mobile-card-head">
        <input type="checkbox" class="pkg-check pkg-row-check pkg-mobile-card-check" />
        <div class="pkg-thumb ${p.type}">
          ${initial}
          ${p.featured ? '<div class="pkg-thumb-featured"><i class="bi bi-star-fill"></i></div>' : ''}
        </div>
        <div class="pkg-mobile-card-info">
          <div class="pkg-mobile-card-name">${p.name}</div>
          <div class="pkg-mobile-card-id">${p.id}</div>
        </div>
      </div>
      <div class="pkg-mobile-card-meta">
        <div class="pkg-mobile-meta-item">
          <span class="pkg-mobile-meta-label">Type</span>
          <span class="pkg-type-badge ${p.type}"><i class="bi bi-${getTypeIcon(p.type)}"></i>${capitalize(p.type)}</span>
        </div>
        <div class="pkg-mobile-meta-item">
          <span class="pkg-mobile-meta-label">Destination</span>
          <span class="pkg-dest"><span class="pkg-dest-flag">${p.destFlag}</span>${p.dest}</span>
        </div>
        <div class="pkg-mobile-meta-item">
          <span class="pkg-mobile-meta-label">Duration</span>
          <span class="pkg-mobile-meta-value">${p.duration}</span>
        </div>
        <div class="pkg-mobile-meta-item">
          <span class="pkg-mobile-meta-label">Status</span>
          <span class="pkg-status-badge ${p.status}"><span class="pip"></span>${capitalize(p.status)}</span>
        </div>
        <div class="pkg-mobile-meta-item" style="grid-column: span 2;">
          <span class="pkg-mobile-meta-label">Availability</span>
          <div class="pkg-avail">
            <div class="pkg-avail-bar ${availClass}"><span style="width:${availPct}%"></span></div>
            ${getAvailText(p.avail, p.capacity)}
          </div>
        </div>
      </div>
      <div class="pkg-mobile-card-foot">
        <div class="pkg-mobile-card-price">${formatPrice(p.price)}<small>Starts from</small></div>
        <div class="pkg-mobile-card-actions">
          <button class="pkg-action-btn" title="View"><i class="bi bi-eye"></i></button>
          <button class="pkg-action-btn" title="Edit"><i class="bi bi-pencil"></i></button>
          <div class="pkg-more-wrap">
            <button class="pkg-action-btn pkg-more-trigger" title="More"><i class="bi bi-three-dots-vertical"></i></button>
            <div class="pkg-more-menu">
              <a href="#"><i class="bi bi-eye"></i>View Details</a>
              <a href="#"><i class="bi bi-pencil"></i>Edit</a>
              <a href="#"><i class="bi bi-copy"></i>Duplicate</a>
              <div class="divider"></div>
              <button class="danger" data-action="delete"><i class="bi bi-trash"></i>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
        }).join('');

        attachRowHandlers();
    }

    function getTypeIcon(type) {
        const map = { umrah: 'kaaba', hajj: 'moon-stars', tour: 'geo-alt-fill', holiday: 'sun-fill', visa: 'passport', custom: 'box-seam' };
        return map[type] || 'box-seam';
    }
    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* ---------- Row Handlers ---------- */
    function attachRowHandlers() {
        // More menu toggles
        $$('.pkg-more-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const menu = btn.nextElementSibling;
                $$('.pkg-more-menu.show').forEach(m => { if (m !== menu) m.classList.remove('show'); });
                menu.classList.toggle('show');
            });
        });

        // Row checkbox
        $$('.pkg-row-check').forEach(cb => {
            cb.addEventListener('change', updateBulkBar);
        });

        // Action buttons
        $$('.pkg-action-btn[title="View"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showToast('info', 'View Package', 'Opening package details...');
            });
        });
        $$('.pkg-action-btn[title="Edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showToast('info', 'Edit Package', 'Opening package editor...');
            });
        });
        $$('.pkg-action-btn[title="Duplicate"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showToast('success', 'Duplicated', 'Package copied successfully.');
            });
        });

        // More menu actions
        $$('.pkg-more-menu button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const menu = btn.closest('.pkg-more-menu');
                menu.classList.remove('show');
                if (action === 'delete') {
                    openConfirmModal('danger', 'bi-trash-fill', 'Delete Package?', 'This package will be permanently deleted. This action cannot be undone.', () => {
                        showToast('success', 'Deleted', 'Package removed successfully.');
                    });
                } else if (action === 'archive') {
                    openConfirmModal('warn', 'bi-archive-fill', 'Archive Package?', 'This package will be moved to archive. You can restore it later.', () => {
                        showToast('success', 'Archived', 'Package archived successfully.');
                    });
                } else if (action === 'toggle-status') {
                    showToast('success', 'Status Updated', 'Package status changed.');
                }
            });
        });

        // Close more menus on outside click
        document.addEventListener('click', () => {
            $$('.pkg-more-menu.show').forEach(m => m.classList.remove('show'));
        });
    }

    /* ---------- Bulk Actions ---------- */
    const bulkBar = $('#bulkBar');
    const bulkCount = $('#bulkCount');
    const checkAll = $('#checkAll');
    const bulkClearBtn = $('#bulkClearBtn');

    function updateBulkBar() {
        const checked = $$('.pkg-row-check:checked');
        const count = checked.length;
        bulkCount.textContent = count;
        if (count > 0) {
            bulkBar.classList.add('show');
        } else {
            bulkBar.classList.remove('show');
        }
        // Update check-all state
        const total = $$('.pkg-row-check').length;
        if (checkAll) {
            checkAll.checked = count === total && total > 0;
            checkAll.indeterminate = count > 0 && count < total;
        }
        // Highlight rows
        $$('.pkg-row-check').forEach(cb => {
            const row = cb.closest('tr') || cb.closest('.pkg-mobile-card');
            if (row) row.classList.toggle('selected', cb.checked);
        });
    }

    if (checkAll) {
        checkAll.addEventListener('change', () => {
            $$('.pkg-row-check').forEach(cb => { cb.checked = checkAll.checked; });
            updateBulkBar();
        });
    }

    if (bulkClearBtn) {
        bulkClearBtn.addEventListener('click', () => {
            $$('.pkg-row-check').forEach(cb => { cb.checked = false; });
            if (checkAll) checkAll.checked = false;
            updateBulkBar();
        });
    }

    $$('.pkg-bulk-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.bulk;
            const count = $$('.pkg-row-check:checked').length;
            if (action === 'delete') {
                openConfirmModal('danger', 'bi-trash-fill', `Delete ${count} package${count > 1 ? 's' : ''}?`, 'Selected packages will be permanently deleted.', () => {
                    showToast('success', 'Deleted', `${count} package(s) removed.`);
                    $$('.pkg-row-check:checked').forEach(cb => { cb.checked = false; });
                    if (checkAll) checkAll.checked = false;
                    updateBulkBar();
                });
            } else {
                showToast('success', capitalize(action), `${count} package(s) ${action === 'publish' ? 'published' : action === 'unpublish' ? 'unpublished' : action}.`);
                $$('.pkg-row-check:checked').forEach(cb => { cb.checked = false; });
                if (checkAll) checkAll.checked = false;
                updateBulkBar();
            }
        });
    });

    /* ---------- Confirm Modal ---------- */
    const confirmModal = $('#confirmModal');
    const confirmIcon = $('#confirmIcon');
    const confirmTitle = $('#confirmTitle');
    const confirmMessage = $('#confirmMessage');
    const confirmOk = $('#confirmOk');
    const confirmCancel = $('#confirmCancel');
    let confirmCallback = null;

    function openConfirmModal(variant, icon, title, message, onConfirm) {
        confirmIcon.className = 'pkg-modal-icon ' + variant;
        confirmIcon.innerHTML = `<i class="bi ${icon}"></i>`;
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmCallback = onConfirm;
        confirmModal.classList.add('open');
    }
    function closeConfirmModal() {
        confirmModal.classList.remove('open');
        confirmCallback = null;
    }

    if (confirmCancel) confirmCancel.addEventListener('click', closeConfirmModal);
    if (confirmOk) confirmOk.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirmModal();
    });
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal || e.target.classList.contains('pkg-modal-overlay')) {
                closeConfirmModal();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && confirmModal.classList.contains('open')) closeConfirmModal();
    });

    /* ---------- Filters ---------- */
    const pkgSearch = $('#pkgSearch');
    const pkgSearchClear = $('#pkgSearchClear');
    const filterType = $('#filterType');
    const filterStatus = $('#filterStatus');
    const filterDestination = $('#filterDestination');
    const moreFiltersBtn = $('#moreFiltersBtn');
    const moreFiltersPanel = $('#moreFiltersPanel');
    const resetFiltersBtn = $('#resetFiltersBtn');
    const resultsCount = $('#resultsCount');
    const activeFiltersEl = $('#activeFilters');

    function applyFilters() {
        const q = (pkgSearch?.value || '').trim().toLowerCase();
        const type = filterType?.value || 'all';
        const status = filterStatus?.value || 'all';
        const dest = filterDestination?.value || 'all';

        const filtered = PACKAGES.filter(p => {
            const matchQ = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.dest.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
            const matchType = type === 'all' || p.type === type;
            const matchStatus = status === 'all' || p.status === status;
            const matchDest = dest === 'all' || p.dest.toLowerCase().includes(dest);
            return matchQ && matchType && matchStatus && matchDest;
        });

        renderTable(filtered);
        renderMobileCards(filtered);
        if (resultsCount) resultsCount.textContent = filtered.length;
        updateActiveFilters(q, type, status, dest);
    }

    function updateActiveFilters(q, type, status, dest) {
        if (!activeFiltersEl) return;
        const chips = [];
        if (q) chips.push({ label: `Search: "${q}"`, clear: () => { pkgSearch.value = ''; applyFilters(); } });
        if (type !== 'all') chips.push({ label: `Type: ${capitalize(type)}`, clear: () => { filterType.value = 'all'; applyFilters(); } });
        if (status !== 'all') chips.push({ label: `Status: ${capitalize(status)}`, clear: () => { filterStatus.value = 'all'; applyFilters(); } });
        if (dest !== 'all') chips.push({ label: `Dest: ${capitalize(dest)}`, clear: () => { filterDestination.value = 'all'; applyFilters(); } });

        activeFiltersEl.innerHTML = chips.map((c, i) =>
            `<span class="pkg-active-chip">${c.label}<button data-idx="${i}" aria-label="Remove"><i class="bi bi-x"></i></button></span>`
        ).join('');

        $$('.pkg-active-chip button', activeFiltersEl).forEach((btn, i) => {
            btn.addEventListener('click', () => chips[i].clear());
        });
    }

    if (pkgSearch) {
        pkgSearch.addEventListener('input', () => {
            pkgSearch.parentElement.classList.toggle('has-value', pkgSearch.value.length > 0);
            applyFilters();
        });
    }
    if (pkgSearchClear) {
        pkgSearchClear.addEventListener('click', () => {
            pkgSearch.value = '';
            pkgSearch.parentElement.classList.remove('has-value');
            applyFilters();
            pkgSearch.focus();
        });
    }
    [filterType, filterStatus, filterDestination].forEach(sel => {
        if (sel) sel.addEventListener('change', applyFilters);
    });

    if (moreFiltersBtn) {
        moreFiltersBtn.addEventListener('click', () => {
            moreFiltersBtn.classList.toggle('active');
            moreFiltersPanel.classList.toggle('open');
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (pkgSearch) pkgSearch.value = '';
            if (filterType) filterType.value = 'all';
            if (filterStatus) filterStatus.value = 'all';
            if (filterDestination) filterDestination.value = 'all';
            pkgSearch.parentElement.classList.remove('has-value');
            applyFilters();
            showToast('info', 'Filters Reset', 'All filters have been cleared.');
        });
    }

    /* ---------- Mobile Filter Drawer ---------- */
    const mobileFilterBtn = $('#mobileFilterBtn');
    const filterDrawer = $('#filterDrawer');
    const filterDrawerOverlay = $('#filterDrawerOverlay');
    const filterDrawerClose = $('#filterDrawerClose');
    const drawerApply = $('#drawerApply');
    const drawerReset = $('#drawerReset');

    function openDrawer() { filterDrawer?.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeDrawer() { filterDrawer?.classList.remove('open'); document.body.style.overflow = ''; }

    if (mobileFilterBtn) mobileFilterBtn.addEventListener('click', openDrawer);
    if (filterDrawerOverlay) filterDrawerOverlay.addEventListener('click', closeDrawer);
    if (filterDrawerClose) filterDrawerClose.addEventListener('click', closeDrawer);
    if (drawerApply) drawerApply.addEventListener('click', () => {
        closeDrawer();
        applyFilters();
        showToast('success', 'Filters Applied', 'Package list updated.');
    });
    if (drawerReset) drawerReset.addEventListener('click', () => {
        $$('.pkg-drawer-field input, .pkg-drawer-field select').forEach(el => {
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else el.value = '';
        });
    });

    /* ---------- Sorting ---------- */
    let currentSort = { key: null, dir: 'asc' };
    $$('.pkg-table thead th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (currentSort.key === key) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort = { key, dir: 'asc' };
            }
            $$('.pkg-table thead th.sortable').forEach(t => t.classList.remove('sort-asc', 'sort-desc'));
            th.classList.add('sort-' + currentSort.dir);

            const sorted = [...PACKAGES].sort((a, b) => {
                let va, vb;
                if (key === 'name') { va = a.name; vb = b.name; }
                else if (key === 'id') { va = a.id; vb = b.id; }
                else if (key === 'duration') { va = parseInt(a.duration); vb = parseInt(b.duration); }
                else if (key === 'price') { va = a.price; vb = b.price; }
                else if (key === 'updated') { va = a.updatedDate; vb = b.updatedDate; }
                if (typeof va === 'string') {
                    return currentSort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
                }
                return currentSort.dir === 'asc' ? va - vb : vb - va;
            });
            renderTable(sorted);
            renderMobileCards(sorted);
        });
    });

    /* ---------- Pagination ---------- */
    const pagination = $('.pkg-pagination-controls');
    if (pagination) {
        pagination.addEventListener('click', (e) => {
            const btn = e.target.closest('.pkg-page-btn');
            if (!btn || btn.disabled) return;
            $$('.pkg-page-btn', pagination).forEach(b => {
                if (!isNaN(parseInt(b.dataset.page))) b.classList.remove('active');
            });
            if (!isNaN(parseInt(btn.dataset.page))) btn.classList.add('active');
            showToast('info', 'Page Changed', 'Loading packages for selected page...');
        });
    }

    /* ---------- View Toggle ---------- */
    $$('.pkg-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.pkg-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showToast('info', 'View Changed', `Switched to ${btn.dataset.view} view.`);
        });
    });

    /* ---------- Page Actions ---------- */
    const addPackageBtn = $('#addPackageBtn');
    if (addPackageBtn) addPackageBtn.addEventListener('click', () => {
        showToast('info', 'Add Package', 'Opening package creation form...');
    });
    const exportBtn = $('#exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        showToast('success', 'Export Started', 'Preparing package data for export...');
    });
    const emptyCreateBtn = $('#emptyCreateBtn');
    if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', () => {
        showToast('info', 'Create Package', 'Opening package creation form...');
    });

    /* ---------- Reveal Animation ---------- */
    function initReveal() {
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((e, idx) => {
                    if (e.isIntersecting) {
                        setTimeout(() => e.target.classList.add('in'), idx * 80);
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.05 });
            $$('.pkg-content .reveal').forEach(el => io.observe(el));
        } else {
            $$('.pkg-content .reveal').forEach(el => el.classList.add('in'));
        }
    }

    /* ---------- Toggle buttons (Featured) ---------- */
    $$('.pkg-toggle-group').forEach(group => {
        group.addEventListener('click', (e) => {
            const btn = e.target.closest('.pkg-toggle-btn');
            if (!btn) return;
            $$('.pkg-toggle-btn', group).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

})();