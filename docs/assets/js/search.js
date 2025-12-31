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

  const DATA_URL = withBase("/data/store.data.json");

  const URLS = {
    STORE: (slug) => withBase(`/store/${enc(slug)}/`),
    SECTION: (storeSlug, sectionSlug) => withBase(`/store/${enc(storeSlug)}/${enc(sectionSlug)}/`),
  };

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    if (/<html|<!doctype/i.test(text)) throw new Error(`HTML returned for ${url} (rewrite?)`);
    return JSON.parse(text);
  }

  // Flatten store.data.json into searchable entries
  function buildEntries(storesObj) {
    const entries = [];
    for (const storeSlug of Object.keys(storesObj || {})) {
      const store = storesObj[storeSlug] || {};
      entries.push({
        type: "store",
        storeSlug,
        sectionSlug: "",
        productId: "",
        title: store.title || storeSlug,
        tagline: store.tagline || "",
      });

      const sections = Array.isArray(store.sections) ? store.sections : [];
      for (const sec of sections) {
        const sectionSlug = sec.slug || "";
        entries.push({
          type: "section",
          storeSlug,
          sectionSlug,
          productId: "",
          title: sec.name || sectionSlug,
          tagline: sec.tagline || "",
        });

        const products = Array.isArray(sec.products) ? sec.products : [];
        for (const p of products) {
          entries.push({
            type: "product",
            storeSlug,
            sectionSlug,
            productId: p.id || "",
            title: p.title || p.id || "Product",
            tagline: p.tagline || "",
          });
        }

        // nested sections support (like tiny-js-lab has "sections" inside sections)
        const nested = Array.isArray(sec.sections) ? sec.sections : [];
        for (const sub of nested) {
          const subSlug = sub.slug || "";
          entries.push({
            type: "section",
            storeSlug,
            sectionSlug: subSlug,
            productId: "",
            title: sub.name || subSlug,
            tagline: sub.tagline || "",
          });

          const subProducts = Array.isArray(sub.products) ? sub.products : [];
          for (const p of subProducts) {
            entries.push({
              type: "product",
              storeSlug,
              sectionSlug: subSlug,
              productId: p.id || "",
              title: p.title || p.id || "Product",
              tagline: p.tagline || "",
            });
          }
        }
      }
    }
    return entries;
  }

  function scoreMatch(q, e) {
    const hay = `${e.title} ${e.tagline} ${e.storeSlug} ${e.sectionSlug} ${e.productId}`.toLowerCase();
    if (!hay.includes(q)) return 0;

    // simple scoring: prefer title matches, then type priority
    let s = 10;
    if ((e.title || "").toLowerCase().includes(q)) s += 20;
    if (e.type === "store") s += 8;
    if (e.type === "section") s += 4;
    return s;
  }

  function ensureResultsUI() {
    // minimal dropdown under search bar
    let wrap = document.getElementById("rgz-search-results");
    if (wrap) return wrap;

    const input = document.querySelector(".search-input");
    if (!input) return null;

    wrap = document.createElement("div");
    wrap.id = "rgz-search-results";
    wrap.style.position = "absolute";
    wrap.style.top = "calc(100% + 10px)";
    wrap.style.left = "0";
    wrap.style.right = "0";
    wrap.style.background = "#fff";
    wrap.style.border = "1px solid rgba(0,0,0,0.08)";
    wrap.style.borderRadius = "14px";
    wrap.style.boxShadow = "0 18px 40px rgba(0,0,0,0.12)";
    wrap.style.overflow = "hidden";
    wrap.style.display = "none";
    wrap.style.zIndex = "99999";

    const bar = input.closest(".search-bar");
    if (!bar) return null;
    bar.style.position = "relative";
    bar.appendChild(wrap);

    return wrap;
  }

  function renderResults(wrap, results, q) {
    if (!wrap) return;
    if (!q || results.length === 0) {
      wrap.style.display = "none";
      wrap.innerHTML = "";
      return;
    }

    wrap.innerHTML = results
      .slice(0, 10)
      .map((r) => {
        const label =
          r.type === "store" ? "Store" : r.type === "section" ? "Section" : "Product";
        const href =
          r.type === "store"
            ? URLS.STORE(r.storeSlug)
            : URLS.SECTION(r.storeSlug, r.sectionSlug) + (r.type === "product" ? `?p=${enc(r.productId)}` : "");

        return `
        <a href="${href}" style="
          display:flex; flex-direction:column; gap:3px;
          padding:12px 14px; text-decoration:none;
          border-bottom:1px solid rgba(0,0,0,0.06);
          color:#111827;
        ">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="font-weight:900;">${r.title}</div>
            <div style="font-size:12px; font-weight:800; color:#ff6b00;">${label}</div>
          </div>
          <div style="font-size:13px; color:#6b7280; line-height:1.4;">
            ${r.type === "store" ? r.storeSlug : `${r.storeSlug} / ${r.sectionSlug}`}
          </div>
        </a>`;
      })
      .join("");

    wrap.style.display = "block";
  }

  async function boot() {
    const input = document.querySelector(".search-input");
    const btn = document.querySelector(".search-btn");
    if (!input) return;

    const wrap = ensureResultsUI();

    let entries = [];
    try {
      const stores = await fetchJson(DATA_URL);
      entries = buildEntries(stores);
    } catch (err) {
      console.warn("[search] store.data.json failed:", err);
      return;
    }

    let lastQ = "";
    const run = () => {
      const q = String(input.value || "").trim().toLowerCase();
      lastQ = q;
      if (q.length < 2) return renderResults(wrap, [], q);

      const scored = entries
        .map((e) => ({ e, s: scoreMatch(q, e) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.e);

      renderResults(wrap, scored, q);
    };

    input.addEventListener("input", run);
    input.addEventListener("focus", run);

    document.addEventListener("click", (e) => {
      if (!wrap) return;
      const inside = wrap.contains(e.target) || input.contains(e.target);
      if (!inside) renderResults(wrap, [], lastQ);
    });

    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      run();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
