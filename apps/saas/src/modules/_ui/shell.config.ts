// apps/saas/src/modules/_ui/shell.config.ts

/* =========================
   SELLER
   ========================= */

export type SellerSection =
  | "dashboard"
  | "products"
  | "orders"
  | "analytics"
  | "hardware"
  | "pricing"
  | "profile"
  | "settings"

  // Settings sub-routes
  | "settings_account"
  | "settings_security"
  | "settings_payouts"
  | "settings_team"
  | "settings_notifications"
  | "settings_integrations"
  | "settings_advanced"

  | "summary";

export const SELLER_SECTION_META: Record<
  SellerSection,
  { title: string; subtitle?: string }
> = {
  dashboard: { title: "Seller Dashboard", subtitle: "Overview & quick actions" },
  products: { title: "Products", subtitle: "Create, edit, publish" },
  orders: { title: "Orders", subtitle: "Pipeline & fulfillment" },
  analytics: { title: "Analytics", subtitle: "Revenue, traffic, conversion" },
  hardware: { title: "Hardware", subtitle: "Physical products & compliance" },
  pricing: { title: "Pricing", subtitle: "Plans, fees & commissions" },
  profile: { title: "Profile", subtitle: "Account & store settings" },

  settings: { title: "Settings", subtitle: "Account, security & integrations" },

  settings_account: {
    title: "Account",
    subtitle: "Store identity & region",
  },
  settings_security: {
    title: "Security",
    subtitle: "2FA, sessions & access alerts",
  },
  settings_payouts: {
    title: "Payouts",
    subtitle: "Stripe Connect & payout schedule",
  },
  settings_team: {
    title: "Team",
    subtitle: "Invite members & manage roles",
  },
  settings_notifications: {
    title: "Notifications",
    subtitle: "Email preferences & alerts",
  },
  settings_integrations: {
    title: "Integrations",
    subtitle: "API keys & webhooks",
  },
  settings_advanced: {
    title: "Advanced",
    subtitle: "Exports & danger zone",
  },

  summary: { title: "Summary", subtitle: "Reports & exports" },
};

/* =========================
   ADMIN
   ========================= */

export type AdminSection =
  | "admin_overview"
  | "admin_stores"
  | "admin_users"
  | "admin_moderation"
  | "admin_finance";

export const ADMIN_SECTION_META: Record<
  AdminSection,
  { title: string; subtitle?: string }
> = {
  admin_overview: {
    title: "Admin Overview",
    subtitle: "System status & operations",
  },
  admin_stores: {
    title: "Stores",
    subtitle: "Approvals, verification & policies",
  },
  admin_users: {
    title: "Users",
    subtitle: "Accounts, roles & access control",
  },
  admin_moderation: {
    title: "Moderation",
    subtitle: "Flags, disputes & compliance",
  },
  admin_finance: {
    title: "Finance",
    subtitle: "Payouts, fees & settlements",
  },
};

/* =========================
   BUYER
   ========================= */

export type BuyerSection =
  | "buyer_marketplace"
  | "buyer_orders"
  | "buyer_profile"
  | "buyer_cart"
  | "buyer_checkout";

export const BUYER_SECTION_META: Record<
  BuyerSection,
  { title: string; subtitle?: string }
> = {
  buyer_marketplace: {
    title: "Marketplace",
    subtitle: "Browse & purchase",
  },
  buyer_orders: {
    title: "Orders",
    subtitle: "Purchases & downloads",
  },
  buyer_profile: {
    title: "Profile",
    subtitle: "Account & security",
  },
  buyer_cart: {
    title: "Cart",
    subtitle: "Review items",
  },
  buyer_checkout: {
    title: "Checkout",
    subtitle: "Payment & confirmation",
  },
};

/* =========================
   APP (union)
   ========================= */

export type AppSection = SellerSection | AdminSection | BuyerSection;


