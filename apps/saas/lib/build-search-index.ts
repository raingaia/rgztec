// apps/saas/lib/build-search-index.ts
import raw from "./source-stores.json";

type RawProduct = {
  id: string;
  title: string;
  tagline?: string;
  image?: string;
};

type RawSection = {
  slug: string;
  name: string;
  tagline?: string;
  banner?: string;
  products?: RawProduct[];
  sections?: RawSection[]; // nested sections support (tiny-js-lab gibi)
};

type RawStore = {
  title: string;
  tagline?: string;
  banner?: string;
  sections?: RawSection[];
};

type RawStoresRoot = Record<string, RawStore>;

export type SearchIndexItem = {
  id: string;
  name: string;
  tagline: string;
  store_key: string;
  store_title: string;
  section_slug: string;
  section_name: string;
  image: string | null;

  // search helpers
  keywords: string[];

  // saas flags
  base_price_usd: number;
  is_active: boolean;
  region_lock: string | null;
};

const DEFAULT_PRICE = 69;
const PLATFORM_FEE = 0.2;
const TAX_RATE = 0.08;

// basit keyword builder
function buildKeywords(parts: string[]) {
  return Array.from(
    new Set(
      parts
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
    )
  );
}

function walkSections(
  storeKey: string,
  store: RawStore,
  sections: RawSection[] | undefined,
  out: SearchIndexItem[]
) {
  if (!sections) return;

  for (const sec of sections) {
    // 1) products
    const prods = sec.products || [];
    for (const p of prods) {
      // deterministic “vary price” (id’e göre) — sabit değil, random da değil
      const hash =
        p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 12;
      const price = Number((DEFAULT_PRICE + hash * 5).toFixed(2));

      out.push({
        id: p.id,
        name: p.title,
        tagline: p.tagline || "",
        store_key: storeKey,
        store_title: store.title,
        section_slug: sec.slug,
        section_name: sec.name,
        image: p.image || null,

        keywords: buildKeywords([
          storeKey,
          store.title,
          sec.slug,
          sec.name,
          p.title,
          p.tagline || "",
        ]),

        base_price_usd: price,
        is_active: true,
        region_lock: null,
      });
    }

    // 2) nested sections (tiny-js-lab gibi)
    if (sec.sections?.length) {
      walkSections(storeKey, store, sec.sections, out);
    }
  }
}

export function buildSearchIndex() {
  const root = raw as unknown as RawStoresRoot;
  const out: SearchIndexItem[] = [];

  for (const [storeKey, store] of Object.entries(root)) {
    walkSections(storeKey, store, store.sections, out);
  }

  // duplicate ID guard
  const seen = new Set<string>();
  const deduped: SearchIndexItem[] = [];
  for (const item of out) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return deduped;
}
