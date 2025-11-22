// assets/js/hardware-index.js
// RGZTEC • Hardware Lab index controller

(function () {
  var GRID_ID = "hardwareCategories";

  // Önce hardware.json'u dener, olmazsa hardware-categories.json'a düşer
  var PRIMARY_URL = "data/hardware.json";
  var FALLBACK_URL = "data/hardware-categories.json";

  function init() {
    var grid = document.getElementById(GRID_ID);
    if (!grid) {
      console.error("[RGZTEC Hardware] #hardwareCategories bulunamadı");
      return;
    }

    // Önce primary dene
    fetch(PRIMARY_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("primary-fail:" + res.status);
        return res.json();
      })
      .then(function (raw) {
        var normalized = normalizeData(raw);
        renderCategories(grid, normalized.categories, normalized.products);
      })
      .catch(function () {
        // Primary olmadı → fallback'e geç
        console.warn("[RGZTEC Hardware] hardware.json yok, hardware-categories.json deneniyor");
        fetch(FALLBACK_URL)
          .then(function (res) {
            if (!res.ok) throw new Error("fallback-fail:" + res.status);
            return res.json();
          })
          .then(function (raw) {
            var normalized = normalizeData(raw);
            renderCategories(grid, normalized.categories, normalized.products);
          })
          .catch(function (err) {
            console.error("[RGZTEC Hardware] veri yüklenemedi:", err);
            renderFallback(grid, err && err.message);
          });
      });
  }

  // Hem hardware.json hem hardware-categories.json yapısını tek tipe çevir
  function normalizeData(raw) {
    // 1) Senin gönderdiğin structure:
    // { version, updatedAt, currency, categories:[...], products:[...] }
    if (raw && raw.categories && raw.products) {
      return {
        categories: raw.categories.slice(),
        products: raw.products.slice()
      };
    }

    // 2) Diğer structure: [ { slug, name, tagline, bannerImage, products:[...] }, ... ]
    if (Array.isArray(raw)) {
      var categoriesWithProducts = raw;
      var categories = [];
      var products = [];

      for (var i = 0; i < categoriesWithProducts.length; i++) {
        var c = categoriesWithProducts[i];
        if (!c) continue;

        categories.push({
          id: c.slug,
          slug: c.slug,
          name: c.name,
          description: c.tagline || "",
          heroImage: c.bannerImage,
          accentColor: c.accentColor || "#f97316",
          order: (i + 1) * 10
        });

        if (Array.isArray(c.products)) {
          for (var j = 0; j < c.products.length; j++) {
            var p = c.products[j];
            if (!p) continue;
            // categoryId ekleyerek tek listeye at
            var flat = {};
            for (var key in p) {
              if (Object.prototype.hasOwnProperty.call(p, key)) {
                flat[key] = p[key];
              }
            }
            flat.categoryId = c.slug;
            products.push(flat);
          }
        }
      }

      return { categories: categories, products: products };
    }

    // Boş/uyumsuz yapı
    return { categories: [], products: [] };
  }

  function renderCategories(grid, categories, products) {
    if (!categories || !categories.length) {
      renderFallback(grid, "Kategori bulunamadı");
      return;
    }

    // order'a göre sırala
    categories = categories.slice().sort(function (a, b) {
      return (a.order || 999) - (b.order || 999);
    });

    categories.forEach(function (cat) {
      var count = 0;
      if (products && products.length) {
        for (var i = 0; i < products.length; i++) {
          if (products[i].categoryId === cat.id || products[i].categoryId === cat.slug) {
            count++;
          }
        }
      }

      var card = document.createElement("a");
      card.href = "hardware-category.html?slug=" + encodeURIComponent(cat.slug);
      card.className = "card";

      // Görsel alanı
      var media = document.createElement("div");
      media.className = "media";

      var img = document.createElement("img");
      img.src = cat.heroImage;
      img.alt = cat.name || "";
      img.onload = function () {
        media.classList.add("loaded");
      };
      media.appendChild(img);

      // İç alan
      var pad = document.createElement("div");
      pad.className = "pad";

      var title = document.createElement("div");
      title.className = "title";
      title.textContent = cat.name || "";
      pad.appendChild(title);

      if (cat.description) {
        var sub = document.createElement("p");
        sub.className = "sub";
        sub.textContent = cat.description;
        pad.appendChild(sub);
      }

      var row = document.createElement("div");
      row.className = "row";

      var price = document.createElement("div");
      price.className = "price";
      price.textContent = count
        ? count + " mock products"
        : "Hardware category";
      row.appendChild(price);

      var btn = document.createElement("span");
      btn.className = "btn";
      btn.textContent = "View category";
      row.appendChild(btn);

      pad.appendChild(row);

      card.appendChild(media);
      card.appendChild(pad);

      grid.appendChild(card);
    });
  }

  function renderFallback(grid, reason) {
    var card = document.createElement("div");
    card.className = "card";

    card.innerHTML =
      '<div class="media loaded"></div>' +
      '<div class="pad">' +
      '  <div class="title">Hardware data not loaded</div>' +
      '  <p class="sub">Sebep: ' + (reason || "bilinmiyor") +
      '. Lütfen <code>data/hardware.json</code> veya <code>data/hardware-categories.json</code> yolunu ve ' +
      '<code>assets/js/hardware-index.js</code> dosyasının yayın ortamında olduğunu kontrol et.</p>' +
      '</div>';

    grid.appendChild(card);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
