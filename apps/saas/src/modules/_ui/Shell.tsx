"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SELLER_NAV, ADMIN_NAV, BUYER_NAV, type NavItem } from "./nav";
import {
  type AppSection,
  type SellerSection,
  type AdminSection,
  type BuyerSection,
  SELLER_SECTION_META,
  ADMIN_SECTION_META,
  BUYER_SECTION_META,
} from "./shell.config";

type Variant = "seller" | "admin" | "buyer";

const NAV_BY_VARIANT: Record<Variant, NavItem[]> = {
  seller: SELLER_NAV,
  admin: ADMIN_NAV,
  buyer: BUYER_NAV,
};

function getMeta(variant: Variant, section: AppSection) {
  if (variant === "seller") return SELLER_SECTION_META[section as SellerSection];
  if (variant === "admin") return ADMIN_SECTION_META[section as AdminSection];
  return BUYER_SECTION_META[section as BuyerSection];
}

export default function Shell({
  section,
  children,
  variant = "seller",
}: {
  section: AppSection;
  children: React.ReactNode;
  variant?: Variant;
}) {
  const pathname = usePathname();
  const nav = NAV_BY_VARIANT[variant];

  const meta = getMeta(variant, section);

  const headerTitle =
    variant === "seller"
      ? "RGZTEC • Seller"
      : variant === "admin"
        ? "RGZTEC • Admin"
        : "RGZTEC • Buyer";

  const headerSub =
    variant === "seller"
      ? "Command Center"
      : variant === "admin"
        ? "Control Panel"
        : "Account";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" data-variant={variant}>
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{headerTitle}</div>
              <div className="text-xs text-slate-500">{headerSub}</div>
            </div>
          </div>

          <nav className="hidden items-center gap-4 text-sm md:flex">
            {nav.map((i) => {
              const active = pathname === i.href || pathname.startsWith(i.href + "/");
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={active ? "font-semibold text-slate-900" : "text-slate-600 hover:text-slate-900"}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5">
          <div className="text-xl font-semibold">{meta?.title ?? "Page"}</div>
          {meta?.subtitle ? <div className="mt-1 text-sm text-slate-600">{meta.subtitle}</div> : null}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">{children}</div>
      </main>
    </div>
  );
}

