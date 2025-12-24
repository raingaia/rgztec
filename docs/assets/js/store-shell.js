/**
 * RGZTEC Marketplace — STORE SHELL ENGINE (BRAIN, NO-CORE)
 * FINAL v19.1.0
 *
 * Works when you DO NOT have /core.
 * - Static safe: absolute paths only
 * - Base path resolver: root or /rgztec
 * - Data from /data/store.data.json by default
 *
 * Required HTML hooks:
 *  #rgzTopNav, #rgzSectionNav, #rgzHero, #rgzGrid, #rgzBreadcrumb (optional)
 *
 * Routing:
 *  <body data-path="hardware"> or <body data-path="hardware/ai-accelerators">
 *  If missing, infers from URL /store/{...}/
 */

(() => {
  // ---------------------------
  // 0) Base Path Resolver
  // ---------------------------
  function resolveBasePath() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta?.content != null) return String(meta.content).replace(/\/+$/, "");

    const p = window.location.pathname || "/";
    const idx = p.indexOf("/rgztec/");
    if (idx !== -1) return "/rgztec";

    return "";
  }
  const BASE = resolveBasePath();
  const abs = (path) => `${BASE}${path.startsWith("/") ? path : "/" + path}`;

  // ---------------------------
  // 1) Config (NO-CORE)
  // ---------------------------
  const CONFIG = {
    DATA_URL: abs("/data/store.data.json"), // <-- core yoksa burası
    DEFAULT_EMPTY_MSG: "No items found for this section.",
    DEBUG: false,
  };
  const log = (...a) => CONFIG.DEBUG && console.log("[RGZTEC]", ...a);

  // ---------------------------
  // 2) DOM Helpers
  // ---------------------------
  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
    return el;
  };

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showFatal(message, details = "") {
    const box = document.createElement("div");
    box.style.cssText =
      "max-width:980px;margin:40px auto;padding:18px;border:1px solid #eee;border-radius:14px;font-family:Inter,system-ui,Arial;background:#fff;";
    box.innerHTML = `
      <div style="font-weight:800;font-size:18px;margin-bottom:8px;">RGZTEC Store Engine Error</div>
      <div style="color:#333;line-height:1.5;margin-bottom:10px;">${escapeHtml(message)}</div>
      ${details ? `<pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;padding:12px;border-radius:12px;overflow:auto;">${escapeHtml(details)}</pre>` : ""}
      <div style="margin-top:10px;color:#666;font-size:12px;">DATA: ${escapeHtml(CONFIG.DATA_URL)} | BASE: ${escapeHtml(BASE || "(root)")}</div>
    `;
    document.body.prepend(box);
  }

  // ---------------------------
  // 3) Data Load
  // ---------------------------
  async function loadBrain() {
    const res = await fetch(CONFIG.DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Store data fetch failed: ${res.status} ${CONFIG.DATA_URL}`);
    return res.json();
  }

  // ---------------------------
  // 4) Schema Normalizers (tolerant)
  // ---------------------------
  const asArray = (x) => (Array.isArray(x) ? x : x ? [x] : []);

  const getRootStores = (brain) => {
    // Accept: brain.stores OR brain.root.stores OR brain.data.stores OR brain itself array
    const stores =
      asArray(brain?.stores).length ? asArray(brain?.stores) :
      asArray(brain?.root?.stores).length ? asArray(brain?.root?.stores) :
      asArray(brain?.data?.stores).length ? asArray(brain?.data?.stores) :
      Array.isArray(brain) ? brain : [];
    return stores.filter(Boolean);
  };

  const getChildren = (node) =>
    (asArray(node?.children).length ? asArray(node?.children) :
     asArray(node?.substores).length ? asArray(node?.substores) :
     asArray(node?.sections).length ? asArray(node?.sections) :
     asArray(node?.stores).length ? asArray(node?.stores) : [])
    .filter(Boolean);

  const getSlug = (node) => node?.slug || node?.id || node?.key || "";
  const getTitle = (node) => node?.title || node?.name || node?.label || getSlug(node) || "RGZTEC";
  const getBanner = (node) => node?.banner || node?.hero || node?.cover || null;
  const getCards = (node) =>
    (asArray(node?.cards).length ? asArray(node?.cards) :
     asArray(node?.items).length ? asArray(node?.items) :
     asArray(node?.products).length ? asArray(node?.products) : [])
    .filter(Boolean);

  // ---------------------------
  // 5) Route Resolver
  // ---------------------------
  function getRequestedPath() {
    const dp = document.body?.getAttribute("data-path");
    if (dp) return dp.replace(/^\/+|\/+$/g, "");

    const p = (window.location.pathname || "/").replace(BASE, "");
    const parts = p.split("/").filter(Boolean);
    const i = parts.indexOf("store");
    if (i !== -1) return parts.slice(i + 1).join("/");

    return "";
  }

  function findNodeByPath(rootStores, pathStr) {
    const segs = (pathStr || "").split("/").filter(Boolean);
    if (!segs.length) return { node: null, trail: [] };

    const rootSlug = segs[0];
    const root = rootStores.find((s) => getSlug(s) === rootSlug);
    if (!root) return { node: null, trail: [] };

    let current = root;
    const trail = [root];

    for (let i = 1; i < segs.length; i++) {
      const slug = segs[i];
      const kids = getChildren(current);
      const next = kids.find((k) => getSlug(k) === slug);
      if (!next) break;
      current = next;
      trail.push(current);
    }

    return { node: current, trail };
  }

  // ---------------------------
  // 6) URL Builders (ABSOLUTE)
  // ---------------------------
  function storeUrl(rootSlug, sectionPath = "") {
    const tail = sectionPath ? `/${sectionPath.replace(/^\/+|\/+$/g, "")}/` : "/";
    return abs(`/store/${rootSlug}${tail}`);
  }

  // ---------------------------
  // 7) Renderers
  // ---------------------------
  function renderTopNav(rootStores, activeRootSlug) {
    setHTML("rgzTopNav", `
      <div class="rgz-nav-root">
        ${rootStores.map(s => {
          const slug = getSlug(s);
          const active = slug === activeRootSlug ? "is-active" : "";
          return `<a class="rgz-nav-root__item ${active}" href="${storeUrl(slug)}">${escapeHtml(getTitle(s))}</a>`;
        }).join("")}
      </div>
    `);
  }

  function renderSectionNav(rootNode, trail) {
    const rootSlug = getSlug(rootNode);
    const rootChildren = getChildren(rootNode);
    if (!rootChildren.length) return setHTML("rgzSectionNav", "");

    const activeSlug = getSlug(trail[trail.length - 1] || rootNode);

    setHTML("rgzSectionNav", `
      <div class="rgz-nav-section">
        ${rootChildren.map(sec => {
          const secSlug = getSlug(sec);
          const active = secSlug === activeSlug ? "is-active" : "";
          return `<a class="rgz-nav-section__item ${active}" href="${storeUrl(rootSlug, secSlug)}">${escapeHtml(getTitle(sec))}</a>`;
        }).join("")}
      </div>
    `);
  }

  function renderBreadcrumb(trail) {
    if (!trail?.length) return setHTML("rgzBreadcrumb", "");

    const rootSlug = getSlug(trail[0]);
    const items = trail.map((n, i) => {
      const title = getTitle(n);
      const path = trail.slice(1, i + 1).map(getSlug).join("/");
      const href = i === 0 ? storeUrl(rootSlug) : storeUrl(rootSlug, path);
      return `<a href="${href}">${escapeHtml(title)}</a>`;
    });

    setHTML("rgzBreadcrumb", `
      <div class="rgz-bc">${items.join('<span class="rgz-bc__sep">/</span>')}</div>
    `);
  }

  function renderHero(node, rootNode) {
    const b = getBanner(node) || getBanner(rootNode);
    if (!b) {
      setHTML("rgzHero", `
        <div class="rgz-hero rgz-hero--fallback">
          <div class="rgz-hero__kicker">${escapeHtml(getTitle(rootNode))}</div>
          <div class="rgz-hero__title">${escapeHtml(getTitle(node || rootNode))}</div>
          <div class="rgz-hero__sub">Premium digital assets for modern builders.</div>
        </div>
      `);
      return;
    }

    const title = b.title || getTitle(node || rootNode);
    const subtitle = b.subtitle || b.sub || "";
    const kicker = b.kicker || getTitle(rootNode);
    const img = b.image || b.img || b.url || (typeof b === "string" ? b : "");

    setHTML("rgzHero", `
      <div class="rgz-hero">
        <div class="rgz-hero__content">
          <div class="rgz-hero__kicker">${escapeHtml(kicker)}</div>
          <div class="rgz-hero__title">${escapeHtml(title)}</div>
          ${subtitle ? `<div class="rgz-hero__sub">${escapeHtml(subtitle)}</div>` : ""}
        </div>
        ${img ? `<div class="rgz-hero__media"><img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy"/></div>` : ""}
      </div>
    `);
  }

  function renderGridFromCards(cards) {
    if (!cards.length) {
      setHTML("rgzGrid", `<div class="rgz-empty">${escapeHtml(CONFIG.DEFAULT_EMPTY_MSG)}</div>`);
      return;
    }

    setHTML("rgzGrid", `
      <div class="rgz-grid">
        ${cards.map(card => {
          const title = card.title || card.name || "Untitled";
          const desc = card.desc || card.description || "";
          const tag = card.tag || card.badge || "";
          const img = card.image || card.img || "";
          const href = card.href || card.url || "#";
          const isExternal = /^https?:\/\//.test(href);
          const aAttrs = isExternal ? `target="_blank" rel="noopener noreferrer"` : "";
          return `
            <a class="rgz-card" href="${escapeHtml(href)}" ${aAttrs}>
              ${img ? `<div class="rgz-card__media"><img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy"/></div>` : ""}
              <div class="rgz-card__body">
                <div class="rgz-card__title">${escapeHtml(title)}</div>
                ${desc ? `<div class="rgz-card__desc">${escapeHtml(desc)}</div>` : ""}
                ${tag ? `<div class="rgz-card__tag">${escapeHtml(tag)}</div>` : ""}
              </div>
            </a>
          `;
        }).join("")}
      </div>
    `);
  }

  function renderChildrenAsCards(node, rootSlug, trail) {
    const kids = getChildren(node);
    if (!kids.length) return false;

    const pathPrefix = trail.slice(1).map(getSlug).join("/");
    const cards = kids.map(kid => {
      const slug = getSlug(kid);
      const title = getTitle(kid);
      const b = getBanner(kid);
      const img = b?.image || b?.img || b?.url || "";
      const subtitle = b?.subtitle || b?.sub || kid?.subtitle || "";
      const fullPath = pathPrefix ? `${pathPrefix}/${slug}` : slug;
      return {
        title,
        description: subtitle,
        image: img,
        href: storeUrl(rootSlug, fullPath),
        badge: "Open"
      };
    });

    renderGridFromCards(cards);
    return true;
  }

  // ---------------------------
  // 8) Boot
  // ---------------------------
  async function boot() {
    try {
      const brain = await loadBrain();
      const rootStores = getRootStores(brain);
      if (!rootStores.length) throw new Error("No root stores found in JSON (brain.stores missing).");

      const requestedPath = getRequestedPath(); // "hardware/ai-accelerators"
      log("BASE", BASE, "requestedPath", requestedPath);

      if (!requestedPath) {
        const first = rootStores[0];
        renderTopNav(rootStores, getSlug(first));
        renderSectionNav(first, [first]);
        renderBreadcrumb([first]);
        renderHero(first, first);

        const did = renderChildrenAsCards(first, getSlug(first), [first]);
        if (!did) renderGridFromCards(getCards(first));
        return;
      }

      const { node, trail } = findNodeByPath(rootStores, requestedPath);
      if (!node || !trail.length) {
        renderTopNav(rootStores, "");
        setHTML("rgzHero", "");
        setHTML("rgzSectionNav", "");
        setHTML("rgzBreadcrumb", "");
        setHTML("rgzGrid", `<div class="rgz-empty">Store path not found: <b>${escapeHtml(requestedPath)}</b></div>`);
        return;
      }

      const rootNode = trail[0];
      const rootSlug = getSlug(rootNode);

      renderTopNav(rootStores, rootSlug);
      renderSectionNav(rootNode, trail);
      renderBreadcrumb(trail);
      renderHero(node, rootNode);

      const cards = getCards(node);
      if (cards.length) {
        renderGridFromCards(cards);
      } else {
        const did = renderChildrenAsCards(node, rootSlug, trail);
        if (!did) renderGridFromCards([]);
      }

    } catch (err) {
      showFatal(
        "Store engine failed to boot. Most common: /data/store.data.json 404 OR script path wrong OR missing data-path.",
        err?.stack || String(err)
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

