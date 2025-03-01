console.log("content.js cargado correctamente.");

// Evitar duplicaciones y asegurar que el script solo se ejecuta una vez
if (!window.volumeControlInitialized) {
    window.volumeControlInitialized = true;

    // Variable para guardar el estado actual y el ID de la pestaña
    let state = {
        tabId: null,
        volume: 1.0,
        muted: false
    };

    // Obtener el ID de la pestaña actual
    chrome.runtime.sendMessage({ action: "getTabId" }, (response) => {
        if (response && response.tabId) {
            state.tabId = response.tabId;
            console.log(`Content script inicializado en pestaña ID: ${state.tabId}`);

            // Obtener el volumen guardado específico para esta pestaña
            chrome.storage.local.get([`volume_${state.tabId}`], (result) => {
                if (result[`volume_${state.tabId}`] !== undefined) {
                    state.volume = result[`volume_${state.tabId}`];
                    console.log(`Volumen recuperado para pestaña ${state.tabId}: ${state.volume}`);
                }

                // Una vez que tenemos el volumen, configurar los controles
                setupMediaControls();
            });

            // Obtener el estado de silencio de la pestaña
            chrome.tabs.get(state.tabId, (tab) => {
                if (tab && tab.mutedInfo) {
                    state.muted = tab.mutedInfo.muted;
                    console.log(`Estado de silencio recuperado: ${state.muted}`);
                }
            });
        }
    });

    // Función para encontrar y controlar elementos de audio/video
    function setupMediaControls() {
        // Obtener todos los elementos de audio/video en la página
        const mediaElements = [...document.querySelectorAll('video, audio')];

        if (mediaElements.length > 0) {
            console.log(`Se encontraron ${mediaElements.length} elementos multimedia en la página.`);

            // Aplicar volumen guardado a todos los elementos
            mediaElements.forEach(media => {
                media.volume = state.volume;
                media.muted = state.muted;
            });

            // Observar la adición de nuevos elementos de audio/video
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
                                node.volume = state.volume;
                                node.muted = state.muted;
                                console.log(`Nuevo elemento multimedia encontrado y configurado.`);
                            } else if (node.querySelectorAll) {
                                const mediaInNode = node.querySelectorAll('video, audio');
                                mediaInNode.forEach(media => {
                                    media.volume = state.volume;
                                    media.muted = state.muted;
                                    console.log(`Nuevo elemento multimedia encontrado dentro de un nodo y configurado.`);
                                });
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });
            return true;
        } else {
            console.log("No se encontraron elementos multimedia todavía.");
            return false;
        }
    }

    // Intentar configurar los controles después de que la página esté completamente cargada
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!setupMediaControls()) {
                console.log("No se encontraron elementos multimedia después de la carga completa.");
            }
        }, 1000); // Dar tiempo adicional después de que la página esté cargada
    });

    // Escuchar mensajes del popup/background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Mensaje recibido en content.js:", request);

        // Responder a pings para verificar que el script está activo
        if (request.ping) {
            sendResponse({ active: true });
            return true;
        }

        const mediaElements = document.querySelectorAll('video, audio');

        // Manejar cambios de volumen
        if (request.volume !== undefined) {
            state.volume = request.volume;

            // Guardar el volumen específico para esta pestaña
            if (state.tabId) {
                let storageData = {};
                storageData[`volume_${state.tabId}`] = request.volume;
                chrome.storage.local.set(storageData);
                console.log(`Volumen guardado para pestaña ${state.tabId}: ${request.volume}`);
            }

            // Aplicar a todos los elementos multimedia
            mediaElements.forEach(media => {
                media.volume = request.volume;
            });

            console.log("Volumen ajustado a", request.volume);
            sendResponse({ success: true, volume: request.volume });
            return true;
        }

        // Manejar cambios de mute
        if (request.mute !== undefined) {
            state.muted = request.mute;

            mediaElements.forEach(media => {
                media.muted = request.mute;
            });

            console.log("Mute cambiado a", request.mute);
            sendResponse({ success: true, muted: request.mute });
            return true;
        }

        return false;
    });
}