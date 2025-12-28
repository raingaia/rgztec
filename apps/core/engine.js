import SearchHub from './search-logic.js';
import SellerHub from '../modules/seller-hub.js';
import InventoryManager from '../modules/inventory.js';

const RGZ_AppEngine = {
    db: null,
    currentStoreID: null, // 87 mağazadan hangisindeyiz?

    async boot() {
        // URL'den veya subdomain'den mağaza ID'sini yakala (Örn: rgztec.com/store/87)
        const pathParts = window.location.pathname.split('/');
        this.currentStoreID = pathParts[pathParts.indexOf('store') + 1] || 'default';

        const localData = localStorage.getItem(`rgz_db_${this.currentStoreID}`);
        
        if (localData) {
            this.db = JSON.parse(localData);
        } else {
            // Tek bir JSON'dan 87 mağazanın verisini veya o mağazaya özel dosyayı çek
            const response = await fetch(`/apps/storage/master-data.json`);
            const allStores = await response.json();
            // Sadece bu mağazaya ait ürünleri filtrele
            this.db = {
                products: allStores.products.filter(p => p.storeId === this.currentStoreID),
                seller_stats: allStores.stats[this.currentStoreID] || { balance: 0 }
            };
        }

        // Merkezi Hub'ı başlat (Arama artık sadece bu mağazada çalışır)
        SearchHub.init(this.db.products);
        console.log(`RGZ SaaS: Store ${this.currentStoreID} is online.`);
    },

    sync(updatedProducts) {
        this.db.products = updatedProducts;
        localStorage.setItem(`rgz_db_${this.currentStoreID}`, JSON.stringify(this.db));
        SearchHub.init(this.db.products);
        this.navigate('admin');
    },

    navigate(view) {
        const root = 'rgz-app-root';
        if (view === 'admin') {
            SellerHub.render(root, this.db, (newP) => this.sync(newP));
        } else {
            // Katalog görünümünde merkezi Hub'dan veriyi al
            InventoryManager.renderList(root, SearchHub.getCatalog());
        }
    }
};

export default RGZ_AppEngine;
