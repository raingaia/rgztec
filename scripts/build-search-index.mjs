import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// --- YOLLAR (PATHS) ---
const SRC_STORES = path.join(root, "apps/saas/lib/stores.json");
const SRC_PRICING = path.join(root, "apps/saas/lib/pricing.json");

const DST_CATEGORIES = path.join(root, "docs/data/categories.json");
const DST_PRICING = path.join(root, "docs/data/pricing-data.json");
const DST_SEARCH = path.join(root, "docs/data/search.index.json");
const LIB_SEARCH = path.join(root, "apps/saas/lib/search-index.json");

// --- 1) DOSYA KOPYALAMA BÖLÜMÜ ---
function ensureDir(p) {
  if (!fs.existsSync(path.dirname(p))) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
  }
}

const copyPairs = [
  [SRC_STORES, DST_CATEGORIES],
  [SRC_PRICING, DST_PRICING]
];

console.log("🚀 Statik dosyalar kopyalanıyor...");
for (const [src, dst] of copyPairs) {
  if (fs.existsSync(src)) {
    ensureDir(dst);
    fs.copyFileSync(src, dst);
    console.log(`✅ Kopyalandı: ${path.basename(src)} -> ${path.relative(root, dst)}`);
  } else {
    console.warn(`⚠️ Kaynak bulunamadı, atlanıyor: ${src}`);
  }
}

// --- 2) SEARCH INDEX OLUŞTURMA BÖLÜMÜ ---
function norm(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

if (fs.existsSync(SRC_STORES)) {
  const raw = fs.readFileSync(SRC_STORES, "utf-8");
  const stores = JSON.parse(raw);
  const base = "/rgztec";
  const items = [];

  for (const [storeSlug, store] of Object.entries(stores)) {
    // STORE seviyesi
    items.push({
      type: "store",
      storeSlug,
      title: store.title || storeSlug,
      url: `${base}/store/${storeSlug}/`,
      q: norm(`${storeSlug} ${store.title} ${store.tagline || ""}`)
    });

    const walkSections = (sections, parentPath = []) => {
      if (!Array.isArray(sections)) return;
      for (const sec of sections) {
        const sectionPath = [...parentPath, sec.slug];
        const url = `${base}/store/${storeSlug}/${sectionPath.join("/")}/`;

        items.push({
          type: "section",
          storeSlug,
          title: sec.name || sec.title || sec.slug,
          url,
          q: norm(`${storeSlug} ${sec.slug} ${sec.name || ""} ${sec.tagline || ""}`)
        });

        if (Array.isArray(sec.products)) {
          for (const p of sec.products) {
            items.push({
              type: "product",
              storeSlug,
              id: p.id,
              title: p.title || p.id,
              url: `${url}?p=${encodeURIComponent(p.id)}`,
              q: norm(`${storeSlug} ${p.id} ${p.title || ""} ${p.tagline || ""}`)
            });
          }
        }
        if (sec.sections) walkSections(sec.sections, sectionPath);
      }
    };
    walkSections(store.sections || []);
  }

  const out = {
    updatedAt: new Date().toISOString().slice(0, 10),
    total: items.length,
    items
  };

  // Hem dökümanlara hem de uygulamaya yazıyoruz
  [DST_SEARCH, LIB_SEARCH].forEach(p => {
    ensureDir(p);
    fs.writeFileSync(p, JSON.stringify(out, null, 2), "utf-8");
  });

  console.log(`✅ Search Index hazır: ${items.length} öğe.`);
}
