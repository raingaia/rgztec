/// === RGZ GLOBAL (home-products için ZORUNLU) ===
window.RGZ = window.RGZ || {
  env: "docs",
  go(path) {
    window.location.href = path;
  }
};
/ docs/assets/js/bridge.js
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else fn();
  }

  ready(function () {
    const meta = document.querySelector('meta[name="rgztec-app-origin"]');
    const APP_ORIGIN =
      (meta && meta.content) ||
      window.RGZTEC_APP_ORIGIN ||
      "https://APP-URL-BURAYA";

    const ORIGIN = APP_ORIGIN.replace(/\/$/, "");

    // ✅ 1) Sign In → App Login
    document.querySelectorAll('a[data-bridge="login"]').forEach((a) => {
      a.href = ORIGIN + "/login";
    });

    // ✅ 2) Open Store / Start selling → App Login (sonra role seçip seller flow)
    document.querySelectorAll('a[data-bridge="start-selling"]').forEach((a) => {
      a.href = ORIGIN + "/login";
      // istersen direkt seller onboarding route’un varsa:
      // a.href = ORIGIN + "/seller/onboarding";
    });

    // ✅ 3) Global search (div + input + button) → App Search
    const searchWrap = document.querySelector('[data-bridge-search="global"]');
    if (searchWrap) {
      const input = searchWrap.querySelector(".search-input");
      const btn = searchWrap.querySelector(".search-btn");

      function go() {
        const q = (input && input.value ? input.value : "").trim();
        if (!q) return;
        window.location.href = ORIGIN + "/search?q=" + encodeURIComponent(q);
      }

      if (input) {
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            go();
          }
        });
      }
      if (btn) btn.addEventListener("click", go);
    }
  });
})();

