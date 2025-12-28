// apps/api/engine.js
import { API_CONFIG } from './config.js';

export const DataEngine = {
    // 90 mağazadan hangisi istenirse onu dinamik getirir
    async fetchStoreData(storeSlug) {
        try {
            const response = await fetch(`${API_CONFIG.store_paths}${storeSlug}.json`);
            const rawData = await response.json();
            return this.applyBusinessLogic(rawData);
        } catch (error) {
            console.error("API Error: Mağaza verisi yüklenemedi.", error);
            return null;
        }
    },

    // Veriyi ham halden "işlenmiş" hale getirir
    applyBusinessLogic(data) {
        return data.map(item => ({
            ...item,
            // Matematiksel işlemleri burada yapıyoruz, JSON'da yazı tutmuyoruz
            calculated_price: (item.price * (1 + API_CONFIG.vat_rate)).toFixed(2),
            is_available: item.stock > 0
        }));
    }
};
