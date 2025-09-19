<script>
(function(){
  // 1) Header zaten var mı? (çift enjeksiyonu önle)
  if (document.querySelector('header.topbar, header.header-outer')) {
    return;
  }

  // 2) Partial URL: <base> üzerinden çöz (GH Pages alt dizin uyumlu)
  const PARTIAL_URL = new URL('assets/partials/header.html?v=6', document.baseURI).toString();

  // 3) Header'ı yükle ve en başa ekle
  fetch(PARTIAL_URL, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);

      // 4) Aktif link işaretleme (chips + categories)
      const cur = new URL(location.href);
      const curPath  = cur.pathname.replace(/\/+$/,'');
      const curTag   = (cur.searchParams.get('tag')   || '').toLowerCase();
      const curStore = (cur.searchParams.get('store') || '').toLowerCase();

      document.querySelectorAll('.chips a, .categories a').forEach(a => {
        const href = a.getAttribute('href') || '';
        const u = new URL(href, document.baseURI);
        const uPath  = u.pathname.replace(/\/+$/,'');
        const uTag   = (u.searchParams.get('tag')   || '').toLowerCase();
        const uStore = (u.searchParams.get('store') || '').toLowerCase();

        const samePath  = uPath === curPath;
        const tagOK     = uTag   ? (uTag   === curTag)   : (curTag   === '');
        const storeOK   = uStore ? (uStore === curStore) : (curStore === '');

        if (samePath && tagOK && storeOK) a.classList.add('active');
      });

      // 5) Eski data-key haritası (fallback)
      const path = location.pathname.toLowerCase();
      const map = [
        { key: 'web',      match: ['/dev-studio-one','/web-templates'] },
        { key: 'ecom',     match: ['/ecommerce','/e-commerce','/marketplace'] },
        { key: 'widgets',  match: ['/widgets','/icon-smith','/ai-tools-hub','/wp-plugins','/tiny-js-lab'] },
        { key: 'software', match: ['/reactorium','/game-makers','/unity-hub','/software'] },
        { key: 'niche',    match: ['/email-forge','/niche'] }
      ];
      const hit = map.find(m => m.match.some(seg => path.includes(seg)));
      if (hit) {
        const el = document.querySelector(`.categories a[data-key="${hit.key}"]`);
        if (el) el.classList.add('active');
      }
    })
    .catch(e => console.error('[layout] header load failed', e));
})();
</script>
