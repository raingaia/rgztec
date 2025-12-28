/**
 * RGZ Admin Dashboard Module
 * Handles CRUD operations for products and categories
 */
const DashboardManager = {
    // Render the product management table
    renderAdminPanel(containerId, db) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="admin-header">
                <h2>Product Management</h2>
                <button onclick="DashboardManager.openAddModal()" class="btn-primary">Add New Product</button>
            </div>
            <table class="rgz-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${db.products.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.title}</td>
                            <td>$${p.price}</td>
                            <td>${p.stock}</td>
                            <td>
                                <button onclick="DashboardManager.editProduct('${p.id}')">Edit</button>
                                <button onclick="DashboardManager.deleteProduct('${p.id}')" class="text-danger">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    // Mock functions for logic (to be connected to a backend later)
    deleteProduct(id) {
        if(confirm(`Delete product ${id}?`)) {
            console.log(`Product ${id} marked for deletion.`);
            // Logic to update master-data.json goes here
        }
    }
};

export default DashboardManager;
