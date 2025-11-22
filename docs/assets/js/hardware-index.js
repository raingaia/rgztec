// docs/assets/js/hardware-index.js

(function () {
  const GRID_ID = "hardwareCategories";
  const DATA_URL = "data/hardware.json"; // base href=/rgztec/ olduğu için => /rgztec/data/hardware.json

  async function loadHardwareCategories() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) {
      console.warn("[hardware-index] #hardwareCategories bulunamadı.");
      return;
    }

    try {
      // JSON'u çek
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("HTTP " + res.status + " " + res.statusText);
      }

      const data = await res.json();
      const categories = (data && data.categories) || [];

      // Boşsa info göster
      if (!categories.length) {
        grid.innerHTML =
          '<p style="font-size:14px;color:#64748b;">No hardware categories configured yet.</p>';
        return;
      }

      // Sıralama (order alanına göre)
      categories.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Mevcut içeriği temizle
      grid.innerHTML = "";

      // Her kategori için kart oluştur
      categories.forEach((cat) => {
        const slug = cat.slug || "";
        const name = cat.name || "";
        const desc =
          cat.description ||
          cat.tagline ||
          "Explore hardware in this category.";
        const hero = cat.heroImage || "";
        const color = cat.accentColor || "#f97316";

        // Kartın tamamı tıklanabilir olsun
        const card = document.createElement("a");
        card.className = "card";
        card.href = "hardware-category.html?slug=" + encodeURIComponent(slug);
        card.style.textDecoration = "none";
        card.style.color = "inherit";

        card.innerHTML = `
          <div class="media">
            ${
              hero
                ? `<img src="${hero}" alt="${name}" loading="lazy" />`
                : ""
            }
          </div>
          <div class="pad">
            <div class="title">${name}</div>
            <p class="sub">${desc}</p>
            <div class="row">
              <span class="price" style="color:${color};">
                ${cat.shortName || "Category"}
              </span>
              <span class="btn">View category</span>
            </div>
          </div>
        `;

        grid.appendChild(card);
      });
    } catch (err) {
      console.error("[hardware-index] veri yüklenirken hata:", err);
      const grid = document.getElementById(GRID_ID);
      if (grid) {
        grid.innerHTML =
          '<p style="font-size:14px;color:#b91c1c;">Hardware categories could not be loaded. Check console log.</p>';
      }
    }
  }

  // DOM hazır olunca çalıştır
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHardwareCategories);
  } else {
    loadHardwareCategories();
  }
})();

