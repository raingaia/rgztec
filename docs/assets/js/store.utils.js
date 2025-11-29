// store/core/assets/js/store.utils.js
// Küçük yardımcılar – tüm diğer dosyalar bunu kullanabilir

(function (window) {
  "use strict";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  async function fetchJSON(path, options = {}) {
    const { optional = false } = options;
    try {
      const res = await fetch(path + "?v=" + Date.now());
      if (!res.ok) {
        if (optional) return null;
        throw new Error("Fetch failed: " + path + " • " + res.status);
      }
      return await res.json();
    } catch (err) {
      console.error("[store.utils] JSON yüklenemedi:", path, err);
      if (optional) return null;
      throw err;
    }
  }

  function setText(el, text) {
    if (el) el.textContent = text || "";
  }

  function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html != null) el.innerHTML = html;
    return el;
  }

  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function showStoreMessage(message, type) {
    // type: "error" | "empty" | "info"
    const root = qs("#store-root");
    if (!root) return;
    root.innerHTML = `
      <div class="store-message store-message--${type || "info"}">
        ${message}
      </div>
    `;
  }

  // Global export
  window.StoreUtils = {
    qs,
    qsa,
    fetchJSON,
    setText,
    createEl,
    debounce,
    showStoreMessage,
  };
})(window);
