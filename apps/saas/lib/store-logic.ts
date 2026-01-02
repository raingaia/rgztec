import rawData from "./pricing.json";

// --- Tipler (Interfaces) ---
export interface Product {
  id: string;
  name: string;
  store_key: string;
  section_slug: string;
  base_price_usd: number;
  final_price: number;
  net_revenue: number;
  is_active: boolean;
  region_lock: string | null;
}

export interface StoreAnalytics {
  name: string;
  totalSales: number;
  netProfit: number;
  tax: number;
  count: number;
}

// pricing.json'un tipini garantiye alalım
const data = rawData as Array<{
  id: string;
  name: string;
  store_key: string;
  section_slug: string;
  base_price_usd: number;
  is_active?: boolean;
  region_lock?: string | null;
}>;

// --- 1. Temel Ürün Listeleme & Hesaplama Motoru ---
export const getSaaSProducts = (): Product[] => {
  return data.map((item, index) => {
    // Sabit fiyatları %15 aralığında dinamik olarak değiştiriyoruz
    const variance = index % 2 === 0 ? 1.12 : 0.95;
    const dynamicBasePrice = parseFloat((item.base_price_usd * variance).toFixed(2));

    // Vergi ve Komisyon Hesaplaması (US SaaS Logic)
    const taxRate = 0.08; // %8
    const platformFee = 0.20; // %20

    const finalPrice = parseFloat((dynamicBasePrice * (1 + taxRate)).toFixed(2));
    const netRevenue = parseFloat((finalPrice * (1 - platformFee)).toFixed(2));

    return {
      id: item.id,
      name: item.name,
      store_key: item.store_key,
      section_slug: item.section_slug,
      base_price_usd: dynamicBasePrice,
      final_price: finalPrice,
      net_revenue: netRevenue,
      is_active: item.is_active ?? true,
      region_lock: item.region_lock ?? null,
    };
  });
};

// --- 2. Finansal Analiz & Raporlama Motoru ---
export const getStoreAnalytics = (): StoreAnalytics[] => {
  const products = getSaaSProducts();
  const analytics: Record<string, StoreAnalytics> = {};

  products.forEach((p) => {
    if (!analytics[p.store_key]) {
      analytics[p.store_key] = {
        name: p.store_key.toUpperCase(),
        totalSales: 0,
        netProfit: 0,
        tax: 0,
        count: 0,
      };
    }

    analytics[p.store_key].totalSales += p.final_price;
    analytics[p.store_key].netProfit += p.net_revenue;
    analytics[p.store_key].tax += p.final_price - p.base_price_usd;
    analytics[p.store_key].count += 1;
  });

  return Object.values(analytics).map((store) => ({
    ...store,
    totalSales: parseFloat(store.totalSales.toFixed(2)),
    netProfit: parseFloat(store.netProfit.toFixed(2)),
    tax: parseFloat(store.tax.toFixed(2)),
  }));
};
