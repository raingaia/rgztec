<script>
(function(){
  // /rgztec/ gibi repo alt-kökünü otomatik bul
  function base(){
    const parts = location.pathname.split('/').filter(Boolean);
    return (parts.length && parts[0] !== 'store' && parts[0] !== 'stores' && parts[0] !== 'data')
      ? '/' + parts[0] + '/' : '/';
  }

  // Yol çözümleyici: /store/<slug> ve /stores/open gibi yolları gerçek dosyalara çevirir
  function route(){
    const raw = location.pathname.replace(/\/+$/,'');
    const segs = raw.split('/').filter(Boolean);

    // repo alt kökü varsa (ör. rgztec) onu atla
    const hasRepo = (segs.length && segs[0] !== 'store' && segs[0] !== 'stores' && segs[0] !== 'data');
    const i = hasRepo ? 1 : 0;

    const b = base();

    // /store/<slug>  -> store.html?slug=<slug>
    if (segs[i] === 'store' && segs[i+1]) {
      location.replace(b + 'store.html?slug=' + encodeURIComponent(segs[i+1]));
      return;
    }

    // /stores/open   -> open-store.html
    if (segs[i] === 'stores' && segs[i+1] === 'open') {
      location.replace(b + 'open-store.html');
      return;
    }

    // /stores/       -> stores/ (liste sayfan)
    if (segs[i] === 'stores' && !segs[i+1]) {
      location.replace(b + 'stores/');
      return;
    }
  }

  route();
})();
</script>
