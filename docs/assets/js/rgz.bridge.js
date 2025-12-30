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

  // ✅ STATIC SNAPSHOTS (Amplify /docs publish eder)
  const PUBLIC = {
    stores: withBase("/data/store.data.json"),
    categories: withBase("/data/categories.json"),
    searchIndex: withBase("/data/search.index.json"),
  };

  const URLS = {
    STORE: (slug) => withBase(`/store/${enc(slug)}/`),
    STORE_SECTION: (storeSlug, sectionSlug) => withBase(`/store/${enc(storeSlug)}/${enc(sectionSlug)}/`),
    ASSET: (p) => withBase(`/assets/${String(p ?? "").replace(/^\/+/, "")}`),
  };

  async function fetchJson(url, { timeout = 12000 } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      if (/<html|<!doctype/i.test(text)) throw new Error(`HTML returned (rewrite) for ${url}`);
      return JSON.parse(text);
    } finally {
      clearTimeout(t);
    }
  }

  // ✅ stores snapshot
  async function getStores() {
    return await fetchJson(PUBLIC.stores);
  }

  // ✅ categories snapshot (API değil)
  async function getCategories() {
    return await fetchJson(PUBLIC.categories);
  }

  // ✅ search snapshot (API değil)
  let __searchCache = null;
  async function getSearchIndex() {
    if (__searchCache) return __searchCache;
    __searchCache = await fetchJson(PUBLIC.searchIndex);
    return __searchCache;
  }

  // search.index.json içinden filtrele
  async function search(q) {
    const query = String(q ?? "").trim().toLowerCase();
    if (!query) return { q: "", total: 0, results: [] };

    const idx = await getSearchIndex();
    const list = Array.isArray(idx?.items) ? idx.items : Array.isArray(idx) ? idx : [];

    const hits = list.filter((it) => {
      const hay = `${it.title ?? ""} ${it.subtitle ?? ""} ${it.storeTitle ?? ""} ${it.tags ?? ""}`.toLowerCase();
      return hay.includes(query);
    }).slice(0, 40);

    return { q: query, total: hits.length, results: hits };
  }

  window.RGZ = { BASE, withBase, enc, PUBLIC, URLS, fetchJson, getStores, getCategories, search };
})();

