// =========================================
// RGZTEC STORE • store-shell.js (FULL, FINAL)
// Tek JS: Data → Header → Hero → Grid
// Hata durumunda her zaman ekrana mesaj basar
// =========================================

(function () {
  console.log("RGZTEC STORE SHELL: script loaded");

  // ---- Ayarlanabilir sabit yollar ----
  var STORE_DATA_URLS = [
    "/rgztec/data/store.data.json",         // 1. tercih
    "/rgztec/assets/data/store.data.json"   // 2. tercih (yedek)
  ];
  var STORE_BANNER_BASE = "/rgztec/asset/images/store/"; // game-makers.webp buradan

  function showFatalError(root, message) {
    console.error("RGZTEC STORE SHELL ERROR:", message);
    if (root) {
      root.innerHTML = [
        '<div class="store-error">',
        "<h2>Store Error</h2>",
        "<p>" + message + "</p>",
        "</div>"
      ].join("");
    }
  }

  async function fetchStoreData() {
    var lastError = null;

    for (var i = 0; i < STORE_DATA_URLS.length; i++) {
      var url = STORE_DATA_URLS[i];
      try {
        console.log("Trying data URL:", url);
        var res = await fetch(url + "?v=" + Date.now());
        if (!res.ok) {
          lastError = "HTTP " + res.status + " on " + url;
          continue;
        }
        var json = await res.json();
        console.log("Data loaded from:", url, json);
        return json;
      } catch (err) {
        console.error("Fetch error on", url, err);
        lastError = err.message;
      }
    }

    throw new Error("All data URLs failed. Last error: " + lastError);
  }

  async function init() {
    var root = document.getElementById("store-root");
    var headerMount = document.getElementById("store-header");
    var storeSlug = document.body && document.body.dataset
      ? document.body.dataset.store
      : null;

    if (!root || !headerMount) {
      console.error("store-root veya store-header bulunamadı.");
      return;
    }
    if (!storeSlug) {
      showFatalError(root, "data-store attribute is missing on <body>.");
      return;
    }

    console.log("INIT STORE SHELL for slug:", storeSlug);

    // Body'ye tema class'ı ekle
    document.body.classList.add("store-" + storeSlug);

    // 1) Data'yı yükle
    var data;
    try {
      data = await fetchStoreData();
    } catch (err) {
      showFatalError(root, "Store configuration could not be loaded. " + err.message);
      return;
    }

    // Data yapısına toleranslı bak
    var storeConfig = null;

    // a) Object map ise (game-makers, hardware vs. key)
    if (data && !Array.isArray(data) && typeof data === "object") {
      storeConfig = data[storeSlug] || null;
    }

    // b) Array ise {slug:"game-makers"} tipini ara
    if (!storeConfig && Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (!item) continue;
        if (item.slug === storeSlug || item.id === storeSlug || item.key === storeSlug) {
          storeConfig = item;
          break;
        }
      }
    }

    if (!storeConfig) {
      showFatalError(
        root,
        "No configuration found for store slug: " + storeSlug +
          ". Check store.data.json structure."
      );
      return;
    }

    console.log("Store config for", storeSlug, storeConfig);

    // 2) Aktif section
    var path = window.location.pathname.replace(/\/+$/, "");
    var parts = path.split("/");
    var last = parts[parts.length - 1];
    var activeSection = "overview";

    if (last && last !== storeSlug) {
      activeSection = last;
    }

    console.log("Active section:", activeSection);

    // -------------------------------
    // HEADER (Etsy tarzı)
    // -------------------------------
    function buildHeader() {
      var header = document.createElement("header");
      header.className = "store-header";

      var inner = document.createElement("div");
      inner.className = "store-header-inner";

      // Brand
      var brand = document.createElement("a");
      brand.className = "store-brand";
      brand.href = "/rgztec/";

      var dot = document.createElement("div");
      dot.className = "store-brand-dot";

      var textBlock = document.createElement("div");
      textBlock.className = "store-brand-text-block";

      var title = document.createElement("div");
      title.className = "store-brand-title";
      title.textContent = "RGZTEC";

      var sub = document.createElement("div");
      sub.className = "store-brand-sub";
      sub.textContent = storeConfig.title || "";

      textBlock.appendChild(title);
      textBlock.appendChild(sub);
      brand.appendChild(dot);
      brand.appendChild(textBlock);

      // Search
      var searchWrap = document.createElement("div");
      searchWrap.className = "store-search";

      var searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.className = "store-search-input";
      searchInput.placeholder = "Search products…";

      searchWrap.appendChild(searchInput);

      // Nav
      var nav = document.createElement("nav");
      nav.className = "store-nav";

      // Overview
      var overviewLink = document.createElement("a");
      overviewLink.href = "/rgztec/store/" + storeSlug + "/";
      overviewLink.className =
        "store-nav-link" + (activeSection === "overview" ? " store-nav-link-active" : "");
      overviewLink.textContent = "Overview";
      nav.appendChild(overviewLink);

      // Sections
      var sections = storeConfig.sections;
      if (!Array.isArray(sections)) sections = [];

      for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        if (!s) continue;
        var a = document.createElement("a");
        a.href = "/rgztec/store/" + storeSlug + "/" + s.slug + "/";
        a.className =
          "store-nav-link" + (activeSection === s.slug ? " store-nav-link-active" : "");
        a.textContent = s.name;
        nav.appendChild(a);
      }

      inner.appendChild(brand);
      inner.appendChild(searchWrap);
      inner.appendChild(nav);
      header.appendChild(inner);

      return header;
    }

    // -------------------------------
    // HERO + BANNER
    // -------------------------------
    function buildHero() {
      var hero = document.createElement("section");
      hero.className = "store-hero";

      // Sol
      var left = document.createElement("div");
      left.className = "store-hero-text";

      var eyebrow = document.createElement("div");
      eyebrow.className = "store-hero-eyebrow";
      eyebrow.textContent = "Store • " + (storeConfig.title || "");

      var h1 = document.createElement("h1");
      h1.className = "store-hero-title";

      var heroTitle;
      if (activeSection === "overview") {
        heroTitle = (storeConfig.title || "") + " templates & UI kits.";
      } else {
        var secName = null;
        var sections = storeConfig.sections;
        if (Array.isArray(sections)) {
          for (var i = 0; i < sections.length; i++) {
            if (sections[i] && sections[i].slug === activeSection) {
              secName = sections[i].name;
              break;
            }
          }
        }
        heroTitle = secName || (storeConfig.title || "");
      }
      h1.textContent = heroTitle;

      var p = document.createElement("p");
      p.className = "store-hero-sub";
      p.textContent = storeConfig.tagline || "";

      left.appendChild(eyebrow);
      left.appendChild(h1);
      left.appendChild(p);

      // Sağ (banner)
      var right = document.createElement("div");
      right.className = "store-hero-banner";

      var art = document.createElement("div");
      art.className = "store-hero-banner-art";

      var img = document.createElement("img");
      img.alt = (storeConfig.title || "") + " banner";

      var bannerName = storeConfig.banner || "";
      img.src = STORE_BANNER_BASE + bannerName;
      console.log("Banner src:", img.src);

      img.onerror = function () {
        console.error("Banner image failed to load:", img.src);
      };

      var glass = document.createElement("div");
      glass.className = "store-hero-banner-glass";

      art.appendChild(img);
      art.appendChild(glass);
      right.appendChild(art);

      hero.appendChild(left);
      hero.appendChild(right);

      return hero;
    }

    // -------------------------------
    // PRODUCTS GRID (placeholder)
    // -------------------------------
    function buildProducts() {
      var wrap = document.createElement("section");
      wrap.className = "store-products";

      var header = document.createElement("div");
      header.className = "store-products-header";

      var h2 = document.createElement("h2");
      if (activeSection === "overview") {
        h2.textContent = "Featured Products";
      } else {
        var name = null;
        var sections = storeConfig.sections;
        if (Array.isArray(sections)) {
          for (var i = 0; i < sections.length; i++) {
            if (sections[i] && sections[i].slug === activeSection) {
              name = sections[i].name;
              break;
            }
          }
        }
        h2.textContent = name || "Products";
      }

      var sub = document.createElement("p");
      sub.textContent = "Product grid will be connected soon.";

      header.appendChild(h2);
      header.appendChild(sub);

      var grid = document.createElement("div");
      grid.className = "products-grid";

      // Placeholder kartlar
      for (var i = 0; i < 8; i++) {
        var card = document.createElement("div");
        card.className = "product-card";
        card.textContent = "Product card placeholder";
        grid.appendChild(card);
      }

      wrap.appendChild(header);
      wrap.appendChild(grid);
      return wrap;
    }

    // -------------------------------
    // RENDER
    // -------------------------------
    headerMount.innerHTML = "";
    root.innerHTML = "";

    headerMount.appendChild(buildHeader());
    root.appendChild(buildHero());
    root.appendChild(buildProducts());

    console.log("RGZTEC STORE SHELL: render complete.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init().catch(function (err) {
        console.error("INIT ERROR (DOMContentLoaded):", err);
      });
    });
  } else {
    init().catch(function (err) {
      console.error("INIT ERROR:", err);
      var root = document.getElementById("store-root");
      showFatalError(root, "Unexpected error: " + err.message);
    });
  }
})();





