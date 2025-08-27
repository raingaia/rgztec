(function(){
  // 1) Header zaten var mı? (çift enjeksiyonu önle)
  if (document.querySelector('header.topbar')) {
    // console.log('[layout] header already present, skip inject');
    return;
  }

  // 2) Kök yol: GitHub Pages için /rgztec
  const ROOT = '/rgztec';

  // 3) Header'ı yükle ve en başa ekle
  fetch(`${ROOT}/assets/partials/header.html?v=5`, { cache: 'no-store' })
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);

      // 4) Aktif kategori işaretle
      const path = location.pathname.toLowerCase();
      const map = [
        { key: 'web',      match: ['/dev-studio-one','/web-templates'] },
        { key: 'ecom',     match: ['/ecommerce','/e-commerce','/marketplace'] },
        { key: 'widgets',  match: ['/widgets','/icon-smith','/ai-tools-hub','/wp-plugins','/tiny-js-lab'] },
        { key: 'software', match: ['/reactorium','/game-makers','/unity-hub','/software'] },
        { key: 'niche',    match: ['/email-forge','/niche'] }
      ];
      const activeKey = (map.find(m => m.match.some(seg => path.includes(seg))) || {}).key;
      if (activeKey) {
        const el = document.querySelector(`.categories a[data-key="${activeKey}"]`);
        if (el) el.classList.add('active');
      }
    })
    .catch(e => console.error('[layout] header load failed', e));
})();
