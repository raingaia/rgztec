import rawData from './data.json';

export interface Product {
  id: string;
  name: string;
  store_key: string;
  section_slug: string;
  base_price_usd: number;
  final_price: number;
  net_revenue: number;
}

export const getSaaSProducts = (): Product[] => {
  return rawData.map((item, index) => {
    // Sabit fiyatları %15 aralığında dinamik olarak değiştiriyoruz
    // Böylece her ürünün fiyatı kendine has ve profesyonel görünür
    const variance = index % 2 === 0 ? 1.12 : 0.95;
    const dynamicBasePrice = parseFloat((item.base_price_usd * variance).toFixed(2));
    
    // Vergi ve Komisyon Hesaplaması (US SaaS Logic)
    const taxRate = 0.08;
    const platformFee = 0.20;
    
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
