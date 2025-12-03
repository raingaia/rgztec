window.renderSearchResultsOnHome = function(results, q) {
    const container = document.getElementById("home-search-results");

    let html = `
        <h2 class="section-title">Results for "${q}"</h2>
        <div class="results-grid">
    `;

    results.forEach(p => {
        html += `
            <div class="product-card">
                <img src="${p.image}" class="product-image">
                <div class="product-info">
                    <h3>${p.title}</h3>
                    <p>${p.tagline}</p>
                    <span>${p.store} → ${p.section}</span>
                </div>
            </div>
        `;
    });

    html += "</div>";

    container.innerHTML = html;
    container.style.display = "block";
};
