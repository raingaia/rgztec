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

  const PUBLIC = {
    stores: withBase("/data/store.data.json"),       // ✅ snapshot
  };

  const API = {
    categories: withBase("/api/categories"),         // ✅ live
    search: withBase("/api/search"),                 // ✅ live
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

  // ✅ STORES = snapshot (API’ye bağımlı değil)
  async function getStores() {
    return await fetchJson(PUBLIC.stores);
  }

  // ✅ CATEGORIES = always API
  async function getCategories() {
    return await fetchJson(API.categories);
  }

  // ✅ SEARCH = always API
  async function search(q) {
    const url = `${API.search}?q=${enc(q)}`;
    return await fetchJson(url);
  }

  window.RGZ = { BASE, withBase, enc, PUBLIC, API, URLS, fetchJson, getStores, getCategories, search };
})();
