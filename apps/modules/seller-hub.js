/**
 * RGZ Seller Hub (Gumroad Style)
 * Handles Digital Code & Physical Hardware Sales
 */
const SellerHub = {
    render(containerId, db, onUpdate) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="gumroad-container">
                <aside class="gum-sidebar">
                    <div class="brand">RGZ<span>TEC</span></div>
                    <nav>
                        <button onclick="SellerHub.switchTab('analytics')">📈 Analytics</button>
                        <button onclick="SellerHub.switchTab('products')">📦 Products</button>
                        <button onclick="SellerHub.switchTab('payouts')">💰 Payouts</button>
                    </nav>
                </aside>

                <main class="gum-main">
                    <header class="gum-header">
                        <h2 id="view-title">Dashboard Overview</h2>
                        <button class="btn-primary" onclick="SellerHub.openProductModal()">+ New Product</button>
                    </header>

                    <div id="gum-content-grid">
                        </div>
                </main>
            </div>

            <div id="gum-modal" class="modal-overlay" style="display:none;">
                <div class="modal-content gum-glass">
                    <h3>Create Digital or Physical Product</h3>
                    <form id="gum-product-form">
                        <select id="prod-type" onchange="SellerHub.toggleProductFields()">
                            <option value="digital">💻 Digital (Code, Script, Software)</option>
                            <option value="physical">🔌 Physical (Hardware, Parts, Kit)</option>
                        </select>
                        
                        <input type="text" id="title" placeholder="Product Name" required>
                        <input type="number" id="price" placeholder="Price ($)" required>
                        
                        <div id="dynamic-type-fields">
                            </div>

                        <div class="modal-actions">
                            <button type="button" onclick="SellerHub.closeModal()">Cancel</button>
                            <button type="submit" class="btn-publish">Publish to Store</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    toggleProductFields() {
        const type = document.getElementById('prod-type').value;
        const container = document.getElementById('dynamic-type-fields');
        
        if(type === 'digital') {
            container.innerHTML = `<input type="url" id="download_url" placeholder="Secure Download Link / GitHub Repo URL" required>`;
        } else {
            container.innerHTML = `
                <input type="number" id="stock" placeholder="Available Stock" required>
                <input type="text" id="shipping" placeholder="Shipping Dimensions (e.g. 10x10x5 cm)">
            `;
        }
    }
};
