/**
 * RGZ Advanced Dynamic Dashboard Manager
 * Full Data-Driven UI and CRUD Logic
 */
const DashboardManager = {
    formConfig: [
        { id: 'title', label: 'Product Title', type: 'text', placeholder: 'e.g. RGZ-Alpha Connector', required: true },
        { id: 'price', label: 'Price ($)', type: 'number', placeholder: '0.00', step: '0.01', required: true },
        { id: 'stock', label: 'Initial Stock', type: 'number', placeholder: 'Quantity', required: true },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Product details...', required: false }
    ],

    renderAdminPanel(containerId, db, onUpdate) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="admin-panel">
                ${this.renderHeader(db)}
                ${this.renderTable(db)}
            </div>

            <div id="rgz-modal" class="modal-overlay" style="display:none;">
                <div class="modal-content">
                    <h3 id="modal-title">Product Entry</h3>
                    <form id="product-form">
                        <input type="hidden" id="form-id">
                        <div id="dynamic-fields-container"></div>

                        <div class="field-group">
                            <label>Category</label>
                            <select id="form-category">
                                ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="DashboardManager.closeModal()">Cancel</button>
                            <button type="submit" class="btn-success">Confirm & Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        this.generateDynamicFields();
        this.bindEvents(db, onUpdate);
    },

    renderHeader(db) {
        const totalValue = db.products.reduce((acc, p) => acc + (p.price * p.stock), 0);
        return `
            <header class="panel-header">
                <div class="header-info">
                    <h2>Inventory Management</h2>
                    <div class="stats-mini">
                        <span><strong>Total Products:</strong> ${db.products.length}</span> | 
                        <span><strong>Market Value:</strong> $${totalValue.toFixed(2)}</span>
                    </div>
                </div>
                <button id="add-prod-btn" class="btn-success" onclick="DashboardManager.showAdd()">+ Add Product</button>
            </header>
        `;
    },

    renderTable(db) {
        return `
            <table class="rgz-admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${db.products.map(p => `
                        <tr>
                            <td><strong>${p.title}</strong></td>
                            <td><span class="badge">${p.category_id}</span></td>
                            <td class="${p.stock < 5 ? 'low-stock' : ''}">${p.stock}</td>
                            <td>$${p.price.toFixed(2)}</td>
                            <td>
                                <button class="btn-edit" onclick="window.rgzEdit('${p.id}')">Edit</button>
                                <button class="btn-del" onclick="window.rgzDelete('${p.id}')">Remove</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    generateDynamicFields() {
        const container = document.getElementById('dynamic-fields-container');
        if (!container) return;
        container.innerHTML = this.formConfig.map(field => `
            <div class="field-group">
                <label for="form-${field.id}">${field.label}</label>
                ${field.type === 'textarea' 
                    ? `<textarea id="form-${field.id}" placeholder="${field.placeholder}"></textarea>`
                    : `<input type="${field.type}" id="form-${field.id}" placeholder="${field.placeholder}" ${field.step ? `step="${field.step}"` : ''} ${field.required ? 'required' : ''}>`
                }
            </div>
        `).join('');
    },

    bindEvents(db, onUpdate) {
        // DELETE
        window.rgzDelete = (id) => {
            if(confirm("Are you sure?")) {
                const updated = db.products.filter(p => p.id !== id);
                onUpdate(updated);
            }
        };

        // EDIT (Trigger)
        window.rgzEdit = (id) => {
            const product = db.products.find(p => p.id === id);
            if(product) this.showEdit(product);
        };

        // SAVE (Submit)
        const form = document.getElementById('product-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const id = document.getElementById('form-id').value || 'p_' + Date.now();
                
                // Dinamik olarak tüm config alanlarını topla
                const productData = { id: id };
                this.formConfig.forEach(field => {
                    const val = document.getElementById(`form-${field.id}`).value;
                    productData[field.id] = field.type === 'number' ? parseFloat(val) : val;
                });
                productData.category_id = document.getElementById('form-category').value;
                productData.tags = productData.tags || ["synced"];

                let updatedProducts;
                const index = db.products.findIndex(p => p.id === id);
                if (index > -1) {
                    updatedProducts = [...db.products];
                    updatedProducts[index] = productData;
                } else {
                    updatedProducts = [...db.products, productData];
                }

                onUpdate(updatedProducts);
                this.closeModal();
            };
        }
    },

    showAdd() {
        document.getElementById('product-form').reset();
        document.getElementById('form-id').value = '';
        document.getElementById('modal-title').innerText = 'Add New Product';
        document.getElementById('rgz-modal').style.display = 'flex';
    },

    showEdit(product) {
        document.getElementById('modal-title').innerText = 'Edit Product';
        document.getElementById('form-id').value = product.id;
        this.formConfig.forEach(field => {
            const el = document.getElementById(`form-${field.id}`);
            if (el) el.value = product[field.id] || '';
        });
        document.getElementById('form-category').value = product.category_id;
        document.getElementById('rgz-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('rgz-modal').style.display = 'none';
    }
};

export default DashboardManager;
