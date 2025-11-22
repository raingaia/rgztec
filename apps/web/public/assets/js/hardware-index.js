// docs/assets/js/hardware-index.js

(function () {
  const container = document.getElementById("hardwareCategories");
  if (!container) return;

  // JSON dosyan: docs/data/hardware-categories.json
  const DATA_URL = "data/hardware-categories.json?v=1";

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error("JSON yüklenemedi: " + res.status);
      return res.json();
    })
    .then(renderCategories)
    .catch((err) => {
      console.error(err);
      container.innerHTML =
        '<p style="color:#64748b;font-size:14px;">Hardware categories could not be loaded.</p>';
    });

  function renderCategories(categories) {
    if (!Array.isArray(categories)) return;

    const html = categories
      .map((cat) => {
        const slug = cat.slug || "";
        const name = cat.name || "Hardware category";
        const tagline =
          cat.tagline ||
          cat.description ||
          "Curated hardware for this domain.";
        const banner = cat.bannerImage || "assets/images/store/hardware-hero.webp";

        // JSON içindeki ürünler → pill için 1 tane seç
        let featured = null;
        if (Array.isArray(cat.products) && cat.products.length > 0) {
          featured =
            cat.products.find((p) => p.highlight) || cat.products[0];
        }

        const pillText =
          (featured && (featured.badges || []).join(" • ")) ||
          (featured && featured.name) ||
          "Curated selection";

        return `
          <a href="hardware-category.html?slug=${encodeURIComponent(
            slug
          )}" class="store-card">
            <div class="store-card-media">
              <img src="${banner}" alt="${name}">
              <span class="store-card-pill">${pillText}</span>
            </div>
            <div class="store-card-body">
              <h3>${name}</h3>
              <p>${tagline}</p>
              <div class="store-links">
                <span class="store-link">Open category →</span>
                ${
                  featured
                    ? `<span class="store-link store-link--muted">${featured.vendor || ""}</span>`
                    : ""
                }
              </div>
            </div>
          </a>
        `;
      })
      .join("");

    container.innerHTML = html;
  }
})();


