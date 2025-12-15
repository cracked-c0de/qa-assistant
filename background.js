// background.js

// ИНИЦИАЛИЗАЦИЯ (Устанавливает начальные значения при первой установке)
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["enabled", "highlight"], (res) => {
        chrome.storage.local.set({
            // Устанавливаем false по умолчанию, если значение не существует (?? false)
            enabled: res.enabled ?? false,
            highlight: res.highlight ?? false
        });
    });
});


// ОБРАБОТЧИК СООБЩЕНИЙ
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // Переключатель (switch) для обработки разных типов сообщений
    switch (message.type) {

        /* ================= TOGGLE OVERLAY ================= */
        case "TOGGLE_OVERLAY": {
            chrome.storage.local.set({ enabled: message.enabled });

            // Отправка состояния оверлея на все вкладки
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab.id && tab.url?.startsWith("http")) {

                        // 1. Управление оверлеем
                        chrome.tabs.sendMessage(tab.id, {
                            type: "OVERLAY_STATE",
                            enabled: message.enabled
                        }).catch(() => { });

                        // 2. 🔥 Если overlay выключили — выключаем highlight везде
                        if (!message.enabled) {
                            chrome.tabs.sendMessage(tab.id, {
                                type: "HIGHLIGHT_MODE",
                                enabled: false
                            }).catch(() => { });
                        }
                    }
                });
            });

            // 3. Сохраняем highlight = false, если overlay OFF
            if (!message.enabled) {
                chrome.storage.local.set({ highlight: false });
            }

            break;
        }

        /* ================= CLEAR COOKIES ================= */
        case "CLEAR_COOKIES": {

            // !!! Возвращаем true, чтобы указать Chrome, что ответ будет асинхронным

            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                const currentTab = tabs[0];

                if (!currentTab?.url || currentTab.url.startsWith("chrome://")) {
                    sendResponse({ success: false, reason: "Cannot clear data for this URL." });
                    return;
                }

                const url = currentTab.url;
                let clearedCount = 0;

                try {
                    // 1. Очистка Cookies
                    const cookies = await chrome.cookies.getAll({ url: url });
                    for (const cookie of cookies) {
                        await chrome.cookies.remove({ url: url, name: cookie.name });
                        clearedCount++;
                    }

                    // 2. Очистка Local Storage (отправляем сообщение content-скрипту)
                    // Content script сам очистит localStorage.
                    if (currentTab.id) {
                        // Мы не ждем ответа, так как страница все равно перезагрузится.
                        chrome.tabs.sendMessage(currentTab.id, {
                            type: "CLEAR_LOCAL_STORAGE"
                        }).catch(() => {
                            // Если content script не запущен, просто игнорируем
                        });
                        clearedCount += 1; // Считаем, что Local Storage очищен
                    }

                    // Отправляем ответ Popup-скрипту
                    sendResponse({ success: true, count: clearedCount });

                } catch (error) {
                    console.error("Cookie clearing failed:", error);
                    sendResponse({ success: false, reason: `Clearing failed: ${error.message}` });
                }
            });

            return true;
        }

        /* ================= SCREENSHOT ================= */
        case "TAKE_SCREENSHOT": {
            // !!! Возвращаем true, чтобы указать Chrome, что ответ будет асинхронным

            chrome.storage.local.get("enabled", ({ enabled }) => {
                if (!enabled) {
                    sendResponse({ success: false, reason: "Overlay disabled" });
                    return;
                }

                if (!sender.tab?.windowId || !sender.tab?.url) {
                    sendResponse({ success: false, reason: "Invalid tab context" });
                    return;
                }

                chrome.tabs.captureVisibleTab(
                    sender.tab.windowId,
                    { format: "png" },
                    (dataUrl) => {
                        if (chrome.runtime.lastError || !dataUrl) {
                            console.warn("Screenshot failed:", chrome.runtime.lastError);
                            sendResponse({ success: false, reason: chrome.runtime.lastError?.message || "Capture failed" });
                            return;
                        }

                        const now = new Date();
                        const ts = now.toISOString().replace(/[:.]/g, "-");
                        const hostname = new URL(sender.tab.url).hostname;

                        chrome.downloads.download({
                            url: dataUrl,
                            filename: `qa-${hostname}-${ts}.png`,
                            saveAs: false
                        }, () => {
                            if (chrome.runtime.lastError) {
                                sendResponse({ success: false, reason: chrome.runtime.lastError.message || "Download failed" });
                            } else {
                                sendResponse({ success: true });
                            }
                        });
                    }
                );
            });

            return true; // <-- Асинхронный ответ
        }

        default:
            // Если сообщение не требует асинхронного ответа, просто выходим
            break;
    }
});