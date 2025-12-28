/**
 * RGZ API - Store Handler
 * Dağıtıcı ve İstek Yönetici
 */
import { DataEngine } from './engine.js';

export const StoreHandler = {
    /**
     * Aktif mağaza isteğini karşılar ve işlenmiş veriyi döner.
     * @param {string} storeSlug - Veri klasöründeki dosya adı.
     */
    async getStoreData(storeSlug) {
        console.log(`[API Handler] İstek İşleniyor: ${storeSlug}`);

        try {
            // 1. Motor üzerinden veriyi çek ve kuralları uygula
            const processedItems = await DataEngine.fetchStoreData(storeSlug);

            // 2. Veri boşsa veya dosya bulunamadıysa hata yönetimi yap
            if (!processedItems || processedItems.length === 0) {
                this.logError(`Mağaza verisi boş veya eksik: ${storeSlug}`);
                return { success: false, data: [], message: "Store not found or empty" };
            }

            // 3. Başarılı sonuç paketi (Meta verilerle birlikte)
            return {
                success: true,
                store: storeSlug,
                count: processedItems.length,
                results: processedItems,
                timestamp: Date.now()
            };

        } catch (error) {
            this.logError(`Handler Kritik Hatası: ${error.message}`);
            return { success: false, data: [], error: error.message };
        }
    },

    /**
     * Geliştirici konsolu için hata kaydı tutar.
     */
    logError(msg) {
        console.error(`%c[RGZ API ERROR]: ${msg}`, "color: white; background: red; padding: 4px; border-radius: 4px;");
    }
};
