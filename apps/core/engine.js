import { executeSearch } from './search-logic.js';
import DashboardManager from '../modules/dashboard.js';
import InventoryManager from '../modules/inventory.js';

const RGZ_AppEngine = {
    db: null,

    async boot() {
        // First, check local storage for user updates, else fetch master-data.json
        const localData = localStorage.getItem('rgz_db');
        if (localData) {
            this.db = JSON.parse(localData);
        } else {
            const response = await fetch('/apps/storage/master-data.json');
            this.db = await response.json();
        }
        console.log("RGZ System Initialized.");
    },

    save(updatedProducts) {
        this.db.products = updatedProducts;
        localStorage.setItem('rgz_db', JSON.stringify(this.db));
        this.navigate('admin'); // Refresh view
    },

    navigate(view) {
        const root = 'rgz-app-root';
        if (view === 'admin') {
            DashboardManager.renderAdminPanel(root, this.db, (newP) => this.save(newP));
        } else {
            InventoryManager.renderList(root, this.db.products);
        }
    }
};

export default RGZ_AppEngine;
