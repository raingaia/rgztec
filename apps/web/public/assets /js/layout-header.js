<script>
(function(){
  // ---- AYARLAR ----
  // Header'ı parçalı dosyadan enjekte etmek istemiyorsan boş bırak:
  // const PARTIAL_HREF = ""; 
  const PARTIAL_HREF = "assets/partials/header.html?v=9";

  // URL param yatay debug: ?debug=1
  const DEBUG = /[?&]debug=1\b/.test(location.search);
  const log = (...a)=> DEBUG && console.log("[layout]", ...a);

  // ---- PATH/PARAM ----
  const curURL  = new URL(location.href);
  const curPath = curURL.pathname.replace(/\/index\.html$/i,'/').replace(/\/+$/,'');
  const curTag   = (curURL.searchParams.get('tag')   || '').toLowerCase();
  const curStore = (curURL.searchParams.get('store') || '').toLowerCase();
  const curSlug  = (curURL.searchParams.get('slug')  || '').toLowerCase();

  // ---- HEADER'ı (gerekirse) yükle ----
  function ensureHeader(){
    if (!PARTIAL_HREF){
      log("partial disabled");
      return Promise.resolve("skip");
    }
    const exists = document.querySelector("header.topbar, header.header-outer");
    if (exists){ log("header exists, skip inject"); return Promise.resolve("existing"); }
    const url = new URL(PARTIAL_HREF, document.baseURI).toString();
    log("inject header from", url);
    return fetch(url,{cache:"no-store"})
      .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
      .then(html=>{ document.body.insertAdjacentHTML("afterbegin", html); return "inserted"; })
      .catch(e=>{ console.warn("[layout] header load failed", e); return "failed"; });
  }

  // ---- AKTİF BAĞLANTIYI İŞARETLE ----
  function markActiveLinks(){
    try{
      const curIsHome = /\/apps\/web\/public\/?$/.test(curPath) || /\/rgztec\/apps\/web\/public\/?$/.test(curPath);

      document.querySelectorAll(".chips a, .categories a, .store-bar a, .hdr-right a[href]")
      .forEach(a=>{
        const u = new URL(a.getAttribute("href")||"", document.baseURI);
        const uPath  = u.pathname.replace(/\/index\.html$/i,'/').replace(/\/+$/,'');
        const uTag   = (u.searchParams.get("tag")   || "").toLowerCase();
        const uStore = (u.searchParams.get("store") || "").toLowerCase();
        const uSlug  = (u.searchParams.get("slug")  || "").toLowerCase();

        const samePage =
          uPath === curPath ||
          (uPath.endsWith("/listings.html") && curPath.endsWith("/listings.html")) ||
          (uPath.endsWith("/store.html")    && curPath.endsWith("/store.html")) ||
          (uPath.endsWith("/")              && curPath.endsWith("/"));

        const tagOK   = uTag   ? (uTag   === curTag)   : true;
        const storeOK = uStore ? (uStore === curStore) : true;
        const storeSlugMatch = (uStore && uStore===curSlug) || (uSlug && uSlug===curStore);

        if (samePage && tagOK && (storeOK || storeSlugMatch)){
          a.classList.add("active");
          log("active:", a.href);
        }
      });

      // Ana sayfadaysak görsel değişiklik için "New" chip'i varsayılan aktif yap:
      if (curIsHome && !curTag && !curStore && !curSlug){
        const def = document.querySelector('.chips a[href*="tag=new"]');
        def && def.classList.add("active");
      }
    }catch(e){ console.warn("[layout] markActiveLinks failed", e); }
  }

  function run(){ ensureHeader().then(markActiveLinks); }

  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
</script>

