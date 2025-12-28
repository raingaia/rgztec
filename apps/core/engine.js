import { executeSearch } from './search-logic.js';
import DashboardManager from '../modules/dashboard.js';
import InventoryManager from '../modules/inventory.js';

const RGZ_AppEngine = {
    db: null,

    async boot() {
        try {
            const response = await fetch('/apps/storage/master-data.json');
            this.db = await response.json();
            console.info("RGZ Global Engine: Ready");
        } catch (e) {
            console.error("Boot Error:", e);
        }
    },

    // Smart Router: Decide what to show
    navigate(view) {
        const root = 'rgz-app-root';
        if (view === 'admin') {
            DashboardManager.renderAdminPanel(root, this.db);
        } else {
            InventoryManager.renderList(root, this.db.products);
        }
    },

    // Search and Refresh
    runSearch(query) {
        const results = executeSearch(query, this.db.products);
        InventoryManager.renderList('rgz-app-root', results);
    }
};

export default RGZ_AppEngine;
