"use client";

import React from "react";
import Link from "next/link";
import { SELLER_NAV, SELLER_SECTION_META, type SellerSection } from "./shell.config";

export function Shell({
  section,
  children,
}: {
  section: SellerSection;
  children: React.ReactNode;
}) {
  const meta = SELLER_SECTION_META[section];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
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
            {SELLER_NAV.map((i) => {
              const active = i.section === section;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={
                    active
                      ? "font-semibold text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5">
          <div className="text-xl font-semibold">{meta.title}</div>
          {meta.subtitle ? (
            <div className="mt-1 text-sm text-slate-600">{meta.subtitle}</div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
