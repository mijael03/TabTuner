document.addEventListener("DOMContentLoaded", () => {
    const volumeSlider = document.getElementById("volume-slider");
    const tabInfo = document.getElementById("tab-info");
    const tabList = document.getElementById("tab-list");

    // Obtener pestaña activa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            tabInfo.textContent = `Current Tab: ${activeTab.title.substring(0, 25)}...`;

            // Establecer valor inicial del slider desde storage (específico para esta pestaña)
            chrome.storage.local.get([`volume_${activeTab.id}`], (result) => {
                if (result[`volume_${activeTab.id}`] !== undefined) {
                    volumeSlider.value = result[`volume_${activeTab.id}`];
                }
            });

            // Configurar el evento de cambio de volumen
            volumeSlider.addEventListener("input", (event) => {
                const volume = parseFloat(event.target.value);

                // Enviar mensaje al background para que lo redirija a la pestaña correcta
                chrome.runtime.sendMessage({
                    action: "setVolume",
                    tabId: activeTab.id,
                    volume: volume
                }, (response) => {
                    if (response && !response.success) {
                        console.warn("No se pudo ajustar el volumen:", response.error);
                    }
                });
            });
        }
    });

    // Cargar y mostrar todas las pestañas con audio
    function loadAudioTabs() {
        tabList.innerHTML = "";

        chrome.tabs.query({ audible: true }, (tabs) => {
            if (tabs.length === 0) {
                tabList.innerHTML = "<p>No hay pestañas reproduciendo audio.</p>";
                return;
            }

            tabs.forEach(tab => {
                let tabItem = document.createElement("div");
                tabItem.className = "tab-item";
                if (tab.mutedInfo && tab.mutedInfo.muted) {
                    tabItem.classList.add("muted");
                }

                const tabTitle = tab.title.length > 25 ? tab.title.substring(0, 25) + "..." : tab.title;

                tabItem.innerHTML = `
                    <span>${tabTitle}</span>
                    <button class="mute-button" data-tab-id="${tab.id}">
                        ${(tab.mutedInfo && tab.mutedInfo.muted) ? "🔊" : "🔇"}
                    </button>
                `;
                tabList.appendChild(tabItem);
            });

            // Configurar botones de silencio
            document.querySelectorAll(".mute-button").forEach(button => {
                button.addEventListener("click", function () {
                    const tabId = parseInt(this.getAttribute("data-tab-id"));
                    const buttonEl = this;

                    chrome.runtime.sendMessage({
                        action: "toggleMute",
                        tabId: tabId
                    }, (response) => {
                        if (response && response.success) {
                            // Cambiar el icono de silencio basado en la respuesta
                            buttonEl.textContent = response.muted ? "🔊" : "🔇";
                            buttonEl.parentElement.classList.toggle("muted", response.muted);
                        }
                    });
                });
            });
        });
    }

    // Cargar pestañas con audio al inicio
    loadAudioTabs();

    // Actualizar la lista cada 2 segundos
    setInterval(loadAudioTabs, 2000);
});