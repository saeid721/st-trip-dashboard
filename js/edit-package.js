/* =========================================================
ST TRIP ADMIN — EDIT PACKAGE MODULE
Shares component patterns with add-package.js
========================================================= */
(() => {
    'use strict';
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- State ---------- */
    let hasUnsavedChanges = false;
    let originalFormData = '';
    const autosaveEl = $('#autosaveIndicator');
    const unsavedBar = $('#unsavedBar');

    function captureFormState() {
        const inputs = $$('.form-input, .form-select, .form-textarea');
        return inputs.map(i => i.value).join('|');
    }
    originalFormData = captureFormState();

    function markDirty() {
        const current = captureFormState();
        if (current !== originalFormData) {
            if (!hasUnsavedChanges) {
                hasUnsavedChanges = true;
                unsavedBar.classList.add('show');
                autosaveEl.className = 'edit-pkg-autosave unsaved';
                autosaveEl.innerHTML = '<i class="bi bi-exclamation-circle"></i><span>Unsaved changes</span>';
            }
        } else {
            markClean();
        }
    }
    function markClean() {
        hasUnsavedChanges = false;
        unsavedBar.classList.remove('show');
        autosaveEl.className = 'edit-pkg-autosave';
        autosaveEl.innerHTML = '<i class="bi bi-cloud-check"></i><span>All changes saved</span>';
        originalFormData = captureFormState();
        updateSavedAgo();
    }

    $$('.form-input, .form-select, .form-textarea').forEach(el => {
        el.addEventListener('input', markDirty);
        el.addEventListener('change', markDirty);
    });

    /* ---------- Section Toggle ---------- */
    $$('.add-pkg-section-head').forEach(head => {
        head.addEventListener('click', () => head.closest('.add-pkg-section').classList.toggle('collapsed'));
    });

    /* ---------- Counters ---------- */
    function setupCounter(id, cId) {
        const inp = $(`#${id}`), c = $(`#${cId}`);
        if (!inp || !c) return;
        const u = () => { c.textContent = inp.value.length; };
        inp.addEventListener('input', u); u();
    }
    setupCounter('packageName', 'nameCounter');
    setupCounter('shortDesc', 'shortDescCounter');
    setupCounter('seoTitle', 'seoTitleCounter');
    setupCounter('metaDescription', 'metaDescCounter');

    /* ---------- Price Calc ---------- */
    const startP = $('#startingPrice'), disc = $('#discount'), discT = $('#discountType'), tx = $('#tax');
    function calcPrice() {
        let p = parseFloat(startP.value) || 0;
        const d = parseFloat(disc.value) || 0, t = parseFloat(tx.value) || 0;
        if (discT.value === 'percent') p -= p * (d / 100); else p -= d;
        p += t;
        const f = 'BDT ' + Math.round(p).toLocaleString('en-IN');
        $('#finalPriceValue').textContent = f;
        $('#cppAmount').textContent = f;
        $('#summaryPrice').textContent = f;
        markDirty();
    }
    [startP, disc, tx, discT].forEach(el => { if (el) { el.addEventListener('input', calcPrice); el.addEventListener('change', calcPrice); } });
    calcPrice();

    /* ---------- Live Summary ---------- */
    $('#packageName').addEventListener('input', e => {
        $('#summaryName').textContent = e.target.value || 'Package Name';
        $('#headerPkgName').textContent = e.target.value || 'Package Name';
    });
    $('#packageType').addEventListener('change', e => { $('#summaryType').textContent = e.target.options[e.target.selectedIndex].text; });
    $('#city').addEventListener('input', e => { $('#summaryDest').textContent = e.target.value || 'Destination'; });
    $('#duration').addEventListener('input', e => {
        const n = $('#nights').value;
        $('#summaryDuration').textContent = e.target.value ? `${e.target.value} days / ${n || '?'} nights` : 'Duration';
    });
    $('#status').addEventListener('change', e => {
        const s = e.target.value;
        const el = $('#summaryStatus');
        el.textContent = s.charAt(0).toUpperCase() + s.slice(1);
        el.className = `status-${s}`;
        updateHeaderBadge(s);
        updateStatusBtnLabel(s);
    });

    function updateHeaderBadge(s) {
        const b = $('#headerStatusBadge');
        b.className = `edit-pkg-status-badge ${s}`;
        b.innerHTML = `<span class="pip"></span>${s.charAt(0).toUpperCase() + s.slice(1)}`;
    }
    function updateStatusBtnLabel(s) {
        const lbl = $('#statusBtnLabel');
        if (s === 'published') lbl.textContent = 'Unpublish';
        else if (s === 'draft') lbl.textContent = 'Publish';
        else lbl.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    }

    /* ---------- Completion ---------- */
    function updateCompletion() {
        const fields = ['#packageName', '#packageType', '#country', '#city', '#departureCity', '#startingPrice', '#shortDesc', '#fullDesc'];
        let filled = fields.filter(f => $(f) && $(f).value.trim()).length;
        if ($('#currentCover').style.display !== 'none') filled++;
        const pct = Math.round((filled / (fields.length + 1)) * 100);
        $('#completionPercent').textContent = `${pct}%`;
        $('#completionFill').style.width = `${pct}%`;
    }
    $$('.form-input,.form-select,.form-textarea').forEach(el => { el.addEventListener('input', updateCompletion); el.addEventListener('change', updateCompletion); });
    updateCompletion();

    /* ---------- Saved Ago ---------- */
    function updateSavedAgo() {
        const el = $('#sectionSavedAgo');
        if (el) el.innerHTML = '<i class="bi bi-clock"></i> Last saved just now';
    }

    /* ---------- Toast ---------- */
    function showToast(type, title, message) {
        const icons = { success: 'bi-check-circle-fill', info: 'bi-info-circle-fill', warn: 'bi-exclamation-triangle-fill', error: 'bi-x-circle-fill' };
        const t = document.createElement('div');
        t.className = `toast-st ${type}`;
        t.innerHTML = `<div class="ic"><i class="bi ${icons[type]}"></i></div><div style="flex:1"><div class="t">${title}</div><div class="m">${message}</div></div><button style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;" aria-label="Close"><i class="bi bi-x"></i></button>`;
        $('#toastContainer').appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        const close = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 280); };
        t.querySelector('button').addEventListener('click', close);
        setTimeout(close, 4000);
    }

    /* ---------- Confirm Modal ---------- */
    const cModal = $('#confirmModal');
    let cCallback = null;
    function openConfirm(variant, icon, title, msg, onOk) {
        $('#confirmIcon').className = `add-pkg-modal-icon ${variant}`;
        $('#confirmIcon').innerHTML = `<i class="bi ${icon}"></i>`;
        $('#confirmTitle').textContent = title;
        $('#confirmMessage').textContent = msg;
        cCallback = onOk;
        cModal.classList.add('open');
        // swap confirm button style for danger
        const okBtn = $('#confirmOk');
        if (variant === 'danger') { okBtn.style.background = 'var(--st-red)'; okBtn.style.borderColor = 'var(--st-red)'; }
        else { okBtn.style.background = ''; okBtn.style.borderColor = ''; }
    }
    function closeConfirm() { cModal.classList.remove('open'); cCallback = null; }
    $('#confirmCancel').addEventListener('click', closeConfirm);
    $('#confirmOk').addEventListener('click', () => { if (cCallback) cCallback(); closeConfirm(); });
    cModal.addEventListener('click', e => { if (e.target === cModal || e.target.classList.contains('add-pkg-modal-overlay')) closeConfirm(); });

    /* ---------- Save ---------- */
    function doSave() {
        autosaveEl.className = 'edit-pkg-autosave saving';
        autosaveEl.innerHTML = '<i class="bi bi-cloud-arrow-up"></i><span>Saving…</span>';
        setTimeout(() => {
            markClean();
            showToast('success', 'Changes Saved', 'Package updated successfully.');
        }, 800);
    }
    $('#saveBtn').addEventListener('click', doSave);
    $('#unsavedSaveBtn').addEventListener('click', doSave);
    $('#bottomSave').addEventListener('click', doSave);
    $('#discardBtn').addEventListener('click', () => {
        openConfirm('warn', 'bi-arrow-counterclockwise', 'Discard Changes?', 'All unsaved changes will be lost.', () => {
            location.reload();
        });
    });

    /* ---------- Status Menu ---------- */
    const statusToggle = $('#statusToggleBtn');
    const statusMenu = $('#statusMenu');
    statusToggle.addEventListener('click', e => { e.stopPropagation(); statusMenu.classList.toggle('show'); });
    document.addEventListener('click', () => statusMenu.classList.remove('show'));
    $$('.edit-pkg-status-menu button').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            statusMenu.classList.remove('show');
            const s = btn.dataset.status;
            if (s === 'delete') {
                openConfirm('danger', 'bi-trash-fill', 'Delete this package?', 'This package will be permanently deleted and cannot be recovered.', () => {
                    showToast('success', 'Deleted', 'Package has been deleted.');
                    setTimeout(() => { window.location.href = 'packages.html'; }, 1200);
                });
                return;
            }
            if (s === 'archived' || s === 'expired') {
                openConfirm('warn', 'bi-exclamation-triangle-fill', `Change status to ${s}?`, `The package will be ${s}.`, () => {
                    $('#status').value = s;
                    $('#status').dispatchEvent(new Event('change'));
                    markDirty();
                    showToast('info', 'Status Changed', `Package is now ${s}.`);
                });
                return;
            }
            $('#status').value = s;
            $('#status').dispatchEvent(new Event('change'));
            markDirty();
            showToast('success', 'Status Updated', `Package is now ${s}.`);
        });
    });

    /* ---------- Duplicate ---------- */
    $('#duplicateBtn').addEventListener('click', () => showToast('success', 'Duplicated', 'Package copy created as draft.'));

    /* ---------- Preview ---------- */
    $('#previewBtn').addEventListener('click', () => showToast('info', 'Preview', 'Opening preview…'));
    $('#bottomPreview').addEventListener('click', () => showToast('info', 'Preview', 'Opening preview…'));

    /* ---------- Media Management ---------- */
    $('#replaceCoverBtn').addEventListener('click', () => {
        $('#currentCover').style.display = 'none';
        $('#coverUpload').style.display = '';
        markDirty();
    });
    $('#removeCoverBtn').addEventListener('click', () => {
        openConfirm('danger', 'bi-image', 'Remove Cover Image?', 'The primary cover image will be removed.', () => {
            $('#currentCover').style.display = 'none';
            $('#coverUpload').style.display = '';
            const sc = $('#summaryCover');
            sc.innerHTML = '<i class="bi bi-image"></i><span>No cover image</span>';
            markDirty();
            showToast('info', 'Removed', 'Cover image removed.');
        });
    });

    // Gallery delete buttons
    $$('.edit-pkg-gallery-item .edit-pkg-gallery-actions button:last-child').forEach(btn => {
        btn.addEventListener('click', () => {
            openConfirm('danger', 'bi-image', 'Delete Image?', 'This gallery image will be permanently removed.', () => {
                btn.closest('.edit-pkg-gallery-item').remove();
                markDirty();
                showToast('info', 'Removed', 'Image removed from gallery.');
            });
        });
    });

    // Gallery set primary
    $$('.edit-pkg-gallery-item .edit-pkg-gallery-actions button:first-child').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.edit-pkg-gallery-item').forEach(it => {
                it.classList.remove('primary');
                const badge = it.querySelector('.edit-pkg-gallery-badge');
                if (badge) badge.remove();
                it.querySelector('.edit-pkg-gallery-actions button:first-child').classList.remove('active');
                const starIcon = it.querySelector('.edit-pkg-gallery-actions button:first-child i');
                if (starIcon) { starIcon.className = 'fa-solid fa-star'; }
            });
            const item = btn.closest('.edit-pkg-gallery-item');
            item.classList.add('primary');
            btn.classList.add('active');
            btn.querySelector('i').className = 'fa-solid fa-star-fill';
            const b = document.createElement('span');
            b.className = 'edit-pkg-gallery-badge';
            b.textContent = 'Primary';
            item.prepend(b);
            markDirty();
            showToast('info', 'Primary Set', 'Gallery primary image updated.');
        });
    });

    $('#addGalleryBtn').addEventListener('click', () => $('#galleryInput').click());

    /* ---------- Drag & Reorder ---------- */
    function initDragReorder(containerSelector) {
        const container = $(containerSelector);
        if (!container) return;
        let dragEl = null;

        container.addEventListener('dragstart', e => {
            dragEl = e.target.closest('[draggable]');
            if (dragEl) { dragEl.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
        });
        container.addEventListener('dragend', () => {
            if (dragEl) dragEl.classList.remove('dragging');
            dragEl = null;
        });
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const after = getDragAfter(container, e.clientY);
            if (!dragEl) return;
            if (after == null) container.appendChild(dragEl);
            else container.insertBefore(dragEl, after);
            markDirty();
        });
    }
    function getDragAfter(container, y) {
        const els = [...container.querySelectorAll('[draggable]:not(.dragging)')];
        return els.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    initDragReorder('#highlightsList');
    initDragReorder('#includesList');
    initDragReorder('#excludesList');
    initDragReorder('#itineraryList');
    initDragReorder('#faqList');

    /* ---------- Dynamic List Items ---------- */
    function addListItem(containerId, placeholder, iconClass, cls) {
        const c = $(`#${containerId}`);
        const d = document.createElement('div');
        d.className = cls;
        d.draggable = true;
        d.innerHTML = `<i class="bi bi-grip-vertical drag-handle"></i><i class="bi ${iconClass}"></i><input type="text" placeholder="${placeholder}" /><button type="button"><i class="bi bi-x"></i></button>`;
        c.appendChild(d);
        d.querySelector('button').addEventListener('click', () => { d.remove(); markDirty(); });
        d.querySelector('input').addEventListener('input', markDirty);
        d.querySelector('input').focus();
        markDirty();
    }
    $('#addHighlightBtn').addEventListener('click', () => addListItem('highlightsList', 'New highlight', 'bi-check-circle', 'highlight-item'));
    $('#addIncludeBtn').addEventListener('click', () => addListItem('includesList', 'Included item', 'bi-check-circle', 'include-item'));
    $('#addExcludeBtn').addEventListener('click', () => addListItem('excludesList', 'Excluded item', 'bi-x-circle', 'exclude-item'));

    // Bind existing delete buttons
    $$('.highlight-item button, .include-item button, .exclude-item button').forEach(b => {
        b.addEventListener('click', () => { b.closest('[draggable]').remove(); markDirty(); });
    });

    /* ---------- Destination Chips ---------- */
    $('#addDestinationBtn').addEventListener('click', () => {
        const v = $('#city').value.trim();
        if (!v) return;
        const c = document.createElement('div');
        c.className = 'destination-chip';
        c.innerHTML = `<i class="bi bi-geo-alt"></i><span>${v}</span><button type="button"><i class="bi bi-x"></i></button>`;
        $('#destinationChips').appendChild(c);
        c.querySelector('button').addEventListener('click', () => { c.remove(); markDirty(); });
        $('#city').value = '';
        markDirty();
    });
    $$('.destination-chip button').forEach(b => b.addEventListener('click', () => { b.closest('.destination-chip').remove(); markDirty(); }));

    /* ---------- Itinerary Builder ---------- */
    const itineraryData = [
        { num: 1, title: 'Departure from Dhaka', location: 'Dhaka, Bangladesh', desc: 'Board flight BG-071 from Hazrat Shahjalal International Airport.' },
        { num: 2, title: 'Arrival in Jeddah & Transfer', location: 'Jeddah, Saudi Arabia', desc: 'Arrive at King Abdulaziz Airport. Private transfer to Makkah hotel. Check-in at Pullman Zamzam.' },
        { num: 3, title: 'Umrah & Ziyarah', location: 'Makkah', desc: 'Perform Umrah. Guided Ziyarah to historical sites including Jabal Al-Nour and Cave Hira.' },
        { num: 4, title: 'Travel to Madinah', location: 'Madinah', desc: 'High-speed train to Madinah. Check-in at Oberoi Madinah. Visit Masjid An-Nabawi.' }
    ];

    function addItineraryDay(data) {
        const list = $('#itineraryList');
        const count = $$('.itinerary-day', list).length + 1;
        const d = document.createElement('div');
        d.className = 'itinerary-day';
        d.draggable = true;
        d.innerHTML = `
    <div class="itinerary-day-head">
      <div class="itinerary-day-title">
        <i class="bi bi-grip-vertical drag-handle" style="font-size:14px;color:var(--text-muted);margin-right:4px;"></i>
        <div class="itinerary-day-num">${data?.num || count}</div>
        <div class="itinerary-day-name">${data?.title || `Day ${count}`}</div>
      </div>
      <div class="itinerary-day-actions">
        <button type="button" class="dup" title="Duplicate"><i class="bi bi-copy"></i></button>
        <button type="button" class="delete" title="Delete"><i class="bi bi-trash"></i></button>
      </div>
    </div>
    <div class="itinerary-day-body">
      <div class="form-row"><div class="form-group"><label>Day Title</label><input type="text" class="form-input" value="${data?.title || ''}" placeholder="e.g., Arrival & Check-in" /></div></div>
      <div class="form-row form-row-2">
        <div class="form-group"><label>Location</label><input type="text" class="form-input" value="${data?.location || ''}" placeholder="e.g., Makkah" /></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" /></div>
      </div>
      <div class="form-row"><div class="form-group"><label>Description</label><textarea class="form-textarea" rows="3" placeholder="Activities...">${data?.desc || ''}</textarea></div></div>
    </div>`;
        list.appendChild(d);

        d.querySelector('.itinerary-day-head').addEventListener('click', e => {
            if (e.target.closest('button') || e.target.closest('.drag-handle')) return;
            d.classList.toggle('open');
        });
        d.querySelector('.dup').addEventListener('click', () => { addItineraryDay({ title: data?.title + ' (copy)', location: data?.location, desc: data?.desc }); renumberDays(); });
        d.querySelector('.delete').addEventListener('click', () => {
            openConfirm('danger', 'bi-trash-fill', 'Delete Day?', 'This day will be removed from the itinerary.', () => {
                d.remove(); renumberDays(); markDirty();
            });
        });
        d.querySelectorAll('.form-input,.form-textarea').forEach(el => el.addEventListener('input', markDirty));
    }

    function renumberDays() {
        $$('.itinerary-day').forEach((d, i) => {
            d.querySelector('.itinerary-day-num').textContent = i + 1;
            const nameEl = d.querySelector('.itinerary-day-name');
            if (!d.querySelector('.form-input').value) nameEl.textContent = `Day ${i + 1}`;
        });
    }

    itineraryData.forEach(d => addItineraryDay(d));
    // Open first day
    $$('.itinerary-day')[0]?.classList.add('open');

    $('#addDayBtn').addEventListener('click', () => { addItineraryDay(); markDirty(); });

    /* ---------- FAQ Builder ---------- */
    const faqData = [
        { q: 'What documents are required for Umrah?', a: 'Valid passport (6+ months), visa, vaccination certificate, and passport-size photos.' },
        { q: 'Is travel insurance included?', a: 'No, travel insurance is not included but can be purchased separately.' }
    ];

    function addFaq(data) {
        const list = $('#faqList');
        const d = document.createElement('div');
        d.className = 'faq-item';
        d.draggable = true;
        d.innerHTML = `
    <div class="faq-item-head">
      <i class="bi bi-grip-vertical drag-handle"></i>
      <button type="button"><i class="bi bi-trash"></i></button>
    </div>
    <div class="form-row"><div class="form-group"><label>Question</label><input type="text" class="form-input" value="${data?.q || ''}" placeholder="Enter question..." /></div></div>
    <div class="form-row"><div class="form-group"><label>Answer</label><textarea class="form-textarea" rows="3" placeholder="Enter answer...">${data?.a || ''}</textarea></div></div>`;
        list.appendChild(d);
        d.querySelector('.faq-item-head button').addEventListener('click', () => { d.remove(); markDirty(); });
        d.querySelectorAll('.form-input,.form-textarea').forEach(el => el.addEventListener('input', markDirty));
    }
    faqData.forEach(d => addFaq(d));
    $('#addFaqBtn').addEventListener('click', () => { addFaq(); markDirty(); });

    /* ---------- SEO Preview ---------- */
    $('#seoTitle').addEventListener('input', e => { $('#seoPreviewTitle').textContent = e.target.value || 'Package Title'; });
    $('#urlSlug').addEventListener('input', e => { $('#seoPreviewSlug').textContent = e.target.value || 'package-slug'; });
    $('#metaDescription').addEventListener('input', e => { $('#seoPreviewDesc').textContent = e.target.value || 'Description…'; });

    /* ---------- Price History Toggle ---------- */
    const phToggle = $('#priceHistoryToggle');
    const phPanel = $('#priceHistoryPanel');
    phToggle.addEventListener('click', () => {
        phToggle.classList.toggle('open');
        phPanel.classList.toggle('open');
    });

    /* ---------- Unsaved Changes: Leave Warning ---------- */
    const leaveModal = $('#leaveModal');
    window.addEventListener('beforeunload', e => {
        if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    });

    // Intercept internal navigation
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link || link.getAttribute('href').startsWith('#') || link.getAttribute('href') === '') return;
        if (hasUnsavedChanges) {
            e.preventDefault();
            leaveModal.classList.add('open');
            $('#leaveConfirm').onclick = () => {
                hasUnsavedChanges = false;
                leaveModal.classList.remove('open');
                window.location.href = link.getAttribute('href');
            };
        }
    });
    $('#leaveCancel').addEventListener('click', () => leaveModal.classList.remove('open'));
    leaveModal.addEventListener('click', e => { if (e.target === leaveModal || e.target.classList.contains('add-pkg-modal-overlay')) leaveModal.classList.remove('open'); });

    /* ---------- Reveal ---------- */
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), i * 60); io.unobserve(e.target); } });
        }, { threshold: 0.05 });
        $$('.add-pkg-content .reveal').forEach(el => io.observe(el));
    } else {
        $$('.add-pkg-content .reveal').forEach(el => el.classList.add('in'));
    }

})();