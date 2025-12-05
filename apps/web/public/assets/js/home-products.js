(async function () {
  const container = document.querySelector("#home-products");
  if (!container) return;

  const BASE = "/rgztec/";
  const DATA_URL = BASE + "data/store.data.json";

  try {
    const res = await fetch(DATA_URL + "?v=" + Date.now());
    const data = await res.json();

    let products = [];

    // Bütün mağazalardaki ürünleri topla
    for (const storeKey in data) {
      const store = data[storeKey];
      if (!store.sections) continue;

      store.sections.forEach(section => {
        if (!section.products) return;
        section.products.forEach(p => {
          products.push({
            ...p,
            storeSlug: storeKey,
            sectionSlug: section.slug,
            storeTitle: store.title
          });
        });
      });
    }

    // Örnek: En yeni 30 ürün
    const latest = products
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      .slice(0, 30);

    // HTML üret
    container.innerHTML = latest.map(p => `
      <div class="home-product-card">
        <img src="/rgztec/${p.image}" class="home-product-img">

        <div class="home-product-info">
          <h3 class="home-product-title">${p.title}</h3>
          <p class="home-product-store">${p.storeTitle}</p>
          <a href="/rgztec/store/${p.storeSlug}/${p.sectionSlug}/?id=${p.id}"
             class="home-product-btn">View Product</a>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("HOME ürün yükleme hatası:", err);
  }
})();

