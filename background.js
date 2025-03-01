// Detecta cuando una pestaña comienza a reproducir audio
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.audible !== undefined) {  // Solo ejecuta cuando 'audible' cambia
        if (changeInfo.audible) {
            console.log(`🔊 Audio detectado en: ${tab.url}`);
            injectContentScript(tabId);
        } else {
            console.log(`🔇 Pestaña silenciada: ${tab.url}`);
        }
    }
});

// También detecta si la pestaña activa está reproduciendo audio
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.audible) {
            console.log(`🎵 Audio en pestaña activa: ${tab.url}`);
            injectContentScript(tab.id);
        }
    });
});

// Función para inyectar el script
function injectContentScript(tabId) {
    console.log(`Verificando content.js en pestaña: ${tabId}`);

    // Verificar primero si podemos enviar un mensaje (el content script ya está activo)
    chrome.tabs.sendMessage(tabId, { ping: true }, response => {
        if (chrome.runtime.lastError) {
            // El content script no está activo, inyectarlo
            console.log(`Inyectando content.js en pestaña: ${tabId}`);
            chrome.scripting.executeScript({
                target: { tabId },
                files: ["content.js"]
            })
                .then(() => console.log(`✅ content.js inyectado en pestaña: ${tabId}`))
                .catch(err => console.warn("❌ Error al inyectar content.js:", err));
        } else {
            console.log("Content script ya está activo");
        }
    });
}

// Responder con el ID de la pestaña cuando content.js lo solicite
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getTabId") {
        sendResponse({ tabId: sender.tab.id });
        return true;
    }

    // Manejar cambios de volumen para pestañas específicas
    if (message.action === "setVolume" && message.tabId) {
        chrome.tabs.sendMessage(message.tabId, { volume: message.volume }, response => {
            sendResponse({ success: !!response });
        });
        return true; // Indica que vamos a responder de forma asíncrona
    }

    // Manejar silenciamiento de pestañas usando la API nativa
    if (message.action === "toggleMute" && message.tabId) {
        // Primero obtener el estado actual de silencio
        chrome.tabs.get(message.tabId, (tab) => {
            // Luego invertir el estado usando la API nativa
            chrome.tabs.update(message.tabId, { muted: !tab.mutedInfo.muted }, (updatedTab) => {
                sendResponse({
                    success: true,
                    muted: updatedTab.mutedInfo.muted
                });

                // Notificar al content script sobre el cambio
                chrome.tabs.sendMessage(message.tabId, {
                    mute: updatedTab.mutedInfo.muted
                }).catch(() => console.log("Content script no disponible para notificar"));
            });
        });
        return true; // Indica que responderemos de forma asíncrona
    }

    return false;
});