// assets/js/store.banner.js
// RGZTEC STORE • Hero / Banner şeridi
// Sol: SEO metinleri, Sağ: store banner görseli

(function (window, document) {
  "use strict";

  // Ana store listesi (home'da kullandığımız JSON)
  const STORES_JSON_PATH = "data/stores.json";

  // Store'a özel hero metinleri (SEO)
  const HERO_TEXT = {
    "game-makers": {
      kicker: "Curated store",
      title: "Game Makers",
      subtitle: "Unity & Unreal templates, UI kits and game-ready assets.",
      body: "Discover premium HUDs, menus, UI kits and ready-to-use elements for Unity, Unreal Engine and other modern game engines. Build polished games faster with production-ready assets crafted for developers, artists and studios."
    }
    // ileride diğer store'lar için buraya entry ekleyebiliriz
  };

  function $(id) {
    return document.getElementById(id);
  }

  async function fetchStores() {
    try {
      const res = await fetch(STORES_JSON_PATH);
      if (!res.ok) throw new Error("stores.json fetch failed");
      return await res.json();
    } catch (err) {
      console.warn("[store.banner] stores.json okunamadı:", err);
      return null;
    }
  }

  function buildHeroContent(slug, storeEntry) {
    const override = HERO_TEXT[slug] || {};

    const name = override.title || (storeEntry && storeEntry.name) || "Store";
    const kicker = override.kicker || "Curated store";
    const subtitle =
      override.subtitle ||
      (storeEntry && (storeEntry.tagline || storeEntry.category)) ||
      "";
    const body =
      override.body ||
      (storeEntry && (storeEntry.seoDescription || "")) ||
      "";

    return { name, kicker, subtitle, body };
  }

  function getBannerImagePath(slug, storeEntry) {
    // Öncelik: storeEntry.heroImage (varsa)
    if (storeEntry && storeEntry.heroImage) {
      return storeEntry.heroImage;
    }
    // Default: assets/images/store/<slug>.webp
    if (slug) {
      return `assets/images/store/${slug}.webp`;
    }
    // Son çare: generic banner
    return "assets/images/store/default-store-banner.webp";
  }

  function renderHero({ slug, storeEntry }) {
    const textRoot = $("store-hero-text");
    const bannerRoot = $("store-banner");

    if (!textRoot || !bannerRoot) return;

    const hero = buildHeroContent(slug, storeEntry);
    const imgPath = getBannerImagePath(slug, storeEntry);

    // Sol kolon: SEO metni
    textRoot.innerHTML = `
      <p class="store-hero-kicker">${hero.kicker}</p>
      <h1 class="store-hero-title">${hero.title}</h1>
      ${
        hero.subtitle
          ? `<p class="store-hero-subtitle">${hero.subtitle}</p>`
          : ""
      }
      ${
        hero.body
          ? `<p class="store-hero-body">${hero.body}</p>`
          : ""
      }
    `;

    // Sağ kolon: banner kartı
    bannerRoot.innerHTML = `
      <figure class="store-banner-card">
        <img src="${imgPath}" alt="${hero.name} banner" loading="lazy" />
      </figure>
    `;
  }

  async function bootstrapHero() {
    const body = document.body;
    const slug = body.dataset.store || "";

    if (!slug) {
      console.warn("[store.banner] body.data-store boş.");
      return;
    }

    const stores = await fetchStores();
    let storeEntry = null;

    if (Array.isArray(stores)) {
      storeEntry = stores.find((s) => s.slug === slug) || null;
    }

    renderHero({ slug, storeEntry });
  }

  document.addEventListener("DOMContentLoaded", bootstrapHero);
})(window, document);

