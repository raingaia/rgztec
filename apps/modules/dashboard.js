/**
 * RGZ Advanced Dashboard Manager
 * Full CRUD (Create, Read, Update, Delete) & View Switching
 */
const DashboardManager = {
    renderAdminPanel(containerId, db, onUpdate) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        // Header and Stats Section
        outlet.innerHTML = `
            <div class="admin-panel">
                <nav class="admin-nav">
                    <button class="nav-btn active" onclick="window.rgzView('admin')">📦 Inventory</button>
                    <button class="nav-btn" onclick="window.rgzView('analytics')">📊 Analytics</button>
                    <button class="nav-btn" onclick="window.rgzView('catalog')">🏠 Storefront</button>
                </nav>

                <header class="panel-header">
                    <div class="header-content">
                        <h2>Inventory Management</h2>
                        <p>Manage your global stock and pricing from one place.</p>
                    </div>
                    <button id="add-prod-btn" class="btn-success" onclick="DashboardManager.showAddModal()">+ Add New Product</button>
                </header>

                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="label">Total Products</span>
                        <span class="value">${db.products.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Inventory Value</span>
                        <span class="value">$${db.products.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)}</span>
                    </div>
                </div>

                <table class="rgz-admin-table">
                    <thead>
                        <tr>
                            <th>Product Details</th>
                            <th>Status</th>
                            <th>Stock</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-table-body">
                        ${db.products.map(p => `
                            <tr id="row-${p.id}">
                                <td>
                                    <strong>${p.title}</strong><br>
                                    <small class="text-muted">${p.category_id}</small>
                                </td>
                                <td>
                                    <span class="badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}">
                                        ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td class="${p.stock < 10 ? 'low-stock' : ''}">${p.stock} units</td>
                                <td><strong>$${p.price.toFixed(2)}</strong></td>
                                <td>
                                    <button class="btn-edit" onclick="window.rgzEdit('${p.id}')">Edit</button>
                                    <button class="btn-del" onclick="window.rgzDelete('${p.id}')">Remove</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div id="rgz-modal" class="modal-overlay" style="display:none;">
                <div class="modal-content">
                    <h3 id="modal-title">Add Product</h3>
                    <form id="product-form">
                        <input type="hidden" id="form-id">
                        <input type="text" id="form-title" placeholder="Product Title" required>
                        <input type="number" id="form-price" placeholder="Price ($)" step="0.01" required>
                        <input type="number" id="form-stock" placeholder="Stock Quantity" required>
                        <select id="form-category">
                            ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <div class="modal-actions">
                            <button type="button" onclick="DashboardManager.closeModal()">Cancel</button>
                            <button type="submit" class="btn-success">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        this.bindEvents(db, onUpdate);
    },

    bindEvents(db, onUpdate) {
        // Global delete handler
        window.rgzDelete = (id) => {
            if(confirm("Confirm deletion? This action cannot be undone.")) {
                const updated = db.products.filter(p => p.id !== id);
                onUpdate(updated);
            }
        };

        // Global edit handler (Open modal with data)
        window.rgzEdit = (id) => {
            const product = db.products.find(p => p.id === id);
            if(product) {
                document.getElementById('modal-title').innerText = 'Edit Product';
                document.getElementById('form-id').value = product.id;
                document.getElementById('form-title').value = product.title;
                document.getElementById('form-price').value = product.price;
                document.getElementById('form-stock').value = product.stock;
                document.getElementById('form-category').value = product.category_id;
                document.getElementById('rgz-modal').style.display = 'flex';
            }
        };

        // Form Submit Logic (Handle Add & Edit)
        const form = document.getElementById('product-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('form-id').value || 'p_' + Date.now();
            
            const productData = {
                id: id,
                title: document.getElementById('form-title').value,
                price: parseFloat(document.getElementById('form-price').value),
                stock: parseInt(document.getElementById('form-stock').value),
                category_id: document.getElementById('form-category').value,
                tags: ["new"] 
            };

            let updatedProducts;
            const existingIndex = db.products.findIndex(p => p.id === id);
            
            if (existingIndex > -1) {
                updatedProducts = [...db.products];
                updatedProducts[existingIndex] = productData;
            } else {
                updatedProducts = [...db.products, productData];
            }

            onUpdate(updatedProducts);
            this.closeModal();
        };
    },

    showAddModal() {
        document.getElementById('product-form').reset();
        document.getElementById('form-id').value = '';
        document.getElementById('modal-title').innerText = 'Add New Product';
        document.getElementById('rgz-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('rgz-modal').style.display = 'none';
    }
};

export default DashboardManager;
