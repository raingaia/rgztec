/**
 * RGZ Premium Seller Hub - The "Everything" Version
 */
import RGZ_Intelligence from './intelligence.js';

const SellerHub = {
    db: null,

    async render(containerId, db) {
        this.db = db;
        const outlet = document.getElementById(containerId);
        
        outlet.innerHTML = `
            <div class="rgz-app-frame">
                <aside class="rgz-sidebar-premium">
                    <div class="logo-area">RGZ<span>NEXT</span></div>
                    <nav>
                        <button onclick="SellerHub.switchTab('intel')">🧠 AI Insights</button>
                        <button onclick="SellerHub.switchTab('inventory')" class="active">🔌 Hardware & Code</button>
                        <button onclick="SellerHub.switchTab('finance')">💰 Payouts</button>
                    </nav>
                </aside>

                <main class="rgz-main-content">
                    <header class="rgz-glass-header">
                        <h2 id="page-title">Inventory Command Center</h2>
                        <div class="header-actions">
                            <span class="status-indicator">● System Online</span>
                            <button class="btn-etsy" onclick="SellerHub.openModal()">+ New Asset</button>
                        </div>
                    </header>

                    <div id="dynamic-workspace" class="workspace-grid">
                        </div>
                </main>
            </div>

            <div id="asset-modal" class="modal-blur" style="display:none;">
                <div class="modal-content-premium">
                    <form id="asset-form">
                        <div class="form-header">
                            <h3>Asset Configuration</h3>
                            <select id="asset-type" onchange="SellerHub.updateFormFields()" class="type-picker">
                                <option value="hardware">Physical Hardware (Amazon+ Tech)</option>
                                <option value="code">Digital Code (Envato+ Style)</option>
                            </select>
                        </div>
                        
                        <div id="fields-area" class="fields-scroll">
                            </div>

                        <div class="form-footer">
                            <button type="button" onclick="SellerHub.closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary-rgz">Verify & Deploy</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        this.updateFormFields();
        this.switchTab('inventory');
    },

    updateFormFields() {
        const type = document.getElementById('asset-type').value;
        const area = document.getElementById('fields-area');
        
        if(type === 'hardware') {
            area.innerHTML = `
                <input type="text" placeholder="Product Title" required>
                <div class="grid-2">
                    <input type="number" placeholder="Voltage (V)">
                    <input type="text" placeholder="Interface (I2C/SPI)">
                </div>
                <input type="url" placeholder="Technical Pinout Image URL">
                <textarea placeholder="Datasheet Summary (JSON format supported)"></textarea>
            `;
        } else {
            area.innerHTML = `
                <input type="text" placeholder="Script Name" required>
                <input type="text" placeholder="Version (e.g. 2.1.0)">
                <input type="url" placeholder="Secure Repository URL">
                <div class="check-box">
                    <input type="checkbox"> <span>Encrypted License Key Generation</span>
                </div>
            `;
        }
    },

    async switchTab(tab) {
        const workspace = document.getElementById('dynamic-workspace');
        if(tab === 'intel') {
            workspace.innerHTML = `
                <div class="ai-card">
                    <h3>Python AI Sales Analysis</h3>
                    <canvas id="analysisChart"></canvas>
                    <p id="ai-status">Python Engine Booting...</p>
                </div>`;
            const analysis = await RGZ_Intelligence.runMarketAnalysis(this.db.products);
            document.getElementById('ai-status').innerText = `Forecast: ${analysis.status} | Prediction: $${analysis.forecast.toFixed(2)}`;
            RGZ_Intelligence.renderChart('analysisChart', analysis);
        } else if(tab === 'inventory') {
            // Envanter listesi Etsy kart yapısında gelecek
        }
    },

    openModal() { document.getElementById('asset-modal').style.display = 'flex'; },
    closeModal() { document.getElementById('asset-modal').style.display = 'none'; }
};
