let overlay = null;
let timer = null;

// Переменная для хранения версии ОС, выбранной пользователем в Popup
let selectedOsVersion = getInitialBrowserOS();

const icon = {
    globe: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20"/>
        </svg>
    `,
    browser: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="14" rx="2"/>
        <line x1="3" y1="8" x2="21" y2="8"/>
        </svg>
    `,
    screen: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        </svg>
    `,
    language: `
    <svg width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20"/>
    </svg>
    `,
    timer: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="6" x2="12" y2="12"/>
        <line x1="12" y1="12" x2="16" y2="14"/>
        </svg>
    `,
    calendar: `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
    `
};


/* ================= QA CONTEXT ================= */

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let version = "";

    if (ua.includes("Chrome")) {
        browser = "Chrome";
        version = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Firefox")) {
        browser = "Firefox";
        version = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
    }

    return { browser, version };
}

function getInitialBrowserOS() {
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows (Auto)";
    if (ua.includes("Mac OS")) return "macOS (Auto)";
    if (ua.includes("Linux")) return "Linux (Auto)";
    return "Unknown";
}

function getOSVersion() {
    return selectedOsVersion;
}


function getLoadTime() {
    const timing = performance.timing;
    if (!timing.loadEventEnd) return "N/A";
    return ((timing.loadEventEnd - timing.navigationStart) / 1000).toFixed(2);
}

function collectQAContext() {
    const now = new Date();
    const { browser, version } = getBrowserInfo();

    return {
        host: location.hostname,
        url: location.href,
        path: location.pathname,
        title: document.title,

        browser: `${browser} ${version}`.trim(),
        os: getOSVersion(),
        language: navigator.language,

        viewport: `${window.innerWidth}×${window.innerHeight}`,
        resolution: `${screen.width}×${screen.height}`,
        dpr: window.devicePixelRatio,

        loadTime: getLoadTime(),
        datetime: now.toLocaleString(),

        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        dnt: navigator.doNotTrack
    };
}


function formatQAContext(ctx) {
    return `
Date & Time: ${ctx.datetime}
URL: ${ctx.url}
Title: ${ctx.title}

Browser: ${ctx.browser}
OS: ${ctx.os}
Language: ${ctx.language}

Resolution: ${ctx.resolution}
Viewport: ${ctx.viewport}
DPR: ${ctx.dpr}

Page Load Time: ${ctx.loadTime}s
User-Agent: ${ctx.userAgent}
`.trim();
}


function copyToClipboard() {
    const text = formatQAContext(collectQAContext());
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("qa-copy-btn");
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = "Copy QA Context"), 1500);
    });
}

/* ================= OVERLAY ================= */

function handleScreenshotClick() {
    const btn = document.getElementById("qa-screenshot-btn");

    // 1. Устанавливаем статус "в процессе"
    btn.textContent = "Capturing...";
    btn.style.background = '#ffc107'; // Желтый цвет для ожидания

    // 2. Отправляем сообщение и ждем ответ (response) от background.js
    chrome.runtime.sendMessage({ type: "TAKE_SCREENSHOT" }, (response) => {

        const resetBtn = () => {
            btn.textContent = "Screenshot";
            btn.style.background = '#1e90ff';
        };

        if (chrome.runtime.lastError) {
            console.error("Screenshot message failed:", chrome.runtime.lastError);
            btn.textContent = "Error (Comms)!";
            btn.style.background = '#dc3545';
        }
        else if (response && response.success) {
            btn.textContent = "Saved!";
            btn.style.background = '#28a745'; // Зеленый цвет
        }
        else if (response && !response.success) {
            console.error("Screenshot failed:", response.reason);
            const reasonText = response.reason.split(':')[0];
            btn.textContent = `Error: ${reasonText.slice(0, 10)}...`;
            btn.style.background = '#dc3545'; // Красный цвет
        } else {
            btn.textContent = "Unknown Error";
            btn.style.background = '#dc3545';
        }

        setTimeout(resetBtn, 1500);
    });
}

function renderOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "qa-overlay";
    overlay.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 280px;
    background: rgba(15,15,15,0.95);
    color: #e5e5e5;
    font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
    font-size: 13px;
    border-radius: 12px;
    padding: 12px;
    z-index: 999999;
    box-shadow: 0 0 18px rgba(0,255,200,0.35);
  `;

    overlay.innerHTML = `
    <div style="font-weight:bold; margin-bottom:8px;">QA Context</div>
    <div id="qa-info"></div>

    <button id="qa-copy-btn" style="margin-top:10px;width:100%;padding:6px;border:none;border-radius:8px;cursor:pointer;background:#00c896;color:#000;font-weight:bold;">
      Copy QA Context
    </button>

    <button id="qa-screenshot-btn" style="margin-top:6px;width:100%;padding:6px;border:none;border-radius:8px;cursor:pointer;background:#1e90ff;color:#fff;font-weight:bold;">
      Screenshot
    </button>
  `;

    document.body.appendChild(overlay);

    document.getElementById("qa-copy-btn").addEventListener("click", copyToClipboard);
    document.getElementById("qa-screenshot-btn").addEventListener("click", handleScreenshotClick);

    updateOverlay();
    timer = setInterval(updateOverlay, 1000);
}

function updateOverlay() {
    if (!overlay) return;
    const c = collectQAContext();

    overlay.querySelector("#qa-info").innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;">
        ${icon.globe}
        <b>${c.host}</b>
    </div>

    <div style="opacity:.7;margin-left:20px">
        ${c.path}
    </div>

    <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
        ${icon.browser}
        ${c.browser} • ${c.os}
    </div>

    <div style="display:flex;align-items:center;gap:6px;">
        ${icon.screen}
        ${c.viewport} • DPR ${c.dpr}
    </div>

    <div style="display:flex;align-items:center;gap:6px;">
        ${icon.language}
        ${c.language}
    </div>

    <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
        ${icon.timer}
        Load Time: ${c.loadTime}s
    </div>

    <div style="display:flex;align-items:center;gap:6px;opacity:.7;">
        ${icon.calendar}
        ${c.datetime}
    </div>
`;
}


function removeOverlay() {
    clearInterval(timer);
    overlay?.remove();
    overlay = null;
}

/* ================= HIGHLIGHT MODE ================= */

let highlightEnabled = false;
let hoverBox = null;
let tooltip = null;

// фиксированные элементы
const lockedElements = new Map();

/* ===== HELPERS ===== */

function getCssSelector(el) {
    if (!el || el.nodeType !== 1) return "";

    // самый стабильный вариант для QA
    if (el.id) return `#${el.id}`;

    const path = [];
    while (el && el.nodeType === 1 && el !== document.body) {
        let selector = el.tagName.toLowerCase();

        if (el.classList.length) {
            selector += "." + [...el.classList].join(".");
        }

        path.unshift(selector);
        el = el.parentElement;
    }

    return path.join(" > ");
}

function findLockedTarget(el) {
    while (el && el !== document.body) {
        if (lockedElements.has(el)) return el;
        el = el.parentElement;
    }
    return null;
}


function createLockedTooltip(el) {
    const tip = document.createElement("div");
    tip.style.cssText = `
        position: fixed;
        background: #111;
        color: #0ff;
        font-size: 11px;
        font-family: monospace;
        padding: 6px 8px;
        border-radius: 6px;
        z-index: 1000001;
        max-width: 320px;
        pointer-events: none;
    `;

    tip.innerHTML = `
        <div><b>${el.tagName.toLowerCase()}</b></div>
        <div>CSS: ${getCssSelector(el)}</div>
        <div style="opacity:.6">Locked</div>
    `;

    document.body.appendChild(tip);
    return tip;
}


function createBox() {
    const box = document.createElement("div");
    box.style.cssText = `
        position: fixed;
        border: 2px solid #00ffcc;
        background: rgba(0,255,204,0.15);
        z-index: 999998;
        pointer-events: none;
    `;
    document.body.appendChild(box);
    return box;
}

function positionBox(el, box) {
    const rect = el.getBoundingClientRect();
    box.style.top = rect.top + "px";
    box.style.left = rect.left + "px";
    box.style.width = rect.width + "px";
    box.style.height = rect.height + "px";
}

function createTooltip() {
    // В отличие от hoverBox, tooltip может существовать
    if (tooltip) return;

    tooltip = document.createElement("div");
    tooltip.style.cssText = `
        position: fixed;
        background: #111;
        color: #0ff;
        font-size: 11px;
        font-family: monospace;
        padding: 6px 8px;
        border-radius: 6px;
        z-index: 1000001;
        pointer-events: none;
        max-width: 320px;
    `;
    document.body.appendChild(tooltip);
}


function preventScroll(e) {
    if (!highlightEnabled) return;
    if (lockedElements.size === 0) return;
    e.preventDefault();
}

/* ===== EVENTS ===== */

function onMouseMove(e) {
    if (!highlightEnabled) return;

    // 1. Игнорируем: оверлей и любые зафиксированные элементы
    const isOverLockedElement = findLockedTarget(e.target);
    if (overlay?.contains(e.target) || isOverLockedElement) {
        // Если мышь над зафиксированным или над оверлеем, скрываем hoverBox и tooltip
        hoverBox?.remove();
        hoverBox = null;
        tooltip?.remove();
        tooltip = null;
        return;
    }

    // 2. Если есть зафиксированные элементы, и мы не над ними,
    // мы должны ИГНОРИРОВАТЬ другие элементы (только разрешаем снятие лока).
    if (lockedElements.size > 0) return;


    // 3. Создаем box и tooltip, если они не существуют
    if (!hoverBox) {
        hoverBox = createBox();
    }
    if (!tooltip) {
        createTooltip();
    }

    // 4. Позиционируем
    positionBox(e.target, hoverBox);

    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.innerHTML = `
        <div><b>${e.target.tagName.toLowerCase()}</b></div>
        <div>CSS: ${getCssSelector(e.target)}</div>
        <div style="opacity:.6">Click to lock</div>
    `;
}

function onClick(e) {
    if (!highlightEnabled) return;
    if (overlay?.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    // 1. Проверяем, был ли клик по ЗАФИКСИРОВАННОМУ элементу или его потомку.
    const lockedTarget = findLockedTarget(e.target);
    if (lockedTarget) {
        // Если клик по зафиксированному элементу — удаляем фиксацию
        const { box, tooltip: tip } = lockedElements.get(lockedTarget);
        box.remove();
        tip.remove();
        lockedElements.delete(lockedTarget);

        // Очищаем hover-подсветку, чтобы избежать ее случайного появления
        hoverBox?.remove();
        hoverBox = null;
        tooltip?.remove();
        tooltip = null;

        return;
    }

    // 2. Если элемент уже зафиксирован (не должно происходить, но для надежности)
    if (lockedElements.has(e.target)) return;

    // 3. ФИКСАЦИЯ НОВОГО ЭЛЕМЕНТА

    // Убираем hover-подсветку
    hoverBox?.remove();
    hoverBox = null;
    tooltip?.remove();
    tooltip = null;

    const box = createBox();
    positionBox(e.target, box);

    const tip = createLockedTooltip(e.target);

    // позиционируем tooltip рядом с элементом
    const rect = e.target.getBoundingClientRect();
    tip.style.top = rect.bottom + 6 + "px";
    tip.style.left = rect.left + "px";

    // Сохраняем фиксацию
    lockedElements.set(e.target, { box, tooltip: tip });

    navigator.clipboard.writeText(getCssSelector(e.target));
}


/* ===== ENABLE / DISABLE ===== */

function enableHighlight() {
    if (highlightEnabled) return;

    highlightEnabled = true;

    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);

    document.addEventListener("wheel", preventScroll, { passive: false, capture: true });
    document.addEventListener("touchmove", preventScroll, { passive: false, capture: true });
}

function disableHighlight() {
    highlightEnabled = false;

    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);

    document.removeEventListener("wheel", preventScroll, true);
    document.removeEventListener("touchmove", preventScroll, true);

    hoverBox?.remove();
    tooltip?.remove();

    lockedElements.forEach(({ box, tooltip }) => {
        box.remove();
        tooltip.remove();
    });
    lockedElements.clear();

    hoverBox = null;
    tooltip = null;
}

function clearAllHighlights() {
    lockedElements.forEach(({ box, tooltip }) => {
        box.remove();
        tooltip.remove();
    });
    lockedElements.clear();

    hoverBox?.remove();
    hoverBox = null;
}

document.addEventListener("keydown", (e) => {

    const target = e.target;
    const tag = target.tagName;

    // 1. Игнорировать, если ввод текста:
    const isEditing = (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target.isContentEditable // Проверяет, редактируемый ли элемент
    );

    if (isEditing || e.isComposing) {
        return;
    }

    // 2. Игнорировать, если мы находимся внутри нашего собственного оверлея
    if (overlay?.contains(target)) {
        return;
    }

    // ----------------------------------------------------
    // Логика шорткатов с модификаторами
    // ----------------------------------------------------

    // ESC — clear highlights (без модификаторов)
    if (e.key === "Escape") {
        if (lockedElements.size > 0) {
            e.preventDefault();
            clearAllHighlights();
        }
        return;
    }

    // Проверяем наличие Alt И Shift
    const isCombination = e.altKey && e.shiftKey;

    if (isCombination) {

        const keyLower = e.key.toLowerCase();

        // H — toggle highlight: Alt + Shift + H
        if (keyLower === "h") {
            e.preventDefault();

            highlightEnabled ? disableHighlight() : enableHighlight();

            chrome.storage.local.set({ highlight: highlightEnabled });
            return;
        }

        // O — toggle overlay: Alt + Shift + O
        if (keyLower === "o") {
            e.preventDefault();

            const enabled = !overlay;
            enabled ? renderOverlay() : removeOverlay();

            chrome.storage.local.set({ enabled });
            return;
        }

        // C — copy QA context: Alt + Shift + C
        if (keyLower === "c") {
            e.preventDefault();
            copyToClipboard();
            return;
        }
    }
});


/* ================= MESSAGES & INIT ================= */

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "OVERLAY_STATE") msg.enabled ? renderOverlay() : removeOverlay();
    if (msg.type === "HIGHLIGHT_MODE") msg.enabled ? enableHighlight() : disableHighlight();

    // НОВЫЙ ОБРАБОТЧИК ДЛЯ ВЕРСИИ ОС ИЗ POPUP
    if (msg.type === "UPDATE_OS" && msg.osVersion) {
        selectedOsVersion = msg.osVersion;
        if (overlay) updateOverlay(); // Обновляем оверлей немедленно
    }

    // 🔥 НОВЫЙ ОБРАБОТЧИК ДЛЯ ОЧИСТКИ LOCAL STORAGE
    if (msg.type === "CLEAR_LOCAL_STORAGE") {
        try {
            // Очищаем Local Storage
            localStorage.clear();

            // Очищаем Session Storage
            sessionStorage.clear();

            console.log("[QA Assistant] Local and Session Storage cleared for this domain.");

        } catch (e) {
            console.error("[QA Assistant] Error clearing storage:", e);
        }
    }
});

// Инициализация при загрузке content-скрипта
chrome.storage.local.get(["enabled", "highlight", "qa_os_version"], (res) => {
    // 1. Загрузка состояния Overlay и Highlight
    if (res.enabled) renderOverlay();
    if (res.highlight) enableHighlight();

    // 2. Загрузка выбранной версии ОС
    if (res.qa_os_version && res.qa_os_version !== "Unknown") {
        selectedOsVersion = res.qa_os_version;
    }
    // Если оверлей уже включен, обновляем его, чтобы отобразить загруженную версию ОС
    if (overlay) updateOverlay();
});