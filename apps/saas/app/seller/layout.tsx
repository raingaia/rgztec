import React from "react";
import Link from "next/link";

const NAV = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/analytics", label: "Analytics" },
  { href: "/seller/profile", label: "Profile" },
  { href: "/open-store", label: "Open Store" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">RGZTEC • Seller</div>
              <div className="text-xs text-slate-500">Command Center</div>
            </div>
          </div>

          <nav className="hidden items-center gap-4 text-sm md:flex">
            {NAV.slice(0, 5).map((i) => (
              <Link key={i.href} className="text-slate-700 hover:text-slate-900" href={i.href}>
                {i.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border bg-white p-3 md:sticky md:top-[76px] md:h-[calc(100vh-90px)]">
          <div className="mb-3 text-xs font-semibold text-slate-500">Seller Menu</div>
          <div className="flex flex-col gap-1">
            {NAV.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                {i.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-700">Status</div>
            <div className="mt-1 text-xs text-slate-600">Dev mode • JSON data</div>
          </div>
        </aside>

        {/* Content */}
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}

