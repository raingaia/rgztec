// =========================================
// RGZTEC STORE • store-shell.js (FINAL)
// - Base path otomatik: /rgztec/ veya /
// - Data:   {BASE}data/store.data.json
// - Banner: {BASE}asset/images/store/{banner}.webp
// =========================================

(function () {
  console.log("RGZTEC STORE SHELL: loaded, path =", window.location.pathname);

  // ---- BASE PATH HESABI ----
  // Örnek path: /rgztec/store/game-makers/
  var parts = window.location.pathname.split("/").filter(Boolean); // ["rgztec","store","game-makers"]
  var project = parts[0] || "";
  var BASE = "/";

  // Eğer ilk parça 'store', 'data', 'asset' değilse proje ismi olarak kabul et
  if (project && ["store", "data", "asset"].indexOf(project) === -1) {
    BASE = "/" + project + "/";
  }

  console.log("BASE path =", BASE);

  console.log("STORE_DATA_URL =", STORE_DATA_URL);
  console.log("STORE_BANNER_BASE =", STORE_BANNER_BASE);

  function showError(message) {
    var root = document.getElementById("store-root");
    if (!root) return;
    root.innerHTML =
      '<div class="store-error">' +
      "<h2>Store Error</h2>" +
      "<p>" + message + "</p>" +
      "</div>";
  }

  async function fetchStoreData() {
    console.log("Fetching data from", STORE_DATA_URL);
    var res = await fetch(STORE_DATA_URL + "?v=" + Date.now());
    if (!res.ok) {
      throw new Error("HTTP " + res.status + " on " + STORE_DATA_URL);
    }
    var json = await res.json();
    console.log("Data loaded:", json);
    return json;
  }

  async function init() {
    var root = document.getElementById("store-root");
    var headerMount = document.getElementById("store-header");
    var body = document.body;
    var storeSlug = body && body.dataset ? body.dataset.store : null;

    if (!root || !headerMount) {
      console.error("store-root veya store-header bulunamadı.");
      return;
    }
    if (!storeSlug) {
      showError("data-store attribute is missing on <body>.");
      return;
    }

    console.log("INIT for store slug =", storeSlug);
    body.classList.add("store-" + storeSlug);

    var data;
    try {
      data = await fetchStoreData();
    } catch (err) {
      console.error("Data error:", err);
      showError("Store configuration could not be loaded. " + err.message);
      return;
    }

    var storeConfig = data[storeSlug];
    if (!storeConfig) {
      showError("No config found for store slug: " + storeSlug);
      return;
    }

    console.log("storeConfig =", storeConfig);

    // Aktif section (overview / unity-3d vs.)
    var path = window.location.pathname.replace(/\/+$/, "");
    var pp = path.split("/").filter(Boolean); // örn ["rgztec","store","game-makers"]
    var last = pp[pp.length - 1];
    var activeSection = "overview";
    if (last && last !== storeSlug) {
      activeSection = last;
    }
    console.log("activeSection =", activeSection);

    // ----- HEADER -----
    function buildHeader() {
      var header = document.createElement("header");
      header.className = "store-header";

      var inner = document.createElement("div");
      inner.className = "store-header-inner";

      var brand = document.createElement("a");
      brand.className = "store-brand";
      brand.href = BASE; // ana sayfa

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

      var searchWrap = document.createElement("div");
      searchWrap.className = "store-search";

      var searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.className = "store-search-input";
      searchInput.placeholder = "Search products…";

      searchWrap.appendChild(searchInput);

      var nav = document.createElement("nav");
      nav.className = "store-nav";

      var overviewLink = document.createElement("a");
      overviewLink.href = BASE + "store/" + storeSlug + "/";
      overviewLink.className =
        "store-nav-link" + (activeSection === "overview" ? " store-nav-link-active" : "");
      overviewLink.textContent = "Overview";
      nav.appendChild(overviewLink);

      var sections = Array.isArray(storeConfig.sections) ? storeConfig.sections : [];
      sections.forEach(function (s) {
        var a = document.createElement("a");
        a.href = BASE + "store/" + storeSlug + "/" + s.slug + "/";
        a.className =
          "store-nav-link" + (activeSection === s.slug ? " store-nav-link-active" : "");
        a.textContent = s.name;
        nav.appendChild(a);
      });

      inner.appendChild(brand);
      inner.appendChild(searchWrap);
      inner.appendChild(nav);
      header.appendChild(inner);
      return header;
    }

    // ----- HERO + BANNER -----
    function buildHero() {
      var hero = document.createElement("section");
      hero.className = "store-hero";

      var left = document.createElement("div");
      left.className = "store-hero-text";

      var eyebrow = document.createElement("div");
      eyebrow.className = "store-hero-eyebrow";
      eyebrow.textContent = "Store • " + (storeConfig.title || "");

      var h1 = document.createElement("h1");
      h1.className = "store-hero-title";

      if (activeSection === "overview") {
        h1.textContent = (storeConfig.title || "") + " templates & UI kits.";
      } else {
        var sec = (storeConfig.sections || []).find(function (s) {
          return s.slug === activeSection;
        });
        h1.textContent = sec ? sec.name : (storeConfig.title || "");
      }

      var p = document.createElement("p");
      p.className = "store-hero-sub";
      p.textContent = storeConfig.tagline || "";

      left.appendChild(eyebrow);
      left.appendChild(h1);
      left.appendChild(p);

      var right = document.createElement("div");
      right.className = "store-hero-banner";

      var art = document.createElement("div");
      art.className = "store-hero-banner-art";

      var img = document.createElement("img");
      img.alt = (storeConfig.title || "") + " banner";
      img.src = STORE_BANNER_BASE + (storeConfig.banner || "");
      console.log("Banner src =", img.src);
      img.onerror = function () {
        console.error("Banner failed to load:", img.src);
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

    // ----- PRODUCTS (placeholder) -----
    function buildProducts() {
      var wrap = document.createElement("section");
      wrap.className = "store-products";

      var header = document.createElement("div");
      header.className = "store-products-header";

      var h2 = document.createElement("h2");
      if (activeSection === "overview") {
        h2.textContent = "Featured Products";
      } else {
        var sec = (storeConfig.sections || []).find(function (s) {
          return s.slug === activeSection;
        });
        h2.textContent = sec ? sec.name : "Products";
      }

      var sub = document.createElement("p");
      sub.textContent = "Product grid will be connected soon.";

      header.appendChild(h2);
      header.appendChild(sub);

      var grid = document.createElement("div");
      grid.className = "products-grid";

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

    // ----- RENDER -----
    headerMount.innerHTML = "";
    root.innerHTML = "";

    headerMount.appendChild(buildHeader());
    root.appendChild(buildHero());
    root.appendChild(buildProducts());

    console.log("STORE SHELL: render complete");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init().catch(function (err) {
        console.error("INIT ERROR (DOMContentLoaded):", err);
        showError("Unexpected error: " + err.message);
      });
    });
  } else {
    init().catch(function (err) {
      console.error("INIT ERROR:", err);
      showError("Unexpected error: " + err.message);
    });
  }
})();








