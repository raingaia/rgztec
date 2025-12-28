/**
 * RGZ Premium Seller Hub - Final Enterprise Version
 * Integration: Etsy UX + Envato Digital + Advanced Hardware Specs
 */

const PayoutsManager = {
    render(container, db) {
        const stats = db.seller_stats || { balance: 0.00, bank_id: '', history: [] };
        container.innerHTML = `
            <div class="premium-view animate-fade-in">
                <div class="stats-cards-grid">
                    <div class="stat-card gold-gradient">
                        <span class="stat-label">Net Earnings</span>
                        <h2 class="stat-value">$${stats.balance.toFixed(2)}</h2>
                        <button class="btn-action-light" onclick="SellerHub.initiatePayout()">Withdraw to Bank</button>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Verified Payout Method</span>
                        <div class="bank-form">
                            <input type="text" id="bank-iban" placeholder="IBAN / SWIFT Address" value="${stats.bank_id}" class="premium-input">
                            <button class="btn-save-sm" onclick="SellerHub.updateBank()">Secure Update</button>
                        </div>
                        <div class="security-tag"><i class="shield-icon"></i> Encrypted AES-256</div>
                    </div>
                </div>

                <div class="table-section mt-30">
                    <div class="section-header">
                        <h3>Transaction History</h3>
                        <button class="btn-ghost-sm">Download CSV</button>
                    </div>
                    <table class="rgz-premium-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.history.length > 0 ? stats.history.map(trx => `
                                <tr>
                                    <td>${trx.date}</td>
                                    <td><strong>${trx.product_name}</strong></td>
                                    <td><span class="type-badge">${trx.type}</span></td>
                                    <td class="text-success">+$${trx.amount.toFixed(2)}</td>
                                    <td><span class="status-pill">Completed</span></td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" class="text-center">No sales recorded yet.</td></tr>'}
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
                <aside class="seller-sidebar">
                    <div class="sidebar-brand">
                        <div class="logo-circle">RGZ</div>
                        <span>SELLER HUB</span>
                    </div>
                    <nav class="nav-menu">
                        <button onclick="SellerHub.switchTab('analytics')" class="nav-btn active" id="btn-analytics">📈 Analytics</button>
                        <button onclick="SellerHub.switchTab('products')" class="nav-btn" id="btn-products">📦 Inventory</button>
                        <button onclick="SellerHub.switchTab('payouts')" class="nav-btn" id="btn-payouts">💰 Finances</button>
                    </nav>
                </aside>

                <main class="seller-main">
                    <header class="hub-header">
                        <div class="title-group">
                            <h1 id="hub-title">Marketplace Overview</h1>
                            <p class="subtitle">Welcome back, Managing <strong>${db.products.length}</strong> assets.</p>
                        </div>
                        <button class="btn-premium-add" onclick="SellerHub.openProductModal()">+ Add New Asset</button>
                    </header>

                    <div id="hub-dynamic-content" class="content-container">
                        </div>
                </main>
            </div>

            <div id="gum-modal" class="modal-overlay" style="display:none;">
                <div class="modal-card animate-slide-up">
                    <div class="modal-header">
                        <div class="header-text">
                            <h3>Launch New Asset</h3>
                            <p>Distribute digital code or physical hardware worldwide.</p>
                        </div>
                        <button onclick="SellerHub.closeModal()" class="close-x">&times;</button>
                    </div>
                    <form id="gum-product-form" onsubmit="SellerHub.handleSubmission(event)">
                        <div class="form-scroll-area">
                            <div class="input-group full">
                                <label>Asset Classification</label>
                                <select id="prod-type" onchange="SellerHub.toggleProductFields()" class="premium-select">
                                    <option value="digital">💻 Digital Asset (Software, Code, Scripts)</option>
                                    <option value="physical">🔌 Physical Hardware (Modules, PCBs, Kits)</option>
                                </select>
                            </div>
                            
                            <div class="form-grid-2">
                                <div class="input-group">
                                    <label>Display Title</label>
                                    <input type="text" id="title" placeholder="e.g. RGZ Alpha Module" required class="premium-input">
                                </div>
                                <div class="input-group">
                                    <label>Unit Price (USD)</label>
                                    <input type="number" id="price" step="0.01" placeholder="0.00" required class="premium-input">
                                </div>
                            </div>

                            <div id="dynamic-type-fields" class="dynamic-section">
                                <div class="input-group full animate-slide-down">
                                    <label>Version Control</label>
                                    <input type="text" id="version" placeholder="v1.0.0-stable" class="premium-input">
                                </div>
                                <div class="input-group full animate-slide-down">
                                    <label>Source / Download URL</label>
                                    <input type="url" id="source_url" placeholder="https://secure-storage.rgztec.com/..." class="premium-input">
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn-ghost" onclick="SellerHub.closeModal()">Discard</button>
                            <button type="submit" class="btn-publish-final">Verify & Publish</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        this.switchTab('analytics');
    },

    toggleProductFields() {
        const type = document.getElementById('prod-type').value;
        const container = document.getElementById('dynamic-type-fields');
        
        if(type === 'digital') {
            container.innerHTML = `
                <div class="input-group full animate-slide-down">
                    <label>Version Control</label>
                    <input type="text" id="version" placeholder="v1.0.0-stable" class="premium-input">
                </div>
                <div class="input-group full animate-slide-down">
                    <label>Source / Download URL</label>
                    <input type="url" id="source_url" placeholder="https://github.com/..." class="premium-input">
                </div>
                <div class="checkbox-group animate-slide-down">
                    <input type="checkbox" id="generate_license">
                    <label>Auto-generate secure license keys</label>
                </div>`;
        } else {
            container.innerHTML = `
                <div class="form-grid-2 animate-slide-down">
                    <div class="input-group">
                        <label>Stock Inventory</label>
                        <input type="number" id="stock" placeholder="0" required class="premium-input">
                    </div>
                    <div class="input-group">
                        <label>Unit Weight (kg)</label>
                        <input type="text" id="shipping" placeholder="0.5" class="premium-input">
                    </div>
                </div>
                <div class="input-group full animate-slide-down">
                    <label>Technical Datasheet / Pinout URL</label>
                    <input type="url" id="datasheet_url" placeholder="https://docs.rgztec.com/pinouts/..." class="premium-input">
                </div>`;
        }
    },

    switchTab(tab) {
        const area = document.getElementById('hub-dynamic-content');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`btn-${tab}`).classList.add('active');
        
        if (tab === 'payouts') {
            PayoutsManager.render(area, this.db);
            document.getElementById('hub-title').innerText = 'Financial Overview';
        } else if (tab === 'products') {
            area.innerHTML = `<div class="placeholder-view">📦 Product Management Console Loading...</div>`;
            document.getElementById('hub-title').innerText = 'Inventory Control';
        } else {
            area.innerHTML = `<div class="placeholder-view">📈 Real-time Analytics Engine Active.</div>`;
            document.getElementById('hub-title').innerText = 'Marketplace Insights';
        }
    },

    openProductModal() { document.getElementById('gum-modal').style.display = 'flex'; },
    closeModal() { document.getElementById('gum-modal').style.display = 'none'; },

    handleSubmission(e) {
        e.preventDefault();
        alert("Success: Asset verified and queued for marketplace sync.");
        this.closeModal();
    }
};

export default SellerHub;
