/* RGZTEC — app.js
   Amaç: Sayfada header/kategori elemanlarının ÇİFT görünmesini önlemek,
   varsa fazlalıkları temizlemek ve aktif kategoriyi güvenceye almak.
   Bu dosya HEADER OLUŞTURMAZ; sadece düzenler.  */

(function () {
  // Yardımcı
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const once = (fn) => { try { fn(); } catch (e) { console.warn('[app.js]', e); } };

  // 1) Fazla header/kategori/çizgi elemanlarını temizle
  once(() => {
    const headers = $all('header.topbar');
    if (headers.length > 1) {
      // İlkini bırak, diğerlerini kaldır
      headers.slice(1).forEach(h => h.remove());
      // console.info('[app] duplicate headers removed:', headers.length - 1);
    }

    const navs = $all('nav.categories');
    if (navs.length > 1) {
      navs.slice(1).forEach(n => n.remove());
      // console.info('[app] duplicate category bars removed:', navs.length - 1);
    }

    const dividers = $all('hr.divider');
    if (dividers.length > 1) {
      dividers.slice(1).forEach(d => d.remove());
      // console.info('[app] duplicate dividers removed:', dividers.length - 1);
    }
  });

  // 2) Aktif kategori işaretleme (layout.js çalışmadıysa devreye girer)
  once(() => {
    // Zaten işaretlenmişse dokunma
    if (document.querySelector('.categories a.active')) return;

    const path = location.pathname.toLowerCase();
    const map = [
      { key: 'web',      match: ['/dev-studio-one', '/web-templates'] },
      { key: 'ecom',     match: ['/ecommerce', '/e-commerce', '/marketplace'] },
      { key: 'widgets',  match: ['/widgets', '/icon-smith', '/ai-tools-hub', '/wp-plugins', '/tiny-js-lab'] },
      { key: 'software', match: ['/reactorium', '/game-makers', '/unity-hub', '/software'] },
      { key: 'niche',    match: ['/email-forge', '/niche'] }
    ];
    const activeKey = (map.find(m => m.match.some(seg => path.includes(seg))) || {}).key;
    if (activeKey) {
      const el = document.querySelector(`.categories a[data-key="${activeKey}"]`);
      if (el) el.classList.add('active');
    }
  });

  // 3) Mağaza sayfası varsa (store.html) — Ürün grid boş mesajını garanti et
  once(() => {
    const grid = document.getElementById('productsGrid');
    if (grid && !grid.children.length && !grid._filled) {
      grid.innerHTML = `<div style="grid-column:1/-1;color:#6B7280">No products yet.</div>`;
      grid._filled = true;
    }
  });

  // 4) Güvenlik: Başka bir script header enjekte etmeye kalkarsa engelle
  // (Sayfada header zaten varsa global bir bayrak bırakıyoruz)
  if (document.querySelector('header.topbar')) {
    window.__HEADER_READY__ = true;
  }
})();
