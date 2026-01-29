"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// 1. Shell alias'ı (Muhtemelen @modules veya @/modules)
import Shell from "@/modules/_ui/Shell";

// 2. Component alias'ları (Senin yapına göre @components veya @_components)
import StatusPill from "@/app/seller/_components/StatusPill";
import Toolbar from "@/app/seller/_components/Toolbar";

// Eğer tsconfig içinde özel bir @sellerComponents tanımın varsa şöyle de olabilir:
// import Toolbar from "@sellerComponents/Toolbar";

type Product = {
  id: string;
  title: string;
  price: string;
  status: "Active" | "Draft" | "Archived";
  updated: string;
};

const DATA: Product[] = [
  { id: "p_01", title: "Next.js SaaS Starter", price: "$89", status: "Active", updated: "Today" },
  { id: "p_02", title: "Admin Dashboard Pro", price: "$59", status: "Active", updated: "Yesterday" },
  { id: "p_03", title: "Checkout Components Pack", price: "$39", status: "Draft", updated: "2 days ago" },
  { id: "p_04", title: "Sticky Header UI Kit", price: "$29", status: "Archived", updated: "1 week ago" },
];

export default function SellerProductsPage() {
  const [tab, setTab] = React.useState<"All" | Product["status"]>("All");
  const [q, setQ] = React.useState("");

  const items = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return DATA.filter((p) => {
      const okTab = tab === "All" ? true : p.status === tab;
      const okQ = !qq || p.title.toLowerCase().includes(qq);
      return okTab && okQ;
    });
  }, [tab, q]);

  return (
    <Shell section="products" variant="seller">
      <Toolbar
        title="Products"
        subtitle="Manage listings (static demo)."
        right={
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="chip"
              style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid var(--line)", background: "#fff", minWidth: 220 }}
            />
            <Link className="chip" href="/seller/products" style={{ fontWeight: 900 }}>
              + New Product
            </Link>
          </>
        }
      />

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="card-h">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["All", "Active", "Draft", "Archived"] as const).map((t) => (
              <button
                key={t}
                className="chip"
                onClick={() => setTab(t)}
                style={{
                  fontWeight: 900,
                  borderColor: tab === t ? "rgba(15,23,42,.20)" : "var(--line)",
                  background: tab === t ? "rgba(15,23,42,.04)" : "#fff",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{items.length} item(s)</span>
        </div>

        <div style={{ padding: "10px 14px 14px" }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr className="row" key={p.id}>
                  <td style={{ fontWeight: 900 }}>{p.title}</td>
                  <td style={{ fontWeight: 900 }}>{p.price}</td>
                  <td><StatusPill status={p.status} /></td>
                  <td style={{ color: "var(--muted)" }}>{p.updated}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href="/seller/products" style={{ color: "var(--brand-600)", fontWeight: 900 }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr className="row">
                  <td colSpan={5} style={{ color: "var(--muted)", padding: 14 }}>
                    No products found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="note">
          Next: “New Product” will open an upload wizard (files, thumbnail, pricing, publish).
        </div>
      </div>
    </Shell>
  );
}
