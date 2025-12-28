import { DataEngine } from './engine.js';

export const StoreHandler = {
    /**
     * Sayfa yüklendiğinde veya dükkan değiştirildiğinde çağrılır.
     * @param {string} storeSlug - Mağazanın klasördeki adı (örn: 'hardware-lab')
     */
    async handleStoreRequest(storeSlug) {
        console.log(`[RGZ API] İstek alındı: ${storeSlug}`);

        // 1. Veriyi Motor (Engine) üzerinden çek ve işlet
        const processedData = await DataEngine.fetchStoreData(storeSlug);

        if (!processedItems || processedItems.length === 0) {
            this.showError("Üzgünüz, bu mağaza şu an bakımdadır.");
            return null;
        }

        // 2. Başarılıysa veriyi UI'ya gönder (Render işlemi)
        return {
            meta: {
                total: processedItems.length,
                generated_at: new Date().toLocaleTimeString()
            },
            items: processedItems
        };
    },

    /**
     * Hata durumunda UI'ya geri bildirim gönderir
     */
    showError(message) {
        const grid = document.getElementById('product-grid');
        if (grid) {
            grid.innerHTML = `<div class="api-error">${message}</div>`;
        }
    }
};
