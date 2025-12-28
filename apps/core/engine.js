import SearchHub from './search-logic.js'; // Arama ve Katalog Merkezi
import DashboardManager from '../modules/dashboard.js';
import InventoryManager from '../modules/inventory.js';
import SellerHub from '../modules/seller-hub.js'; // Yeni SaaS Paneli

const RGZ_AppEngine = {
    db: null,

    /**
     * Boot: Veriyi yükle ve Merkezi Arama Hub'ını (SearchHub) başlat.
     */
    async boot() {
        const localData = localStorage.getItem('rgz_premium_db');
        if (localData) {
            this.db = JSON.parse(localData);
        } else {
            // Veri yolunu projene göre kontrol et (/data/ veya /storage/)
            const response = await fetch('/apps/storage/master-data.json');
            this.db = await response.json();
        }

        // --- KRİTİK EKLEME: Merkezi Veri Hub'ını İndeksle ---
        SearchHub.init(this.db.products);
        
        console.log("RGZ Core: Booted & Data Hub Indexed.");
    },

    /**
     * Sync: Yeni veriyi kaydet ve Arama Hub'ını anlık olarak tazele.
     */
    sync(updatedProducts) {
        this.db.products = updatedProducts;
        localStorage.setItem('rgz_premium_db', JSON.stringify(this.db));
        
        // Veri değiştiği anda Hub'ı yeniden indeksle ki aramalar güncel kalsın
        SearchHub.init(this.db.products);
        
        console.log("RGZ Sync: Local & Hub Updated.");
        this.navigate('admin'); 
    },

    /**
     * Navigate: Artık veriyi doğrudan db'den değil, merkezden (SearchHub) çeker.
     */
    navigate(view) {
        const root = 'rgz-app-root';
        
        if (view === 'admin') {
            // Admin paneli için tam DB objesini gönderiyoruz
            SellerHub.render(root, this.db, (newP) => this.sync(newP));
        } else {
            // Katalog görünümü: Veriyi merkezden (Hub) süzülmüş olarak al
            const catalogData = SearchHub.getCatalog(); 
            InventoryManager.renderList(root, catalogData);
        }
    }
};

export default RGZ_AppEngine;
