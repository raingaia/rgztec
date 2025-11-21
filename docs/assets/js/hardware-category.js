(function () {
  // 1) Hangi kategori sayfasındayız? (body data attribute'ten alıyoruz)
  const slug = document.body.dataset.hwSlug || "ai-accelerators";

  // 2) DOM referansları
  const titleEl   = document.querySelector('[data-hw="title"]');
  const taglineEl = document.querySelector('[data-hw="tagline"]');
  const bannerImg = document.querySelector('[data-hw="banner-image"]');
  const heroEl    = document.querySelector('[data-hw="hero"]');
  const gridEl    = document.querySelector('[data-hw="grid"]');
  const stateEl   = document.querySelector('[data-hw="state"]');

  if (!gridEl) {
    console.warn("HW: grid container bulunamadı.");
    return;
  }

  // 3) JSON'dan kategorileri çek
  fetch("data/hardware-categories.json", { cache: "no-cache" })
    .then(function (res) { return res.json(); })
    .then(function (categories) {
      const category = categories.find(function (c) { return c.slug === slug; });

      if (!category) {
        if (stateEl) stateEl.textContent = "Category not found.";
        console.error("HW: Category slug bulunamadı:", slug);
        return;
      }

      applyCategory(category);
    })
    .catch(function (err) {
      console.error("HW: JSON yüklenirken hata:", err);
      if (stateEl) stateEl.textContent = "Data yüklenemedi.";
    });

  // 4) Kategori verisini sayfaya bas
  function applyCategory(category) {
    document.title = "RGZTEC • Hardware Lab • " + category.name;

    if (titleEl)   titleEl.textContent   = category.name;
    if (taglineEl) taglineEl.textContent = category.tagline || "";

    if (bannerImg && category.bannerImage) {
      bannerImg.src = category.bannerImage;
      bannerImg.alt = category.name + " banner";
    }

    if (heroEl) {
      heroEl.style.setProperty(
        "--hw-accent",
        category.accentColor || "#f97316"
      );
    }

    // Ürün grid'ini temizle
    gridEl.innerHTML = "";

    if (!category.products || !category.products.length) {
      const empty = document.createElement("p");
      empty.className = "hw-empty";
      empty.textContent = "Bu kategori yakında güncellenecek.";
      gridEl.appendChild(empty);
      return;
    }

    category.products.forEach(function (p) {
      const card = createProductCard(p);
      gridEl.appendChild(card);
    });

    if (stateEl) stateEl.textContent = ""; // loading mesajını temizle
  }

  // 5) Kart üretici
  function createProductCard(p) {
    const a = document.createElement("a");
    a.className = "hw-card" + (p.highlight ? " hw-card--highlight" : "");
    a.href = p.url || "#";

    const media = document.createElement("div");
    media.className = "hw-card-media";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = p.image || "assets/images/hardware/placeholder.webp";
    img.alt = p.name || "";
    media.appendChild(img);

    if (Array.isArray(p.badges) && p.badges.length) {
      const badgesWrap = document.createElement("div");
      badgesWrap.className = "hw-badges";
      p.badges.forEach(function (b) {
        const span = document.createElement("span");
        span.className = "hw-badge";
        span.textContent = b;
        badgesWrap.appendChild(span);
      });
      media.appendChild(badgesWrap);
    }

    const body = document.createElement("div");
    body.className = "hw-card-body";

    const titleRow = document.createElement("div");
    titleRow.className = "hw-card-title-row";

    const h3 = document.createElement("h3");
    h3.className = "hw-card-title";
    h3.textContent = p.name || "";

    const price = document.createElement("span");
    price.className = "hw-card-price";
    price.textContent = p.priceLabel || "";

    titleRow.appendChild(h3);
    if (p.priceLabel) {
      titleRow.appendChild(price);
    }

    const subtitle = document.createElement("p");
    subtitle.className = "hw-card-subtitle";
    subtitle.textContent = p.subtitle || "";

    const vendor = document.createElement("p");
    vendor.className = "hw-card-vendor";
    if (p.vendor) {
      vendor.textContent = "by " + p.vendor;
    }

    body.appendChild(titleRow);
    if (p.subtitle) body.appendChild(subtitle);
    if (p.vendor)   body.appendChild(vendor);

    a.appendChild(media);
    a.appendChild(body);

    return a;
  }
})();
