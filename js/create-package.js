// ========================================
// Create Package - Dummy data
// ========================================
(function () {
    'use strict';

    // ==========================================
    // MOCK DATA & CONFIG
    // ==========================================
    const MOCK_CUSTOMERS = [
        { id: 'CUS-00125', name: 'ABC Tyres Ltd.', phone: '01712345678', type: 'Corporate', address: '123 Business Park, Dhaka', shipAddress: 'Same as billing', prevDue: 35500, creditLimit: 100000 },
        { id: 'CUS-00126', name: 'XYZ Motors', phone: '01812345678', type: 'Wholesale', address: '456 Road, Chattogram', shipAddress: '456 Road, Chattogram', prevDue: 0, creditLimit: 500000 },
        { id: 'CUS-00127', name: 'Rahim Enterprise', phone: '01912345678', type: 'Retail', address: '789 Street, Sylhet', shipAddress: '789 Street, Sylhet', prevDue: 12000, creditLimit: 50000 }
    ];

    const MOCK_PRODUCTS = [
        { sku: 'TYR-00125', name: 'Michelin 265/65 R17', barcode: '8945001234567', stock: 24, unit: 'Pcs', price: 18500, vat: 15, details: 'Brand: Michelin | Size: 265/65 R17 | DOT: 3426' },
        { sku: 'TYR-00126', name: 'Bridgestone 215/60 R16', barcode: '8945001234568', stock: 4, unit: 'Pcs', price: 14500, vat: 15, details: 'Brand: Bridgestone | Size: 215/60 R16 | DOT: 4125' },
        { sku: 'TYR-00127', name: 'Pirelli 225/45 R18', barcode: '8945001234569', stock: 0, unit: 'Pcs', price: 22000, vat: 15, details: 'Brand: Pirelli | Size: 225/45 R18' },
        { sku: 'TUB-00012', name: 'Tube 12R', barcode: '8945001234570', stock: 150, unit: 'Pcs', price: 1500, vat: 15, details: 'Heavy Duty Butyl Tube' },
        { sku: 'TUB-00011', name: 'Tube 11R', barcode: '8945001234571', stock: 85, unit: 'Pcs', price: 1400, vat: 15, details: 'Standard Butyl Tube' }
    ];

    let selectedCustomer = null;
    let invoiceItems = [];
    let itemToDelete = null;


    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function formatCurrency(v) {
        return '৳' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[s]));
    }

    function nextInvoiceNo() {
        return 'INV-' + String(Math.floor(Math.random() * 900000) + 100000).padStart(6, '0');
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast-modern show toast-${type}`;
        toast.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle-fill text-success' : 'exclamation-triangle-fill text-danger'}"></i>
            <div class="toast-body">${message}</div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // CUSTOMER SEARCH
    // ==========================================
    const custSearch = document.getElementById('custSearch');
    const custDropdown = document.getElementById('custDropdown');
    const custDetails = document.getElementById('custDetails');

    custSearch.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        if (!query) {
            custDropdown.classList.remove('show');
            return;
        }

        const results = MOCK_CUSTOMERS.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.phone.includes(query) ||
            c.id.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            custDropdown.innerHTML = '<div class="page-search-item text-center text-muted">No customers found</div>';
        } else {
            custDropdown.innerHTML = results.map(c => `
                <div class="page-search-item" data-id="${c.id}">
                    <div class="page-cust-row page-cust-row-name">
                        <div class="page-search-item-title">${c.name}</div>
                        <span class="page-cust-phone-inline"><i class="bi bi-telephone"></i> ${c.phone}</span>
                    </div>
                    <div class="page-cust-row page-search-item-meta">
                        <span class="page-cust-id-inline"><strong>ID:</strong> ${c.id}</span>
                        <span class="page-cust-due-inline text-danger"><strong>Due:</strong> ${formatCurrency(c.prevDue)}</span>
                    </div>
                </div>
            `).join('');
        }
        custDropdown.classList.add('show');
    });

    custDropdown.addEventListener('click', function (e) {
        const item = e.target.closest('.page-search-item');
        if (!item || !item.dataset.id) return;

        const cust = MOCK_CUSTOMERS.find(c => c.id === item.dataset.id);
        if (cust) selectCustomer(cust);
    });

    function selectCustomer(cust) {
        selectedCustomer = cust;
        custSearch.value = cust.name;
        custDropdown.classList.remove('show');

        document.getElementById('custName').textContent = cust.name;
        document.getElementById('custId').textContent = cust.id;
        document.getElementById('custPhone').textContent = cust.phone;
        document.getElementById('custType').textContent = cust.type;
        document.getElementById('custAddress').textContent = cust.address;
        document.getElementById('custShipAddress').textContent = cust.shipAddress;
        document.getElementById('custPrevDue').textContent = formatCurrency(cust.prevDue);
        document.getElementById('custCreditLimit').textContent = formatCurrency(cust.creditLimit);

        const availCredit = Math.max(0, cust.creditLimit - cust.prevDue);
        document.getElementById('custAvailCredit').textContent = formatCurrency(availCredit);

        custDetails.style.display = 'block';
        updateOutstanding();
    }

    document.addEventListener('click', function (e) {
        if (!custSearch.contains(e.target) && !custDropdown.contains(e.target)) {
            custDropdown.classList.remove('show');
        }
    });

    // ==========================================
    // PRODUCT SEARCH
    // ==========================================
    const prodSearch = document.getElementById('prodSearch');
    const prodDropdown = document.getElementById('prodDropdown');

    prodSearch.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        if (!query) {
            prodDropdown.classList.remove('show');
            return;
        }

        const results = MOCK_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.barcode.includes(query)
        );

        if (results.length === 0) {
            prodDropdown.innerHTML = '<div class="page-search-item text-center text-muted">No products found</div>';
        } else {
            prodDropdown.innerHTML = results.map(p => {
                let stockClass = 'page-search-item-stock';
                let stockText = `Stock: ${p.stock} ${p.unit}`;
                if (p.stock === 0) {
                    stockClass += ' out';
                    stockText = 'Out of Stock';
                } else if (p.stock <= 5) {
                    stockClass += ' low';
                    stockText = `Low Stock: ${p.stock} ${p.unit}`;
                }

                return `
                    <div class="page-search-item" data-sku="${p.sku}">
                        <div class="page-prod-row page-prod-row-name">
                            <div class="page-search-item-title">${p.name}</div>
                            <span class="page-prod-price-inline"><strong>Price:</strong> ${formatCurrency(p.price)}</span>
                        </div>
                        <div class="page-prod-row page-search-item-meta">
                            <span class="page-prod-sku-inline"><strong>SKU:</strong> ${p.sku}</span>
                            <span class="${stockClass} page-prod-stock-inline"><i class="bi bi-box-seam"></i> ${stockText}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        prodDropdown.classList.add('show');
    });

    prodDropdown.addEventListener('click', function (e) {
        const item = e.target.closest('.page-search-item');
        if (!item || !item.dataset.sku) return;

        const prod = MOCK_PRODUCTS.find(p => p.sku === item.dataset.sku);
        if (prod) addProductToInvoice(prod);
    });

    document.addEventListener('click', function (e) {
        if (!prodSearch.contains(e.target) && !prodDropdown.contains(e.target)) {
            prodDropdown.classList.remove('show');
        }
    });

    // ==========================================
    // INVOICE ITEMS TABLE
    // ==========================================
    const itemsBody = document.getElementById('itemsBody');
    const itemsEmptyState = document.getElementById('itemsEmptyState');

    function addProductToInvoice(prod) {
        if (prod.stock === 0) {
            showToast('Product is out of stock!', 'danger');
            return;
        }

        const existing = invoiceItems.find(i => i.sku === prod.sku);
        if (existing) {
            existing.qty += 1;
            if (existing.qty > prod.stock) {
                existing.qty = prod.stock;
                showToast(`Only ${prod.stock} units available in stock.`, 'danger');
            }
        } else {
            invoiceItems.push({
                sku: prod.sku,
                name: prod.name,
                stock: prod.stock,
                qty: 1,
                unit: prod.unit,
                price: prod.price,
                discountType: 'amount',
                discountValue: 0,
                vat: prod.vat,
                details: prod.details || ''
            });
        }

        prodSearch.value = '';
        prodDropdown.classList.remove('show');
        renderItems();
    }

    function renderItems() {
        itemsBody.innerHTML = '';

        if (invoiceItems.length === 0) {
            itemsEmptyState.style.display = 'block';
            document.getElementById('itemsTable').style.display = 'none';
        } else {
            itemsEmptyState.style.display = 'none';
            document.getElementById('itemsTable').style.display = 'table';

            invoiceItems.forEach((item, index) => {
                const isInvalidQty = item.qty > item.stock || item.qty <= 0;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <span class="prod-name">${item.name}</span>
                        <span class="prod-sku">${item.sku}</span>
                    </td>
                    <td>
                        <span class="${item.stock <= 5 ? 'text-warning fw-semibold' : ''}">${item.stock} ${item.unit}</span>
                    </td>
                    <td>
                        <input type="number" class="input-sm item-qty ${isInvalidQty ? 'is-invalid' : ''}" 
                               value="${item.qty}" min="1" max="${item.stock}" data-index="${index}">
                    </td>
                    <td>${item.unit}</td>
                    <td>
                        <input type="number" class="input-sm item-price" value="${item.price}" min="0" step="0.01" data-index="${index}">
                    </td>
                    <td>
                        <div class="disc-cell">
                            <select class="disc-type-select item-disc-type" data-index="${index}">
                                <option value="amount" ${item.discountType === 'amount' ? 'selected' : ''}>৳</option>
                                <option value="percent" ${item.discountType === 'percent' ? 'selected' : ''}>%</option>
                            </select>
                            <input type="number" class="input-sm item-disc-value" value="${item.discountValue}" min="0" step="0.01" data-index="${index}">
                        </div>
                    </td>
                    <td>${item.vat}%</td>
                    <td class="total-cell">${formatCurrency(calcLineTotal(item))}</td>
                    <td>
                        ${item.details ? `<button class="action-btn btn-info" data-bs-toggle="tooltip" title="${item.details}"><i class="bi bi-info-circle"></i></button>` : ''}
                        <button class="action-btn btn-delete" data-index="${index}" title="Remove">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                itemsBody.appendChild(tr);
            });

            // Initialize tooltips for tyre details
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
        }

        recalcSummary();
    }

    function getItemDiscountAmount(item) {
        const lineSub = item.qty * item.price;
        if (item.discountType === 'percent') {
            return lineSub * (Math.min(item.discountValue, 100) / 100);
        }
        return Math.min(item.discountValue, lineSub);
    }

    function calcLineTotal(item) {
        const lineSub = item.qty * item.price;
        const discAmt = getItemDiscountAmount(item);
        const taxable = lineSub - discAmt;
        const vatAmt = taxable * (item.vat / 100);
        return taxable + vatAmt;
    }

    function updateRowTotal(index, activeInput) {
        const item = invoiceItems[index];
        const row = activeInput.closest('tr');
        if (!row) return;

        const lineSub = item.qty * item.price;

        const isInvalidQty = item.qty > item.stock || item.qty <= 0;
        const qtyInput = row.querySelector('.item-qty');
        if (qtyInput) qtyInput.classList.toggle('is-invalid', isInvalidQty);

        const discInput = row.querySelector('.item-disc-value');
        if (discInput) {
            const discInvalid = item.discountType === 'amount' && item.discountValue > lineSub;
            discInput.classList.toggle('is-invalid', discInvalid);
        }

        const totalCell = row.querySelector('.total-cell');
        if (totalCell) totalCell.textContent = formatCurrency(calcLineTotal(item));
    }

    itemsBody.addEventListener('input', function (e) {
        const index = e.target.dataset.index;
        if (index === undefined) return;

        const item = invoiceItems[index];
        if (e.target.classList.contains('item-qty')) {
            item.qty = Number(e.target.value) || 0;
        } else if (e.target.classList.contains('item-price')) {
            item.price = Number(e.target.value) || 0;
        } else if (e.target.classList.contains('item-disc-value')) {
            let val = Number(e.target.value) || 0;
            if (val < 0) val = 0;
            if (item.discountType === 'percent' && val > 100) val = 100;
            item.discountValue = val;
        }

        updateRowTotal(index, e.target);
        recalcSummary();
    });

    itemsBody.addEventListener('change', function (e) {
        const index = e.target.dataset.index;
        if (index === undefined) return;

        if (e.target.classList.contains('item-disc-type')) {
            invoiceItems[index].discountType = e.target.value;
            renderItems();
        }
    });

    itemsBody.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-delete');
        if (btn) {
            itemToDelete = Number(btn.dataset.index);
            const modal = new bootstrap.Modal(document.getElementById('deleteItemModal'));
            modal.show();
        }
    });

    document.getElementById('confirmDeleteItemBtn').addEventListener('click', function () {
        if (itemToDelete !== null) {
            invoiceItems.splice(itemToDelete, 1);
            itemToDelete = null;
            renderItems();
            bootstrap.Modal.getInstance(document.getElementById('deleteItemModal')).hide();
        }
    });

    // ==========================================
    // CALCULATIONS & SUMMARY
    // ==========================================
    function recalcSummary() {
        let subtotal = 0, totalDiscount = 0, totalVat = 0, totalQty = 0;

        invoiceItems.forEach(item => {
            const lineSub = item.qty * item.price;
            const discAmt = getItemDiscountAmount(item);
            subtotal += lineSub;
            totalDiscount += discAmt;
            totalQty += item.qty;

            const taxable = lineSub - discAmt;
            totalVat += taxable * (item.vat / 100);
        });

        const afterLineDiscount = subtotal - totalDiscount;

        const discType = document.getElementById('invDiscType').value;
        const discValueInput = Number(document.getElementById('invDiscValue').value) || 0;
        const overallDiscount = discType === 'percent'
            ? afterLineDiscount * (Math.min(discValueInput, 100) / 100)
            : Math.min(discValueInput, afterLineDiscount);

        const shipping = Number(document.getElementById('invShipping').value) || 0;
        const grandTotal = afterLineDiscount - overallDiscount + totalVat + shipping;
        const paid = Number(document.getElementById('invPaid').value) || 0;
        const due = Math.max(0, grandTotal - paid);
        if (paid > grandTotal) {
            showToast('Paid amount exceeds Grand Total.', 'danger');
        }

        document.getElementById('sumItems').textContent = invoiceItems.length;
        document.getElementById('sumQty').textContent = totalQty;
        document.getElementById('sumSubtotal').textContent = formatCurrency(subtotal);
        document.getElementById('sumLineDiscount').textContent = '-' + formatCurrency(totalDiscount);
        document.getElementById('sumVat').textContent = formatCurrency(totalVat);
        document.getElementById('sumGrandTotal').textContent = formatCurrency(grandTotal);
        document.getElementById('sumPaid').textContent = formatCurrency(paid);
        document.getElementById('sumDue').textContent = formatCurrency(due);

        updateOutstanding();
        checkCreditLimitForTotal(grandTotal);
    }

    function updateOutstanding() {
        if (selectedCustomer && selectedCustomer.prevDue > 0) {
            const currentDue = Number(document.getElementById('sumDue').textContent.replace(/[^0-9.-]+/g, "")) || 0;
            const totalOutstanding = selectedCustomer.prevDue + currentDue;
            document.getElementById('sumPrevDue').textContent = formatCurrency(selectedCustomer.prevDue);
            document.getElementById('sumTotalOutstanding').textContent = formatCurrency(totalOutstanding);
            document.getElementById('custOutstanding').style.display = 'block';
        } else {
            document.getElementById('custOutstanding').style.display = 'none';
        }
    }

    function checkCreditLimitForTotal(grandTotal) {
        if (!selectedCustomer) return;
        const availCredit = selectedCustomer.creditLimit - selectedCustomer.prevDue;
        const warning = document.getElementById('custCreditWarning');
        warning.style.display = (grandTotal > availCredit) ? 'flex' : 'none';
    }

    document.getElementById('invDiscType').addEventListener('change', recalcSummary);
    document.getElementById('invDiscValue').addEventListener('input', recalcSummary);
    document.getElementById('invDueDate').addEventListener('change', function () {
        const invDate = document.getElementById('invDate').value;
        if (invDate && this.value && this.value < invDate) {
            showToast('Due date cannot be earlier than invoice date.', 'danger');
            this.value = '';
        }
    });

    // ==========================================
    // FORM SUBMISSION
    // ==========================================
    document.getElementById('btnSaveInvoice').addEventListener('click', function () {
        const btn = this;
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        const grandTotalVal = Number(document.getElementById('sumGrandTotal').textContent.replace(/[^0-9.-]+/g, "")) || 0;
        const paidVal = Number(document.getElementById('invPaid').value) || 0;
        if (paidVal > grandTotalVal) {
            showToast('Paid amount cannot exceed Grand Total. Please correct before saving.', 'danger');
            return;
        }

        let hasInvalidQty = false;
        invoiceItems.forEach(item => {
            if (item.qty > item.stock || item.qty <= 0) hasInvalidQty = true;
        });

        if (hasInvalidQty) {
            showToast('Please fix quantity/stock errors before saving.', 'danger');
            return;
        }

        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        setTimeout(() => {
            btn.disabled = false;
            btnText.style.display = 'inline-flex';
            btnLoader.style.display = 'none';
            showToast('Invoice created successfully!', 'success');
            // window.location.href = 'invoice-list.html'; // Redirect logic
        }, 1500);
    });

    document.getElementById('btnSaveDraft').addEventListener('click', function () {
        showToast('Invoice saved as draft.', 'success');
    });

    // ==========================================
    // ADD NEW CUSTOMER MODAL LOGIC
    // ==========================================
    const addCustomerModalEl = document.getElementById('addCustomerModal');
    if (addCustomerModalEl) {
        const addCustomerModal = new bootstrap.Modal(addCustomerModalEl);
        const btnAddNewCustomer = document.getElementById('btnAddNewCustomer');
        const btnSaveNewCustomer = document.getElementById('btnSaveNewCustomer');

        function generateNewCustomerId() {
            const maxId = MOCK_CUSTOMERS.reduce((max, c) => {
                const num = parseInt(c.id.replace('CUS-', ''), 10);
                return num > max ? num : max;
            }, 0);
            return 'CUS-' + String(maxId + 1).padStart(5, '0');
        }

        btnAddNewCustomer.addEventListener('click', function () {
            document.getElementById('addCustomerForm').reset();
            document.getElementById('newCustId').value = generateNewCustomerId();
            addCustomerModal.show();
        });

        btnSaveNewCustomer.addEventListener('click', function () {
            const name = document.getElementById('newCustName').value.trim();
            const phone = document.getElementById('newCustPhone').value.trim();

            // Basic Validation
            if (!name || !phone) {
                showToast('Please fill in Customer Name and Phone.', 'danger');
                return;
            }

            const newCustomer = {
                id: document.getElementById('newCustId').value,
                name: name,
                phone: phone,
                type: document.getElementById('newCustType').value,
                address: document.getElementById('newCustAddress').value.trim() || 'N/A',
                shipAddress: document.getElementById('newCustShipAddress').value.trim() || 'Same as billing',
                prevDue: Number(document.getElementById('newCustPrevDue').value) || 0,
                creditLimit: Number(document.getElementById('newCustCreditLimit').value) || 0
            };

            // Add to local mock database
            MOCK_CUSTOMERS.push(newCustomer);

            // Close modal and show success
            addCustomerModal.hide();
            showToast('New customer added successfully!', 'success');

            // UX Enhancement: Auto-select the newly added customer in the invoice
            selectCustomer(newCustomer);
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('invNo').value = nextInvoiceNo();
        document.getElementById('invDate').value = new Date().toISOString().slice(0, 10);
        document.getElementById('invPayDate').value = new Date().toISOString().slice(0, 10);
        renderItems();
    });

})();