/* ==========================================================================
   RGZTEC — Shared JS (assets/js/main.js)
   - Robust utilities ($, $$, on, qs, debounce)
   - Year setter
   - Image fallback (webp -> png -> jpg -> data-fallback)
   - Lazy-load (IntersectionObserver) with fallback to eager
   - Header v2 search + Home search + Catalog search
   - Category chips router (supports multiple chip groups)
   - Active nav link highlighter + subnav current state
   - Client-side cart & wishlist (localStorage) + badge updater
   - Products loader (assets/data/products.json) with filters:
       ?cat=, ?q=, ?sort=price|new|alpha, ?page=
     + grid renderer for containers with [data-mount="product-grid"]
   - Helpers for building product URLs (detail, demo)
   - Smooth hash scroll
   - Minimal event telemetry (console only)
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------- */
  /* Tiny DOM & misc utilities                                            */
  /* --------------------------------------------------------------------- */
  const $  = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const qs = (key, dflt = null, url = location.href) =>
    new URL(url).searchParams.get(key) ?? dflt;

  const debounce = (fn, ms = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const log = (...a) => console.log("[RGZTEC]", ...a);

  /* Figure out site base (works with <base href="/rgztec/"> or plain file) */
  const BASE = (function () {
    const b = document.querySelector("base");
    if (b && b.href) return new URL(b.getAttribute("href"), location.origin).pathname;
    // fall back to repo root heuristic
    const parts = location.pathname.split("/");
    return parts.slice(0, parts.indexOf("rgztec") + 1).join("/") + "/";
  })();

  /* Build absolute path respecting base */
  const urlFrom = (path) =>
    new URL(path, location.origin + BASE).pathname + (path.includes("?") ? path.split("?")[1] ? "?" + path.split("?")[1] : "" : "");

  /* --------------------------------------------------------------------- */
  /* Footer year                                                           */
  /* --------------------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------------------------------------------------------------------- */
  /* Image fallback & lazy loading                                         */
  /* --------------------------------------------------------------------- */
  function attachImageFallback(root = document) {
    $$("img", root).forEach((img) => {
      const src = img.getAttribute("src") || "";
      const base = src.replace(/\.(webp|png|jpe?g)$/i, "");
      const custom = img.getAttribute("data-fallback");

      img.onerror = () => {
        if (img.src.endsWith(".webp")) { img.src = base + ".png"; return; }
        if (img.src.endsWith(".png"))  { img.src = base + ".jpg"; return; }
        if (custom && !img.src.endsWith(custom)) { img.src = custom; return; }
        img.onerror = null; // stop looping
      };
    });
  }

  // Lazy load images with data-src (optional)
  function lazyLoad(root = document) {
    const targets = $$("img[data-src]", root);
    if (!("IntersectionObserver" in window) || !targets.length) {
      targets.forEach((img) => (img.src = img.dataset.src));
      attachImageFallback(root);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const img = e.target;
        img.src = img.dataset.src;
        io.unobserve(img);
      });
    }, { rootMargin: "300px" });
    targets.forEach((img) => io.observe(img));
    attachImageFallback(root);
  }

  attachImageFallback();

  /* --------------------------------------------------------------------- */
  /* Search forms                                                          */
  /* - Header:   #navSearch + #navQ
  /* - Home:     #homeSearch + #q
  /* - Catalog:  #searchForm + #q
  /* Redirects to products/category.html with ?q=
  /* --------------------------------------------------------------------- */
  function wireSearch(formId, inputId) {
    const form  = document.getElementById(formId);
    const input = document.getElementById(inputId);
    if (!form || !input) return;

    const go = () => {
      const term = (input.value || "").trim();
      const url  = new URL(urlFrom("products/category.html"), location.origin);
      if (term) url.search = "q=" + encodeURIComponent(term);
      location.href = url.pathname + url.search;
    };

    on(form, "submit", (e) => { e.preventDefault(); go(); });
    // Optional: press Enter anywhere in field already catches submit; add debounce for live
    on(input, "input", debounce(() => {
      input.setAttribute("aria-live", "polite");
    }, 250));
  }
  wireSearch("navSearch", "navQ");
  wireSearch("homeSearch", "q");
  wireSearch("searchForm", "q");

  /* --------------------------------------------------------------------- */
  /* Category chips router (supports multiple groups)                      */
  /* <div id="chips"> or any [data-chip-group="categories"]                */
  /* Routes to products/category.html?cat=<cat> or #freebies               */
  /* --------------------------------------------------------------------- */
  function handleChipClick(e) {
    const chip = e.target.closest("[data-cat]");
    if (!chip) return;
    const cat = chip.dataset.cat || "all";
    if (cat === "free") {
      location.href = urlFrom("products/category.html#freebies");
    } else {
      const url = new URL(urlFrom("products/category.html"), location.origin);
      if (cat !== "all") url.search = "cat=" + encodeURIComponent(cat);
      location.href = url.pathname + url.search;
    }
  }
  on(document.getElementById("chips"), "click", handleChipClick);
  $$('[data-chip-group="categories"]').forEach((g) => on(g, "click", handleChipClick));

  /* --------------------------------------------------------------------- */
  /* Active nav highlight                                                  */
  /* --------------------------------------------------------------------- */
  (function highlightNav() {
    const here = location.pathname.replace(/\/+$/, "");
    $$(".header-v2 .main a, .menu a, .rail a").forEach((a) => {
      try {
        const ap = new URL(a.getAttribute("href"), location.origin + BASE)
          .pathname.replace(/\/+$/, "");
        if (ap && ap !== "/" && here.startsWith(ap)) {
          a.classList.add("active");
          a.setAttribute("aria-current", "page");
        }
      } catch (_) {}
    });
  })();

  /* --------------------------------------------------------------------- */
  /* Smooth hash scroll                                                    */
  /* --------------------------------------------------------------------- */
  on(document, "click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + id);
    }
  });

  /* --------------------------------------------------------------------- */
  /* Cart & wishlist (localStorage)                                        */
  /* --------------------------------------------------------------------- */
  const CART_KEY = "rgz_cart";
  const WISHLIST_KEY = "rgz_wishlist";

  const readJSON = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  function getCart() { return readJSON(CART_KEY, {}); }
  function setCart(c) { writeJSON(CART_KEY, c); updateCartBadge(); }
  function addToCart(id, qty = 1) {
    const c = getCart(); c[id] = (c[id] || 0) + qty; setCart(c);
  }
  function updateCartBadge() {
    const c = getCart();
    const count = Object.values(c).reduce((n, x) => n + (parseInt(x, 10) || 0), 0);
    $$("#cartCount,[data-cart-count]").forEach((el) => (el.textContent = String(count)));
  }
  updateCartBadge();

  // Intercept cart links: cart.html?add=ID  OR  [data-add="ID"]
  on(document, "click", (e) => {
    const addLink = e.target.closest('a[href*="cart.html?add="], [data-add]');
    if (!addLink) return;

    let id = addLink.getAttribute("data-add");
    if (!id && addLink.tagName === "A") {
      const u = new URL(addLink.getAttribute("href"), location.origin + BASE);
      id = u.searchParams.get("add");
    }
    if (!id) return;

    e.preventDefault();
    addToCart(id, 1);

    // tiny feedback
    const old = addLink.textContent;
    addLink.textContent = "Added ✓";
    addLink.classList.add("badge");
    setTimeout(() => { addLink.textContent = old || "Add"; addLink.classList.remove("badge"); }, 1200);

    log("cart:add", id);
  });

  // Wishlist: [data-wish="ID"] toggle
  on(document, "click", (e) => {
    const btn = e.target.closest("[data-wish]");
    if (!btn) return;
    const id = btn.dataset.wish;
    const wl = new Set(readJSON(WISHLIST_KEY, []));
    if (wl.has(id)) { wl.delete(id); btn.classList.remove("active"); }
    else { wl.add(id); btn.classList.add("active"); }
    writeJSON(WISHLIST_KEY, Array.from(wl));
    log("wishlist:toggle", id);
  });

  /* --------------------------------------------------------------------- */
  /* Products loader & grid renderer                                       */
  /* --------------------------------------------------------------------- */
  const DATA_URL = urlFrom("assets/data/products.json");
  let PRODUCTS = null;

  async function loadProducts() {
    if (PRODUCTS) return PRODUCTS;
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      PRODUCTS = Array.isArray(json) ? json : (json.items || []);
      log("products:loaded", PRODUCTS.length);
    } catch (err) {
      console.warn("products:failed", err);
      PRODUCTS = []; // degrade gracefully
    }
    return PRODUCTS;
  }

  // helpers
  const productImage = (p) =>
    p.image ||
    `images/catalog/html${encodeURIComponent(p.id || "")}.webp`;

  const productDetailURL = (p) =>
    urlFrom(`products/detail.html?id=${encodeURIComponent(p.id)}&slug=${encodeURIComponent(p.slug || (p.title||"").toLowerCase().replace(/\s+/g,"-"))}`);

  const productDemoURL = (p) =>
    p.demo || `images/catalog/html${encodeURIComponent(p.id)}.html`;

  function filterProducts(list, { cat, q }) {
    let out = list.slice(0);
    if (cat && cat !== "all") {
      const C = String(cat).toLowerCase();
      out = out.filter((p) => String(p.category || p.cat || "").toLowerCase().includes(C));
    }
    if (q) {
      const Q = String(q).toLowerCase();
      out = out.filter((p) =>
        String(p.title || "").toLowerCase().includes(Q) ||
        String(p.desc || p.description || "").toLowerCase().includes(Q) ||
        String(p.tags || "").toLowerCase().includes(Q)
      );
    }
    return out;
  }

  function sortProducts(list, sort) {
    const s = (sort || "").toLowerCase();
    if (s === "price") return list.slice(0).sort((a,b)=>(+a.price||0)-(+b.price||0));
    if (s === "alpha") return list.slice(0).sort((a,b)=>String(a.title).localeCompare(String(b.title)));
    // "new" or default: by id desc if id numeric
    return list.slice(0).sort((a,b)=>(+b.id||0)-(+a.id||0));
  }

  function paginate(list, page=1, perPage=20) {
    const p = Math.max(1, parseInt(page,10)||1);
    const start = (p-1)*perPage;
    const end   = start + perPage;
    const total = Math.ceil(list.length / perPage) || 1;
    return { items:list.slice(start,end), page:p, total, perPage };
  }

  function cardHTML(p){
    const img = productImage(p);
    const detail = productDetailURL(p);
    const demo = productDemoURL(p);
    const price = p.price ? `$${p.price}` : (p.free ? "Free" : "$—");

    return `
      <article class="card pop" data-id="${p.id||""}">
        <a class="thumb" href="${detail}">
          <img src="${img}" alt="${escapeHtml(p.title||"Item")}" loading="lazy" decoding="async"
               data-fallback="${img.replace(/\.webp$/i,'.png')}">
        </a>
        <div class="body">
          <div class="title">${escapeHtml(p.title||"Untitled")}</div>
          <p class="desc">${escapeHtml(p.desc || p.description || "")}</p>
          <div class="meta"><div class="price">${price}</div><span class="muted">${escapeHtml(p.category||p.cat||"")}</span></div>
          <div class="actions">
            <a class="btn" target="_blank" rel="noopener" href="${demo}" data-action="live">Preview</a>
            <a class="btn" href="${detail}">Details</a>
            <a class="btn primary" href="cart.html?add=${encodeURIComponent(p.id)}">Add</a>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  async function mountProductGrid() {
    const mount = $('[data-mount="product-grid"]');
    if (!mount) return; // nothing to do on this page

    const cat  = qs("cat") || mount.getAttribute("data-cat") || "";
    const q    = qs("q") || "";
    const sort = qs("sort") || mount.getAttribute("data-sort") || "new";
    const page = qs("page") || 1;

    const all = await loadProducts();
    let list = filterProducts(all, { cat, q });
    list = sortProducts(list, sort);
    const { items, total } = paginate(list, page, 20);

    mount.innerHTML = items.map(cardHTML).join("") || emptyStateHTML({cat,q});
    attachImageFallback(mount);
    lazyLoad(mount);

    renderPagination(mount, { total, page: parseInt(page,10)||1, base: "products/category.html", q, cat, sort });
  }

  function emptyStateHTML({cat,q}){
    const note = q ? `No results for “${escapeHtml(q)}”.` :
                cat ? `No items in “${escapeHtml(cat)}”.` : "No items yet.";
    return `
      <div class="card h-min" style="padding:22px">
        <div class="title">Nothing found</div>
        <p class="desc">${note}</p>
        <div class="actions"><a class="btn" href="${urlFrom("products/index.html")}">Back to all products</a></div>
      </div>
    `;
  }

  function renderPagination(mount, { total, page, base, q, cat, sort }){
    const pag = document.createElement("div");
    pag.className = "row mt-18";
    pag.setAttribute("role","navigation");
    const mk = (p, label) => {
      const u = new URL(urlFrom(base), location.origin);
      if (q) u.searchParams.set("q", q);
      if (cat) u.searchParams.set("cat", cat);
      if (sort) u.searchParams.set("sort", sort);
      u.searchParams.set("page", p);
      return `<a class="btn${p===page?' badge':''}" href="${u.pathname+u.search}">${label}</a>`;
    };
    const prev = Math.max(1, page-1);
    const next = Math.min(total, page+1);

    pag.innerHTML = `
      <div class="gap-8 row">
        ${page>1? mk(1,"First") : ""}
        ${page>1? mk(prev,"Prev") : ""}
        <span class="pill">Page ${page} / ${total}</span>
        ${page<total? mk(next,"Next") : ""}
        ${page<total? mk(total,"Last") : ""}
      </div>
    `;
    mount.after(pag);
  }

  // Auto-mount on pages that include product grid placeholder
  mountProductGrid();

  /* --------------------------------------------------------------------- */
  /* Demo page helper: ?item=&slug=&open=1                                 */
  /* (If the page uses demo/index.html provided earlier, this is optional) */
  /* --------------------------------------------------------------------- */
  (function demoDeepLink(){
    const isDemo = /\/demo\/index\.html$/i.test(location.pathname);
    if (!isDemo) return;
    // we rely on markup built by that page; nothing to do here
  })();

  /* --------------------------------------------------------------------- */
  /* Minimal analytics (console only)                                      */
  /* --------------------------------------------------------------------- */
  on(document, "click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (/cart\.html\?add=/.test(href)) log("event:add_to_cart", href);
    else if (/\blive\b|preview/i.test(a.textContent || "")) log("event:preview", href);
    else if (/detail\.html/i.test(href)) log("event:details", href);
  });

  /* expose tiny API */
  window.RGZTEC = Object.freeze({
    getCart,
    addToCart,
    attachImageFallback,
    lazyLoad
  });
})();
