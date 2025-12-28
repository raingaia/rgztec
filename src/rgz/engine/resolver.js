import { getCache, setCache } from "./cache.js";

/**
 * Browser-side resolver (docs içinde çalışan store-shell gibi)
 * - 1) /api/catalog
 * - 2) /data/store.data.json (fallback)
 */
export async function loadCatalog({ apiPath = "/api/catalog", fallbackPath = "/data/store.data.json" } = {}) {
  const cached = getCache();
  if (cached?.data) return cached.data;

  // 1) API
  try {
    const r = await fetch(apiPath, { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      if (j?.ok && j?.data) return setCache(j.data).data;
    }
  } catch {}

  // 2) Fallback
  try {
    const r2 = await fetch(fallbackPath, { cache: "no-store" });
    if (r2.ok) {
      const j2 = await r2.json();
      return setCache(j2).data;
    }
  } catch {}

  throw new Error("Catalog could not be loaded from API or fallback.");
}
