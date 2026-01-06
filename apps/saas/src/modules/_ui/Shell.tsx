// src/modules/_ui/Shell.tsx
import React from "react";
import Link from "next/link";
import type { NavItem } from "./nav";

export function Shell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">RGZTEC</div>
              <div className="text-xs text-slate-500">{title}</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {i.label}
              </Link>
            ))}
          </nav>

          {/* Right actions placeholder */}
          <div className="hidden md:block">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              Dev Mode
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="border-b bg-white md:hidden">
        <div className="mx-auto max-w-6xl overflow-x-auto px-2 py-2">
          <div className="flex gap-2">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="whitespace-nowrap rounded-xl border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {i.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
