// apps/saas/src/modules/_ui/shell.config.ts

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

// çakışmayı önlemek için prefix'li:
export type AdminSection =
  | "admin_overview"
  | "admin_stores"
  | "admin_products"
  | "admin_banners";

export type BuyerSection =
  | "buyer_account"
  | "buyer_orders"
  | "buyer_billing";

export type AppSection = SellerSection | AdminSection | BuyerSection;

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

export const ADMIN_SECTION_META: Record<AdminSection, { title: string; subtitle?: string }> = {
  admin_overview: { title: "Admin Overview", subtitle: "System status & operations" },
  admin_stores:   { title: "Stores", subtitle: "Approvals, verification and policies" },
  admin_products: { title: "Products", subtitle: "Moderation, flags and catalog health" },
  admin_banners:  { title: "Banners", subtitle: "Inventory, sponsors and placements" },
};

export const BUYER_SECTION_META: Record<BuyerSection, { title: string; subtitle?: string }> = {
  buyer_account: { title: "Account", subtitle: "Profile & security" },
  buyer_orders:  { title: "Orders", subtitle: "Purchases & downloads" },
  buyer_billing: { title: "Billing", subtitle: "Invoices & payment methods" },
};

