// apps/saas/app/seller/layout.tsx
import React from "react";
import Link from "next/link";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  // Şimdilik “guard” yok; auth geldiğinde burada:
  // - cookie/session kontrol
  // - role seller değilse redirect /open-store
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">RGZTEC Seller</div>
              <div className="text-xs text-slate-500">Dashboard</div>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-slate-700 hover:text-slate-900" href="/seller/dashboard">
              Overview
            </Link>
            <Link className="text-slate-700 hover:text-slate-900" href="/seller/products">
              Products
            </Link>
            <Link className="text-slate-700 hover:text-slate-900" href="/seller/orders">
              Orders
            </Link>
            <Link className="text-slate-700 hover:text-slate-900" href="/seller/profile">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
