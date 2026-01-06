import React from "react";

const items = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/analytics", label: "Analytics" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/pricing", label: "Pricing" },
  { href: "/seller/profile", label: "Profile" },
];

export default function SellerNav() {
  // Basit active state: pathname yoksa da çalışır. İstersen sonra usePathname ile aktif yaparız.
  return (
    <nav className="space-y-1">
      {items.map((it) => (
        <a
          key={it.href}
          href={it.href}
          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <span className="font-medium">{it.label}</span>
          <span className="text-[11px] text-slate-400">→</span>
        </a>
      ))}
    </nav>
  );
}
