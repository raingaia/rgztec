// apps/saas/src/modules/_ui/shell.config.ts

// --- SELLER (sende zaten olabilir) ---
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

export const SELLER_SECTION_META: Record<SellerSection, { title: string; subtitle?: string }> = {
  dashboard: { title: "Seller Dashboard", subtitle: "Overview & quick actions" },
  products:  { title: "Products", subtitle: "Create, edit, publish" },
  orders:    { title: "Orders", subtitle: "Pipeline & fulfillment" },
  analytics: { title: "Analytics", subtitle: "Revenue, traffic, conversion" },
  hardware:  { title: "Hardware", subtitle: "Physical products & compliance" },
  pricing:   { title: "Pricing", subtitle: "Plans, fees, commissions" },
  profile:   { title: "Profile", subtitle: "Account & store settings" },
  settings:  { title: "Settings", subtitle: "Security, team & integrations" },
  summary:   { title: "Summary", subtitle: "Reports & exports" },
};

// --- ADMIN (senin klasörlerine göre) ---
export type AdminSection =
  | "admin_overview"
  | "admin_stores"
  | "admin_users"
  | "admin_moderation"
  | "admin_finance";

export const ADMIN_SECTION_META: Record<AdminSection, { title: string; subtitle?: string }> = {
  admin_overview:    { title: "Admin Overview", subtitle: "System status & operations" },
  admin_stores:      { title: "Stores", subtitle: "Approvals, verification & policies" },
  admin_users:       { title: "Users", subtitle: "Accounts, roles & access control" },
  admin_moderation:  { title: "Moderation", subtitle: "Flags, disputes & compliance" },
  admin_finance:     { title: "Finance", subtitle: "Payouts, fees & settlements" },
};

// --- BUYER (senin klasörlerine göre) ---
export type BuyerSection =
  | "buyer_marketplace"
  | "buyer_orders"
  | "buyer_profile"
  | "buyer_cart"
  | "buyer_checkout";

export const BUYER_SECTION_META: Record<BuyerSection, { title: string; subtitle?: string }> = {
  buyer_marketplace: { title: "Marketplace", subtitle: "Browse & purchase" },
  buyer_orders:      { title: "Orders", subtitle: "Purchases & downloads" },
  buyer_profile:     { title: "Profile", subtitle: "Account & security" },
  buyer_cart:        { title: "Cart", subtitle: "Review items" },
  buyer_checkout:    { title: "Checkout", subtitle: "Payment & confirmation" },
};

export type AppSection = SellerSection | AdminSection | BuyerSection;


