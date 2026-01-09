// ---- TYPES ----
export type SellerSection =
  | "dashboard"
  | "products"
  | "orders"
  | "analytics"
  | "hardware"
  | "pricing"
  | "profile"
  | "settings"
  | "summary";

export type AdminSection = "overview" | "stores" | "products" | "banners";
export type BuyerSection = "account" | "orders" | "billing";

// Shell hepsini kapsasın:
export type AppSection = SellerSection | AdminSection | BuyerSection;

// ---- SELLER META ----
export const SELLER_SECTION_META: Record<SellerSection, { title: string; subtitle?: string }> = {
  dashboard: { title: "Seller Dashboard", subtitle: "Overview & quick actions" },
  products:  { title: "Products", subtitle: "Create, edit, publish" },
  orders:    { title: "Orders", subtitle: "Pipeline & fulfillment" },
  analytics: { title: "Analytics", subtitle: "Revenue, traffic, conversion" },
  hardware:  { title: "Hardware", subtitle: "Physical products & compliance" },
  pricing:   { title: "Pricing", subtitle: "Plans, fees, commissions" },
  profile:   { title: "Profile", subtitle: "Account & store settings" },
  settings:  { title: "Settings", subtitle: "Security, team, notifications & integrations" },
  summary:   { title: "Summary", subtitle: "Reports & exports" },
};

// ---- ADMIN META ----
export const ADMIN_SECTION_META: Record<AdminSection, { title: string; subtitle?: string }> = {
  overview: { title: "Admin Overview", subtitle: "System status & operations" },
  stores:   { title: "Stores", subtitle: "Manage stores & approvals" },
  products: { title: "Products", subtitle: "Catalog moderation & flags" },
  banners:  { title: "Banners", subtitle: "Sponsors, placements & inventory" },
};

// ---- BUYER META ----
export const BUYER_SECTION_META: Record<BuyerSection, { title: string; subtitle?: string }> = {
  account: { title: "Account", subtitle: "Profile & security" },
  orders:  { title: "Orders", subtitle: "Purchases & downloads" },
  billing: { title: "Billing", subtitle: "Invoices, payment methods" },
};
