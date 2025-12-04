// RGZTEC HOME • basit arama + store pill highlight

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("#home-search-input");
  const storePills = document.querySelectorAll("[data-store-name]");

  if (!searchInput) {
    console.warn("home.js: #home-search-input bulunamadı.");
    return;
  }

  // Yazdıkça mağaza pill'lerini filtrele / highlight et
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();

    storePills.forEach((pill) => {
      const name = (pill.dataset.storeName || "").toLowerCase();
      const matches = !q || name.includes(q);

      pill.classList.toggle("home-store-pill--active", matches && !!q);
      pill.style.opacity = matches || !q ? "1" : "0.35";
    });
  });

  // Enter'a basıldığında şimdilik sadece console.log
  const form = document.querySelector("#home-search-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      console.log("Marketplace search:", q);
      // İleride: gerçek search sayfasına yönlendirme
      // window.location.href = `/rgztec/search?q=${encodeURIComponent(q)}`;
    });
  }

  console.log("RGZTEC HOME JS yüklendi.");
});

