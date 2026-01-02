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

// --- 1. Temel Ürün Listeleme & Hesaplama Motoru ---
export const getSaaSProducts = (): Product[] => {
  return rawData.map((item, index) => { ... })
    // Sabit fiyatları %15 aralığında dinamik olarak değiştiriyoruz
    // Böylece her ürünün fiyatı kendine has ve profesyonel görünür
    const variance = index % 2 === 0 ? 1.12 : 0.95;
    const dynamicBasePrice = parseFloat((item.base_price_usd * variance).toFixed(2));
    
    // Vergi ve Komisyon Hesaplaması (US SaaS Logic)
    const taxRate = 0.08;      // %8 Eyalet Vergisi
    const platformFee = 0.20;  // %20 Platform Komisyonu
    
    const finalPrice = parseFloat((dynamicBasePrice * (1 + taxRate)).toFixed(2));
    const netRevenue = parseFloat((finalPrice * (1 - platformFee)).toFixed(2));

    return {
      ...item,
      base_price_usd: dynamicBasePrice,
      final_price: finalPrice,
      net_revenue: netRevenue
    };
  });
};

// --- 2. Finansal Analiz & Raporlama Motoru ---
export const getStoreAnalytics = (): StoreAnalytics[] => {
  const products = getSaaSProducts();
  const analytics: Record<string, StoreAnalytics> = {};

  products.forEach(p => {
    if (!analytics[p.store_key]) {
      analytics[p.store_key] = { 
        name: p.store_key.toUpperCase(), 
        totalSales: 0, 
        netProfit: 0, 
        tax: 0,
        count: 0 
      };
    }
    
    analytics[p.store_key].totalSales += p.final_price;
    analytics[p.store_key].netProfit += p.net_revenue;
    analytics[p.store_key].tax += (p.final_price - p.base_price_usd);
    analytics[p.store_key].count += 1;
  });

  // Rakamları temizlemek için (toFixed(2) sonrası number'a çevrim)
  return Object.values(analytics).map(store => ({
    ...store,
    totalSales: parseFloat(store.totalSales.toFixed(2)),
    netProfit: parseFloat(store.netProfit.toFixed(2)),
    tax: parseFloat(store.tax.toFixed(2))
  }));
};
