// apps/core/engine.js
// RGZTEC Core Engine (MVP -> API-ready)
// - Loads DB from /data/store.data.json
// - Allows localStorage override (rgz_db_override)
// - Provides sync() to persist override
// - Utilities: count, search, flatten
const Engine = (() => {
  const STATE = {
    booted: false,
    source: "none",
    db: null,
    lastLoadedAt: 0,
    version: "1.0.0-premium-mvp",
  };

  const OVERRIDE_KEY = "rgz_db_override";
  const USERS_KEY = "rgztec_users";
  const SESSION_KEY = "rgztec_session";
  const APPLICATIONS_KEY = "rgztec_openstore_applications";

  function now() { return Date.now(); }

  function safeJSONParse(s, fallback = null) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  function getOverride() {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return raw ? safeJSONParse(raw, null) : null;
  }

  function setOverride(obj) {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(obj));
  }

  async function fetchDB() {
    // Always read from /data/... (Vercel rewrite already maps /data -> /docs/data)
    const url = "/data/store.data.json?v=" + now();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`DB fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
  }

  async function boot() {
    if (STATE.booted) return;

    // 1) Try local override first
    const override = getOverride();
    if (override && typeof override === "object") {
      STATE.db = override;
      STATE.source = "localStorage-override";
      STATE.lastLoadedAt = now();
      STATE.booted = true;
      return;
    }

    // 2) Fetch from /data
    const db = await fetchDB();
    STATE.db = db;
    STATE.source = "fetched:/data/store.data.json";
    STATE.lastLoadedAt = now();
    STATE.booted = true;
  }

  function getDB() {
    if (!STATE.booted) throw new Error("Engine not booted. Call Engine.boot() first.");
    return STATE.db || {};
  }

  function getMeta() {
    return { ...STATE };
  }

  async function reload({ preferOverride = true } = {}) {
    if (preferOverride) {
      const override = getOverride();
      if (override && typeof override === "object") {
        STATE.db = override;
        STATE.source = "localStorage-override";
        STATE.lastLoadedAt = now();
        return;
      }
    }
    const db = await fetchDB();
    STATE.db = db;
    STATE.source = "fetched:/data/store.data.json";
    STATE.lastLoadedAt = now();
  }

  async function sync(newDB) {
    if (!newDB || typeof newDB !== "object") throw new Error("sync() expects an object DB");
    setOverride(newDB);
    STATE.db = newDB;
    STATE.source = "localStorage-override";
    STATE.lastLoadedAt = now();
    return true;
  }

  function clearOverride() {
    localStorage.removeItem(OVERRIDE_KEY);
  }

  // ---------- Helpers ----------
  function countTree(node) {
    let c = 0;
    if (!node) return 0;
    if (Array.isArray(node.products)) c += node.products.length;
    if (Array.isArray(node.sections)) {
      c += node.sections.length;
      node.sections.forEach(s => { c += countTree(s); });
    }
    return c;
  }

  function inventorySummary(db) {
    const slugs = Object.keys(db || {});
    let totalEntries = 0;
    slugs.forEach(k => { totalEntries += countTree(db[k]); });
    return { stores: slugs.length, totalEntries };
  }

  function normalizeStr(s) {
    return String(s || "").trim().toLowerCase();
  }

  function search(db, query, { limit = 200 } = {}) {
    const q = normalizeStr(query);
    if (q.length < 2) return [];
    const results = [];

    function dive(obj, storeSlug, pathParts = []) {
      if (!obj) return;

      // products
      if (Array.isArray(obj.products)) {
        obj.products.forEach(p => {
          const title = String(p?.title || "");
          const tagline = String(p?.tagline || "");
          const hay = (title + " " + tagline).toLowerCase();
          if (hay.includes(q)) {
            results.push({
              type: "product",
              storeSlug,
              title: title || "Product",
              tagline: tagline || "",
              image: p?.image || "",
              url: p?.url || "#",
              isExternal: true,
              path: pathParts.join("/")
            });
          }
        });
      }

      // sections
      if (Array.isArray(obj.sections)) {
        obj.sections.forEach(s => {
          const name = String(s?.name || s?.title || "");
          const slug = String(s?.slug || "");
          const hay = (name + " " + String(s?.tagline || "")).toLowerCase();
          if (hay.includes(q)) {
            results.push({
              type: "section",
              storeSlug,
              title: name || slug || "Section",
              tagline: String(s?.tagline || "Shop Section"),
              image: s?.image || "",
              url: slug ? `/store/${storeSlug}/${slug}/` : `/store/${storeSlug}/`,
              isExternal: false,
              path: [...pathParts, slug].filter(Boolean).join("/")
            });
          }
          dive(s, storeSlug, [...pathParts, slug].filter(Boolean));
        });
      }
    }

    Object.keys(db || {}).forEach(storeSlug => {
      dive(db[storeSlug], storeSlug, []);
    });

    return results.slice(0, limit);
  }

  // ---------- Auth helpers (MVP) ----------
  function getUsers() {
    return safeJSONParse(localStorage.getItem(USERS_KEY) || "{}", {});
  }
  function setUsers(usersObj) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usersObj || {}));
  }
  function getSession() {
    return safeJSONParse(localStorage.getItem(SESSION_KEY) || "null", null);
  }
  function setSession(s) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    // older demo keys compatibility
    localStorage.removeItem("rgz_seller_token");
    localStorage.removeItem("rgz_seller_id");
  }

  // ---------- Open store applications ----------
  function getApplications() {
    return safeJSONParse(localStorage.getItem(APPLICATIONS_KEY) || "[]", []);
  }
  function addApplication(app) {
    const arr = getApplications();
    arr.unshift({ ...app, id: "app_" + now(), createdAt: now() });
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(arr));
    return arr[0];
  }

  return {
    boot,
    reload,
    getDB,
    getMeta,
    sync,
    clearOverride,

    // helpers
    countTree,
    inventorySummary,
    search,

    // auth + apps
    getUsers, setUsers,
    getSession, setSession, clearSession,
    getApplications, addApplication,
  };
})();

export default Engine;

