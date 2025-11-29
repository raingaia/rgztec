// store/core/assets/js/store.search.js
// Sadece o store içindeki ürünlerde arama

(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.search] StoreUtils yok.");
    return;
  }

  const { qs, debounce } = utils;

  function initStoreSearch(products, productsRoot) {
    const trigger = qs("#store-search-trigger");
    const root = productsRoot || qs("#store-root");
    if (!trigger || !root || !Array.isArray(products)) return;

    // Basit bir inline arama input'u açalım (header altında)
    let searchBar = qs("#store-search-bar");
    if (!searchBar) {
      const header = qs(".store-header");
      if (!header) return;

      searchBar = document.createElement("div");
      searchBar.id = "store-search-bar";
      searchBar.style.padding = "0.5rem 1.25rem 0.75rem";
      searchBar.innerHTML = `
        <input
          id="store-search-input"
          type="search"
          placeholder="Search in this store..."
          style="width:100%;max-width:420px;border-radius:999px;border:1px solid rgba(148,163,184,0.45);padding:0.4rem 0.9rem;font-size:0.8rem;outline:none;"
        />
      `;
      header.insertAdjacentElement("afterend", searchBar);
    }

    const input = qs("#store-search-input", searchBar);
    if (!input) return;

    const doSearch = debounce((term) => {
      const q = term.trim().toLowerCase();
      if (!q) {
        // boş arama → tüm ürünler
        if (typeof window.renderStoreProducts === "function") {
          window.renderStoreProducts(products, root);
        }
        return;
      }

      const filtered = products.filter((p) => {
        const haystack = [
          p.title,
          p.description,
          p.category,
          ...(p.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });

      if (typeof window.renderStoreProducts === "function") {
        window.renderStoreProducts(filtered, root);
      }
    }, 180);

    trigger.addEventListener("click", () => {
      input.focus();
    });

    input.addEventListener("input", (e) => {
      doSearch(e.target.value || "");
    });
  }

  window.initStoreSearch = initStoreSearch;
})(window, document, window.StoreUtils);
