// store/core/assets/js/store.cards.js
// Ürün kartlarını üretir ve #store-root içine basar

(function (window, utils) {
  "use strict";

  if (!utils) {
    console.error("[store.cards] StoreUtils yok.");
    return;
  }

  const { showStoreMessage } = utils;

  function renderStoreProducts(products, root) {
    root = root || document.getElementById("store-root");
    if (!root) {
      console.error("[store.cards] #store-root bulunamadı.");
      return;
    }

    if (!Array.isArray(products) || products.length === 0) {
      root.innerHTML = "";
      showStoreMessage("No products found in this store yet.", "empty");
      return;
    }

    const html = products.map(renderProductCard).join("");
    root.innerHTML = html;
  }

  function renderProductCard(product) {
    const tags = (product.tags || []).map(
      (tag) => `<span class="product-tag">${escapeHtml(tag)}</span>`
    );

    const badge = product.badge
      ? `<span class="product-badge">${escapeHtml(product.badge)}</span>`
      : "";

    const price =
      product.price != null
        ? `$${product.price}`
        : product.priceLabel || "Contact";

    const priceSuffix = product.priceSuffix || (product.currency || "USD");

    const license = product.license || "Single-site license";

    return `
      <article class="product-card">
        <div class="product-card-inner">
          <div class="product-card-media">
            <img src="${escapeAttr(
              product.image || "assets/images/placeholders/product.webp"
            )}" alt="${escapeAttr(product.title || "")}">
          </div>
          <div class="product-card-body">
            <div class="product-tags-row">
              ${badge}
              ${tags.join("")}
            </div>
            <h3 class="product-title">${escapeHtml(product.title || "")}</h3>
            <p class="product-description">
              ${escapeHtml(product.description || "")}
            </p>
            <div class="product-meta-row">
              <div class="product-price">
                ${price}
                <span>${escapeHtml(priceSuffix)}</span>
              </div>
              <div class="product-meta-secondary">
                ${escapeHtml(license)}
              </div>
            </div>
            <div class="product-cta-row">
              <button class="product-cta" type="button" data-slug="${escapeAttr(
                product.slug || ""
              )}">
                View details
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
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

  // Global
  window.renderStoreProducts = renderStoreProducts;
})(window, window.StoreUtils);
