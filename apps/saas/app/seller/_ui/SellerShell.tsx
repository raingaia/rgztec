import React from "react";
import SellerNav from "./SellerNav";

export default function SellerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">RGZTEC Seller</div>
              <div className="text-[11px] text-slate-500">Command Center</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <div className="relative">
                <input
                  className="w-[340px] rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Search orders, products… (dev)"
                />
              </div>
            </div>

            <button className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Help
            </button>

            <div className="h-9 w-9 rounded-full border bg-white" title="Account" />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="md:sticky md:top-20 md:h-[calc(100vh-96px)]">
          <div className="rounded-2xl border bg-white p-3">
            <SellerNav />
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-4">
            <div className="text-xs font-semibold text-slate-900">Store status</div>
            <div className="mt-2 text-xs text-slate-600">
              Dev mode. Payments & KYC later.
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">Pending</span>
              <a className="text-xs font-semibold text-slate-900 underline" href="/seller/profile">
                Complete profile
              </a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <div className="rounded-2xl border bg-white p-4 md:p-6">{children}</div>

          <div className="mt-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} RGZTEC • Seller Panel (Dev → Production ready)
          </div>
        </main>
      </div>
    </div>
  );
}
