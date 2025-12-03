// =======================================================
// AUTOCOMPLETE DROPDOWN
// =======================================================

const searchInput = document.querySelector(".search-input");
const resultsBox = document.createElement("div");

resultsBox.classList.add("autocomplete-box");
document.body.appendChild(resultsBox);

function positionAutocompleteBox() {
    const rect = searchInput.getBoundingClientRect();
    resultsBox.style.position = "absolute";
    resultsBox.style.top = rect.bottom + "px";
    resultsBox.style.left = rect.left + "px";
    resultsBox.style.width = rect.width + "px";
}
window.addEventListener("resize", positionAutocompleteBox);

searchInput.addEventListener("input", async () => {
    const q = searchInput.value;
    positionAutocompleteBox();

    if (q.length < 2) {
        resultsBox.style.display = "none";
        return;
    }

    const results = await RGZTEC_SEARCH.search(q);

    if (results.length === 0) {
        resultsBox.style.display = "none";
        return;
    }

    let html = "";
    results.slice(0, 8).forEach(r => {
        html += `
        <div class="ac-item" data-id="${r.id}">
            <img src="${r.image}" />
            <div>
                <strong>${r.title}</strong>
                <span>${r.store} → ${r.section}</span>
            </div>
        </div>`;
    });

    resultsBox.innerHTML = html;
    resultsBox.style.display = "block";
});

// Enter → tam arama sonuçlarını getir
searchInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const q = searchInput.value;
        const results = await RGZTEC_SEARCH.search(q);
        renderSearchResultsOnHome(results, q);
        resultsBox.style.display = "none";
    }
});

// Suggestion click → ürüne git
resultsBox.addEventListener("click", e => {
    const item = e.target.closest(".ac-item");
    if (!item) return;
});
