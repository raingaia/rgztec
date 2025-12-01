/**
 * RGZTEC Marketplace - Store Shell Engine
 *
 * This single, self-contained JavaScript file is responsible for fetching 
 * a store's data based on a 'data-store' attribute on the <body> tag,
 * and then dynamically rendering the entire store layout.
 *
 * It includes all necessary JS, HTML templating, and CSS.
 * It is built to be robust, secure (XSS-safe), and framework-free.
 *
 * @version 1.0.0
 * @author RGZTEC (via AI Generation)
 */
(function() {
  "use strict";

  // --- Constants ---

  /**
   * Path to the main store data JSON file.
   * @type {string}
   */
  const DATA_URL = "/rgztec/data/store.data.json";

  /**
   * Base URL for all store product and banner images.
   * @type {string}
   */
  const IMAGE_BASE_PATH = "/rgztec/assets/images/store/";

  /**
   * Currency formatting options.
   * @type {Intl.NumberFormatOptions}
   */
  const CURRENCY_OPTIONS = {
    style: "currency",
    currency: "USD", // Default to USD, can be configured
  };

  // --- Main Initialization ---

  /**
   * Runs when the DOM is fully loaded.
   * Kicks off the store rendering process.
   */
  document.addEventListener("DOMContentLoaded", () => {
    const storeBody = document.querySelector("body.store-body");

    if (!storeBody) {
      console.error("Store Shell Engine: Fatal error. Body tag with class '.store-body' not found.");
      return;
    }

    const storeSlug = storeBody.dataset.store;

    if (!storeSlug || storeSlug.trim() === "") {
      renderError(new Error("No 'data-store' attribute found on the body tag."), storeBody);
      return;
    }

    // Inject all necessary CSS into the <head>
    injectStyles();

    // Start the process of building the store
    initStore(storeSlug, storeBody);
  });

  /**
   * Main asynchronous function to fetch data and render the store.
   * @param {string} storeSlug The unique identifier for the store.
   * @param {HTMLElement} targetElement The <body> element to render into.
   */
  async function initStore(storeSlug, targetElement) {
    try {
      const allStoresData = await fetchJSON(DATA_URL);

      if (!allStoresData) {
        throw new Error("Store data file is empty or missing.");
      }

      const storeData = allStoresData[storeSlug];

      if (!storeData) {
        throw new Error(`Store with slug "${escapeHtml(storeSlug)}" not found in data file.`);
      }

      // Render all components into the body
      // We build the HTML string first for a single, efficient DOM insertion.
      let storeHtml = "";
      storeHtml += renderHeader(storeData);
      storeHtml += renderHero(storeData);
      storeHtml += renderMainContent(storeData);

      targetElement.innerHTML = storeHtml;

    } catch (error) {
      console.error(`Store Shell Engine: Failed to initialize store "${escapeHtml(storeSlug)}".`, error);
      renderError(error, targetElement);
    }
  }

  // --- HTML Rendering Functions ---

  /**
   * Renders the fixed header component.
   * @param {object} data The specific store's data.
   * @returns {string} HTML string for the header.
   */
  function renderHeader(data) {
    const storeTitle = escapeHtml(data.title || "RGZTEC Store");

    return `
      <header class="store-header">
        <div class="store-container">
          <a href="/rgztec/" class="store-header__logo">RGZTEC</a>
          <nav class="store-header__nav">
            <span class="store-header__store-name">${storeTitle}</span>
          </nav>
        </div>
      </header>
    `;
  }

  /**
   * Renders the hero banner section.
   * @param {object} data The specific store's data.
   * @returns {string} HTML string for the hero section.
   */
  function renderHero(data) {
    const title = escapeHtml(data.title || "Welcome to the Store");
    const tagline = escapeHtml(data.tagline || "");
    
    // Only add banner style if a banner image is provided
    const bannerUrl = data.banner ? `${IMAGE_BASE_PATH}${escapeHtml(data.banner)}` : "";
    const styleAttribute = bannerUrl ? `style="background-image: url('${bannerUrl}');"` : "";
    const heroClass = bannerUrl ? "store-hero" : "store-hero store-hero--no-image";

    return `
      <section class="${heroClass}" ${styleAttribute}>
        <div class="store-hero__overlay"></div>
        <div class="store-container store-hero__content">
          <h1 class="store-hero__title">${title}</h1>
          ${tagline ? `<p class="store-hero__tagline">${tagline}</p>` : ""}
        </div>
      </section>
    `;
  }

  /**
   * Renders the main content area, including the product grid.
   * @param {object} data The specific store's data.
   * @returns {string} HTML string for the main content.
   */
  function renderMainContent(data) {
    return `
      <main class="store-main">
        <div class="store-container">
          ${renderProductGrid(data.products || [])}
        </div>
      </main>
    `;
  }

  /**
   * Renders the responsive product grid.
   * @param {Array<object>} products An array of product objects.
   * @returns {string} HTML string for the product grid.
   */
  function renderProductGrid(products) {
    if (!Array.isArray(products) || products.length === 0) {
      return `
        <div class="product-grid__empty">
          <h2>Products Coming Soon</h2>
          <p>This store is currently setting up. Please check back later!</p>
        </div>
      `;
    }

    // Map each product object to its HTML card string
    const productCards = products
      .map(product => renderProductCard(product))
      .join("");

    return `
      <div class="product-grid">
        ${productCards}
      </div>
    `;
  }

  /**
   * Renders a single product card.
   * @param {object} product A single product object.
   * @returns {string} HTML string for one product card.
   */
  function renderProductCard(product) {
    if (!product) return ""; // Fail safely if a product is null/undefined

    const title = escapeHtml(product.title || "Untitled Product");
    const tagline = escapeHtml(product.tagline || "");
    const price = formatPrice(product.price);
    const imageUrl = product.image ? `${IMAGE_BASE_PATH}${escapeHtml(product.image)}` : "";

    const imageElement = imageUrl
      ? `<img src="${imageUrl}" alt="${title}" class="product-card__image" loading="lazy">`
      : `<div class="product-card__image product-card__image--placeholder"></div>`;

    return `
      <div class="product-card">
        <a href="#" class="product-card__link">
          <div class="product-card__image-wrapper">
            ${imageElement}
          </div>
          <div class="product-card__content">
            <h3 class="product-card__title">${title}</h3>
            ${tagline ? `<p class="product-card__tagline">${tagline}</p>` : ""}
            <div class="product-card__price">${price}</div>
          </div>
        </a>
      </div>
    `;
  }

  /**
   * Renders a fatal error message to the user.
   * @param {Error} error The error object.
   * @param {HTMLElement} targetElement The <body> element to render into.
   */
  function renderError(error, targetElement) {
    targetElement.innerHTML = `
      <div class="store-error-container">
        <h1 class="store-error-title">RGZTEC</h1>
        <h2 class="store-error-subtitle">An Error Occurred</h2>
        <p class="store-error-message">We're sorry, but this store could not be loaded.</p>
        <code class="store-error-code">${escapeHtml(error.message)}</code>
      </div>
    `;
  }

  // --- Helper Functions ---

  /**
   * Fetches and parses JSON from a URL.
   * @param {string} url The URL to fetch.
   * @returns {Promise<object>} A promise that resolves to the parsed JSON.
   */
  async function fetchJSON(url) {
    const response = await fetch(url, {
      cache: "default" // Use browser cache
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching ${url}: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) { // No Content
      return null;
    }

    try {
      return await response.json();
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON from ${url}: ${jsonError.message}`);
    }
  }

  /**
   * Safely escapes HTML strings to prevent XSS.
   * @param {*} unsafe The input string to escape.
   * @returns {string} The escaped string.
   */
  function escapeHtml(unsafe) {
    // Coerce to string, handling null/undefined
    const str = String(unsafe || "");
    
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Formats a price value.
   * @param {string|number} price The price to format.
   *Answers {string} The formatted price string (e.g., "$29.99").
   */
  function formatPrice(price) {
    const num = parseFloat(price);

    if (isNaN(num)) {
      // If it's not a number (e.g., "Contact Us", "Free"),
      // return the safely escaped string.
      return escapeHtml(price || "");
    }

    try {
      // Use modern Intl.NumberFormat for locale-aware formatting
      return new Intl.NumberFormat("en-US", CURRENCY_OPTIONS).format(num);
    } catch (e) {
      // Fallback for extremely old browsers
      return "$" + num.toFixed(2);
    }
  }

  /**
   * Injects all necessary CSS for the store layout into the <head>.
   */
  function injectStyles() {
    const styleId = "rgztec-store-styles";
    if (document.getElementById(styleId)) {
      return; // Styles already injected
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      :root {
        --store-color-primary: #0a0a0a;
        --store-color-secondary: #007aff;
        --store-color-background: #ffffff;
        --store-color-text: #1d1d1f;
        --store-color-text-light: #515154;
        --store-color-border: #d2d2d7;
        --store-color-hero-text: #ffffff;
        --store-header-height: 60px;
        --store-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      /* --- Basic Reset & Body --- */
      html {
        box-sizing: border-box;
        font-size: 16px;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body.store-body {
        margin: 0;
        padding: 0;
        font-family: var(--store-font-family);
        background-color: var(--store-color-background);
        color: var(--store-color-text);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        /* Add padding to body to offset fixed header */
        padding-top: var(--store-header-height);
      }

      /* --- Utility --- */
      .store-container {
        width: 100%;
        max-width: 1280px;
        margin-left: auto;
        margin-right: auto;
        padding-left: 20px;
        padding-right: 20px;
      }

      /* --- Header --- */
      .store-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--store-header-height);
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--store-color-border);
        z-index: 1000;
      }
      .store-header .store-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
      }
      .store-header__logo {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--store-color-primary);
        text-decoration: none;
      }
      .store-header__store-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--store-color-text-light);
      }

      /* --- Hero Section --- */
      .store-hero {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 400px;
        background-color: #f5f5f7; /* Fallback */
        background-size: cover;
        background-position: center;
        color: var(--store-color-hero-text);
      }
      .store-hero--no-image {
        min-height: 200px;
        background: var(--store-color-primary);
      }
      .store-hero__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
      }
      .store-hero--no-image .store-hero__overlay {
        display: none;
      }
      .store-hero__content {
        position: relative;
        z-index: 2;
      }
      .store-hero__title {
        font-size: 3rem;
        font-weight: 700;
        margin: 0;
      }
      .store-hero__tagline {
        font-size: 1.25rem;
        font-weight: 400;
        margin-top: 0.5rem;
        opacity: 0.9;
      }

      /* --- Main Content --- */
      .store-main {
        padding-top: 40px;
        padding-bottom: 60px;
      }
      
      /* --- Product Grid --- */
      .product-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 24px;
      }
      /* Responsive grid breakpoints */
      @media (min-width: 540px) {
        .product-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 768px) {
        .product-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (min-width: 1024px) {
        .product-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      
      .product-grid__empty {
        text-align: center;
        padding: 60px 20px;
        background-color: #f9f9f9;
        border-radius: 12px;
      }
      .product-grid__empty h2 {
        font-size: 1.5rem;
        margin-top: 0;
      }
      .product-grid__empty p {
        font-size: 1rem;
        color: var(--store-color-text-light);
      }

      /* --- Product Card --- */
      .product-card {
        background-color: var(--store-color-background);
        border: 1px solid var(--store-color-border);
        border-radius: 12px;
        overflow: hidden;
        transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
      }
      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
      }
      .product-card__link {
        display: block;
        text-decoration: none;
        color: inherit;
      }
      .product-card__image-wrapper {
        width: 100%;
        background-color: #f5f5f7;
      }
      .product-card__image {
        display: block;
        width: 100%;
        height: 240px;
        object-fit: cover;
      }
      .product-card__image--placeholder {
        height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f7;
        color: var(--store-color-text-light);
      }
      /* Simple icon for placeholder */
      .product-card__image--placeholder::before {
        content: '🏞';
        font-size: 48px;
        opacity: 0.5;
      }
      .product-card__content {
        padding: 16px;
      }
      .product-card__title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 4px 0;
      }
      .product-card__tagline {
        font-size: 0.875rem;
        color: var(--store-color-text-light);
        margin: 0 0 12px 0;
        min-height: 1.2em; /* Reserve space */
      }
      .product-card__price {
        font-size: 1rem;
        font-weight: 600;
        color: var(--store-color-primary);
      }

      /* --- Error State --- */
      .store-error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - var(--store-header-height));
        text-align: center;
        padding: 20px;
      }
      .store-error-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--store-color-primary);
      }
      .store-error-subtitle {
        font-size: 2rem;
        font-weight: 600;
        margin: 0 0 10px 0;
      }
      .store-error-message {
        font-size: 1.1rem;
        color: var(--store-color-text-light);
        max-width: 400px;
      }
      .store-error-code {
        display: block;
        background-color: #f5f5f7;
        color: #d73a49;
        padding: 10px 15px;
        border-radius: 6px;
        margin-top: 20px;
        font-family: monospace;
      }
    `;

    document.head.appendChild(style);
  }

})();








