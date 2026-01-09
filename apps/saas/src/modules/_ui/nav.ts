// apps/saas/src/modules/_ui/nav.ts
export type NavItem = { href: string; label: string; icon?: string };

// Seller (sende zaten seller tarafı var — burada sadece örnek/uyum)
export const SELLER_NAV: NavItem[] = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/analytics", label: "Analytics" },
  { href: "/seller/pricing", label: "Pricing" },
  { href: "/seller/profile", label: "Profile" },
  { href: "/seller/settings", label: "Settings" },
  { href: "/open-store", label: "Open Store" },
];

// Admin (senin klasörlerin: finance, moderation, stores, users)
export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/finance", label: "Finance" },
];

// Buyer (senin klasörlerin: marketplace, orders, profile, cart, checkout)
export const BUYER_NAV: NavItem[] = [
  { href: "/buyer/marketplace", label: "Marketplace" },
  { href: "/buyer/orders", label: "Orders" },
  { href: "/buyer/profile", label: "Profile" },
  { href: "/buyer/cart", label: "Cart" },
  { href: "/buyer/checkout", label: "Checkout" },
];

