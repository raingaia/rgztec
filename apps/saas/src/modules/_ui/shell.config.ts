export type SellerSection =
  | "dashboard"
  | "products"
  | "orders"
  | "analytics"
  | "hardware"
  | "pricing"
  | "profile"
  | "summary";

export const SELLER_NAV: { href: string; label: string; section: SellerSection }[] = [
  { href: "/seller/dashboard", label: "Dashboard", section: "dashboard" },
  { href: "/seller/products",  label: "Products",  section: "products"  },
  { href: "/seller/orders",    label: "Orders",    section: "orders"    },
  { href: "/seller/analytics", label: "Analytics", section: "analytics" },
  { href: "/seller/hardware",  label: "Hardware",  section: "hardware"  },
  { href: "/seller/pricing",   label: "Pricing",   section: "pricing"   },
  { href: "/seller/profile",   label: "Profile",   section: "profile"   },
  { href: "/seller/summary",   label: "Summary",   section: "summary"   },
];

export const SELLER_SECTION_META: Record<SellerSection, { title: string; subtitle?: string }> = {
  dashboard: { title: "Seller Dashboard", subtitle: "Overview & quick actions" },
  products:  { title: "Products", subtitle: "Create, edit, publish" },
  orders:    { title: "Orders", subtitle: "Pipeline & fulfillment" },
  analytics: { title: "Analytics", subtitle: "Revenue, traffic, conversion" },
  hardware:  { title: "Hardware", subtitle: "Physical products & compliance" },
  pricing:   { title: "Pricing", subtitle: "Plans, fees, commissions" },
  profile:   { title: "Profile", subtitle: "Account & store settings" },
  summary:   { title: "Summary", subtitle: "Reports & exports" },
};
