// apps/web/public/assets/js/hardware-page.js
// Hardware Lab için kategori barı + 6 mağaza + basit ürün grid'i

(function () {
  // 6 alt mağaza (hepsinin HTML'i docs/hardware klasöründe)
  const categories = [
    {
      slug: 'iot',
      label: 'IoT Devices',
      href: 'iot.html',
      tagline: 'Gateways, nodes and connected dev kits.',
    },
    {
      slug: 'sensors',
      label: 'Sensors & Kits',
      href: 'sensors.html',
      tagline: 'Temperature, motion, environment and lab sensors.',
    },
    {
      slug: 'developer-boards',
      label: 'Developer Boards',
      href: 'developer-boards.html',
      tagline: 'MCU/MPU boards, dev kits and starter bundles.',
    },
    {
      slug: 'smart-controllers',
      label: 'Smart Controllers',
      href: 'smart-controllers.html',
      tagline: 'Industrial controllers, PLC-style boards and hubs.',
    },
    {
      slug: 'edge',
      label: 'Edge Devices',
      href: 'edge.html',
      tagline: 'Edge compute nodes, gateways and NUC-style boxes.',
    },
    {
      slug: 'ai-accelerators',
      label: 'AI Accelerators',
      href: 'ai-accelerators.html',
      tagline: 'GPU/TPU accelerators for on-device AI workloads.',
    },
  ];

  const IMG_BASE = '../../assets/images/store/hardware-';
  const IMG_EXT = '.webp';

  function wireSearchForm() {
    const form = document.getElementById('searchForm');
    const qInput = document.getElementById('q');
    if (!form) return;

    // listings.html tarafına hardware filtresi ile gönder
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const url = new URL(form.action, window.location.origin);
      if (qInput && qInput.value.trim()) {
        url.searchParams.set('q', qInput.value.trim());
      }
      url.searchParams.set('store', 'hardware');
      window.location.href = url.toString();
    });

    // store=hardware hidden input (URL elle yazılırsa da dursun)
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'store';
    hidden.value = 'hardware';
    form.appendChild(hidden);
  }

  function renderCategories() {
    const bar = document.getElementById('storeBar');
    if (!bar) return;

    bar.innerHTML = categories
      .map(
        (cat) => `
        <a href="${cat.href}">${cat.label}</a>
      `
      )
      .join('');
  }

  function renderStores() {
    const row = document.getElementById('storeRow');
    if (!row) return;

    row.innerHTML = categories
      .map((cat) => {
        const imgSrc = IMG_BASE + cat.slug + IMG_EXT;
        return `
        <li class="tile">
          <a class="card" href="${cat.href}">
            <div class="media">
              <img src="${imgSrc}" alt="${cat.label}">
            </div>
            <div class="body">
              <h3 class="title">${cat.label}</h3>
              <p class="meta">${cat.tagline}</p>
            </div>
          </a>
        </li>
      `;
      })
      .join('');
  }

  // Şimdilik ürün grid'i de aynı kategorilerle dolduralım.
  // İleride docs/data/hardware.json bağlarız.
  function renderGrid() {
    const grid = document.getElementById('grid');
    if (!grid) return;

    grid.innerHTML = categories
      .map((cat) => {
        const imgSrc = IMG_BASE + cat.slug + IMG_EXT;
        return `
        <article class="card">
          <div class="media">
            <img src="${imgSrc}" alt="${cat.label}">
          </div>
          <div class="body">
            <h3 class="title">${cat.label}</h3>
            <p class="meta">${cat.tagline}</p>
            <a class="link" href="${cat.href}">View category →</a>
          </div>
        </article>
      `;
      })
      .join('');
  }

  function init() {
    wireSearchForm();
    renderCategories();
    renderStores();
    renderGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


