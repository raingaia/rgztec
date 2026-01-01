import stores from "./stores.json";

type RawProduct = {
  id: string;
  title?: string;
  name?: string;
  tagline?: string;
  image?: string;
  keywords?: string[];
  is_active?: boolean;
  region_lock?: string | null;
};

type RawSection = {
  slug: string;
  name?: string;
  tagline?: string;
  products?: RawProduct[];
  sections?: RawSection[];
};

type RawStore = {
  title?: string;
  sections?: RawSection[];
};

type RawRoot = Record<string, RawStore>;

function tokenize(...parts: string[]) {
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

function walkSections(store_key: string, sections: RawSection[] | undefined, out: any[]) {
  if (!sections) return;

  for (const sec of sections) {
    for (const p of sec.products || []) {
      const name = p.title || p.name || p.id;

      const autoKeywords = tokenize(
        store_key,
        sec.slug,
        sec.name || "",
        name,
        p.tagline || ""
      );

      const mergedKeywords = Array.from(new Set([...(p.keywords || []), ...autoKeywords]));

      out.push({
        id: p.id,
        name,
        store_key,
        section_slug: sec.slug,
        keywords: mergedKeywords,
        image: p.image || null,
        is_active: p.is_active ?? true,
        region_lock: p.region_lock ?? null
      });
    }

    if (sec.sections?.length) walkSections(store_key, sec.sections, out);
  }
}

export function buildSearchIndex() {
  const root = stores as unknown as RawRoot;
  const out: any[] = [];

  for (const [store_key, store] of Object.entries(root)) {
    walkSections(store_key, store.sections, out);
  }

  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });
}

// opsiyonel: bazı yerler default import yapıyorsa diye:
export default buildSearchIndex;


