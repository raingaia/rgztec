/**
 * RGZ Analytics Module
 * Powered by Chart.js for data visualization
 */
const AnalyticsManager = {
    charts: {},

    renderAnalytics(containerId, db) {
        const outlet = document.getElementById(containerId);
        if (!outlet) return;

        outlet.innerHTML = `
            <div class="analytics-container">
                <div class="chart-wrapper">
                    <canvas id="inventoryChart"></canvas>
                </div>
                <div class="chart-wrapper">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
        `;

        this.initCharts(db);
    },

    initCharts(db) {
        const ctxInv = document.getElementById('inventoryChart').getContext('2d');
        const ctxCat = document.getElementById('categoryChart').getContext('2d');

        // Inventory Stock Levels (Bar Chart)
        this.charts.inventory = new Chart(ctxInv, {
            type: 'bar',
            data: {
                labels: db.products.map(p => p.title),
                datasets: [{
                    label: 'Stock Levels',
                    data: db.products.map(p => p.stock),
                    backgroundColor: 'rgba(0, 123, 255, 0.6)',
                    borderColor: '#007bff',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Stock Status by Product' } } }
        });

        // Category Distribution (Doughnut Chart)
        const catCounts = db.categories.map(c => ({
            name: c.name,
            count: db.products.filter(p => p.category_id === c.id).length
        }));

        this.charts.category = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: catCounts.map(c => c.name),
                datasets: [{
                    data: catCounts.map(c => c.count),
                    backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
                }]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Product Distribution by Category' } } }
        });
    }
};

export default AnalyticsManager;
