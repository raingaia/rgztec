// apps/web/public/assets/js/hardware-page.js

(function () {
  // ====== PATH & HELPERS ====================================================

  // /rgztec/docs/hardware/index.html -> repo adı "rgztec"
  const pathParts = location.pathname.split("/"); // ["", "rgztec", "docs", ...]
  const repo = pathParts[1] || "rgztec";
  const ROOT = "/" + repo; // "/rgztec"

  // Data & listings yolları (her sayfada aynı çalışsın)
  const DATA_URL = ROOT + "/data/hardware.json";
  const LISTINGS_URL = ROOT + "/listings.html";

  const $ = (id) => document.getElementById(id);

  const elTitle = $("heroTitle");
  const elTag = $("heroTag");
  const elStoreBar = $("storeBar");
  const elStoreRow = $("storeRow");
  const elGrid = $("grid");
  const elSearchForm = $("searchForm");
  const elSearchInput = $("q");

  // ====== SEARCH: listings.html?store=hardware&q=... ========================

  if (elSearchForm) {
    elSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = (elSearchInput && elSearchInput.value.trim()) || "";

      const url = new URL(LISTINGS_URL, location.origin);
      url.searchParams.set("store", "hardware");
      if (q) url.searchParams.set("q", q);

      location.href = url.toString();
    });
  }

  // ====== HERO ==============================================================

  function applyHero(hero) {
    if (!hero) return;

    if (elTitle && hero.title) {
      elTitle.textContent = hero.title;
    }
    if (elTag && hero.tagline) {
      elTag.textContent = hero.tagline;
    }
  }

  // ====== CATEGORY BAR (üstteki sekmeler) ===================================

  function renderCategories(categories) {
    if (!elStoreBar || !Array.isArray(categories)) return;

    const currentFile = (function () {
      const p = location.pathname.split("/").pop() || "index.html";
      return p.toLowerCase();
    })();

    elStoreBar.innerHTML = "";

    categories.forEach((cat) => {
      const a = document.createElement("a");
      a.textContent = cat.label || cat.name || "";
      a.href = cat.href || cat.url || "#";

      // Aktif sekmeyi boyamak için (match olarak dosya adını veriyoruz)
      if (
        cat.match &&
        String(cat.match).toLowerCase() === currentFile
      ) {
        a.classList.add("is-active");
      }

      elStoreBar.appendChild(a);
    });
  }

  // ====== POPULAR STORES (üstteki kartlar) ==================================

  function renderStores(stores) {
    if (!elStoreRow || !Array.isArray(stores)) return;
    if (!stores.length) {
      elStoreRow.innerHTML = "";
      return;
    }

    elStoreRow.innerHTML = stores
      .map((store) => {
        const img = store.image || "";
        const imgSrc = img.startsWith("http")
          ? img
          : ROOT + "/assets/images/" + img; // ör: "hardware-iot.webp"

        const href = store.href || store.url || "#";

        return `
      <li class="tile">
        <a class="tile-link" href="${href}">
          <div class="tile-media">
            ${
              img
                ? `<img src="${imgSrc}" alt="${store.name || ""} banner" loading="lazy">`
                : ""
            }
          </div>
          <div class="tile-body">
            <h3 class="tile-title">${store.name || ""}</h3>
            ${
              store.tagline
                ? `<p class="tile-text">${store.tagline}</p>`
                : ""
            }
          </div>
        </a>
      </li>`;
      })
      .join("");
  }

  // ====== PRODUCT GRID ======================================================

  function renderProducts(products) {
    if (!elGrid || !Array.isArray(products)) return;

    if (!products.length) {
      elGrid.innerHTML =
        '<p style="font-size:13px;color:#6b7280">No products yet. Coming soon.</p>';
      return;
    }

    elGrid.innerHTML = products
      .map((p) => {
        const img = p.image || "";
        const imgSrc = img.startsWith("http")
          ? img
          : ROOT + "/assets/images/" + img; // ör: "hardware-edge.webp"

        const price = p.price ? `$${p.price}` : "";
        const tagText = (p.tags || []).join(" • ");

        return `
      <article class="card">
        <div class="media">
          ${
            img
              ? `<img src="${imgSrc}" alt="${p.name || ""}" loading="lazy">`
              : ""
          }
        </div>
        <div class="body">
          <h3 class="title">${p.name || ""}</h3>
          ${
            p.subtitle
              ? `<p class="subtitle">${p.subtitle}</p>`
              : ""
          }
          ${
            tagText
              ? `<p class="meta">${tagText}</p>`
              : ""
          }
          ${
            price
              ? `<p class="price">${price}</p>`
              : ""
          }
        </div>
      </article>`;
      })
      .join("");
  }

  // ====== DATA LOAD =========================================================

  async function loadHardwarePage() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      const data = await res.json();

      // hero
      applyHero(data.hero);

      // category bar
      renderCategories(data.categories || []);

      // üstteki "popular stores"
      renderStores(data.stores || []);

      // ürün grid
      renderProducts(data.products || []);
    } catch (err) {
      console.error("Hardware data load error:", err);
      if (elGrid) {
        elGrid.innerHTML =
          '<p style="font-size:13px;color:#b91c1c">Hardware data could not be loaded. Check <code>/data/hardware.json</code>.</p>';
      }
    }
  }

  // ====== INIT ==============================================================

  document.addEventListener("DOMContentLoaded", loadHardwarePage);
})();

