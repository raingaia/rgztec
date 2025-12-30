(function () {
  "use strict";

  // ----------------------------
  // BASE RESOLUTION
  // ----------------------------
  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta?.content) return String(meta.content).trim().replace(/\/+$/, "");
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase();
  const withBase = (p) => (BASE ? `${BASE}${p}` : p);
  const enc = (s) => encodeURIComponent(String(s ?? ""));

  // ----------------------------
  // ROUTES / SOURCES
  // ----------------------------
  const PUBLIC = {
    // ✅ Snapshot (static)
    stores: withBase("/data/store.data.json"),

    // ✅ JSON fallbacks (API çalışmazsa)
    categories: withBase("/api/data/categories.json"),
    searchIndex: withBase("/api/data/search.index.json"),
  };

  const API = {
    // ✅ Live endpoints (varsa)
    categories: withBase("/api/categories"),
    search: withBase("/api/search"),
  };

  const URLS = {
    STORE: (slug) => withBase(`/store/${enc(slug)}/`),
    STORE_SECTION: (storeSlug, sectionSlug) =>
      withBase(`/store/${enc(storeSlug)}/${enc(sectionSlug)}/`),
    ASSET: (p) => withBase(`/assets/${String(p ?? "").replace(/^\/+/, "")}`),
  };

  // ----------------------------
  // FETCH JSON (SAFE)
  // ----------------------------
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

  // ----------------------------
  // STORES (SNAPSHOT)
  // ----------------------------
  async function getStores() {
    return await fetchJson(PUBLIC.stores);
  }

  // ----------------------------
  // CATEGORIES (API -> FALLBACK JSON)
  // ----------------------------
  async function getCategories() {
    try {
      return await fetchJson(API.categories);
    } catch (e) {
      return await fetchJson(PUBLIC.categories);
    }
  }

  // ----------------------------
  // SEARCH (API -> FALLBACK INDEX.JSON)
  // ----------------------------
  let __searchIndexCache = null;

  async function getSearchIndex() {
    if (__searchIndexCache) return __searchIndexCache;
    __searchIndexCache = await fetchJson(PUBLIC.searchIndex);
    return __searchIndexCache;
  }

  function norm(s) {
    return String(s ?? "").toLowerCase().trim();
  }

  function makeHay(it) {
    // aramada store + section + product alanlarını topluyoruz
    return norm(
      [
        it.type,
        it.title,
        it.tagline,
        it.store,
        it.section,
        it.id,
        it.category,
        it.keywords,
      ]
        .flat()
        .filter(Boolean)
        .join(" ")
    );
  }

  function computeHref(it) {
    // kart basmıyoruz => yönlendirme
    // product da olsa section’a/ store’a götür
    if (it.store && it.section) return URLS.STORE_SECTION(it.store, it.section);
    if (it.store) return URLS.STORE(it.store);
    if (it.href) return withBase(it.href);
    return "";
  }

  async function search(q) {
    const query = norm(q);
    if (!query) return { q: "", results: [] };

    // 1) Live API
    try {
      const url = `${API.search}?q=${enc(q)}`;
      return await fetchJson(url);
    } catch (e) {
      // 2) Fallback: search.index.json üzerinde local filtre
      const data = await getSearchIndex();
      const items = Array.isArray(data?.items) ? data.items : [];

      const results = items
        .map((it) => ({
          ...it,
          _hay: makeHay(it),
        }))
        .filter((it) => it._hay.includes(query))
        .slice(0, 14)
        .map((it) => ({
          type: it.type || "item",
          title: it.title || it.name || it.store || "Untitled",
          tagline: it.tagline || "",
          store: it.store || "",
          section: it.section || "",
          id: it.id || "",
          href: computeHref(it),
        }));

      return { q, results };
    }
  }

  // ----------------------------
  // EXPORT
  // ----------------------------
  window.RGZ = {
    BASE,
    withBase,
    enc,
    PUBLIC,
    API,
    URLS,
    fetchJson,
    getStores,
    getCategories,
    search,

    // debug helpers (istersen console’da bak)
    _getSearchIndex: getSearchIndex,
  };
})();

