// ========================================
// Package - List Page Logic
// ========================================
(function () {
    'use strict';

    const RAW_DATA = window.INVOICE_CONFIG.load();
    function persist() { window.INVOICE_CONFIG.save(RAW_DATA); }

    const state = {
        entriesPerPage: 10,
        currentPage: 1,
        searchTerm: '',
        sortCol: null,
        sortDir: 'asc',
        filters: { salesType: '', branch: '', payStatus: '', dateFrom: '', dateTo: '' },
    };

    // ---------- Utilities ----------
    function formatCurrency(v) {
        return '৳ ' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function formatDate(d) {
        if (!d) return '-';
        const dt = new Date(d);
        return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }
    function showToast(title, msg, type = 'success') {
        const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
        const el = document.createElement('div');
        el.className = `toast-modern ${type}`;
        el.innerHTML = `<i class="bi ${icons[type]} toast-icon"></i>
            <div class="toast-content"><div class="toast-title">${escapeHtml(title)}</div><div class="toast-msg">${escapeHtml(msg)}</div></div>`;
        document.getElementById('toastContainer').appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => { el.classList.add('hiding'); setTimeout(() => el.remove(), 300); }, 3000);
    }
    function nextInvoiceNo() {
        const maxId = RAW_DATA.reduce((m, r) => Math.max(m, r.id), 0);
        return 'INV-' + String(maxId + 1).padStart(6, '0');
    }

    // ---------- KPI ----------
    function renderKPIs(data) {
        const now = new Date();
        const thisMonth = RAW_DATA.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const pendingApproval = RAW_DATA.filter(r => r.invoiceStatus === 'Draft').length;
        const paidCount = RAW_DATA.filter(r => r.paymentStatus === 'Paid').length;
        const totalDue = RAW_DATA.reduce((s, r) => s + Number(r.due || 0), 0);
        const totalSales = RAW_DATA.reduce((s, r) => s + Number(r.grandTotal || 0), 0);

        document.getElementById('kpiTotal').textContent = RAW_DATA.length;
        document.getElementById('kpiPending').textContent = pendingApproval;
        document.getElementById('kpiApproved').textContent = thisMonth;
        document.getElementById('kpiCompleted').textContent = paidCount;
        document.getElementById('kpiQty').textContent = formatCurrency(totalDue);
        document.getElementById('kpiTotalSales').textContent = formatCurrency(totalSales);
    }

    // ---------- Filter + Search + Sort pipeline ----------
    function getFilteredData() {
        let rows = [...RAW_DATA];
        const f = state.filters;

        if (f.salesType) rows = rows.filter(r => r.salesType === f.salesType);
        if (f.branch) rows = rows.filter(r => r.branch === f.branch);
        if (f.payStatus) rows = rows.filter(r => r.paymentStatus === f.payStatus);
        if (f.dateFrom) rows = rows.filter(r => r.date >= f.dateFrom);
        if (f.dateTo) rows = rows.filter(r => r.date <= f.dateTo);

        if (state.searchTerm) {
            const q = state.searchTerm.toLowerCase();
            rows = rows.filter(r =>
                r.invoiceNo.toLowerCase().includes(q) ||
                r.customer.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q) ||
                r.branch.toLowerCase().includes(q) ||
                r.items.some(it => it.product.toLowerCase().includes(q))
            );
        }

        if (state.sortCol) {
            const map = { no: 'invoiceNo', customer: 'customer', paid: 'paid', due: 'due' };
            const key = map[state.sortCol];
            rows.sort((a, b) => {
                let av = a[key], bv = b[key];
                if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
                if (av < bv) return state.sortDir === 'asc' ? -1 : 1;
                if (av > bv) return state.sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return rows;
    }

    // ---------- Table Render ----------
    const PAY_BADGE = { Paid: 'status-created', Partial: 'status-pending', Due: 'status-rejected' };
    const INV_BADGE = { Confirmed: 'status-approved', Draft: 'status-pending', Cancelled: 'status-rejected' };
    const TYPE_CLASS = { Retail: 'type-local', Wholesale: 'type-import', Corporate: 'type-transfer' };

    function renderTable() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('active');

        const all = getFilteredData();
        const total = all.length;
        const perPage = state.entriesPerPage;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        const start = (state.currentPage - 1) * perPage;
        const pageRows = all.slice(start, start + perPage);

        const tbody = document.getElementById('reqTableBody');

        if (pageRows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h4>No invoices found</h4>
                    <p>Try adjusting your filters or search term.</p>
                </div></td></tr>`;
        } else {
            tbody.innerHTML = pageRows.map((r, i) => `
                <tr>
                    <td class="text-center" data-label="#"><span class="req-row-num">${start + i + 1}</span></td>
                    <td data-label="Invoice No"><span class="req-no" onclick="InvoiceList.view(${r.id})">${escapeHtml(r.invoiceNo)}</span></td>
                    <td data-label="Customer"><span class="req-wing">${escapeHtml(r.customer)}</span></td>
                    <td data-label="Phone" class="req-place">${escapeHtml(r.phone)}</td>
                    <td data-label="Sales Type"><span class="req-type ${TYPE_CLASS[r.salesType] || ''}">${escapeHtml(r.salesType)}</span></td>
                    <td class="text-center" data-label="Grand Total"><span class="req-qty">${formatCurrency(r.grandTotal)}</span></td>
                    <td class="text-end" data-label="Paid">${formatCurrency(r.paid)}</td>
                    <td class="text-center" data-label="Due"><span class="${r.due > 0 ? 'text-danger fw-bold' : ''}">${formatCurrency(r.due)}</span></td>
                    <td data-label="Pay. Status"><span class="status-badge ${PAY_BADGE[r.paymentStatus] || ''}">${escapeHtml(r.paymentStatus)}</span></td>
                    <td class="text-center" data-label="Inv. Status"><span class="status-badge ${INV_BADGE[r.invoiceStatus] || ''}">${escapeHtml(r.invoiceStatus)}</span></td>
                    <td class="text-center" data-label="Action">
                        <div class="action-btns">
                            <button class="action-btn view" title="View" onclick="InvoiceList.view(${r.id})"><i class="bi bi-eye"></i></button>
                            <button class="action-btn doc" title="Record Payment" onclick="InvoiceList.openPayment(${r.id})" ${r.due <= 0 ? 'disabled' : ''}><i class="bi bi-cash-coin"></i></button>
                            <button class="action-btn edit" title="Edit" onclick="InvoiceList.edit(${r.id})"><i class="bi bi-pencil"></i></button>
                            <button class="action-btn delete" title="Delete" onclick="InvoiceList.confirmDelete(${r.id})"><i class="bi bi-trash"></i></button>
                        </div>
                    </td>
                </tr>`).join('');
        }

        document.getElementById('tableInfo').textContent =
            total === 0 ? 'No entries found' : `Showing ${start + 1} to ${Math.min(start + perPage, total)} of ${total} entries`;

        renderPagination(totalPages);
        renderKPIs();
        setTimeout(() => overlay.classList.remove('active'), 150);
    }

    function renderPagination(totalPages) {
        const el = document.getElementById('pagination');
        let html = `<button class="page-btn" ${state.currentPage === 1 ? 'disabled' : ''} data-page="prev"><i class="bi bi-chevron-left"></i></button>`;
        for (let p = 1; p <= totalPages; p++) {
            html += `<button class="page-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }
        html += `<button class="page-btn" ${state.currentPage === totalPages ? 'disabled' : ''} data-page="next"><i class="bi bi-chevron-right"></i></button>`;
        el.innerHTML = html;
        el.querySelectorAll('.page-btn').forEach(btn => btn.addEventListener('click', () => {
            const p = btn.dataset.page;
            if (p === 'prev') state.currentPage--;
            else if (p === 'next') state.currentPage++;
            else state.currentPage = Number(p);
            renderTable();
        }));
    }

    // ---------- Active Filter Chips ----------
    function renderActiveChips() {
        const f = state.filters;
        const labels = [];
        if (f.salesType) labels.push(['salesType', 'Sales Type: ' + f.salesType]);
        if (f.branch) labels.push(['branch', 'Branch: ' + f.branch]);
        if (f.payStatus) labels.push(['payStatus', 'Status: ' + f.payStatus]);
        if (f.dateFrom) labels.push(['dateFrom', 'From: ' + f.dateFrom]);
        if (f.dateTo) labels.push(['dateTo', 'To: ' + f.dateTo]);

        const wrap = document.getElementById('activeFilters');
        const chips = document.getElementById('filterChips');
        if (labels.length === 0) { wrap.classList.remove('show'); chips.innerHTML = ''; return; }

        wrap.classList.add('show');
        chips.innerHTML = labels.map(([key, text]) =>
            `<span class="filter-chip" data-key="${key}">${escapeHtml(text)} <span class="filter-chip-remove"><i class="bi bi-x"></i></span></span>`
        ).join('');
        chips.querySelectorAll('.filter-chip').forEach(chip => chip.addEventListener('click', () => {
            const key = chip.dataset.key;
            state.filters[key] = '';
            syncFilterInputs();
            state.currentPage = 1;
            renderActiveChips();
            renderTable();
        }));
    }

    function syncFilterInputs() {
        document.getElementById('filterWing').value = state.filters.salesType;
        document.getElementById('filterWarehouse').value = state.filters.branch;
        document.getElementById('filterType').value = state.filters.payStatus;
        document.getElementById('filterDateFrom').value = state.filters.dateFrom;
        document.getElementById('filterDateTo').value = state.filters.dateTo;
    }

    // ---------- Invoice Items (offcanvas form) ----------
    const PRODUCTS = ['ST Tyre 12R22.5', 'ST Tyre 11R22.5', 'ST Tyre 10R', 'ST Tyre 9R', 'Tube 12R', 'Tube 11R'];
    let itemRowCount = 0;

    function addItemRow(item) {
        itemRowCount++;
        const rowId = 'itemRow' + itemRowCount;
        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.innerHTML = `
            <td><input type="text" class="form-control-sm item-product" list="productList" value="${escapeHtml(item?.product || '')}" placeholder="Product name"></td>
            <td><input type="number" class="form-control-sm item-qty" min="1" value="${item?.qty ?? 1}"></td>
            <td><select class="form-select-sm item-unit"><option ${item?.unit === 'Pcs' || !item ? 'selected' : ''}>Pcs</option><option ${item?.unit === 'Set' ? 'selected' : ''}>Set</option><option ${item?.unit === 'Box' ? 'selected' : ''}>Box</option></select></td>
            <td><input type="number" class="form-control-sm item-price" min="0" step="0.01" value="${item?.unitPrice ?? 0}"></td>
            <td><input type="number" class="form-control-sm item-discount" min="0" step="0.01" value="${item?.discount ?? 0}"></td>
            <td><input type="number" class="form-control-sm item-vat" min="0" step="0.01" value="${item?.vat ?? 15}"></td>
            <td class="item-total fw-semibold">৳ 0.00</td>
            <td><button type="button" class="action-btn delete" onclick="document.getElementById('${rowId}').remove(); InvoiceList.recalcSummary();"><i class="bi bi-x"></i></button></td>`;
        document.getElementById('itemsBody').appendChild(tr);
        tr.querySelectorAll('input, select').forEach(inp => inp.addEventListener('input', recalcSummary));
        recalcSummary();
    }

    function recalcSummary() {
        let subtotal = 0, discountTotal = 0, vatTotal = 0;
        document.querySelectorAll('#itemsBody tr').forEach(tr => {
            const qty = Number(tr.querySelector('.item-qty').value) || 0;
            const price = Number(tr.querySelector('.item-price').value) || 0;
            const disc = Number(tr.querySelector('.item-discount').value) || 0;
            const vatPct = Number(tr.querySelector('.item-vat').value) || 0;
            const lineBase = qty * price - disc;
            const lineVat = lineBase * (vatPct / 100);
            const lineTotal = lineBase + lineVat;
            tr.querySelector('.item-total').textContent = formatCurrency(lineTotal);
            subtotal += qty * price;
            discountTotal += disc;
            vatTotal += lineVat;
        });
        const shipping = Number(document.getElementById('invShipping').value) || 0;
        const grandTotal = subtotal - discountTotal + vatTotal + shipping;
        const paid = Number(document.getElementById('invPaid').value) || 0;
        const due = Math.max(0, grandTotal - paid);

        document.getElementById('sumSubtotal').textContent = formatCurrency(subtotal);
        document.getElementById('sumDiscount').textContent = '- ' + formatCurrency(discountTotal);
        document.getElementById('sumVat').textContent = formatCurrency(vatTotal);
        document.getElementById('sumGrandTotal').textContent = formatCurrency(grandTotal);
        document.getElementById('sumPaid').textContent = formatCurrency(paid);
        document.getElementById('sumDue').textContent = formatCurrency(due);
    }

    function resetInvoiceForm() {
        document.getElementById('invoiceForm').reset();
        document.getElementById('editInvoiceId').value = '';
        document.getElementById('invNo').value = nextInvoiceNo();
        document.getElementById('invDate').value = new Date().toISOString().slice(0, 10);
        document.getElementById('itemsBody').innerHTML = '';
        document.getElementById('offcanvasTitle').textContent = 'Create Sales Invoice';
        document.getElementById('offcanvasSubtitle').textContent = 'Create a new customer sales invoice';
        addItemRow();
    }

    function collectInvoiceForm() {
        const items = [...document.querySelectorAll('#itemsBody tr')].map(tr => {
            const qty = Number(tr.querySelector('.item-qty').value) || 0;
            const unitPrice = Number(tr.querySelector('.item-price').value) || 0;
            const discount = Number(tr.querySelector('.item-discount').value) || 0;
            const vat = Number(tr.querySelector('.item-vat').value) || 0;
            const total = (qty * unitPrice - discount) * (1 + vat / 100);
            return { product: tr.querySelector('.item-product').value, qty, unit: tr.querySelector('.item-unit').value, unitPrice, discount, vat, total };
        });
        const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
        const discount = items.reduce((s, it) => s + it.discount, 0);
        const vat = items.reduce((s, it) => s + (it.qty * it.unitPrice - it.discount) * (it.vat / 100), 0);
        const shipping = Number(document.getElementById('invShipping').value) || 0;
        const grandTotal = subtotal - discount + vat + shipping;
        const paid = Number(document.getElementById('invPaid').value) || 0;
        const due = Math.max(0, grandTotal - paid);
        const paymentStatus = due <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Due');

        return {
            invoiceNo: document.getElementById('invNo').value,
            date: document.getElementById('invDate').value,
            dueDate: document.getElementById('invDueDate').value,
            customer: document.getElementById('invCustomer').value,
            phone: document.getElementById('invPhone').value,
            address: document.getElementById('invAddress').value,
            branch: document.getElementById('invBranch').value,
            salesType: document.getElementById('invSalesType').value,
            subtotal, discount, vat, shipping, grandTotal, paid, due, paymentStatus,
            items, notes: document.getElementById('invNotes').value,
        };
    }

    function saveInvoice(asDraft) {
        const editId = document.getElementById('editInvoiceId').value;
        const data = collectInvoiceForm();
        data.invoiceStatus = asDraft ? 'Draft' : 'Confirmed';

        if (!data.customer || !data.invDate) { /* basic guard */ }
        if (!document.getElementById('invoiceForm').reportValidity()) return;

        if (editId) {
            const idx = RAW_DATA.findIndex(r => r.id === Number(editId));
            RAW_DATA[idx] = { ...RAW_DATA[idx], ...data };
            showToast('Updated', `${data.invoiceNo} updated successfully.`);
        } else {
            const maxId = RAW_DATA.reduce((m, r) => Math.max(m, r.id), 0);
            RAW_DATA.unshift({ id: maxId + 1, ...data });
            showToast('Created', `${data.invoiceNo} created successfully.`);
        }
        persist();
        bootstrap.Modal.getInstance(document.getElementById('invoiceEditModal'))?.hide();
        state.currentPage = 1;
        renderTable();
    }

    // ---------- View / Edit / Payment / Delete ----------
    let activeDeleteId = null, activePaymentId = null;

    function view(id) {
        const r = RAW_DATA.find(x => x.id === id);
        if (!r) return;
        document.getElementById('viewInvNo').textContent = r.invoiceNo;
        const badge = document.getElementById('viewStatusBadge');
        badge.textContent = r.paymentStatus;
        badge.className = 'inv-status-badge inv-status-' + r.paymentStatus.toLowerCase();
        document.getElementById('viewInvDate').textContent = formatDate(r.date);
        document.getElementById('viewInvDue').textContent = formatDate(r.dueDate);
        document.getElementById('viewCustomer').textContent = r.customer;
        document.getElementById('viewAddress').innerHTML = escapeHtml(r.address);
        document.getElementById('viewPhone').textContent = r.phone;
        document.getElementById('viewItemsBody').innerHTML = r.items.map((it, i) => `
            <tr><td>${i + 1}</td><td>${escapeHtml(it.product)}</td><td class="text-center">${it.qty} ${escapeHtml(it.unit)}</td>
            <td class="text-end">${formatCurrency(it.unitPrice)}</td><td class="text-end">${formatCurrency(it.discount)}</td>
            <td class="text-end">${it.vat}%</td><td class="text-end">${formatCurrency(it.total)}</td></tr>`).join('');
        document.getElementById('viewSubtotal').textContent = formatCurrency(r.subtotal);
        document.getElementById('viewDiscount').textContent = '- ' + formatCurrency(r.discount);
        document.getElementById('viewVat').textContent = formatCurrency(r.vat);
        document.getElementById('viewShipping').textContent = formatCurrency(r.shipping);
        document.getElementById('viewGrandTotal').textContent = formatCurrency(r.grandTotal);
        document.getElementById('viewNotes').textContent = r.notes || 'Thank you for your business.';
        new bootstrap.Modal(document.getElementById('viewInvoiceModal')).show();
    }

    function edit(id) {
        const r = RAW_DATA.find(x => x.id === id);
        if (!r) return;
        document.getElementById('editInvoiceId').value = r.id;
        document.getElementById('invNo').value = r.invoiceNo;
        document.getElementById('invDate').value = r.date;
        document.getElementById('invDueDate').value = r.dueDate;
        document.getElementById('invBranch').value = r.branch;
        document.getElementById('invSalesType').value = r.salesType;
        document.getElementById('invCustomer').value = r.customer;
        document.getElementById('invPhone').value = r.phone;
        document.getElementById('invAddress').value = r.address;
        document.getElementById('invShipping').value = r.shipping;
        document.getElementById('invPaid').value = r.paid;
        document.getElementById('invNotes').value = r.notes;
        document.getElementById('itemsBody').innerHTML = '';
        r.items.forEach(addItemRow);
        document.getElementById('offcanvasTitle').textContent = 'Edit Sales Invoice';
        document.getElementById('offcanvasSubtitle').textContent = `Editing ${r.invoiceNo}`;
        new bootstrap.Modal(document.getElementById('invoiceEditModal')).show();
    }

    function openPayment(id) {
        const r = RAW_DATA.find(x => x.id === id);
        if (!r) return;
        activePaymentId = id;
        document.getElementById('payInvoiceId').value = id;
        document.getElementById('payInvNo').textContent = r.invoiceNo;
        document.getElementById('payCustomer').textContent = r.customer;
        document.getElementById('payDue').textContent = formatCurrency(r.due);
        document.getElementById('payAmount').value = '';
        document.getElementById('payAmount').max = r.due;
        document.getElementById('payDate').value = new Date().toISOString().slice(0, 10);
        new bootstrap.Modal(document.getElementById('paymentModal')).show();
    }

    function submitPayment() {
        const r = RAW_DATA.find(x => x.id === activePaymentId);
        if (!r) return;
        const amount = Number(document.getElementById('payAmount').value);
        if (!amount || amount <= 0 || amount > r.due) { showToast('Invalid amount', 'Enter a valid payment amount.', 'error'); return; }
        r.paid += amount;
        r.due -= amount;
        r.paymentStatus = r.due <= 0 ? 'Paid' : 'Partial';
        persist();
        bootstrap.Modal.getInstance(document.getElementById('paymentModal'))?.hide();
        showToast('Payment Recorded', `${formatCurrency(amount)} recorded for ${r.invoiceNo}.`);
        renderTable();
    }

    function confirmDelete(id) {
        const r = RAW_DATA.find(x => x.id === id);
        if (!r) return;
        activeDeleteId = id;
        document.getElementById('deleteInvNo').textContent = r.invoiceNo;
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    }

    function doDelete() {
        const idx = RAW_DATA.findIndex(x => x.id === activeDeleteId);
        if (idx > -1) {
            const inv = RAW_DATA[idx].invoiceNo;
            RAW_DATA.splice(idx, 1);
            persist();
            showToast('Deleted', `${inv} has been deleted.`, 'warning');
        }
        bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
        renderTable();
    }

    // ---------- Export / Print ----------
    function exportCSV() {
        const rows = getFilteredData();
        const header = ['Invoice No', 'Date', 'Customer', 'Phone', 'Sales Type', 'Grand Total', 'Paid', 'Due', 'Payment Status', 'Invoice Status'];
        const csv = [header.join(',')].concat(rows.map(r =>
            [r.invoiceNo, r.date, `"${r.customer}"`, r.phone, r.salesType, r.grandTotal, r.paid, r.due, r.paymentStatus, r.invoiceStatus].join(',')
        )).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales-invoices-${Date.now()}.csv`;
        link.click();
        showToast('Exported', 'Invoice list exported to CSV.');
    }

    // ---------- Init & Events ----------
    function init() {
        document.getElementById('entryCount').addEventListener('change', e => {
            state.entriesPerPage = Number(e.target.value); state.currentPage = 1; renderTable();
        });
        let searchTimer;
        document.getElementById('tableSearch').addEventListener('input', e => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => { state.searchTerm = e.target.value.trim(); state.currentPage = 1; renderTable(); }, 250);
        });
        document.querySelectorAll('.req-table th.sortable').forEach(th => th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            else { state.sortCol = col; state.sortDir = 'asc'; }
            document.querySelectorAll('.req-table th.sortable i').forEach(ic => ic.className = 'bi bi-chevron-expand');
            th.querySelector('i').className = state.sortDir === 'asc' ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
            renderTable();
        }));
        document.getElementById('applyFilter').addEventListener('click', () => {
            state.filters.salesType = document.getElementById('filterWing').value;
            state.filters.branch = document.getElementById('filterWarehouse').value;
            state.filters.payStatus = document.getElementById('filterType').value;
            state.filters.dateFrom = document.getElementById('filterDateFrom').value;
            state.filters.dateTo = document.getElementById('filterDateTo').value;
            state.currentPage = 1;
            renderActiveChips();
            renderTable();
        });
        document.getElementById('resetFilter').addEventListener('click', () => {
            state.filters = { salesType: '', branch: '', payStatus: '', dateFrom: '', dateTo: '' };
            syncFilterInputs(); state.currentPage = 1; renderActiveChips(); renderTable();
        });
        document.getElementById('clearAllFilters').addEventListener('click', () => document.getElementById('resetFilter').click());
        document.getElementById('btnAddItem').addEventListener('click', () => addItemRow());
        document.getElementById('invShipping').addEventListener('input', recalcSummary);
        document.getElementById('invPaid').addEventListener('input', recalcSummary);
        document.getElementById('btnSaveInvoice').addEventListener('click', () => saveInvoice(false));
        document.getElementById('btnSaveDraft').addEventListener('click', () => saveInvoice(true));
        document.getElementById('btnSubmitPayment').addEventListener('click', submitPayment);
        document.getElementById('confirmDeleteBtn').addEventListener('click', doDelete);
        document.getElementById('btnPrintInvoice').addEventListener('click', () => window.print());
        document.getElementById('printList').addEventListener('click', () => window.print());
        document.getElementById('exportExcel').addEventListener('click', exportCSV);

        renderTable();
    }

    document.addEventListener('DOMContentLoaded', init);

    // expose for inline onclick handlers
    window.InvoiceList = { view, edit, openPayment, confirmDelete, recalcSummary };
})();