const InventoryManager = {
    renderList(containerId, products) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = products.map(item => `
            <div class="rgz-card" data-id="${item.id}">
                <div class="card-header">
                    <h3>${item.title}</h3>
                    <span class="price">$${item.price}</span>
                </div>
                <div class="card-body">
                    <p>${item.description}</p>
                    <div class="tags">
                        ${item.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
};

export default InventoryManager;
