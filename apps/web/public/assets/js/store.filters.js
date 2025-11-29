// store/core/assets/js/store.filters.js
// Tag / category'ye göre basit filtre sistemi

(function (window, document, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.filters] StoreUtils yok.");
    return;
  }

  const { qs, createEl } = utils;

  function initStoreFilters(products, root, productsRoot) {
    root = root || qs("#store-filters-root");
    if (!root || !Array.isArray(products) || products.length === 0) {
      return;
    }

    const uniqueTags = new Set();
    const uniqueCategories = new Set();

    products.forEach((p) => {
      (p.tags || []).forEach((t) => uniqueTags.add(t));
      if (p.category) uniqueCategories.add(p.category);
    });

    // Basit filtre UI
    root.innerHTML = `
      <div class="store-filters-title">Filters</div>

      <div class="filter-group" data-filter-type="category">
        <div class="filter-group-label">Category</div>
        <div class="filter-chips" id="filter-chips-category"></div>
      </div>

      <div class="filter-group" data-filter-type="tag">
        <div class="filter-group-label">Tags</div>
        <div class="filter-chips" id="filter-chips-tag"></div>
      </div>
    `;

    const categoryContainer = qs("#filter-chips-category", root);
    const tagContainer = qs("#filter-chips-tag", root);

    if (categoryContainer) {
      categoryContainer.innerHTML =
        `<button class="filter-chip is-active" data-value="">All</button>` +
        Array.from(uniqueCategories)
          .sort()
          .map(
            (cat) =>
              `<button class="filter-chip" data-value="${escapeAttr(
                cat
              )}">${escapeHtml(cat)}</button>`
          )
          .join("");
    }

    if (tagContainer) {
      tagContainer.innerHTML = Array.from(uniqueTags)
        .sort()
        .map(
          (tag) =>
            `<button class="filter-chip" data-value="${escapeAttr(
              tag
            )}">${escapeHtml(tag)}</button>`
        )
        .join("");
    }

    const state = {
      category: "",
      tag: "",
    };

    // Eventler
    root.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;

      const group = chip.closest(".filter-group");
      if (!group) return;

      const type = group.dataset.filterType;
      const value = chip.dataset.value || "";

      // Aktif class güncelle
      const chipsInGroup = group.querySelectorAll(".filter-chip");
      chipsInGroup.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");

      if (type === "category") {
        state.category = value;
      } else if (type === "tag") {
        state.tag = value;
      }

      applyFilters(products, productsRoot || qs("#store-root"), state);
    });
  }

  function applyFilters(products, root, state) {
    if (!root) return;
    const filtered = products.filter((p) => {
      const matchCategory =
        !state.category || p.category === state.category;

      const matchTag =
        !state.tag ||
        (Array.isArray(p.tags) && p.tags.includes(state.tag));

      return matchCategory && matchTag;
    });

    if (typeof window.renderStoreProducts === "function") {
      window.renderStoreProducts(filtered, root);
    }
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    if (str == null) return "";
    return String(str).replace(/"/g, "&quot;");
  }

  window.initStoreFilters = initStoreFilters;
})(window, document, window.StoreUtils);
