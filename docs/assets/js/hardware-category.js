// assets/js/hardware-category.js
(function () {
  // 1) Slug'ı body'den al
  var body = document.body;
  if (!body) return;

  var slug = body.dataset.hwSlug;
  if (!slug) {
    console.warn("HW: data-hw-slug bulunamadı, varsayılan 'ai-accelerators' kullanılıyor.");
    slug = "ai-accelerators";
  }

  // 2) DOM referansları
  var titleEl    = document.querySelector('[data-hw="title"]');
  var taglineEl  = document.querySelector('[data-hw="tagline"]');
  var bannerImg  = document.querySelector('[data-hw="banner-image"]');
  var heroWrap   = document.querySelector('[data-hw="hero"]');
  var gridEl     = document.querySelector('[data-hw="grid"]');
  var stateEl    = document.querySelector('[data-hw="state"]');
  var metaDescEl = document.querySelector('meta[name="description"]');

  if (!gridEl) {
    console.warn("HW: [data-hw=\"grid\"] bulunamadı.");
  }

  // 3) JSON'ı yükle
  fetch("data/hardware-categories.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (categories) {
      if (!Array.isArray(categories)) {
        throw new Error("HW: JSON formatı dizi değil.");
      }

      var category = categories.find(function (c) {
        return c.slug === slug;
      });

      if (!category) {
        console.error("HW: Slug bulunamadı:", slug);
        if (stateEl) stateEl.textContent = "Category not found.";
        return;
      }

      applyCategory(category);
    })
    .catch(function (err) {
      console.error("HW: JSON yüklenirken hata:", err);
      if (stateEl) stateEl.textContent = "Unable to load devices.";
    });

  // 4) Kategori verisini sayfaya uygula
  function applyCategory(category) {
    // Title
    if (category.name) {
      document.title = "RGZTEC • Hardware Lab • " + category.name;
      if (titleEl) titleEl.textContent = category.name;
    }

    // Meta description
    if (metaDescEl && category.metaDescription) {
      metaDescEl.setAttribute("content", category.metaDescription);
    }

    // Tagline
    if (taglineEl) {
      taglineEl.textContent = category.tagline || "";
    }

    // Banner görseli
    if (bannerImg) {
      if (category.bannerImage) {
        bannerImg.src = category.bannerImage;
      }
      bannerImg.alt = (category.name || "Hardware category") + " banner";
    }

    // Accent color (istenirse hero'da kullanılabilir)
    if (heroWrap && category.accentColor) {
      heroWrap.style.setProperty("--hw-accent", category.accentColor);
    }

    // Grid'i doldur
    if (!gridEl) return;

    gridEl.innerHTML = "";

    if (!category.products || !category.products.length) {
      var empty = document.createElement("p");
      empty.className = "section__meta";
      empty.textContent = "This category will be updated soon.";
      gridEl.appendChild(empty);
      if (stateEl) stateEl.textContent = "";
      return;
    }

    category.products.forEach(function (p) {
      var card = createProductCard(p);
      gridEl.appendChild(card);
    });

    if (stateEl) {
      stateEl.textContent = category.products.length + " devices curated";
    }
  }

  // 5) Product card (home'daki kart yapısına uyumlu)
  function createProductCard(p) {
    var a = document.createElement("a");
    a.className = "card card--product";
    if (p.highlight) {
      a.className += " card--featured";
    }
    a.href = p.url || "#";

    // MEDIA
    var media = document.createElement("div");
    media.className = "card__media";

   var img = document.createElement("img");
img.loading = "lazy";

// p.image tanımlı değilse fallback olarak genel hardware kartını kullan
img.src = p.image || "assets/images/store/hardware.webp";
img.alt = p.name || "";
media.appendChild(img);


    // Badges (örn. Edge AI, M.2, Industrial)
    if (Array.isArray(p.badges) && p.badges.length) {
      var badgesWrap = document.createElement("div");
      badgesWrap.className = "card__badges";
      p.badges.forEach(function (b) {
        var span = document.createElement("span");
        span.className = "chip chip--tiny";
        span.textContent = b;
        badgesWrap.appendChild(span);
      });
      media.appendChild(badgesWrap);
    }

    // BODY
    var body = document.createElement("div");
    body.className = "card__body";

    var titleRow = document.createElement("div");
    titleRow.className = "card__title-row";

    var h3 = document.createElement("h3");
    h3.className = "card__title";
    h3.textContent = p.name || "";

    titleRow.appendChild(h3);

    if (p.priceLabel) {
      var price = document.createElement("span");
      price.className = "card__price";
      price.textContent = p.priceLabel;
      titleRow.appendChild(price);
    }

    var subtitle = document.createElement("p");
    subtitle.className = "card__subtitle";
    subtitle.textContent = p.subtitle || "";

    var meta = document.createElement("p");
    meta.className = "card__meta";
    if (p.vendor) {
      meta.textContent = "by " + p.vendor;
    }

    body.appendChild(titleRow);
    if (p.subtitle) body.appendChild(subtitle);
    if (p.vendor) body.appendChild(meta);

    a.appendChild(media);
    a.appendChild(body);

    return a;
  }
})();
