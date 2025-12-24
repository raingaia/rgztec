/* RGZTEC HOME MANAGER – STABİL (DOCS-ROOT FINAL)
 * - Docs publish root = /
 * - Tüm linkler absolute: /store/...
 * - Tüm assetler absolute: /assets/...
 */

const BASE = ""; // ✅ docs-root deploy (publish root)
const STORE_IMAGE_BASE = `${BASE}/assets/images/store/`;
const PLACEHOLDER_IMG = `${BASE}/assets/images/placeholder.png`;

const STORE_URL = (slug) => `${BASE}/store/${slug}/`;

// ---- MAĞAZA VERİLERİ ----
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
  } catch (err) {
    console.error("HOME MANAGER INIT ERROR:", err);
  }
});

// ---- GALERİ ----
function renderGallery(data) {
  const gallery = document.getElementById("gallery");
  if (!gallery || !Array.isArray(data)) return;

  const html = data
    .map((store) => {
      const href = STORE_URL(store.slug); // ✅ absolute
      const imgSrc = `${STORE_IMAGE_BASE}${store.slug}.webp`; // ✅ absolute

      if (store.isFeatured) {
        return `
          <article class="card card--featured">
            <a href="${href}" class="card-media">
              <img src="${imgSrc}" alt="${escapeHtml(store.title)}"
                   loading="lazy"
                   onerror="this.src='${PLACEHOLDER_IMG}'">
            </a>
            <div class="card-content">
              <span class="card-badge">Featured • Hardware</span>
              <h3 class="card-title">${escapeHtml(store.title)}</h3>
              <p class="card-desc">${escapeHtml(store.tagline)}</p>
              <a href="${href}" class="card-link">Visit Store &rarr;</a>
            </div>
          </article>
        `;
      }

      return `
        <article class="card">
          <a href="${href}" class="card-media">
            <img src="${imgSrc}" alt="${escapeHtml(store.title)}"
                 loading="lazy"
                 onerror="this.style.display='none'">
          </a>
          <div class="card-content">
            <span class="card-badge">Official Store</span>
            <h3 class="card-title">${escapeHtml(store.title)}</h3>
            <p class="card-desc">${escapeHtml(store.tagline)}</p>
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
  const panel = document.getElementById("categories-panel");
  const listEl = document.getElementById("categories-list");
  const detailEl = document.getElementById("categories-detail");

  if (!btn || !header || !panel || !listEl || !detailEl) return;

  listEl.innerHTML = data
    .map(
      (s, i) => `
      <button class="cat-item ${i === 0 ? "cat-item--active" : ""}" data-slug="${s.slug}">
        <span>${escapeHtml(s.title)}</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
             viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    `
    )
    .join("");

  renderDetail(data[0], detailEl);

  listEl.querySelectorAll(".cat-item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      listEl.querySelectorAll(".cat-item").forEach((b) => b.classList.remove("cat-item--active"));
      item.classList.add("cat-item--active");

      const slug = item.getAttribute("data-slug");
      const store = data.find((s) => s.slug === slug);
      if (store) renderDetail(store, detailEl);
    });
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = header.classList.contains("has-cat-open");
    header.classList.toggle("has-cat-open", !isOpen);
  });

  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) header.classList.remove("has-cat-open");
  });
}

// ---- DETAY PANELİ ----
function renderDetail(store, container) {
  if (!store || !container) return;

  const slug = store.slug;
  const sections = Array.isArray(store.sections) ? store.sections : [];

  const storeHref = STORE_URL(slug);

  const linksHtml =
    sections
      .map((s) => `<a href="${storeHref}">${escapeHtml(s.name || "")}</a>`)
      .join("") + `<a href="${storeHref}">View All</a>`;

  container.innerHTML = `
    <div class="cat-detail-eyebrow">STORE</div>
    <div class="cat-detail-title">${escapeHtml(store.title)}</div>
    <div class="cat-detail-subtitle">${escapeHtml(store.tagline)}</div>
    <div class="cat-detail-links">${linksHtml}</div>
  `;
}

// ---- KÜÇÜK YARDIMCI ----
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

