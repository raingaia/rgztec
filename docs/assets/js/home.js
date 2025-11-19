/* RGZTEC Home Page Logic */
(function(RGZ){
  if(!RGZ) return;

  document.addEventListener('DOMContentLoaded', async () => {
    const {$, esc, fetchJSON, setYear} = RGZ;

    // --- Featured stores (sabit veri)
    const COLOR = {
      'html-templates': ['#a5d6ff', '#3b82f6'],
      'email-forge': ['#fecaca', '#ef4444'],
      'icon-smith': ['#bae6fd', '#0ea5e9'],
      'ai-tools-hub': ['#e9d5ff', '#a855f7'],
      'dev-studio-one': ['#a7f3d0', '#10b981'],
      'game-makers': ['#fde68a', '#f59e0b'],
      'reactorium': ['#a5f3fc', '#06b6d4'],
      'tiny-js-lab': ['#d9f99d', '#84cc16'],
      'unity-hub': ['#fecdd3', '#f43f5e'],
      'wp-plugins': ['#ddd6fe', '#8b5cf6'],
      'hardware': ['#c7f0d8', '#10b981']
    };
    const STORES_DATA = [
      { slug:'html-templates', name:'HTML Templates' },
      { slug:'email-forge',    name:'Email Forge' },
      { slug:'icon-smith',     name:'Icon Smith' },
      { slug:'ai-tools-hub',   name:'AI Tools Hub' },
      { slug:'dev-studio-one', name:'Dev Studio One' },
      { slug:'game-makers',    name:'Game Makers' },
      { slug:'reactorium',     name:'Reactorium' },
      { slug:'tiny-js-lab',    name:'Tiny JS Lab' },
      { slug:'unity-hub',      name:'Unity Hub' },
      { slug:'wp-plugins',     name:'WP Plugins' },
      { slug:'hardware',       name:'Hardware' }
    ];

    function tile(s){
      const name = s.name || s.slug;
      const letter = (name||'?')[0].toUpperCase();
      const [light,dark] = COLOR[s.slug] || ['#a5d6ff','#3b82f6'];
      return `<li>
        <a class="store-tile" href="store.html?slug=${encodeURIComponent(s.slug)}" title="${esc(name)}">
          <div class="badge-tile" style="background:radial-gradient(circle at 70% 30%, ${light}, ${dark})">
            <div class="letter">${letter}</div>
          </div>
          <div class="sname">${esc(name)}</div>
        </a>
      </li>`;
    }

    const storeRow = $('#storeRow');
    if (storeRow) storeRow.innerHTML = STORES_DATA.map(tile).join('');

    setYear('#y');

    // --- Drawer (Categories)
    const drawer = $('#drawer'), back = $('#backdrop'), panel = drawer?.querySelector('.panel'), openBtn = $('#btnCats');
    function openDrawer(){
      if (!openBtn || !panel || !drawer) return;
      const r = openBtn.getBoundingClientRect();
      panel.style.top = `${r.bottom + 8}px`;
      panel.style.left = `${r.left}px`;
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
    }
    function closeDrawer(){
      if (!drawer) return;
      drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true');
    }
    openBtn?.addEventListener('click', (e)=>{ e.stopPropagation(); drawer?.classList.contains('open') ? closeDrawer() : openDrawer(); });
    back?.addEventListener('click', closeDrawer);
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeDrawer(); });

    // --- Promos (fallback'lı)
    (async function mountPromos(){
      const box = $('#heroPromos');
      if (!box) return;
      const fallback = [
        { title:'Hot deals',      href:'listings.html?tag=deals' },
        { title:'Hardware picks', href:'listings.html?store=hardware' }
      ];
      try{
        const items = await fetchJSON('assets/data/promos.json');
        const data = Array.isArray(items) && items.length ? items : fallback;
        box.innerHTML = data.slice(0,2).map(p => `
          <a class="promo-box" href="${p.href}" aria-label="${p.title}">
            <span class="promo-badge">${p.title}</span>
            <div class="promo-media"></div>
            <div class="promo-line"></div>
            <div class="promo-line short"></div>
          </a>`).join('');
      }catch(e){
        console.warn('promos fallback', e);
        box.innerHTML = fallback.map(p => `
          <a class="promo-box" href="${p.href}" aria-label="${p.title}">
            <span class="promo-badge">${p.title}</span>
            <div class="promo-media"></div>
            <div class="promo-line"></div>
            <div class="promo-line short"></div>
          </a>`).join('');
      }
    })();
  });
})(window.RGZ);
