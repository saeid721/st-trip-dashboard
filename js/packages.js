/* ==========================================
   PACKAGE MANAGEMENT SCREEN LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Bootstrap Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 2. Bulk Selection Logic
    const selectAll = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const bulkActionBar = document.getElementById('bulkActionBar');
    const selectedCount = document.getElementById('selectedCount');
    const clearSelection = document.getElementById('clearSelection');

    function updateBulkActionBar() {
        const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
        selectedCount.textContent = checkedCount;

        if (checkedCount > 0) {
            bulkActionBar.classList.remove('d-none');
        } else {
            bulkActionBar.classList.add('d-none');
        }

        if (selectAll) {
            selectAll.checked = checkedCount === rowCheckboxes.length && checkedCount > 0;
            selectAll.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
        }
    }

    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            rowCheckboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBulkActionBar();
        });
    }

    rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateBulkActionBar);
    });

    if (clearSelection) {
        clearSelection.addEventListener('click', () => {
            rowCheckboxes.forEach(cb => cb.checked = false);
            if (selectAll) selectAll.checked = false;
            updateBulkActionBar();
        });
    }

    // 3. Filter Reset Logic
    const resetFiltersBtn = document.getElementById('resetFilters');
    const resetFromEmpty = document.getElementById('resetFromEmpty');

    function resetFilters() {
        // Reset text inputs and selects
        document.querySelectorAll('.table-search-input input, .form-select, .form-control').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Collapse advanced filters if open
        const advancedFilters = document.getElementById('advancedFilters');
        if (advancedFilters && advancedFilters.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(advancedFilters);
            bsCollapse.hide();
        }

        // Hide empty state if it was shown
        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.classList.add('d-none');
    }

    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
    if (resetFromEmpty) resetFromEmpty.addEventListener('click', resetFilters);

    // 4. Mock Delete Confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            const modalEl = document.getElementById('deletePackageModal');
            const modal = bootstrap.Modal.getInstance(modalEl);

            // Simulate API call / deletion
            confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Deleting...';
            confirmDeleteBtn.disabled = true;

            setTimeout(() => {
                modal.hide();
                confirmDeleteBtn.innerHTML = 'Yes, Delete Package';
                confirmDeleteBtn.disabled = false;

                // Optional: Show a success toast here in a real app
                console.log('Package deleted successfully');
            }, 800);
        });

        // Reset button state when modal closes
        modalEl.addEventListener('hidden.bs.modal', () => {
            confirmDeleteBtn.innerHTML = 'Yes, Delete Package';
            confirmDeleteBtn.disabled = false;
        });
    }

    // 5. Mock Search Filter (Visual feedback only)
    const packageSearch = document.getElementById('packageSearch');
    if (packageSearch) {
        packageSearch.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#packageTable tbody tr');
            let visibleCount = 0;

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(val)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            const emptyState = document.getElementById('emptyState');
            const tableResponsive = document.querySelector('.table-responsive-custom');
            const tableFooter = document.querySelector('.table-footer');

            if (visibleCount === 0 && val.length > 0) {
                emptyState.classList.remove('d-none');
                tableResponsive.classList.add('d-none');
                tableFooter.classList.add('d-none');
            } else {
                emptyState.classList.add('d-none');
                tableResponsive.classList.remove('d-none');
                tableFooter.classList.remove('d-none');
            }
        });
    }
});



/* ==========================================
   ADD PACKAGE FORM LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addPackageForm');
    let isFormDirty = false;

    // 1. Track Unsaved Changes
    form.addEventListener('input', () => { isFormDirty = true; });
    form.addEventListener('change', () => { isFormDirty = true; });
    window.addEventListener('beforeunload', (e) => {
        if (isFormDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // 2. Dynamic Inclusions
    const inclusionsList = document.getElementById('inclusionsList');
    document.getElementById('addInclusionBtn').addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
            <input type="text" class="form-control" placeholder="Item (e.g., Flight)" required>
            <input type="text" class="form-control" placeholder="Description (e.g., Biman Bangladesh)">
            <input type="number" class="form-control" placeholder="Price (Optional)" style="max-width: 120px;">
            <button type="button" class="btn-remove-row" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        inclusionsList.appendChild(row);
        isFormDirty = true;
    });

    // 3. Dynamic Exclusions
    const exclusionsList = document.getElementById('exclusionsList');
    document.getElementById('addExclusionBtn').addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
            <input type="text" class="form-control" placeholder="Item (e.g., Personal Expenses)" required>
            <input type="text" class="form-control" placeholder="Description (Optional)">
            <button type="button" class="btn-remove-row" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        exclusionsList.appendChild(row);
        isFormDirty = true;
    });

    // Event Delegation for Remove Buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-row')) {
            e.target.closest('.dynamic-row').remove();
            isFormDirty = true;
        }
    });

    // 4. Dynamic Itinerary Builder
    let dayCount = 0;
    const itineraryAccordion = document.getElementById('itineraryAccordion');

    document.getElementById('addItineraryDayBtn').addEventListener('click', () => {
        dayCount++;
        const dayId = `itineraryDay${dayCount}`;
        const headingId = `heading${dayCount}`;
        const collapseId = `collapse${dayCount}`;

        const dayCard = document.createElement('div');
        dayCard.className = 'accordion-item itinerary-day-card';
        dayCard.innerHTML = `
            <h2 class="accordion-header" id="${headingId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                    Day ${dayCount}: <span class="text-muted fw-normal ms-2 day-title-preview">New Day</span>
                    <button type="button" class="btn-remove-day" title="Remove Day"><i class="fa-solid fa-trash"></i></button>
                </
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}" data-bs-parent="#itineraryAccordion">
                <div class="accordion-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label small fw-semibold">Date</label>
                            <input type="date" class="form-control form-control-sm itinerary-date">
                        </div>
                        <div class="col-md-9">
                            <label class="form-label small fw-semibold">Title / Location</label>
                            <input type="text" class="form-control form-control-sm itinerary-title" placeholder="e.g., Arrival in Makkab">
                        </div>
                        <div class="col-12">
                            <label class="form-label small fw-semibold">Description & Activities</label>
                            <textarea class="form-control form-control-sm" rows="3" placeholder="Detailed activities for this day..."></textarea>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Meals</label>
                            <select class="form-select form-select-sm">
                                <option>Breakfast, Lunch, Dinner</option>
                                <option>Breakfast Only</option>
                                <option>No Meals</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Hotel</label>
                            <input type="text" class="form-control form-control-sm" placeholder="Hotel name">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Transportation</label>
                            <input type="text" class="form-control form-control-sm" placeholder="e.g., Private AC Bus">
                        </div>
                    </div>
                </div>
            </div>
        `;
        itineraryAccordion.appendChild(dayCard);

        // Auto-expand the new day
        const collapseEl = dayCard.querySelector('.accordion-collapse');
        const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: true });
        isFormDirty = true;

        // Live preview update for accordion header
        const titleInput = dayCard.querySelector('.itinerary-title');
        const previewSpan = dayCard.querySelector('.day-title-preview');
        titleInput.addEventListener('input', () => {
            previewSpan.textContent = titleInput.value || 'New Day';
        });
    });

    // 5. Duration Auto-Calculation (Nights = Days - 1)
    const daysInput = document.getElementById('durationDays');
    const nightsInput = document.getElementById('durationNights');
    daysInput.addEventListener('input', () => {
        const days = parseInt(daysInput.value) || 0;
        nightsInput.value = days > 0 ? days - 1 : 0;
    });

    // Date-based night calculation
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    function calculateNightsFromDates() {
        if (startDate.value && endDate.value) {
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysInput.value = diffDays + 1;
            nightsInput.value = diffDays;
        }
    }
    startDate.addEventListener('change', calculateNightsFromDates);
    endDate.addEventListener('change', calculateNightsFromDates);

    // 6. Pricing Auto-Calculation
    const priceInputs = document.querySelectorAll('.calc-price');
    function calculatePricing() {
        const base = parseFloat(document.getElementById('basePrice').value) || 0;
        const discount = parseFloat(document.getElementById('discountPrice').value) || 0;
        const taxPct = parseFloat(document.getElementById('taxPercent').value) || 0;
        const servicePct = parseFloat(document.getElementById('serviceChargePercent').value) || 0;

        const subtotal = Math.max(0, base - discount);
        const taxAmount = subtotal * (taxPct / 100);
        const serviceAmount = subtotal * (servicePct / 100);
        const totalCharges = taxAmount + serviceAmount;
        const finalPrice = subtotal + totalCharges;

        document.getElementById('summarySubtotal').textContent = `৳${subtotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
        document.getElementById('summaryTax').textContent = `৳${totalCharges.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
        document.getElementById('summaryFinal').textContent = `৳${finalPrice.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    }
    priceInputs.forEach(input => input.addEventListener('input', calculatePricing));

    // 7. SEO Character Counters
    const seoTitle = document.getElementById('seoTitle');
    const titleCount = document.getElementById('titleCount');
    seoTitle.addEventListener('input', () => {
        const len = seoTitle.value.length;
        titleCount.textContent = `${len}/60`;
        titleCount.className = `char-count float-end ${len > 55 ? 'danger' : len > 50 ? 'warning' : 'text-muted'}`;
    });

    const seoDesc = document.getElementById('seoDesc');
    const descCount = document.getElementById('descCount');
    seoDesc.addEventListener('input', () => {
        const len = seoDesc.value.length;
        descCount.textContent = `${len}/160`;
        descCount.className = `char-count float-end ${len > 150 ? 'danger' : len > 130 ? 'warning' : 'text-muted'}`;
    });

    // 8. Drag & Drop Image Preview
    const mainImageDropZone = document.getElementById('mainImageDropZone');
    const mainImageInput = document.getElementById('mainImageInput');
    const mainImagePlaceholder = document.getElementById('mainImagePlaceholder');
    const mainImagePreview = document.getElementById('mainImagePreview');
    const removeMainImage = document.getElementById('removeMainImage');

    mainImageDropZone.addEventListener('click', () => mainImageInput.click());
    mainImageDropZone.addEventListener('dragover', (e) => { e.preventDefault(); mainImageDropZone.classList.add('drag-over'); });
    mainImageDropZone.addEventListener('dragleave', () => mainImageDropZone.classList.remove('drag-over'));
    mainImageDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        mainImageDropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleMainImage(e.dataTransfer.files[0]);
    });
    mainImageInput.addEventListener('change', () => {
        if (mainImageInput.files.length) handleMainImage(mainImageInput.files[0]);
    });

    function handleMainImage(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mainImagePreview.querySelector('img').src = e.target.result;
                mainImagePlaceholder.classList.add('d-none');
                mainImagePreview.classList.remove('d-none');
                isFormDirty = true;
            };
            reader.readAsDataURL(file);
        }
    }

    removeMainImage.addEventListener('click', (e) => {
        e.stopPropagation();
        mainImageInput.value = '';
        mainImagePreview.classList.add('d-none');
        mainImagePlaceholder.classList.remove('d-none');
        isFormDirty = true;
    });

    // Gallery Preview (Simplified)
    const galleryInput = document.getElementById('galleryInput');
    const galleryPreview = document.getElementById('galleryPreview');
    const galleryPlaceholder = document.getElementById('galleryPlaceholder');
    document.getElementById('galleryDropZone').addEventListener('click', () => galleryInput.click());

    galleryInput.addEventListener('change', () => {
        if (galleryInput.files.length) {
            galleryPlaceholder.classList.add('d-none');
            galleryPreview.classList.remove('d-none');
            Array.from(galleryInput.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const thumb = document.createElement('div');
                        thumb.className = 'gallery-thumb';
                        thumb.innerHTML = `<img src="${e.target.result}"><button type="button" class="btn-remove-row btn-remove-image"><i class="fa-solid fa-xmark"></i></button>`;
                        galleryPreview.appendChild(thumb);
                    };
                    reader.readAsDataURL(file);
                }
            });
            isFormDirty = true;
        }
    });

    // 9. Form Validation & Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity()) {
            const publishBtn = document.getElementById('publishBtn');
            const btnText = publishBtn.querySelector('.btn-text');
            const spinner = publishBtn.querySelector('.spinner-border');

            // Loading State
            publishBtn.disabled = true;
            btnText.classList.add('d-none');
            spinner.classList.remove('d-none');

            // Simulate API Call
            setTimeout(() => {
                publishBtn.disabled = false;
                btnText.classList.remove('d-none');
                spinner.classList.add('d-none');
                isFormDirty = false;

                // Success feedback (In a real app, redirect to list)
                alert('Package published successfully!');
                form.reset();
                // Reset UI states
                mainImagePreview.classList.add('d-none');
                mainImagePlaceholder.classList.remove('d-none');
                galleryPreview.classList.add('d-none');
                galleryPlaceholder.classList.remove('d-none');
                galleryPreview.innerHTML = '';
                inclusionsList.innerHTML = '';
                exclusionsList.innerHTML = '';
                itineraryAccordion.innerHTML = '';
                dayCount = 0;
                calculatePricing();
            }, 1500);
        } else {
            form.classList.add('was-validated');
            // Scroll to first error
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
        }
    });

    // Cancel button resets dirty flag
    document.getElementById('cancelBtn').addEventListener('click', () => {
        isFormDirty = false;
        window.history.back();
    });
});



/* ==========================================
   EDIT PACKAGE FORM LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editPackageForm');
    let isDirty = false;
    const unsavedIndicator = document.getElementById('unsavedIndicator');

    // 1. Dirty State Tracking
    function markDirty() {
        if (!isDirty) {
            isDirty = true;
            unsavedIndicator.style.opacity = '1';
        }
    }

    form.addEventListener('input', markDirty);
    form.addEventListener('change', markDirty);

    window.addEventListener('beforeunload', (e) => {
        if (isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
            return;
        }
        isDirty = false;
        window.history.back();
    });

    // 2. Dynamic Inclusions
    const inclusionsList = document.getElementById('inclusionsList');
    document.getElementById('addInclusionBtn').addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
            <input type="text" class="form-control" placeholder="Item (e.g., Flight)" required>
            <input type="text" class="form-control" placeholder="Description">
            <input type="number" class="form-control" placeholder="Price" style="max-width: 120px;">
            <button type="button" class="btn-remove-row" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        inclusionsList.appendChild(row);
        markDirty();
    });

    // 3. Dynamic Exclusions
    const exclusionsList = document.getElementById('exclusionsList');
    document.getElementById('addExclusionBtn').addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
            <input type="text" class="form-control" placeholder="Item (e.g., Personal Expenses)" required>
            <input type="text" class="form-control" placeholder="Description">
            <button type="button" class="btn-remove-row" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        exclusionsList.appendChild(row);
        markDirty();
    });

    // Event Delegation for Remove Buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-row')) {
            if (confirm('Remove this item?')) {
                e.target.closest('.dynamic-row').remove();
                markDirty();
            }
        }
    });

    // 4. Dynamic Itinerary Builder
    let dayCount = 1; // Start from 1 as Day 1 exists
    const itineraryAccordion = document.getElementById('itineraryAccordion');

    document.getElementById('addItineraryDayBtn').addEventListener('click', () => {
        dayCount++;
        const dayId = `itineraryDay${dayCount}`;
        const headingId = `heading${dayCount}`;
        const collapseId = `collapse${dayCount}`;

        const dayCard = document.createElement('div');
        dayCard.className = 'accordion-item itinerary-day-card';
        dayCard.innerHTML = `
            <h2 class="accordion-header" id="${headingId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false">
                    Day ${dayCount}: <span class="text-muted fw-normal ms-2 day-title-preview">New Day</span>
                    <div class="ms-auto d-flex gap-2 me-3">
                        <button type="button" class="btn btn-sm btn-light border btn-reorder" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                        <button type="button" class="btn btn-sm btn-light border btn-reorder" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
                        <button type="button" class="btn btn-sm btn-outline-danger border-0 btn-remove-day" title="Remove Day"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#itineraryAccordion">
                <div class="accordion-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label small fw-semibold">Date</label>
                            <input type="date" class="form-control form-control-sm itinerary-date">
                        </div>
                        <div class="col-md-9">
                            <label class="form-label small fw-semibold">Title / Location</label>
                            <input type="text" class="form-control form-control-sm itinerary-title" placeholder="e.g., Arrival in Makkah">
                        </div>
                        <div class="col-12">
                            <label class="form-label small fw-semibold">Description & Activities</label>
                            <textarea class="form-control form-control-sm" rows="3" placeholder="Detailed activities..."></textarea>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Meals</label>
                            <select class="form-select form-select-sm">
                                <option>Breakfast, Lunch, Dinner</option>
                                <option>Breakfast Only</option>
                                <option>No Meals</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Hotel</label>
                            <input type="text" class="form-control form-control-sm" placeholder="Hotel name">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Transportation</label>
                            <input type="text" class="form-control form-control-sm" placeholder="e.g., Private AC Bus">
                        </div>
                    </div>
                </div>
            </div>
        `;
        itineraryAccordion.appendChild(dayCard);

        // Auto-expand
        const bsCollapse = new bootstrap.Collapse(dayCard.querySelector('.accordion-collapse'), { toggle: true });
        markDirty();

        // Live preview update
        const titleInput = dayCard.querySelector('.itinerary-title');
        const previewSpan = dayCard.querySelector('.day-title-preview');
        titleInput.addEventListener('input', () => {
            previewSpan.textContent = titleInput.value || 'New Day';
        });
    });

    // Itinerary Remove Delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-day')) {
            if (confirm('Remove this entire day from the itinerary?')) {
                e.target.closest('.itinerary-day-card').remove();
                markDirty();
            }
        }
    });

    // 5. Duration Auto-Calculation
    const daysInput = document.getElementById('durationDays');
    const nightsInput = document.getElementById('durationNights');
    daysInput.addEventListener('input', () => {
        const days = parseInt(daysInput.value) || 0;
        nightsInput.value = days > 0 ? days - 1 : 0;
        markDirty();
    });

    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    function calculateNightsFromDates() {
        if (startDate.value && endDate.value) {
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysInput.value = diffDays + 1;
            nightsInput.value = diffDays;
            markDirty();
        }
    }
    startDate.addEventListener('change', calculateNightsFromDates);
    endDate.addEventListener('change', calculateNightsFromDates);

    // 6. Pricing Auto-Calculation
    const priceInputs = document.querySelectorAll('.calc-price');
    function calculatePricing() {
        const base = parseFloat(document.getElementById('basePrice').value) || 0;
        const discount = parseFloat(document.getElementById('discountPrice').value) || 0;
        const taxPct = parseFloat(document.getElementById('taxPercent').value) || 0;
        const servicePct = parseFloat(document.getElementById('serviceChargePercent').value) || 0;

        const subtotal = Math.max(0, base - discount);
        const taxAmount = subtotal * (taxPct / 100);
        const serviceAmount = subtotal * (servicePct / 100);
        const totalCharges = taxAmount + serviceAmount;
        const finalPrice = subtotal + totalCharges;

        document.getElementById('summarySubtotal').textContent = `৳${subtotal.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
        document.getElementById('summaryTax').textContent = `৳${totalCharges.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
        document.getElementById('summaryFinal').textContent = `৳${finalPrice.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
        markDirty();
    }
    priceInputs.forEach(input => input.addEventListener('input', calculatePricing));

    // 7. SEO Character Counters
    const seoTitle = document.getElementById('seoTitle');
    const titleCount = document.getElementById('titleCount');
    seoTitle.addEventListener('input', () => {
        const len = seoTitle.value.length;
        titleCount.textContent = `${len}/60`;
        titleCount.className = `char-count float-end ${len > 55 ? 'danger' : len > 50 ? 'warning' : 'text-muted'}`;
        markDirty();
    });

    const seoDesc = document.getElementById('seoDesc');
    const descCount = document.getElementById('descCount');
    seoDesc.addEventListener('input', () => {
        const len = seoDesc.value.length;
        descCount.textContent = `${len}/160`;
        descCount.className = `char-count float-end ${len > 150 ? 'danger' : len > 130 ? 'warning' : 'text-muted'}`;
        markDirty();
    });

    // 8. Image Handling Simulation
    document.getElementById('addGalleryBtn').addEventListener('click', () => {
        document.getElementById('galleryInput').click();
    });
    document.getElementById('galleryInput').addEventListener('change', (e) => {
        if (e.target.files.length) {
            // In a real app, upload to server. Here we simulate preview.
            Array.from(e.target.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const div = document.createElement('div');
                        div.className = 'gallery-thumb-item position-relative';
                        div.innerHTML = `<img src="${ev.target.result}"><button type="button" class="btn-remove-gallery"><i class="fa-solid fa-xmark"></i></button>`;
                        document.getElementById('galleryGrid').insertBefore(div, document.getElementById('addGalleryBtn'));
                        markDirty();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });

    document.getElementById('removeMainImageBtn').addEventListener('click', () => {
        if (confirm('Remove the main package image?')) {
            document.getElementById('existingMainImage').style.display = 'none';
            markDirty();
        }
    });

    // Gallery remove delegation
    document.getElementById('galleryGrid').addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-gallery')) {
            if (confirm('Remove this image from the gallery?')) {
                e.target.closest('.gallery-thumb-item').remove();
                markDirty();
            }
        }
    });

    // 9. Form Validation & Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (form.checkValidity()) {
            const updateBtn = document.getElementById('updateBtn');
            const btnText = updateBtn.querySelector('.btn-text');
            const spinner = updateBtn.querySelector('.spinner-border');

            // Loading State
            updateBtn.disabled = true;
            btnText.classList.add('d-none');
            spinner.classList.remove('d-none');

            // Simulate API Call
            setTimeout(() => {
                updateBtn.disabled = false;
                btnText.classList.remove('d-none');
                spinner.classList.add('d-none');

                // Success Feedback
                isDirty = false;
                unsavedIndicator.style.opacity = '0';

                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                toast.show();

                // Update "Last updated" text visually
                document.querySelector('.greeting-left .text-muted small').innerHTML = '<i class="fa-regular fa-clock me-1"></i> Last updated: Just now by Admin';
            }, 1500);
        } else {
            form.classList.add('was-validated');
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
        }
    });
});



/* ==========================================
   PACKAGE PREVIEW MODAL LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Gallery Image Switching
    const galleryThumbs = document.querySelectorAll('#previewGallery .gallery-thumb');
    const mainPreviewImage = document.getElementById('mainPreviewImage');

    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Remove active class from all
            galleryThumbs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked
            thumb.classList.add('active');

            // Smooth transition for main image
            const newSrc = thumb.getAttribute('data-img');
            if (newSrc && mainPreviewImage) {
                mainPreviewImage.style.opacity = '0.7';
                setTimeout(() => {
                    mainPreviewImage.src = newSrc;
                    mainPreviewImage.style.opacity = '1';
                }, 150);
            }
        });
    });

    // Ensure main image has transition
    if (mainPreviewImage) {
        mainPreviewImage.style.transition = 'opacity 0.15s ease';
    }

    // 2. Fullscreen Toggle
    const previewModal = document.getElementById('packagePreviewModal');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');

    if (toggleFullscreenBtn && previewModal) {
        toggleFullscreenBtn.addEventListener('click', () => {
            const icon = toggleFullscreenBtn.querySelector('i');
            previewModal.classList.toggle('modal-fullscreen-custom');

            if (previewModal.classList.contains('modal-fullscreen-custom')) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
                toggleFullscreenBtn.setAttribute('title', 'Exit Fullscreen');
            } else {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
                toggleFullscreenBtn.setAttribute('title', 'Toggle Fullscreen');
            }
            // Re-init tooltip to update title
            const bsTooltip = bootstrap.Tooltip.getInstance(toggleFullscreenBtn);
            if (bsTooltip) {
                bsTooltip.dispose();
                new bootstrap.Tooltip(toggleFullscreenBtn);
            }
        });
    }

    // 3. Preview Action Buttons Simulation
    const previewPublishBtn = document.getElementById('previewPublishBtn');
    const previewEditBtn = document.getElementById('previewEditBtn');
    const previewDuplicateBtn = document.getElementById('previewDuplicateBtn');
    const successToastEl = document.getElementById('previewSuccessToast');

    function showSuccessToast(message) {
        if (successToastEl) {
            successToastEl.querySelector('.toast-body').innerHTML = `<i class="fa-solid fa-circle-check me-2"></i> ${message}`;
            const toast = new bootstrap.Toast(successToastEl);
            toast.show();
        }
    }

    if (previewPublishBtn) {
        previewPublishBtn.addEventListener('click', () => {
            const btnText = previewPublishBtn.querySelector('.btn-text');
            const spinner = previewPublishBtn.querySelector('.spinner-border');

            // Loading state
            previewPublishBtn.disabled = true;
            btnText.classList.add('d-none');
            spinner.classList.remove('d-none');

            setTimeout(() => {
                previewPublishBtn.disabled = false;
                btnText.classList.remove('d-none');
                spinner.classList.add('d-none');
                showSuccessToast('Package updated successfully!');
            }, 1200);
        });
    }

    if (previewEditBtn) {
        previewEditBtn.addEventListener('click', () => {
            // In a real app, this would route to the edit page
            // For demo, we close modal and show toast
            const modalInstance = bootstrap.Modal.getInstance(previewModal);
            if (modalInstance) modalInstance.hide();
            showSuccessToast('Redirecting to Edit Package...');
        });
    }

    if (previewDuplicateBtn) {
        previewDuplicateBtn.addEventListener('click', () => {
            showSuccessToast('Package duplicated! Opening new draft...');
        });
    }

    // 4. Initialize Tooltips inside Modal
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('#packagePreviewModal [data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 5. Reset Fullscreen state when modal is hidden
    if (previewModal) {
        previewModal.addEventListener('hidden.bs.modal', () => {
            previewModal.classList.remove('modal-fullscreen-custom');
            const icon = toggleFullscreenBtn?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
        });
    }
});