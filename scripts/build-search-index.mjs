import fs from "node:fs";
import path from "node:path";

const STORE_DATA_PATH = path.resolve("docs/data/store.data.json"); // <-- gerekirse değiştir
const OUT_PATH = path.resolve("api/data/search.index.json");

function norm(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pushItem(items, item) {
  item.q = norm(item.q || `${item.title || ""} ${item.tagline || ""}`);
  items.push(item);
}

const raw = fs.readFileSync(STORE_DATA_PATH, "utf-8");
const stores = JSON.parse(raw); // { "hardware": {...}, "ai-tools-hub": {...} }

const base = "/rgztec";
const items = [];

for (const [storeSlug, store] of Object.entries(stores)) {
  // 1) STORE
  pushItem(items, {
    type: "store",
    storeSlug,
    title: store.title || storeSlug,
    tagline: store.tagline || "",
    url: `${base}/store/${storeSlug}/`,
    q: `${storeSlug} ${store.title} ${store.tagline}`
  });

  // 2) SECTIONS (recursive)
  const walkSections = (sections, parentPath = []) => {
    if (!Array.isArray(sections)) return;

    for (const sec of sections) {
      const sectionSlug = sec.slug;
      const sectionTitle = sec.name || sec.title || sectionSlug;

      const sectionPath = [...parentPath, sectionSlug];
      const url = `${base}/store/${storeSlug}/${sectionPath.join("/")}/`;

      pushItem(items, {
        type: "section",
        storeSlug,
        sectionSlug: sectionPath.join("/"),
        title: sectionTitle,
        tagline: sec.tagline || "",
        url,
        q: `${storeSlug} ${store.title} ${sectionSlug} ${sectionTitle} ${sec.tagline || ""}`
      });

      // 3) PRODUCTS
      if (Array.isArray(sec.products)) {
        for (const p of sec.products) {
          const pid = p.id || "";
          const pTitle = p.title || pid;
          const pTagline = p.tagline || "";
          pushItem(items, {
            type: "product",
            storeSlug,
            sectionSlug: sectionPath.join("/"),
            id: pid,
            title: pTitle,
            tagline: pTagline,
            url: `${url}?p=${encodeURIComponent(pid)}`,
            q: `${storeSlug} ${store.title} ${sectionSlug} ${sectionTitle} ${pid} ${pTitle} ${pTagline}`
          });
        }
      }

      // nested sections
      if (Array.isArray(sec.sections)) {
        walkSections(sec.sections, sectionPath);
      }
    }
  };

  walkSections(store.sections || [], []);
}

const out = {
  version: "1.0.0",
  updatedAt: new Date().toISOString().slice(0, 10),
  base,
  total: items.length,
  items
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf-8");

console.log("✅ search index built:", OUT_PATH);
console.log("items:", items.length);
