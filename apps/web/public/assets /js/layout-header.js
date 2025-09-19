<script>
(function(){
  const PARTIAL_HREF = 'assets/partials/header.html?v=7';
  const PARTIAL_URL  = new URL(PARTIAL_HREF, document.baseURI).toString();

  function markActiveLinks(){
    try{
      const cur      = new URL(location.href);
      const curPath  = cur.pathname.replace(/\/+$/,'');
      const curTag   = (cur.searchParams.get('tag')   || '').toLowerCase();
      const curStore = (cur.searchParams.get('store') || '').toLowerCase();

      // chips + categories + store bar
      document.querySelectorAll('.chips a, .categories a, .store-bar a').forEach(a => {
        const href = a.getAttribute('href') || '';
        const u    = new URL(href, document.baseURI);
        const uPath  = u.pathname.replace(/\/+$/,'');
        const uTag   = (u.searchParams.get('tag')   || '').toLowerCase();
        const uStore = (u.searchParams.get('store') || '').toLowerCase();

        const samePath = (
          uPath === curPath ||
          (uPath.endsWith('listings.html') && curPath.endsWith('listings.html'))
        );
        const tagOK   = uTag   ? (uTag   === curTag)   : (curTag   === '');
        const storeOK = uStore ? (uStore === curStore) : (curStore === '');

        if (samePath && tagOK && storeOK) a.classList.add('active');
      });

      // data-key fallback (varsa)
      const map = [
        { key:'web',      match:['/dev-studio-one','/web-templates'] },
        { key:'ecom',     match:['/ecommerce','/e-commerce','/marketplace'] },
        { key:'widgets',  match:['/widgets','/icon-smith','/ai-tools-hub','/wp-plugins','/tiny-js-lab'] },
        { key:'software', match:['/reactorium','/game-makers','/unity-hub','/software'] },
        { key:'niche',    match:['/email-forge','/niche'] }
      ];
      const p = location.pathname.toLowerCase();
      const hit = map.find(m => m.match.some(seg => p.includes(seg)));
      if (hit){
        const el = document.querySelector(`.categories a[data-key="${hit.key}"]`);
        if (el) el.classList.add('active');
      }
    }catch(e){
      console.warn('[layout] markActiveLinks failed', e);
    }
  }

  function ensureHeader(){
    const exists = document.querySelector('header.topbar, header.header-outer');
    if (exists) return Promise.resolve('existing');

    return fetch(PARTIAL_URL, { cache:'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
      .then(html => { document.body.insertAdjacentHTML('afterbegin', html); return 'inserted'; })
      .catch(e => { console.error('[layout] header load failed', e); return 'failed'; });
  }

  function run(){ ensureHeader().then(markActiveLinks); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
</script>
