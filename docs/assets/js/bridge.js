// public/bridge/bridge.js
(function () {
  // 1) APP_ORIGIN'i tek yerden yönet
  // Tercih sırası: <meta name="rgztec-app-origin"> -> window.RGZTEC_APP_ORIGIN -> default
  const meta = document.querySelector('meta[name="rgztec-app-origin"]');
  const APP_ORIGIN =
    (meta && meta.content) ||
    window.RGZTEC_APP_ORIGIN ||
    "https://APP-URL-BURAYA";

  function join(p) {
    return APP_ORIGIN.replace(/\/$/, "") + p;
  }

  // 2) Link köprüleri
  document.querySelectorAll('a[data-bridge="login"]').forEach((a) => {
    a.setAttribute("href", join("/login"));
  });

  document.querySelectorAll('a[data-bridge="register"]').forEach((a) => {
    a.setAttribute("href", join("/register")); // yoksa /login
  });

  document.querySelectorAll('a[data-bridge="dashboard"]').forEach((a) => {
    // demo için istersen direkt login'e de yönlendirebilirsin:
    a.setAttribute("href", join("/seller/dashboard"));
  });

  document.querySelectorAll('a[data-bridge="start-selling"]').forEach((a) => {
    // senin gerçek route'un neyse onu yaz
    a.setAttribute("href", join("/seller/dashboard"));
  });

  // 3) Global Search submit → app search
  const form = document.querySelector('[data-bridge-form="search"]');
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const q = (input && input.value ? input.value : "").trim();
      if (!q) return;
      window.location.href = join("/search?q=" + encodeURIComponent(q));
    });
  }

  // 4) Store search varsa → app store search
  const storeForm = document.querySelector('[data-bridge-form="store-search"]');
  if (storeForm) {
    storeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const slug = storeForm.getAttribute("data-store-slug") || "";
      const input = storeForm.querySelector('input[name="q"]');
      const q = (input && input.value ? input.value : "").trim();
      if (!slug || !q) return;
      window.location.href = join(`/store/${encodeURIComponent(slug)}?q=${encodeURIComponent(q)}`);
    });
  }
})();
