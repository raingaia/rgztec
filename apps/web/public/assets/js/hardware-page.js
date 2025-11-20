// Hardware main page JS
// =====================

console.log("Hardware page loaded.");

const categoryBar = document.getElementById("storeBar");
const storeRow = document.getElementById("storeRow");
const grid = document.getElementById("grid");

// Hardware docs path (index.html ile aynı klasördeyiz)
const DOCS_BASE = "./";

// Görseller için
const IMG_BASE = "../../assets/images/hardware/";
const DATA_URL = "../../data/hardware.json";

// ---------------------------
// KATEGORİLER
// ---------------------------
const categories = [
  { slug: "iot", label: "IoT Devices", href: "iot.html" },
  { slug: "sensors", label: "Sensors & Connectivity", href: "sensors.html" },
  { slug: "developer-boards", label: "Developer Boards", href: "developer-boards.html" },
  { slug: "smart-controllers", label: "Smart Controllers", href: "smart-controllers.html" },
  { slug: "edge", label: "Edge Devices", href: "edge.html" },
  { slug: "ai-accelerators", label: "AI Accelerators", href: "ai-accelerators.html" }
];

// ---------------------------
// KATEGORİ BARINI OLUŞTUR
// ---------------------------
if (categoryBar) {
  categoryBar.innerHTML = categories
    .map(cat => {
      return `<a href="${cat.href}" class="cat-link">${cat.label}</a>`;
    })
    .join("");
}

// ---------------------------
// POPULAR STORES (aynı kategoriler listeleniyor)
// ---------------------------
if (storeRow) {
  storeRow.innerHTML = categories
    .map(cat => {
      return `
      <li class="tile">
        <a href="${cat.href}">
          <div class="tile-media">
            <img src="${IMG_BASE}hardware-${cat.slug}.webp" alt="${cat.label}">
          </div>
          <div class="tile-body">
            <strong>${cat.label}</strong>
          </div>
        </a>
      </li>`;
    })
    .join("");
}

// ---------------------------
// ÜRÜNLERİ YÜKLE (hardware.json)
// ---------------------------
async function loadHardwareProducts() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    const items = await res.json();

    grid.innerHTML = items
      .map(item => {
        return `
        <div class="card">
          <div class="media loaded">
            <img src="${IMG_BASE}${item.image}" alt="${item.name}">
          </div>
          <div class="body">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Hardware data error:", err);
    grid.innerHTML = `<p style="color:#666;font-size:14px">Hardware products could not be loaded.</p>`;
  }
}

loadHardwareProducts();

