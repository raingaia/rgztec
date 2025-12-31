(function () {
  "use strict";

  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta?.content) return String(meta.content).trim().replace(/\/+$/, "");
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s ?? ""));

  const DATA = {
    stores: withBase("/data/store.data.json"),
    categories: withBase("/data/categories.json"),
  };

  const URLS = {
    STORE: (slug) => withBase(`/store/${enc(slug)}/`),
  };

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    if (/<html|<!doctype/i.test(text)) throw new Error(`HTML returned for ${url} (rewrite?)`);
    return JSON.parse(text);
  }

  function pickFirstStoreSlug(storesObj, slug) {
    return storesObj?.[slug] ? slug : null;
  }

  function renderCategoriesPanel(categoriesJson, storesJson) {
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");
    if (!listEl || !detailEl) return;

    const categories = categoriesJson?.categories || [];
    const storesObj = storesJson || {};

    function setActive(cat) {
      // Left list active state
      [...listEl.querySelectorAll(".cat-item")].forEach((b) => b.classList.remove("cat-item--active"));
      const btn = listEl.querySelector(`[data-cat="${cat.slug}"]`);
      if (btn) btn.classList.add("cat-item--active");

      // Right detail
      const storeSlugs = (cat.items || cat.stores || []).filter(Boolean);
      const validStores = storeSlugs
        .map((s) => pickFirstStoreSlug(storesObj, s))
        .filter(Boolean)
        .map((slug) => {
          const st = storesObj[slug];
          return {
            slug,
            title: st?.title || slug,
            tagline: st?.tagline || "",
          };
        });

      detailEl.innerHTML = `
        <div class="cat-detail-eyebrow">Category</div>
        <div class="cat-detail-title">${cat.title || cat.slug}</div>
        <div class="cat-detail-subtitle">${cat.tagline || ""}</div>

        <div class="cat-detail-links">
          ${validStores
            .map(
              (s) => `
              <a href="${URLS.STORE(s.slug)}" title="${(s.tagline || "").replace(/"/g, "&quot;")}">
                ${s.title}
              </a>
            `
            )
            .join("")}
        </div>
      `;
    }

    listEl.innerHTML = categories
      .map(
        (c, idx) => `
        <button class="cat-item ${idx === 0 ? "cat-item--active" : ""}" data-cat="${c.slug}" type="button">
          <span>${c.title || c.slug}</span>
          <span>›</span>
        </button>
      `
      )
      .join("");

    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".cat-item");
      if (!btn) return;
      const slug = btn.getAttribute("data-cat");
      const cat = categories.find((x) => x.slug === slug);
      if (cat) setActive(cat);
    });

    if (categories[0]) setActive(categories[0]);
  }

  async function boot() {
    try {
      const [cats, stores] = await Promise.all([fetchJson(DATA.categories), fetchJson(DATA.stores)]);
      renderCategoriesPanel(cats, stores);
    } catch (err) {
      console.warn("[categories] failed:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
