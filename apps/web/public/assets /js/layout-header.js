<script>
(function(){
  // --- SETTINGS (gerekirse değiştir) ---
  // Header partial'ınızın gerçek konumu:
  const PARTIAL_HREF = 'assets/partials/header.html?v=8'; 
  const PARTIAL_URL  = new URL(PARTIAL_HREF, document.baseURI).toString();

  // Konsol log görmek isterseniz:
  const DEBUG = false;

  // --- UTILS ---
  const log = (...a)=> DEBUG && console.log('[layout]', ...a);
  const safeQS = new URLSearchParams(location.search);
  const curURL = new URL(location.href);
  const curPath = curURL.pathname.replace(/\/index\.html$/i,'/').replace(/\/+$/,''); // /…/index.html -> /
  const curTag   = (safeQS.get('tag')   || '').toLowerCase();
  const curStore = (safeQS.get('store') || '').toLowerCase();
  const curSlug  = (safeQS.get('slug')  || '').toLowerCase();

  function markActiveLinks(){
    try{
      // 1) chips + categories + store-bar
      document.querySelectorAll('.chips a, .categories a, .store-bar a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;

        const u = new URL(href, document.baseURI);
        const uPath  = u.pathname.replace(/\/index\.html$/i,'/').replace(/\/+$/,'');
        const uTag   = (u.searchParams.get('tag')   || '').toLowerCase();
        const uStore = (u.searchParams.get('store') || '').toLowerCase();
        const uSlug  = (u.searchParams.get('slug')  || '').toLowerCase();

        // aynı sayfa mantığı
        const samePage = (
          uPath === curPath ||
          (uPath.endsWith('/listings.html') && curPath.endsWith('/listings.html')) ||
          (uPath.endsWith('/store.html')    && curPath.endsWith('/store.html')) ||
          // Home'da hiçbir şey işaretlemek istemiyorsanız bu satırı etkisiz bırakın
          (uPath.endsWith('/') && curPath.endsWith('/'))
        );

        // parametre eşleşmeleri (varsa kontrol et, yoksa serbest bırak)
        const tagOK   = uTag   ? (uTag   === curTag)   : true;
        const storeOK = uStore ? (uStore === curStore) : true;

        // store vs slug karşılıklı tanıma (hardware gibi)
        const storeSlugMatch = (
          (uStore && uStore === curSlug) ||
          (uSlug  && uSlug  === curStore)
        );

        if (samePage && tagOK && (storeOK || storeSlugMatch)) {
          a.classList.add('active');
          log('active:', a.href);
        }
      });

      // 2) “store.html?slug=hardware” iken chips’te hardware’i işaretle (ek garanti)
      if ((curPath.endsWith('/store.html') && curSlug) || curStore){
        const key = curSlug || curStore;
        document.querySelectorAll('.chips a, .store-bar a').forEach(a=>{
          const u = new URL(a.href, document.baseURI);
          const tag   = (u.searchParams.get('tag')   || '').toLowerCase();
          const store = (u.searchParams.get('store') || '').toLowerCase();
          const slug  = (u.searchParams.get('slug')  || '').toLowerCase();
          if ([tag,store,slug].includes(key)) a.classList.add('active');
        });
      }

      // 3) Header sağ linkler (login/editor vs) — path eşleşirse
      document.querySelectorAll('.hdr-right a[href]').forEach(a=>{
        const u = new URL(a.href, document.baseURI);
        const up = u.pathname.replace(/\/index\.html$/i,'/').replace(/\/+$/,'');
        if (up === curPath) a.classList.add('active');
      });
    }catch(e){
      console.warn('[layout] markActiveLinks failed', e);
    }
  }

  function ensureHeader(){
    const exists = document.querySelector('header.topbar, header.header-outer');
    if (exists){
      log('header exists, skip inject');
      return Promise.resolve('existing');
    }
    log('inject header from', PARTIAL_URL);
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

