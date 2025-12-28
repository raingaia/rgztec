/**
 * RGZ Premium Seller Hub - Advanced Preview & Sync Version
 * Etsy UI + Amazon Specs + Python Intelligence
 */
import RGZ_Intelligence from './intelligence.js';

const SellerHub = {
    db: null,

    async render(containerId, db) {
        this.db = db;
        const outlet = document.getElementById(containerId);
        
        outlet.innerHTML = `
            <div class="rgz-app-frame animate-fade-in">
                <aside class="rgz-sidebar-premium">
                    <div class="logo-area">RGZ<span>NEXT</span></div>
                    <nav>
                        <button onclick="SellerHub.switchTab('intel')" id="tab-intel">🧠 AI Insights</button>
                        <button onclick="SellerHub.switchTab('inventory')" id="tab-inventory" class="active">🔌 Hardware & Code</button>
                        <button onclick="SellerHub.switchTab('finance')" id="tab-finance">💰 Payouts</button>
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
                    <div class="modal-body-split">
                        <form id="asset-form" class="modal-form">
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
                                <button type="button" class="btn-ghost" onclick="SellerHub.closeModal()">Cancel</button>
                                <button type="submit" class="btn-primary-rgz">Verify & Deploy</button>
                            </div>
                        </form>

                        <div class="live-preview-section">
                            <label>Storefront Preview</label>
                            <div id="live-preview-pane">
                                <div class="preview-placeholder">Enter details to see preview...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.updateFormFields();
        this.setupEventListeners(); // Önizleme dinleyicilerini başlat
        this.switchTab('inventory');
    },

    updateFormFields() {
        const type = document.getElementById('asset-type').value;
        const area = document.getElementById('fields-area');
        
        if(type === 'hardware') {
            area.innerHTML = `
                <div class="input-wrap"><label>Product Title</label><input type="text" id="p-title" placeholder="e.g. RGZ Sensor V2" required></div>
                <div class="grid-2">
                    <div class="input-wrap"><label>Voltage</label><input type="number" id="p-volt" placeholder="5V"></div>
                    <div class="input-wrap"><label>Interface</label><input type="text" id="p-interface" placeholder="I2C/SPI"></div>
                </div>
                <div class="input-wrap"><label>Price ($)</label><input type="number" id="p-price" placeholder="29.99"></div>
                <div class="input-wrap"><label>Pinout URL</label><input type="url" id="p-image" placeholder="Image URL"></div>
            `;
        } else {
            area.innerHTML = `
                <div class="input-wrap"><label>Script Name</label><input type="text" id="p-title" placeholder="e.g. Neural Logic Engine" required></div>
                <div class="input-wrap"><label>Version</label><input type="text" id="p-version" placeholder="1.0.4"></div>
                <div class="input-wrap"><label>Price ($)</label><input type="number" id="p-price" placeholder="49.00"></div>
                <div class="input-wrap"><label>Source URL</label><input type="url" id="p-image" placeholder="Icon or Cover URL"></div>
            `;
        }
    },

    setupEventListeners() {
        const form = document.getElementById('asset-form');
        // Formdaki her tuş vuruşunda önizlemeyi güncelle
        form.addEventListener('input', () => {
            const data = {
                type: document.getElementById('asset-type').value,
                title: document.getElementById('p-title')?.value || 'New Asset',
                price: document.getElementById('p-price')?.value || '0.00',
                image: document.getElementById('p-image')?.value,
                volt: document.getElementById('p-volt')?.value,
                interface: document.getElementById('p-interface')?.value,
                version: document.getElementById('p-version')?.value
            };
            this.renderLivePreview(data);
        });
    },

    renderLivePreview(data) {
        const pane = document.getElementById('live-preview-pane');
        const isHardware = data.type === 'hardware';

        pane.innerHTML = `
            <div class="etsy-card-preview animate-slide-up">
                <div class="preview-img" style="background-image: url('${data.image || 'https://via.placeholder.com/300x200?text=RGZ+Preview'}')">
                    <span class="badge">${isHardware ? 'HARDWARE' : 'DIGITAL'}</span>
                </div>
                <div class="preview-body">
                    <h4>${data.title}</h4>
                    <div class="preview-specs">
                        ${isHardware ? `<span>${data.volt || '--'}V</span> • <span>${data.interface || '--'}</span>` : `<span>v${data.version || '1.0.0'}</span>`}
                    </div>
                    <div class="preview-price">$${data.price}</div>
                    <button class="preview-btn" disabled>Add to Cart</button>
                </div>
            </div>
        `;
    },

    async switchTab(tab) {
        const workspace = document.getElementById('dynamic-workspace');
        document.querySelectorAll('.rgz-sidebar-premium button').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        if(tab === 'intel') {
            workspace.innerHTML = `<div class="ai-card"><h3>AI Analysis</h3><canvas id="analysisChart"></canvas><p id="ai-status">Python Booting...</p></div>`;
            const analysis = await RGZ_Intelligence.runMarketAnalysis(this.db.products);
            document.getElementById('ai-status').innerText = `Forecast: ${analysis.status}`;
            RGZ_Intelligence.renderChart('analysisChart', analysis);
        } else if(tab === 'inventory') {
            workspace.innerHTML = `<div class="inventory-grid">${this.db.products.map(p => `<div class="mini-card">${p.name}</div>`).join('')}</div>`;
        }
    },

    openModal() { document.getElementById('asset-modal').style.display = 'flex'; },
    closeModal() { document.getElementById('asset-modal').style.display = 'none'; }
};
