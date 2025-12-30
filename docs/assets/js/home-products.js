/* RGZTEC HOME MANAGER – FINAL (AUTO-BASE + ABSOLUTE LINKS)
 * Works for:
 * - GitHub Pages: https://raingaia.github.io/rgztec/  -> BASE="/rgztec"
 * - Vercel root : https://yourdomain.com/            -> BASE=""
 *
 * RULE:
 * - ALL store links use:  /{BASE}/store/{slug}/
 * - ALL assets use:       /{BASE}/assets/...
 */
(function () {
  "use strict";

  // ---------- BASE RESOLVER ----------
  function resolveBase() {
    // 1) Optional meta override: <meta name="rgz-base" content="/rgztec">
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) return String(meta.content).trim().replace(/\/+$/, "");

    // 2) Auto-detect
    const p = location.pathname || "/";
    return p.includes("/rgztec/") ? "/rgztec" : "";
  }

  const BASE = resolveBase(); // "" or "/rgztec"
  const withBase = (p) => (BASE ? `${BASE}${p}` : p); // p must start with "/"
  const enc = (s) => encodeURIComponent(String(s || ""));

  const STORE_URL = (slug) => withBase(`/store/${enc(slug)}/`);
  const ASSET_URL = (p) => withBase(`/assets/${String(p || "").replace(/^\/+/, "")}`);

  const STORE_IMAGE_BASE = ASSET_URL("images/store/"); // ends with /
  const PLACEHOLDER_IMG = ASSET_URL("images/placeholder.png");

  // ---- STORE DATA (home seed) ----
  const STORES_DATA = [
    {
      slug: "hardware",
      title: "Hardware Lab",
      tagline: "High-performance AI accelerators, dev boards & IoT kits.",
      isFeatured: true,
      sections: [{ name: "AI Boards" }, { name: "Sensors" }, { name: "Microcontrollers" }]
    },
    {
      slug: "game-makers",
      title: "Game Makers",
      tagline: "Unity & Unreal assets for pro developers.",
      sections: [{ name: "3D Models" }, { name: "Audio" }, { name: "Shaders" }]
    },
    {
      slug: "ai-tools-hub",
      title: "AI Tools Hub",
      tagline: "Agents, automations and workflow tools.",
      sections: [{ name: "Agents" }, { name: "Automation" }, { name: "Big Data" }]
    },
    {
      slug: "dev-studio-one",
      title: "Dev Studio One",
      tagline: "Dashboards, admin templates and starters.",
      sections: [{ name: "Dashboards" }, { name: "Admin Kits" }, { name: "Starters" }]
    },
    {
      slug: "email-forge",
      title: "Email Forge",
      tagline: "High-converting email templates.",
      sections: [{ name: "Newsletters" }, { name: "Transactional" }, { name: "Marketing" }]
    },
    {
      slug: "html-templates",
      title: "HTML Templates",
      tagline: "Landing pages, marketing sites and UI layouts.",
      sections: [{ name: "Landing Pages" }, { name: "Portfolios" }, { name: "Blogs" }]
    },
    {
      slug: "icon-smith",
      title: "Icon Smith",
      tagline: "Premium icon packs and UI assets.",
      sections: [{ name: "Line Icons" }, { name: "Solid Icons" }, { name: "Illustrations" }]
    },
    {
      slug: "reactorium",
      title: "Reactorium",
      tagline: "React UI kits, dashboards and chart systems.",
      sections: [{ name: "UI Kits" }, { name: "Charts" }, { name: "Hooks" }]
    },
    {
      slug: "tiny-js-lab",
      title: "Tiny JS Lab",
      tagline: "Vanilla JS widgets and utilities.",
      sections: [{ name: "Widgets" }, { name: "Utilities" }, { name: "Plugins" }]
    },
    {
      slug: "unity-hub",
      title: "Unity Hub",
      tagline: "Game systems, controllers and tools.",
      sections: [{ name: "Controllers" }, { name: "Physics" }, { name: "Tools" }]
    },
    {
      slug: "wp-plugins",
      title: "WP Plugins",
      tagline: "Commerce and utility plugins for WordPress.",
      sections: [{ name: "SEO" }, { name: "Security" }, { name: "Commerce" }]
    }
  ];

  // ---- ENTRY POINT ----
  document.addEventListener("DOMContentLoaded", () => {
    try {
      renderGallery(STORES_DATA);
      renderSubNav(STORES_DATA);
      initMegaMenu(STORES_DATA);

      // Debug
      // eslint-disable-next-line no-console
      console.log("RGZTEC HOME OK • BASE =", BASE || "(root)");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("HOME MANAGER INIT ERROR:", err);
    }
  });

  // ---- GALLERY ----
  function renderGallery(data) {
    const gallery = document.getElementById("gallery");
    if (!gallery || !Array.isArray(data)) return;

    const html = data
      .map((store) => {
        const href = STORE_URL(store.slug);
        const imgSrc = `${STORE_IMAGE_BASE}${String(store.slug).trim()}.webp`;
        const title = escapeHtml(store.title);
        const tagline = escapeHtml(store.tagline);

        const imgTag = `
          <img src="${imgSrc}"
               alt="${title}"
               loading="lazy"
               onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}';" />`;

        if (store.isFeatured) {
          return `
            <article class="card card--featured">
              <a href="${href}" class="card-media">${imgTag}</a>
              <div class="card-content">
                <span class="card-badge">Featured • Hardware</span>
                <h3 class="card-title">${title}</h3>
                <p class="card-desc">${tagline}</p>
                <a href="${href}" class="card-link">Visit Store &rarr;</a>
              </div>
            </article>
          `;
        }

        return `
          <article class="card">
            <a href="${href}" class="card-media">${imgTag}</a>
            <div class="card-content">
              <span class="card-badge">Official Store</span>
              <h3 class="card-title">${title}</h3>
              <p class="card-desc">${tagline}</p>
              <a href="${href}" class="card-link">Visit Store &rarr;</a>
            </div>
          </article>
        `;
      })
      .join("");

    gallery.innerHTML = html;
  }

  // ---- SUB NAV ----
  function renderSubNav(data) {
    const list = document.getElementById("sub-nav-list");
    if (!list || !Array.isArray(data)) return;

    list.innerHTML = data
      .map((s) => `<div class="sub-nav-item"><a href="${STORE_URL(s.slug)}">${escapeHtml(s.title)}</a></div>`)
      .join("");
  }

  // ---- MEGA MENU ----
  function initMegaMenu(data) {
    if (!Array.isArray(data) || data.length === 0) return;

    const btn = document.getElementById("btn-categories");
    const header = document.querySelector(".app-header");
    const panelWrap = document.getElementById("categories-panel");
    const listEl = document.getElementById("categories-list");
    const detailEl = document.getElementById("categories-detail");

    if (!btn || !header || !panelWrap || !listEl || !detailEl) return;

    listEl.innerHTML = data
      .map(
        (s, i) => `
        <button class="cat-item ${i === 0 ? "cat-item--active" : ""}" type="button" data-slug="${escapeHtml(
          s.slug
        )}">
          <span>${escapeHtml(s.title)}</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
               viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      `
      )
      .join("");

    renderDetail(data[0], detailEl);

    // Desktop hover + click (mobile safe)
    listEl.querySelectorAll(".cat-item").forEach((item) => {
      const activate = () => {
        listEl.querySelectorAll(".cat-item").forEach((b) => b.classList.remove("cat-item--active"));
        item.classList.add("cat-item--active");

        const slug = item.getAttribute("data-slug");
        const store = data.find((s) => String(s.slug) === String(slug));
        if (store) renderDetail(store, detailEl);
      };

      item.addEventListener("mouseenter", activate);
      item.addEventListener("click", (e) => {
        e.preventDefault();
        activate();
      });
    });

    const close = () => header.classList.remove("has-cat-open");
    const toggle = () => header.classList.toggle("has-cat-open");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    document.addEventListener("click", (e) => {
      if (!header.classList.contains("has-cat-open")) return;
      const inside = panelWrap.contains(e.target) || btn.contains(e.target);
      if (!inside) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // ---- DETAIL PANEL ----
  function renderDetail(store, container) {
    if (!store || !container) return;

    const storeHref = STORE_URL(store.slug);
    const sections = Array.isArray(store.sections) ? store.sections : [];

    // şimdilik section linkleri store'a gider (ileride /store/{slug}/{sectionSlug}/ yaparız)
    const linksHtml =
      sections.map((s) => `<a href="${storeHref}">${escapeHtml(s.name || "")}</a>`).join("") +
      `<a href="${storeHref}">View All</a>`;

    container.innerHTML = `
      <div class="cat-detail-eyebrow">STORE</div>
      <div class="cat-detail-title">${escapeHtml(store.title)}</div>
      <div class="cat-detail-subtitle">${escapeHtml(store.tagline)}</div>
      <div class="cat-detail-links">${linksHtml}</div>
    `;
  }

  // ---- HELPER ----
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  // ---- DİNAMİK VERİ ENJEKSİYONU (YAPIYI BOZMADAN) ----
  async function syncWithLiveApi() {
    try {
      // Senin handler fonksiyonuna istek atıyoruz
      const response = await fetch(withBase('/api/catalog')); 
      const result = await response.json();

      if (result.ok && result.data && Array.isArray(result.data.stores)) {
        const liveData = result.data.stores;

        // Mevcut fonksiyonlarını yeni veriyle tekrar tetikle
        renderGallery(liveData);
        renderSubNav(liveData);
        initMegaMenu(liveData);
        
        console.log("RGZTEC LIVE • Mağazalar API'den güncellendi.");
      }
    } catch (err) {
      console.warn("API Bağlantısı kurulamadı, statik verilerle devam ediliyor.");
    }
  }

  // Sayfa yüklendiğinde canlı veriyi çekmeyi dene
  document.addEventListener("DOMContentLoaded", syncWithLiveApi);

  // SEARCH TETİKLEYİCİ (Arama butonunu canlandırır)
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');
  if (searchBtn && searchInput) {
    const runSearch = () => {
      const q = searchInput.value.trim();
      if(q) window.location.href = withBase(`/search.html?q=${enc(q)}`);
    };
    searchBtn.addEventListener('click', runSearch);
    searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') runSearch(); });
  }
})();

