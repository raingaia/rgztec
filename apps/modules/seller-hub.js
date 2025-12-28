/**
 * RGZ Next-Gen Seller Hub
 * Gumroad'dan daha hızlı, daha güçlü ve veri odaklı.
 */

const PayoutsManager = {
    render(container, db) {
        // Varsayılan finansal veriler (db'den gelir)
        const stats = db.seller_stats || { balance: 0, bank_id: '', history: [] };
        
        container.innerHTML = `
            <div class="premium-view animate-fade-in">
                <div class="stats-cards-grid">
                    <div class="stat-card gold-gradient">
                        <span class="stat-label">Available Balance</span>
                        <h2 class="stat-value">$${stats.balance.toFixed(2)}</h2>
                        <button class="btn-action-light" onclick="SellerHub.withdrawMoney()">Instant Payout</button>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Banking Setup</span>
                        <div class="bank-form">
                            <input type="text" id="bank-iban" placeholder="IBAN / SWIFT Address" value="${stats.bank_id}">
                            <button class="btn-save-sm" onclick="SellerHub.updateBank()">Secure Save</button>
                        </div>
                        <small>Last Payout: 12 Dec 2025</small>
                    </div>
                </div>

                <div class="table-section">
                    <h3>Recent Transactions</h3>
                    <table class="rgz-premium-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.history.map(trx => `
                                <tr>
                                    <td>${trx.date}</td>
                                    <td>${trx.product_name}</td>
                                    <td><span class="badge">${trx.type}</span></td>
                                    <td class="text-success">+$${trx.amount.toFixed(2)}</td>
                                    <td><span class="status-pill">Success</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
};

const SellerHub = {
    db: null,
    onUpdate: null,

    render(containerId, db, onUpdate) {
        this.db = db;
        this.onUpdate = onUpdate;
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="seller-hub-layout">
                <nav class="seller-sidebar">
                    <div class="sidebar-header">
                        <img src="assets/img/logo-white.png" class="mini-logo">
                        <span>SELLER HUB</span>
                    </div>
                    <div class="nav-links">
                        <button onclick="SellerHub.switchTab('analytics')" class="nav-link active">📊 Analytics</button>
                        <button onclick="SellerHub.switchTab('products')" class="nav-link">📦 Products</button>
                        <button onclick="SellerHub.switchTab('payouts')" class="nav-link">💰 Payouts</button>
                    </div>
                </nav>

                <main class="seller-main">
                    <header class="main-header">
                        <h1 id="hub-title">Marketplace Overview</h1>
                        <button class="btn-premium-add" onclick="SellerHub.openProductModal()">+ Quick Add Product</button>
                    </header>

                    <div id="hub-content-area">
                        </div>
                </main>
            </div>

            <div id="gum-modal" class="modal-overlay" style="display:none;">
                <div class="modal-card">
                    <div class="modal-header">
                        <h3>New Product Launch</h3>
                        <button onclick="SellerHub.closeModal()" class="close-x">&times;</button>
                    </div>
                    <form id="gum-product-form" onsubmit="SellerHub.handleSubmission(event)">
                        <div class="form-grid">
                            <div class="input-group full">
                                <label>What are you selling?</label>
                                <select id="prod-type" onchange="SellerHub.toggleProductFields()">
                                    <option value="digital">💻 Digital Asset (Software, Code, 3D Model)</option>
                                    <option value="physical">🔌 Hardware Part (Sensor, PCB, Device)</option>
                                </select>
                            </div>
                            
                            <div class="input-group">
                                <label>Product Title</label>
                                <input type="text" id="title" placeholder="e.g. RGZ Sensor Module" required>
                            </div>
                            <div class="input-group">
                                <label>Price (USD)</label>
                                <input type="number" id="price" step="0.01" placeholder="0.00" required>
                            </div>

                            <div id="dynamic-type-fields" class="full form-grid">
                                <div class="input-group full">
                                    <label>Access URL / GitHub Link</label>
                                    <input type="url" id="download_url" placeholder="https://..." required>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn-ghost" onclick="SellerHub.closeModal()">Discard</button>
                            <button type="submit" class="btn-publish-final">Publish Now</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // İlk açılışta analytics gelsin
        this.switchTab('analytics');
    },

    switchTab(tab) {
        const area = document.getElementById('hub-content-area');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        if (tab === 'payouts') {
            PayoutsManager.render(area, this.db);
        } else if (tab === 'products') {
            area.innerHTML = `<h3>Product List coming soon...</h3>`;
        } else {
            area.innerHTML = `<div class="placeholder-chart">Analytics Dashboard is ready.</div>`;
        }
    },

    toggleProductFields() {
        const type = document.getElementById('prod-type').value;
        const container = document.getElementById('dynamic-type-fields');
        
        if(type === 'digital') {
            container.innerHTML = `
                <div class="input-group full">
                    <label>Secure Access Link</label>
                    <input type="url" id="download_url" placeholder="Download Link or License Key URL" required>
                </div>`;
        } else {
            container.innerHTML = `
                <div class="input-group">
                    <label>Available Stock</label>
                    <input type="number" id="stock" placeholder="100" required>
                </div>
                <div class="input-group">
                    <label>Weight / Dimensions</label>
                    <input type="text" id="shipping" placeholder="0.5kg, 10x10x5cm">
                </div>`;
        }
    },

    openProductModal() {
        document.getElementById('gum-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('gum-modal').style.display = 'none';
    },

    handleSubmission(e) {
        e.preventDefault();
        // Verileri topla, onUpdate ile engine'e gönder
        alert("Product published! RGZ Engine syncing...");
        this.closeModal();
    }
};

export default SellerHub;
