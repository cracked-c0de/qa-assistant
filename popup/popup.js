// popup.js
const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const highlightToggle = document.getElementById("highlightToggle");
const osSelect = document.getElementById("os-select");
const clearCookiesBtn = document.getElementById("clear-cookies-btn");
// 🔥 НОВЫЕ ЭЛЕМЕНТЫ ДЛЯ CUSTOM OS
const customOsInput = document.getElementById("custom-os-input");
const useCustomBtn = document.getElementById("use-custom-btn");


/* ===== INIT STATE ===== */

chrome.storage.local.get(["enabled", "highlight", "qa_os_version"], (res) => {
    const overlayEnabled = !!res.enabled;
    const highlightEnabled = !!res.highlight;
    // Используем сохраненную версию, или 'Unknown' как запасной вариант
    const osVersion = res.qa_os_version || 'Unknown';

    // Overlay
    if (toggle) toggle.checked = overlayEnabled;
    if (status) status.textContent = overlayEnabled ? "Enabled" : "Disabled";

    // Highlight
    if (highlightToggle) {
        highlightToggle.checked = highlightEnabled;
        highlightToggle.disabled = !overlayEnabled;
    }

    // 🔥 OS Select & Custom Input: 
    if (osSelect) {
        // Проверяем, есть ли сохраненное значение в списке <option>
        const isStandardOption = [...osSelect.options].map(o => o.value).includes(osVersion);

        if (isStandardOption) {
            osSelect.value = osVersion;
        } else {
            // Если это пользовательское значение, устанавливаем select на 'Unknown' 
            // и заполняем поле custom input.
            osSelect.value = 'Unknown';
            if (customOsInput) customOsInput.value = osVersion;
            // Кнопка "Use" по умолчанию отключена, если значение уже используется
            if (useCustomBtn) useCustomBtn.disabled = true;
        }
    }


    // 🔥 ВАЖНО: синхронизируем highlight при открытии popup
    if (overlayEnabled && highlightEnabled) {
        sendHighlightState(true);
    }
});


/* ===== OVERLAY TOGGLE ===== */

toggle?.addEventListener("change", () => {
    const enabled = toggle.checked;

    if (status) status.textContent = enabled ? "Enabled" : "Disabled";

    // если overlay выключили — выключаем highlight
    if (!enabled) {
        chrome.storage.local.set({ highlight: false });

        if (highlightToggle) {
            highlightToggle.checked = false;
            highlightToggle.disabled = true;
        }

        sendHighlightState(false);
    } else {
        if (highlightToggle) {
            highlightToggle.disabled = false;
        }

        // если highlight был включён ранее — восстанавливаем
        chrome.storage.local.get("highlight", ({ highlight }) => {
            if (highlight) sendHighlightState(true);
        });
    }

    chrome.runtime.sendMessage({
        type: "TOGGLE_OVERLAY",
        enabled
    });
});


/* ===== HIGHLIGHT TOGGLE ===== */

highlightToggle?.addEventListener("change", () => {
    const enabled = highlightToggle.checked;

    chrome.storage.local.set({ highlight: enabled });
    sendHighlightState(enabled);
});


/* ===== OS SELECT (Обновлено) ===== */

osSelect?.addEventListener("change", () => {
    const newOS = osSelect.value;

    // Если выбрали стандартное значение, очищаем поле custom input
    if (newOS !== 'Unknown') {
        if (customOsInput) customOsInput.value = '';
        if (useCustomBtn) useCustomBtn.disabled = true;
    }

    // Сохраняем выбор и отправляем
    saveAndSendOS(newOS);
});


/* ===== CUSTOM OS INPUT LOGIC ===== */

customOsInput?.addEventListener("input", () => {
    // Активируем кнопку "Use", если есть текст и это отличается от текущего
    const isReadyToUse = customOsInput.value.trim().length > 0;

    if (useCustomBtn) {
        useCustomBtn.disabled = !isReadyToUse;
    }
});

useCustomBtn?.addEventListener("click", () => {
    const customValue = customOsInput.value.trim();
    if (customValue) {
        // Устанавливаем select в "Unknown", чтобы визуально показать, что выбрано кастомное значение
        if (osSelect) osSelect.value = 'Unknown';

        // Сохраняем пользовательское значение
        saveAndSendOS(customValue);
        useCustomBtn.disabled = true;
    }
});


/* ===== CLEAR COOKIES LOGIC ===== */

clearCookiesBtn?.addEventListener("click", () => {
    // 1. Блокируем кнопку, чтобы избежать повторных нажатий
    clearCookiesBtn.disabled = true;
    clearCookiesBtn.textContent = "Clearing...";

    // 2. Отправляем сообщение в background-скрипт
    chrome.runtime.sendMessage({ type: "CLEAR_COOKIES" }, (response) => {

        // 3. Обрабатываем ответ
        if (chrome.runtime.lastError || !response || !response.success) {
            clearCookiesBtn.textContent = "Error!";
            setTimeout(() => {
                clearCookiesBtn.textContent = "Clear Cookies & Local Storage";
                clearCookiesBtn.disabled = false;
            }, 2000);
        } else {
            // Успех
            clearCookiesBtn.textContent = `Cleared ${response.count} item(s)!`;
            // Перезагрузка страницы
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    // Используем .reload() для текущей вкладки
                    chrome.tabs.reload(tabs[0].id);
                }
            });
            // Закрываем Popup
            setTimeout(() => {
                window.close();
            }, 1000);
        }
    });
});


/* ===== HELPERS ===== */

// Хелпер: Сохраняет и отправляет версию ОС
function saveAndSendOS(newOS) {
    // Сохраняем выбор в хранилище
    chrome.storage.local.set({ 'qa_os_version': newOS });

    // Отправляем сообщение контент-скрипту для немедленного обновления оверлея
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id && tabs[0].url?.startsWith("http")) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "UPDATE_OS",
                osVersion: newOS
            }).catch(() => {
                // Игнорируем ошибку, если content script не запущен
            });
        }
    });
}

// Хелпер: Отправляет состояние Highlight Mode в content script
function sendHighlightState(enabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id && tab.url?.startsWith("http")) {
            chrome.tabs
                .sendMessage(tab.id, {
                    type: "HIGHLIGHT_MODE",
                    enabled
                })
                .catch(() => { });
        }
    });
}