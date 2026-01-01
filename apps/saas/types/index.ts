/**
 * SaaS Marketplace - Global Tip Tanımlamaları
 */

// 1. Ürün Veri Yapısı
export interface Product {
  id: string;
  name: string;
  store_key: string;
  section_slug: string;
  base_price_usd: number;
  final_price: number;
  net_revenue: number;
  is_active?: boolean;
  region_lock?: string | null;
}

// 2. Finansal Analiz (Mağaza Bazlı) Veri Yapısı
export interface StoreAnalytics {
  name: string;
  totalSales: number;
  netProfit: number;
  tax: number;
  count: number;
}

// 3. Dashboard İstatistik Kartları Yapısı
export interface StatCard {
  label: string;
  value: string | number;
  color: string;
}

// 4. Kategori/Store Tipleri (Enum gibi kullanılabilir)
export type StoreCategory = 'all' | 'hardware' | 'ai' | 'unity' | 'marketing-agency';
