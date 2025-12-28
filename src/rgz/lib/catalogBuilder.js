import { db } from "./firebaseAdmin.js";

export async function buildCatalogSnapshot() {
  const fire = db();

  const [storesSnap, productsSnap, bannersSnap] = await Promise.all([
    fire.collection("stores").where("status", "in", ["active", "draft"]).get(),
    fire.collection("products").where("status", "==", "active").get(),
    fire.collection("banners").where("status", "==", "active").get(),
  ]);

  const stores = storesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const banners = bannersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Build store map
  const storeMap = new Map();
  for (const s of stores) {
    storeMap.set(s.slug, {
      id: s.id,
      name: s.name,
      slug: s.slug,
      status: s.status,
      order: s.order ?? 0,
      sections: new Map(),
      banners: [],
    });
  }

  // Attach products -> sections
  for (const p of products) {
    const st = storeMap.get(p.storeSlug);
    if (!st) continue;

    const secSlug = p.sectionSlug || "general";
    if (!st.sections.has(secSlug)) {
      st.sections.set(secSlug, {
        slug: secSlug,
        title: p.sectionTitle || secSlug,
        order: 0,
        products: [],
      });
    }

    st.sections.get(secSlug).products.push({
      id: p.id,
      title: p.title,
      href: p.href,
      tags: p.tags || [],
      badge: p.badge || "",
      order: p.order ?? 0,
    });
  }

  // Attach banners
  for (const b of banners) {
    if (b.placement === "global") continue;
    if (!b.storeSlug) continue;

    const st = storeMap.get(b.storeSlug);
    if (!st) continue;

    st.banners.push({
      id: b.id,
      placement: b.placement,
      imageUrl: b.imageUrl,
      href: b.href,
      label: b.label || "",
      order: b.order ?? 0,
    });
  }

  // Global banners
  const globalBanners = banners
    .filter((b) => b.placement === "global")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((b) => ({
      id: b.id,
      placement: b.placement,
      imageUrl: b.imageUrl,
      href: b.href,
      label: b.label || "",
      order: b.order ?? 0,
    }));

  // Normalize + sort
  const storesOut = [...storeMap.values()]
    .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name))
    .map((st) => {
      const sections = [...st.sections.values()]
        .map((sec) => ({
          ...sec,
          products: sec.products.sort((x, y) => (x.order - y.order) || x.title.localeCompare(y.title)),
        }))
        .sort((a, b) => (a.order - b.order) || a.slug.localeCompare(b.slug));

      return {
        id: st.id,
        name: st.name,
        slug: st.slug,
        status: st.status,
        banners: st.banners.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        sections,
      };
    });

  return {
    meta: {
      generator: "rgztec-api",
      exportedAt: new Date().toISOString(),
      stores: storesOut.length,
      products: products.length,
      banners: banners.length,
    },
    globalBanners,
    stores: storesOut,
  };
}
