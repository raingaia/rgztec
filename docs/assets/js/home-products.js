(function () {
  "use strict";

  // ===============================
  // RGZTEC HOME PRODUCTS (AWS Amplify SAFE - Single File)
  // - No import/module needed
  // - Fetches /data/store.data.json
  // - Detects SPA rewrite (HTML returned instead of JSON)
  // - Extracts stores from many schemas
  // ===============================

  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta?.content) return String(meta.content).trim().replace(/\/+$/, "");
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s ?? ""));

  const DATA_URL = withBase("/data/store.data.json");

  const STORE_URL = (slug) => withBase(`/store/${enc(slug)}/`);
  const STORE_SECTION_URL = (storeSlug, sectionSlug) =>
    withBase(`/store/${enc(storeSlug)}/${enc(sectionSlug)}/`);

  const ASSET_URL = (p) => withBase(`/assets/${String(p ?? "").replace(/^\/+/, "")}`);
  const STORE_IMAGE_BASE = ASSET_URL("images/store/");
  const PLACEHOLDER_IMG = ASSET_URL("images/placeholder.png");

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((e) => {
      console.error("RGZTEC boot error:", e);
      showDebug(`BOOT ERROR: ${String(e?.message || e)}`);
    });
  });

  async function boot() {
    // 0) DOM target var mı?
    const gallery = document.getElementById("gallery");
    if (!gallery) {
      showDebug(`Missing #gallery in HTML. Add: <section id="gallery"></section>`);
      initSearchEngine(); // search yine çalışsın
      return;
    }

    // 1) Data çek
    const result = await fetchJsonSafe(DATA_URL);
    const stores = extractStores(result);

    if (!stores.length) {
      showDebug(
        `Stores array is empty after parsing.\n` +
        `DATA_URL: ${DATA_URL}\n` +
        `Fix: ensure JSON contains stores or tell me your schema keys.`
      );
      initSearchEngine();
      return;
    }

    // 2) Render
    renderGallery(stores);
    renderSubNav(stores);
    initMegaMenu(stores);
    initSearchEngine();

    console.log(`RGZTEC: ${stores.length} stores loaded. BASE="${BASE}" DATA="${DATA_URL}"`);
  }

  // -----------------------------
  // FETCH (Rewrite-safe)
  // -----------------------------
  async function fetchJsonSafe(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });

      const text = await res.text();

      if (!res.ok) {
        showDebug(`FETCH FAILED\nStatus: ${res.status} ${res.statusText}\nURL: ${url}\nFirst120: ${text.slice(0,120)}`);
        throw new Error(`Fetch failed: ${res.status}`);
      }

      // 🔥 Amplify SPA rewrite yutarsa HTML döner
      if (/<html|<!doctype/i.test(text)) {
        showDebug(
          `AMPLIFY REWRITE PROBLEM ⚠️\n` +
          `JSON yerine HTML geldi.\n` +
          `URL: ${url}\n\n` +
          `Çözüm: Amplify Rewrites sırası:\n` +
          `1) /data/<*>  -> /data/<*>  (200)\n` +
          `2) /assets/<*>-> /assets/<*> (200)\n` +
          `3) /<*>       -> /index.html (200)\n`
        );
        throw new Error("Data route returned HTML (rewrite).");
      }

      try {
        return JSON.parse(text);
      } catch {
        showDebug(`JSON PARSE FAILED\nURL: ${url}\nFirst200: ${text.slice(0,200)}`);
        throw new Error("JSON parse failed.");
      }
    } finally {
      clearTimeout(t);
    }
  }

  // -----------------------------
  // STORE EXTRACT (Schema tolerant)
  // -----------------------------
  function extractStores(result) {
  if (!result || typeof result !== "object") return [];

  // ✅ Senin şema: { "slug": { title, tagline, sections... }, ... }
  // Eğer result doğrudan store-map ise:
  if (!Array.isArray(result) && !result.stores && !result.data?.stores) {
    const keys = Object.keys(result);
    // hızlı validasyon: en az 1 store objesi var mı?
    const looksLikeStoreMap = keys.some((k) => {
      const v = result[k];
      return v && typeof v === "object" && ("title" in v || "tagline" in v || "sections" in v);
    });

    if (looksLikeStoreMap) {
      return normalizeStoresFromMap(result);
    }
  }

  // Eski destekler (kalsın)
  if (Array.isArray(result.stores)) return normalizeStores(result.stores);
  if (Array.isArray(result.data?.stores)) return normalizeStores(result.data.stores);

  return [];
}

function normalizeStoresFromMap(map) {
  return Object.entries(map)
    .map(([slug, s]) => ({
      slug: String(slug ?? "").trim(),
      title: String(s?.title ?? s?.name ?? "Untitled Store").trim(),
      tagline: String(s?.tagline ?? s?.description ?? "").trim(),
      isFeatured: Boolean(s?.isFeatured ?? s?.featured),
      banner: String(s?.banner ?? ""),
      sections: Array.isArray(s?.sections) ? s.sections : [],
    }))
    .filter((x) => x.slug);
}

  // -----------------------------
  // UI
  // -----------------------------
  function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    const frag = document.createDocumentFragment();

    data.forEach((store) => {
      const article = document.createElement("article");
      article.className = `card ${store.isFeatured ? "card--featured" : ""}`.trim();

      const aMedia = document.createElement("a");
      aMedia.className = "card-media";
      aMedia.href = STORE_URL(store.slug);

      const img = document.createElement("img");
      img.src = `${STORE_IMAGE_BASE}${store.slug}.webp`;
      img.alt = store.title || "Store";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => (img.src = PLACEHOLDER_IMG));

      aMedia.appendChild(img);

      const content = document.createElement("div");
      content.className = "card-content";

      const h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.textContent = store.title;

      const p = document.createElement("p");
      p.className = "card-desc";
      p.textContent = store.tagline || "Explore curated products, tools, and resources.";

      const aLink = document.createElement("a");
      aLink.className = "card-link";
      aLink.href = STORE_URL(store.slug);
      aLink.textContent = "Visit Store →";

      content.appendChild(h3);
      content.appendChild(p);
      content.appendChild(aLink);

      article.appendChild(aMedia);
      article.appendChild(content);

      frag.appendChild(article);
    });

    gallery.innerHTML = "";
    gallery.appendChild(frag);
  }

  function renderSubNav(data) {
    const list = document.getElementById("sub-nav-list");
    if (!list) return;

    list.innerHTML = data
      .slice(0, 30)
      .map((s) => `<div class="sub-nav-item"><a href="${STORE_URL(s.slug)}">${escapeHtml(s.title)}</a></div>`)
      .join("");
  }

  function initMegaMenu(data) {
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");
    const btn = document.getElementById("btn-categories");
    const header = document.querySelector(".app-header");
    if (!listEl || !detailEl || !btn || !header) return;

    listEl.innerHTML = data
      .map((s, i) => `
        <button class="cat-item ${i === 0 ? "cat-item--active" : ""}" type="button" data-slug="${escapeAttr(s.slug)}">
          <span>${escapeHtml(s.title)}</span>
        </button>`
      )
      .join("");

    setActive(data[0].slug);

    function setActive(slug) {
      listEl.querySelectorAll(".cat-item").forEach((b) => b.classList.remove("cat-item--active"));
      const el = listEl.querySelector(`.cat-item[data-slug="${cssEscape(slug)}"]`);
      if (el) el.classList.add("cat-item--active");
      const store = data.find((x) => x.slug === slug);
      if (store) renderDetail(store, detailEl);
    }

    listEl.querySelectorAll(".cat-item").forEach((item) => {
      item.addEventListener("mouseenter", () => setActive(item.dataset.slug));
      item.addEventListener("click", () => setActive(item.dataset.slug));
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      header.classList.toggle("has-cat-open");
    });

    document.addEventListener("click", (e) => {
      if (!header.classList.contains("has-cat-open")) return;
      if (!header.contains(e.target)) header.classList.remove("has-cat-open");
    });

    document.addEventListener("keydown", (e) => e.key === "Escape" && header.classList.remove("has-cat-open"));
  }

  function renderDetail(store, container) {
    if (!store || !container) return;

    const links = (store.sections || [])
      .slice(0, 10)
      .map((sec) => {
        const name = String(sec?.name ?? sec?.title ?? "").trim();
        if (!name) return "";
        const sectionSlug = String(sec?.slug ?? "").trim() || slugify(name);
        return `<a href="${STORE_SECTION_URL(store.slug, sectionSlug)}">${escapeHtml(name)}</a>`;
      })
      .filter(Boolean)
      .join("");

    container.innerHTML = `
      <div class="cat-detail-title">${escapeHtml(store.title)}</div>
      <div class="cat-detail-subtitle">${escapeHtml(store.tagline || "")}</div>
      <div class="cat-detail-links">
        ${links || ""}
        <a href="${STORE_URL(store.slug)}">View All</a>
      </div>`;
  }

  function initSearchEngine() {
    const input = document.querySelector(".search-input");
    const btn = document.querySelector(".search-btn");
    if (!input || !btn) return;

    const run = () => {
      const q = input.value.trim();
      if (!q) return;
      window.location.href = withBase(`/search.html?q=${enc(q)}`);
    };

    btn.addEventListener("click", run);
    input.addEventListener("keydown", (e) => e.key === "Enter" && run());
  }

  // -----------------------------
  // DEBUG OVERLAY (makes it obvious)
  // -----------------------------
  function showDebug(msg) {
    let box = document.getElementById("rgz-debug");
    if (!box) {
      box = document.createElement("pre");
      box.id = "rgz-debug";
      box.style.cssText =
        "position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;" +
        "background:#111;color:#fff;padding:12px 14px;border-radius:12px;" +
        "font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;" +
        "white-space:pre-wrap;box-shadow:0 10px 30px rgba(0,0,0,.35);";
      document.body.appendChild(box);
    }
    box.textContent = `RGZTEC DEBUG\n\n${msg}`;
  }

  function escapeHtml(str) {
    const p = document.createElement("p");
    p.textContent = String(str ?? "");
    return p.innerHTML;
  }
  function escapeAttr(str) {
    return String(str ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function cssEscape(str) {
    return String(str ?? "").replace(/["\\]/g, "\\$&");
  }
  function slugify(s) {
    return String(s ?? "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})();



