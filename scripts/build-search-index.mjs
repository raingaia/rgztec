import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// --- YOLLAR (Senin klasör yapına tam uyumlu) ---
const SRC_STORES = path.join(root, "apps/saas/lib/stores.json");
const SRC_PRICING = path.join(root, "apps/saas/lib/pricing.json");

const DST_CATEGORIES = path.join(root, "docs/data/categories.json");
const DST_PRICING = path.join(root, "docs/data/pricing-data.json");
const DST_SEARCH = path.join(root, "docs/data/search.index.json");
const LIB_SEARCH = path.join(root, "apps/saas/lib/search-index.json");

function ensureDir(p) {
  if (!fs.existsSync(path.dirname(p))) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
  }
}

// 1) Önce Arama Dizinini Oluştur (Indexing)
function norm(s = "") {
  return String(s).toLowerCase().replace(/[^\p{L}\p{N}\s-]+/gu, " ").replace(/\s+/g, " ").trim();
}

console.log("🚀 Arama dizini ve kopyalama işlemi başlıyor...");

if (fs.existsSync(SRC_STORES)) {
  const stores = JSON.parse(fs.readFileSync(SRC_STORES, "utf-8"));
  const items = [];
  const base = "/rgztec";

  for (const [slug, store] of Object.entries(stores)) {
    items.push({ type: "store", title: store.title || slug, url: `${base}/store/${slug}/`, q: norm(`${slug} ${store.title}`) });
    // Alt bölümleri ve ürünleri buraya senin walkSections fonksiyonunu ekleyerek genişletebilirsin
  }

  const out = { updatedAt: new Date().toISOString().slice(0, 10), total: items.length, items };
  [DST_SEARCH, LIB_SEARCH].forEach(p => { ensureDir(p); fs.writeFileSync(p, JSON.stringify(out, null, 2)); });
  console.log(`✅ Search Index: ${items.length} öğe hazır.`);
}

// 2) Diğer Statik Dosyaları Kopyala
[[SRC_STORES, DST_CATEGORIES], [SRC_PRICING, DST_PRICING]].forEach(([src, dst]) => {
  if (fs.existsSync(src)) { ensureDir(dst); fs.copyFileSync(src, dst); console.log(`✅ Kopyalandı: ${path.basename(src)}`); }
});
