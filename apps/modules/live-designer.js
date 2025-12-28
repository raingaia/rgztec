/**
 * RGZ Live Designer - Real-time Preview Engine
 * Satıcı ürünü girerken Etsy/Amazon hibrit kartını render eder.
 */
const RGZ_Designer = {
    updatePreview(formData) {
        const previewArea = document.getElementById('live-preview-pane');
        if (!previewArea) return;

        const isHardware = formData.type === 'hardware';
        
        previewArea.innerHTML = `
            <div class="etsy-preview-card animate-fade-in">
                <div class="preview-badge">${isHardware ? '🛠 Hardware' : '💻 Digital'}</div>
                <div class="preview-image-placeholder">
                    ${formData.image ? `<img src="${formData.image}">` : '<span>Image Preview</span>'}
                </div>
                <div class="preview-info">
                    <h4>${formData.title || 'Product Title'}</h4>
                    <p class="preview-price">$${formData.price || '0.00'}</p>
                    <div class="preview-meta">
                        ${isHardware ? 
                            `<span>⚡ ${formData.voltage || '--'}V</span> <span>🔗 ${formData.interface || '--'}</span>` :
                            `<span>📦 v${formData.version || '1.0.0'}</span>`
                        }
                    </div>
                    <button class="btn-preview-buy">Add to Cart</button>
                </div>
            </div>
        `;
    }
};

export default RGZ_Designer;
