/* =========================================================
ST TRIP ADMIN — ADD PACKAGE MODULE
========================================================= */
(() => {
    'use strict';
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- Section Toggle ---------- */
    $$('.add-pkg-section-head').forEach(head => {
        head.addEventListener('click', () => {
            const section = head.closest('.add-pkg-section');
            section.classList.toggle('collapsed');
        });
    });

    /* ---------- Character Counters ---------- */
    function setupCounter(inputId, counterId, maxLength) {
        const input = $(`#${inputId}`);
        const counter = $(`#${counterId}`);
        if (!input || !counter) return;

        const update = () => {
            counter.textContent = input.value.length;
        };
        input.addEventListener('input', update);
        update();
    }

    setupCounter('packageName', 'nameCounter', 120);
    setupCounter('shortDesc', 'shortDescCounter', 200);
    setupCounter('seoTitle', 'seoTitleCounter', 70);
    setupCounter('metaDescription', 'metaDescCounter', 160);

    /* ---------- Price Calculation ---------- */
    const startingPrice = $('#startingPrice');
    const discount = $('#discount');
    const discountType = $('#discountType');
    const tax = $('#tax');
    const finalPriceValue = $('#finalPriceValue');
    const cppAmount = $('#cppAmount');

    function calculateFinalPrice() {
        let price = parseFloat(startingPrice.value) || 0;
        const discountVal = parseFloat(discount.value) || 0;
        const taxVal = parseFloat(tax.value) || 0;

        if (discountType.value === 'percent') {
            price -= price * (discountVal / 100);
        } else {
            price -= discountVal;
        }

        price += taxVal;

        const formatted = 'BDT ' + Math.round(price).toLocaleString('en-IN');
        finalPriceValue.textContent = formatted;
        cppAmount.textContent = formatted;

        // Update summary
        $('#summaryPrice').textContent = formatted;
    }

    [startingPrice, discount, tax, discountType].forEach(el => {
        if (el) el.addEventListener('input', calculateFinalPrice);
        if (el) el.addEventListener('change', calculateFinalPrice);
    });

    /* ---------- Live Summary Updates ---------- */
    $('#packageName').addEventListener('input', (e) => {
        $('#summaryName').textContent = e.target.value || 'Package Name';
    });

    $('#packageType').addEventListener('change', (e) => {
        const type = e.target.options[e.target.selectedIndex].text;
        $('#summaryType').textContent = type || 'Type';
    });

    $('#city').addEventListener('input', (e) => {
        $('#summaryDest').textContent = e.target.value || 'Destination';
    });

    $('#duration').addEventListener('input', (e) => {
        const nights = $('#nights').value;
        $('#summaryDuration').textContent = e.target.value ? `${e.target.value} days / ${nights || '?'} nights` : 'Duration';
    });

    $('#status').addEventListener('change', (e) => {
        const status = e.target.value;
        const statusEl = $('#summaryStatus');
        statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusEl.className = `status-${status}`;
    });

    /* ---------- Completion Percentage ---------- */
    function updateCompletion() {
        const fields = [
            '#packageName', '#packageType', '#country', '#city', '#departureCity',
            '#startingPrice', '#shortDesc', '#fullDesc'
        ];

        let filled = 0;
        fields.forEach(field => {
            const el = $(field);
            if (el && el.value.trim()) filled++;
        });

        // Check for cover image
        if ($('#coverPreview').style.display !== 'none') filled++;

        const total = fields.length + 1;
        const percent = Math.round((filled / total) * 100);

        $('#completionPercent').textContent = `${percent}%`;
        $('#completionFill').style.width = `${percent}%`;
    }

    $$('.form-input, .form-select, .form-textarea').forEach(el => {
        el.addEventListener('input', updateCompletion);
        el.addEventListener('change', updateCompletion);
    });

    /* ---------- Media Upload ---------- */
    function setupMediaUpload(uploadId, inputId, placeholderId, previewId, multiple = false) {
        const upload = $(`#${uploadId}`);
        const input = $(`#${inputId}`);
        const placeholder = $(`#${placeholderId}`);
        const preview = $(`#${previewId}`);

        if (!upload || !input || !placeholder) return;

        placeholder.addEventListener('click', () => input.click());

        // Drag & drop
        upload.addEventListener('dragover', (e) => {
            e.preventDefault();
            upload.classList.add('dragover');
        });

        upload.addEventListener('dragleave', () => {
            upload.classList.remove('dragover');
        });

        upload.addEventListener('drop', (e) => {
            e.preventDefault();
            upload.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        input.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        function handleFiles(files) {
            if (files.length === 0) return;

            if (multiple) {
                // Gallery
                preview.style.display = 'grid';
                placeholder.style.display = 'none';

                Array.from(files).forEach(file => {
                    if (!file.type.startsWith('image/')) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const item = document.createElement('div');
                        item.className = 'media-gallery-item';
                        item.innerHTML = `
            <img src="${e.target.result}" alt="Gallery image" />
            <button class="media-upload-remove" type="button"><i class="bi bi-x"></i></button>
          `;
                        preview.appendChild(item);

                        item.querySelector('.media-upload-remove').addEventListener('click', () => {
                            item.remove();
                            if (preview.children.length === 0) {
                                preview.style.display = 'none';
                                placeholder.style.display = '';
                            }
                            updateCompletion();
                        });
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                // Single image
                const file = files[0];
                if (!file.type.startsWith('image/')) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.querySelector('img').src = e.target.result;
                    preview.style.display = '';
                    placeholder.style.display = 'none';

                    // Update summary cover
                    if (uploadId === 'coverUpload') {
                        const summaryCover = $('#summaryCover');
                        summaryCover.innerHTML = `<img src="${e.target.result}" alt="Cover" />`;
                    }

                    updateCompletion();
                };
                reader.readAsDataURL(file);
            }
        }

        // Remove button
        if (preview) {
            preview.addEventListener('click', (e) => {
                if (e.target.closest('.media-upload-remove')) {
                    preview.style.display = 'none';
                    placeholder.style.display = '';
                    input.value = '';

                    if (uploadId === 'coverUpload') {
                        const summaryCover = $('#summaryCover');
                        summaryCover.innerHTML = '<i class="bi bi-image"></i><span>No cover image</span>';
                    }

                    updateCompletion();
                }
            });
        }
    }

    setupMediaUpload('coverUpload', 'coverInput', 'coverPlaceholder', 'coverPreview', false);
    setupMediaUpload('galleryUpload', 'galleryInput', 'galleryPlaceholder', 'galleryPreview', true);
    setupMediaUpload('socialUpload', 'socialInput', 'socialPlaceholder', 'socialPreview', false);

    /* ---------- Dynamic Lists ---------- */
    function createListItem(containerId, placeholder, icon = 'bi-check-circle') {
        const container = $(`#${containerId}`);
        const item = document.createElement('div');
        item.className = containerId.includes('highlight') ? 'highlight-item' :
            containerId.includes('include') ? 'include-item' : 'exclude-item';
        item.innerHTML = `
    <i class="bi ${icon}"></i>
    <input type="text" placeholder="${placeholder}" />
    <button type="button"><i class="bi bi-x"></i></button>
  `;
        container.appendChild(item);

        item.querySelector('button').addEventListener('click', () => {
            item.remove();
        });

        item.querySelector('input').focus();
    }

    $('#addHighlightBtn').addEventListener('click', () => {
        createListItem('highlightsList', 'e.g., Hotel within 500m of Haram', 'bi-check-circle');
    });

    $('#addIncludeBtn').addEventListener('click', () => {
        createListItem('includesList', 'e.g., Airport transfer', 'bi-check-circle');
    });

    $('#addExcludeBtn').addEventListener('click', () => {
        createListItem('excludesList', 'e.g., Personal expenses', 'bi-x-circle');
    });

    /* ---------- Destination Chips ---------- */
    $('#addDestinationBtn').addEventListener('click', () => {
        const city = $('#city').value.trim();
        if (!city) {
            showToast('warn', 'Missing City', 'Please enter a destination city first.');
            return;
        }

        const chips = $('#destinationChips');
        const chip = document.createElement('div');
        chip.className = 'destination-chip';
        chip.innerHTML = `
    <i class="bi bi-geo-alt"></i>
    <span>${city}</span>
    <button type="button"><i class="bi bi-x"></i></button>
  `;
        chips.appendChild(chip);

        chip.querySelector('button').addEventListener('click', () => {
            chip.remove();
        });

        $('#city').value = '';
    });

    /* ---------- Itinerary Builder ---------- */
    let dayCount = 0;

    function addItineraryDay() {
        dayCount++;
        const list = $('#itineraryList');
        const day = document.createElement('div');
        day.className = 'itinerary-day open';
        day.innerHTML = `
    <div class="itinerary-day-head">
      <div class="itinerary-day-title">
        <div class="itinerary-day-num">${dayCount}</div>
        <div class="itinerary-day-name">Day ${dayCount}</div>
      </div>
      <div class="itinerary-day-actions">
        <button type="button" class="duplicate" title="Duplicate"><i class="bi bi-copy"></i></button>
        <button type="button" class="delete" title="Delete"><i class="bi bi-trash"></i></button>
      </div>
    </div>
    <div class="itinerary-day-body">
      <div class="form-row">
        <div class="form-group">
          <label>Day Title</label>
          <input type="text" class="form-input" placeholder="e.g., Arrival & Check-in" />
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-input" placeholder="e.g., Makkah" />
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" class="form-input" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-textarea" rows="3" placeholder="Describe activities for this day..."></textarea>
        </div>
      </div>
    </div>
  `;
        list.appendChild(day);

        // Toggle accordion
        day.querySelector('.itinerary-day-head').addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            day.classList.toggle('open');
        });

        // Duplicate
        day.querySelector('.duplicate').addEventListener('click', () => {
            addItineraryDay();
        });

        // Delete
        day.querySelector('.delete').addEventListener('click', () => {
            day.remove();
            renumberDays();
        });
    }

    function renumberDays() {
        $$('.itinerary-day').forEach((day, idx) => {
            const num = idx + 1;
            day.querySelector('.itinerary-day-num').textContent = num;
            day.querySelector('.itinerary-day-name').textContent = `Day ${num}`;
        });
        dayCount = $$('.itinerary-day').length;
    }

    $('#addDayBtn').addEventListener('click', addItineraryDay);

    // Add initial day
    addItineraryDay();

    /* ---------- FAQ Builder ---------- */
    function addFaq() {
        const list = $('#faqList');
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.innerHTML = `
    <div class="faq-item-head">
      <button type="button"><i class="bi bi-trash"></i></button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Question</label>
        <input type="text" class="form-input" placeholder="Enter question..." />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Answer</label>
        <textarea class="form-textarea" rows="3" placeholder="Enter answer..."></textarea>
      </div>
    </div>
  `;
        list.appendChild(item);

        item.querySelector('button').addEventListener('click', () => {
            item.remove();
        });
    }

    $('#addFaqBtn').addEventListener('click', addFaq);

    /* ---------- SEO Preview ---------- */
    $('#seoTitle').addEventListener('input', (e) => {
        $('#seoPreviewTitle').textContent = e.target.value || 'Package Title';
    });

    $('#urlSlug').addEventListener('input', (e) => {
        $('#seoPreviewSlug').textContent = e.target.value || 'package-slug';
    });

    $('#metaDescription').addEventListener('input', (e) => {
        $('#seoPreviewDesc').textContent = e.target.value || 'Package description will appear here...';
    });

    /* ---------- Validation ---------- */
    function validateField(inputId, errorId, message) {
        const input = $(`#${inputId}`);
        const error = $(`#${errorId}`);
        if (!input || !error) return true;

        if (!input.value.trim()) {
            input.classList.add('error');
            error.textContent = message;
            error.classList.add('show');
            return false;
        } else {
            input.classList.remove('error');
            error.classList.remove('show');
            return true;
        }
    }

    function validateForm() {
        let valid = true;

        valid = validateField('packageName', 'packageNameError', 'Package name is required') && valid;
        valid = validateField('packageType', 'packageTypeError', 'Package type is required') && valid;
        valid = validateField('country', 'countryError', 'Country is required') && valid;
        valid = validateField('city', 'cityError', 'City is required') && valid;
        valid = validateField('departureCity', 'departureCityError', 'Departure city is required') && valid;
        valid = validateField('startingPrice', 'startingPriceError', 'Starting price is required') && valid;

        if (!valid) {
            showToast('error', 'Validation Error', 'Please fix the errors before publishing.');
        }

        return valid;
    }

    /* ---------- Autosave ---------- */
    let saveTimeout;
    const autosaveIndicator = $('#autosaveIndicator');

    function autosave() {
        clearTimeout(saveTimeout);
        autosaveIndicator.classList.add('saving');
        autosaveIndicator.innerHTML = '<i class="bi bi-cloud-arrow-up"></i><span>Saving...</span>';

        saveTimeout = setTimeout(() => {
            autosaveIndicator.classList.remove('saving');
            autosaveIndicator.innerHTML = '<i class="bi bi-cloud-check"></i><span>All changes saved</span>';
        }, 1000);
    }

    $$('.form-input, .form-select, .form-textarea').forEach(el => {
        el.addEventListener('input', autosave);
        el.addEventListener('change', autosave);
    });

    /* ---------- Publish Modal ---------- */
    const publishModal = $('#publishModal');
    const publishBtn = $('#publishBtn');
    const publishCancel = $('#publishCancel');
    const publishConfirm = $('#publishConfirm');

    function openPublishModal() {
        if (!validateForm()) return;
        publishModal.classList.add('open');
    }

    function closePublishModal() {
        publishModal.classList.remove('open');
    }

    publishBtn.addEventListener('click', openPublishModal);
    $('#bottomPublish').addEventListener('click', openPublishModal);
    publishCancel.addEventListener('click', closePublishModal);
    publishConfirm.addEventListener('click', () => {
        closePublishModal();
        showToast('success', 'Package Published', 'Your package is now live!');
        setTimeout(() => {
            window.location.href = 'packages.html';
        }, 1500);
    });

    publishModal.addEventListener('click', (e) => {
        if (e.target === publishModal || e.target.classList.contains('add-pkg-modal-overlay')) {
            closePublishModal();
        }
    });

    /* ---------- Save Draft ---------- */
    $('#saveDraftBtn').addEventListener('click', () => {
        autosave();
        showToast('success', 'Draft Saved', 'Your package has been saved as draft.');
    });

    $('#bottomSaveDraft').addEventListener('click', () => {
        autosave();
        showToast('success', 'Draft Saved', 'Your package has been saved as draft.');
    });

    /* ---------- Preview ---------- */
    $('#previewBtn').addEventListener('click', () => {
        showToast('info', 'Preview Mode', 'Opening package preview...');
    });

    $('#bottomPreview').addEventListener('click', () => {
        showToast('info', 'Preview Mode', 'Opening package preview...');
    });

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
    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0;font-size:14px;" aria-label="Close"><i class="bi bi-x"></i></button>
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

    /* ---------- Reveal Animation ---------- */
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e, idx) => {
                if (e.isIntersecting) {
                    setTimeout(() => e.target.classList.add('in'), idx * 60);
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.05 });
        $$('.add-pkg-content .reveal').forEach(el => io.observe(el));
    } else {
        $$('.add-pkg-content .reveal').forEach(el => el.classList.add('in'));
    }

    /* ---------- Initial Setup ---------- */
    updateCompletion();
    calculateFinalPrice();

})();