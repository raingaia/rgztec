// src/modules/_ui/nav.ts
export type NavItem = { href: string; label: string; icon?: string };

export const SELLER_NAV: NavItem[] = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products",  label: "Products" },
  { href: "/seller/orders",    label: "Orders" },
  { href: "/seller/analytics", label: "Analytics" },
  { href: "/seller/pricing",   label: "Pricing" },
  { href: "/seller/profile",   label: "Profile" },
  { href: "/seller/settings",  label: "Settings" },

  { href: "/open-store", label: "Open Store" },
];


export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/banners", label: "Banners" },
];

export const BUYER_NAV: NavItem[] = [
  { href: "/account", label: "Account" },
  { href: "/orders", label: "Orders" },
  { href: "/billing", label: "Billing" },
];
