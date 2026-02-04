/* -----------------------------
    SELECTORS
----------------------------- */
const fontCdn = document.getElementById('fontCdn');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const preview = document.getElementById('previewText');
const useCustomSelector = document.getElementById('useCustomSelector');
const customSelectorInput = document.getElementById('customSelector');
const refreshTabsBtn = document.getElementById('refreshTabs');

// Теперь работаем со скрытыми инпутами кастомных дропдаунов
const targetTabInput = document.getElementById('targetTabValue');
const targetSelectorInput = document.getElementById('targetSelectorValue');

/* -----------------------------
    TOAST
----------------------------- */

let activeToast = null;

function showToast(message, type = 'error', duration = 2200) {
    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // force reflow
    requestAnimationFrame(() => toast.classList.add('show'));

    activeToast = toast;

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (activeToast === toast) activeToast = null;
        }, 250);
    }, duration);
}


/* -----------------------------
    DROPDOWN LOGIC
----------------------------- */

// Универсальная функция инициализации дропдауна
function initDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const trigger = dropdown.querySelector('.dropdown-trigger');
    const selectedText = dropdown.querySelector('.selected-text');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');

    // Используем делегирование на контейнер опций
    const optionsContainer = dropdown.querySelector('.dropdown-options');

    // 1. Обработка клика по триггеру (открытие/закрытие)
    trigger.onclick = (e) => {
        e.stopPropagation();
        // Закрываем остальные
        document.querySelectorAll('.custom-dropdown').forEach(other => {
            if (other !== dropdown) other.classList.remove('open');
        });
        dropdown.classList.toggle('open');
    };

    // 2. Обработка выбора опции
    optionsContainer.onclick = (e) => {
        const option = e.target.closest('.option');
        if (!option) return;

        // Визуальное обновление активного элемента
        dropdown.querySelectorAll('.option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Установка значения в скрытый input
        const value = option.getAttribute('data-value');
        hiddenInput.value = value;

        // --- НАДЕЖНОЕ ПОЛУЧЕНИЕ ТЕКСТА ---
        // Клонируем ноду, чтобы не испортить оригинал
        const clone = option.cloneNode(true);
        const tagElement = clone.querySelector('.tag');
        if (tagElement) {
            tagElement.remove(); // Удаляем <span class="tag"> из клона
        }
        const cleanText = clone.textContent.trim(); // Оставшийся текст (напр. "Paragraph")

        selectedText.textContent = cleanText;
        // ---------------------------------

        dropdown.classList.remove('open');

        // Сразу обновляем превью, чтобы видеть результат
        if (typeof updatePreview === 'function') {
            updatePreview();
        }

        console.log(`Dropdown ${dropdownId} updated to:`, value);
    };
}

// Закрытие при клике вне
document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
});

/* -----------------------------
    GUIDE UI
----------------------------- */

let activeTooltip = null;

function showGuide(target, text) {
    hideGuide();

    const tip = document.createElement('div');
    tip.className = 'guide-tooltip';
    tip.innerHTML = text.trim();

    document.body.appendChild(tip);

    const rect = target.getBoundingClientRect();
    tip.style.top = `${rect.bottom + 6}px`;
    tip.style.left = `${rect.left}px`;

    activeTooltip = tip;
}

function hideGuide() {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }
}

document.querySelectorAll('.icon-help').forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = icon.dataset.guide;
        if (!key || !GUIDES[key]) return;

        showGuide(icon, GUIDES[key]);
    });
});

document.addEventListener('click', hideGuide);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideGuide();
});


/* -----------------------------
    TAB LIST (Chrome Extension API)
----------------------------- */

function loadTabs(done) {
    const tabOptionsContainer = document.querySelector('#tabDropdown .dropdown-options');
    const tabSelectedText = document.querySelector('#tabDropdown .selected-text');

    if (!chrome.tabs) {
        console.warn("Chrome Tabs API not available (not running as extension)");
        showToast("Chrome Tabs API not available (not running as extension)", "error");
        return;
    }

    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        tabOptionsContainer.innerHTML = '';

        tabs.forEach(tab => {
            if (!tab.id) return;

            const option = document.createElement('div');
            option.className = 'option';
            if (tab.active) option.classList.add('active');
            option.setAttribute('data-value', tab.id);

            const tag = tab.active ? 'ACT' : 'TAB';
            option.innerHTML = `<span class="tag">${tag}</span> ${tab.title}`;

            if (tab.active) {
                tabSelectedText.textContent = tab.title;
                targetTabInput.value = tab.id;
            }

            tabOptionsContainer.appendChild(option);
        });

        initDropdown('tabDropdown');

        if (typeof done === 'function') done();
    });


    if (refreshTabsBtn) {
        refreshTabsBtn.addEventListener('click', () => {
            refreshTabsBtn.classList.add('spinning');

            // запоминаем текущий выбранный tabId
            const prevTabId = targetTabInput.value;

            loadTabs(() => {
                // если вкладка ещё существует — восстанавливаем выбор
                const existing = document.querySelector(
                    `#tabDropdown .option[data-value="${prevTabId}"]`
                );

                if (existing) {
                    existing.click();
                }

                refreshTabsBtn.classList.remove('spinning');
            });
        });
    }
}

/* -----------------------------
    FONT HELPERS
----------------------------- */

function loadFont(cdn) {
    if (!cdn || document.querySelector(`link[href="${cdn}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cdn;
    document.head.appendChild(link);
}

function extractFontFamily(cdn) {
    const match = cdn.match(/family=([^:&]+)/);
    return match ? decodeURIComponent(match[1]).replace(/\+/g, ' ') : null;
}

function updatePreview() {
    const family = extractFontFamily(fontCdn.value);
    if (family) {
        loadFont(fontCdn.value);
        preview.style.fontFamily = `'${family}', sans-serif`;
    }
    preview.style.fontSize = `${fontSize.value}px`;
    preview.style.color = fontColor.value;

    // Обновляем HEX текст рядом с пикером
    document.querySelector('.color-hex').textContent = fontColor.value.toUpperCase();
}

/* -----------------------------
    APPLY STYLES
----------------------------- */

const targetDropdown = document.getElementById('targetDropdown');

useCustomSelector.addEventListener('change', () => {
    const enabled = useCustomSelector.checked;

    // input
    customSelectorInput.disabled = !enabled;
    customSelectorInput.classList.toggle('muted', !enabled);

    // 🔥 dropdown
    targetDropdown.classList.toggle('disabled', enabled);
});


function applyStyles() {
    const rawTabValue = targetTabInput.value;

    if (rawTabValue === 'all') {
        showToast('Apply to all tabs is not implemented yet', 'warning');
        return;
    }


    const tabId = Number(rawTabValue);

    let selector = targetSelectorInput.value; // По умолчанию из дропдауна

    if (useCustomSelector.checked) {
        selector = customSelectorInput.value.trim();
    }

    if (!selector) {
        showToast('CSS selector cannot be empty', 'error');
        return;
    }


    chrome.runtime.sendMessage({
        type: 'SET_STYLE_RULES',
        tabId,
        selector,
        rules: {
            cdn: fontCdn.value,
            size: fontSize.value,
            color: fontColor.value
        }
    });
    showToast('Style rules applied', 'success');
}

/* -----------------------------
    GUIDE
----------------------------- */

const GUIDES = {
    'target-tab': `
Select the browser tab where styles will be applied.
Use refresh if you opened a new page.
    `,
    'target-element': `
Choose which HTML elements will be styled.
Example: H1, paragraphs, links.
    `,
    'custom-selector': `
Enable to apply styles using any CSS selector.
You can paste selectors copied from Highlight mode.
    `,
    'font-properties': `
Load custom fonts via Google Fonts CDN,
change text size and color.
    `,
    'preview': `
Live preview shows how styles will look
before applying them to the page.
    `
};


/* -----------------------------
    INIT
----------------------------- */

// Инициализируем дропдаун элементов (он статичен в HTML)
initDropdown('targetDropdown');

// Загружаем вкладки и инициализируем их дропдаун
loadTabs();
updatePreview();

fontCdn.addEventListener('input', updatePreview);
fontSize.addEventListener('input', updatePreview);
fontColor.addEventListener('input', updatePreview);

document.getElementById('applyStyles').addEventListener('click', applyStyles);