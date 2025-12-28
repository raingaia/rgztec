const DashboardManager = {
    renderAdminPanel(containerId, db, onUpdate) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="admin-panel">
                <header class="panel-header">
                    <h2>Inventory Management</h2>
                    <button id="add-prod-btn" class="btn-success">+ Add Product</button>
                </header>
                <div class="stats-bar">
                    <span>Total Products: ${db.products.length}</span>
                    <span>Total Value: $${db.products.reduce((acc, p) => acc + p.price, 0)}</span>
                </div>
                <table class="rgz-admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-table-body">
                        ${db.products.map(p => `
                            <tr>
                                <td><strong>${p.title}</strong></td>
                                <td class="${p.stock < 5 ? 'low-stock' : ''}">${p.stock}</td>
                                <td>$${p.price}</td>
                                <td>
                                    <button onclick="window.rgzEdit('${p.id}')">Edit</button>
                                    <button class="btn-del" onclick="window.rgzDelete('${p.id}')">Remove</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.bindEvents(db, onUpdate);
    },

    bindEvents(db, onUpdate) {
        window.rgzDelete = (id) => {
            if(confirm("Are you sure?")) {
                const updated = db.products.filter(p => p.id !== id);
                onUpdate(updated);
            }
        };
        // Add Product logic will trigger here
    }
};

export default DashboardManager;
