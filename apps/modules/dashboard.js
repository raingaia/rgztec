/**
 * RGZ Premium Dashboard Manager (Final Version)
 * Features: Dynamic Forms, Image Preview, Stock Progress, and Full CRUD
 */
const DashboardManager = {
    // 1. Premium Configuration: Add any field here to update the entire system
    formConfig: [
        { id: 'title', label: 'Product Name', type: 'text', placeholder: 'Enterprise Module X', required: true },
        { id: 'image', label: 'Image URL', type: 'url', placeholder: 'https://images.unsplash.com/...', required: false },
        { id: 'price', label: 'Unit Price ($)', type: 'number', placeholder: '0.00', step: '0.01', required: true },
        { id: 'stock', label: 'Inventory Count', type: 'number', placeholder: '100', required: true },
        { id: 'description', label: 'Product Description', type: 'textarea', placeholder: 'Describe the premium features...', required: false }
    ],

    renderAdminPanel(containerId, db, onUpdate) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="admin-panel premium-layout">
                ${this.renderHeader(db)}
                
                <div class="table-wrapper">
                    ${this.renderTable(db)}
                </div>
            </div>

            <div id="rgz-modal" class="modal-overlay" style="display:none;">
                <div class="modal-content premium-glass">
                    <div class="modal-header">
                        <h3 id="modal-title">Product Entry</h3>
                        <button class="close-x" onclick="DashboardManager.closeModal()">&times;</button>
                    </div>
                    
                    <form id="product-form">
                        <input type="hidden" id="form-id">
                        
                        <div id="dynamic-fields-container" class="form-grid">
                            </div>

                        <div class="field-group full-width">
                            <label>Global Category</label>
                            <select id="form-category">
                                ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn-cancel" onclick="DashboardManager.closeModal()">Discard</button>
                            <button type="submit" class="btn-premium">Confirm Changes</button>
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
                <div class="header-left">
                    <h1>Inventory Manager</h1>
                    <div class="stats-badge">
                        <span><strong>${db.products.length}</strong> Products</span>
                        <span class="divider">|</span>
                        <span><strong>$${totalValue.toLocaleString()}</strong> Total Assets</span>
                    </div>
                </div>
                <button class="btn-add-main" onclick="DashboardManager.showAdd()">+ New Product</button>
            </header>
        `;
    },

    renderTable(db) {
        return `
            <table class="rgz-admin-table">
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Details</th>
                        <th>Availability</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${db.products.map(p => {
                        const stockPercent = Math.min((p.stock / 100) * 100, 100);
                        return `
                        <tr>
                            <td class="td-img">
                                <img src="${p.image || 'https://via.placeholder.com/80'}" alt="thumb" class="prod-thumb">
                            </td>
                            <td>
                                <span class="title-text">${p.title}</span><br>
                                <span class="cat-text">${p.category_id}</span>
                            </td>
                            <td>
                                <div class="stock-flow">
                                    <div class="bar-bg"><div class="bar-fill" style="width: ${stockPercent}%"></div></div>
                                    <span class="stock-label ${p.stock < 10 ? 'urgent' : ''}">${p.stock} units</span>
                                </div>
                            </td>
                            <td class="price-text">$${p.price.toFixed(2)}</td>
                            <td>
                                <div class="btn-group">
                                    <button class="btn-icon-edit" onclick="window.rgzEdit('${p.id}')">✎</button>
                                    <button class="btn-icon-del" onclick="window.rgzDelete('${p.id}')">🗑</button>
                                </div>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        `;
    },

    generateDynamicFields() {
        const container = document.getElementById('dynamic-fields-container');
        if (!container) return;
        container.innerHTML = this.formConfig.map(field => `
            <div class="field-group ${field.type === 'textarea' ? 'full-width' : ''}">
                <label for="form-${field.id}">${field.label}</label>
                ${field.type === 'textarea' 
                    ? `<textarea id="form-${field.id}" placeholder="${field.placeholder}"></textarea>`
                    : `<input type="${field.type}" id="form-${field.id}" placeholder="${field.placeholder}" ${field.step ? `step="${field.step}"` : ''} ${field.required ? 'required' : ''}>`
                }
            </div>
        `).join('');
    },

    bindEvents(db, onUpdate) {
        window.rgzDelete = (id) => {
            if(confirm("Are you sure you want to remove this asset?")) {
                const updated = db.products.filter(p => p.id !== id);
                onUpdate(updated);
            }
        };

        window.rgzEdit = (id) => {
            const product = db.products.find(p => p.id === id);
            if(product) this.showEdit(product);
        };

        const form = document.getElementById('product-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const id = document.getElementById('form-id').value || 'p_' + Date.now();
                
                const productData = { id: id };
                this.formConfig.forEach(field => {
                    const el = document.getElementById(`form-${field.id}`);
                    productData[field.id] = field.type === 'number' ? parseFloat(el.value) : el.value;
                });
                productData.category_id = document.getElementById('form-category').value;

                let updatedProducts = [...db.products];
                const index = updatedProducts.findIndex(p => p.id === id);
                
                if (index > -1) updatedProducts[index] = productData;
                else updatedProducts.push(productData);

                onUpdate(updatedProducts);
                this.closeModal();
            };
        }
    },

    showAdd() {
        const form = document.getElementById('product-form');
        if(form) form.reset();
        document.getElementById('form-id').value = '';
        document.getElementById('modal-title').innerText = 'Add New Asset';
        document.getElementById('rgz-modal').style.display = 'flex';
    },

    showEdit(product) {
        document.getElementById('modal-title').innerText = 'Edit Asset Details';
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
