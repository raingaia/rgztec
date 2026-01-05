"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItem = { href: string; label: string };

export function Shell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "260px 1fr" }}>
      <aside
        style={{
          borderRight: "1px solid rgba(255,255,255,0.10)",
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>RGZTEC</div>
        <div style={{ opacity: 0.75, fontSize: 12, marginBottom: 14 }}>{title}</div>

        <nav style={{ display: "grid", gap: 8 }}>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                  fontWeight: active ? 800 : 600,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>{title}</h1>
        </div>

        <div style={{ marginTop: 14 }}>{children}</div>
      </main>
    </div>
  );
}
