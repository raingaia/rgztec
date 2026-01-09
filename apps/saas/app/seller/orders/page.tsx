"use client";

import React from "react";
import Link from "next/link";
import { Shell } from "@src/modules/_ui/Shell";
import StatusPill, { type Status } from "../_components/StatusPill";
import Toolbar from "../_components/Toolbar";

type Order = {
  id: string;
  product: string;
  buyer: string;
  amount: string;
  status: Extract<Status, "Paid" | "Pending" | "Failed">;
  date: string;
};

const DATA: Order[] = [
  { id: "#RGZ-10482", product: "Sticky Header UI Kit", buyer: "maria@acme.com", amount: "$29", status: "Paid", date: "Today" },
  { id: "#RGZ-10479", product: "Next.js SaaS Starter", buyer: "alex@studio.io", amount: "$89", status: "Pending", date: "Yesterday" },
  { id: "#RGZ-10473", product: "Admin Dashboard Pro", buyer: "leo@labs.com", amount: "$59", status: "Paid", date: "2 days ago" },
  { id: "#RGZ-10465", product: "Checkout Components", buyer: "nina@ops.co", amount: "$39", status: "Failed", date: "3 days ago" },
];

export default function SellerOrdersPage() {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"All" | Order["status"]>("All");

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return DATA.filter((o) => {
      const hit =
        !qq ||
        o.id.toLowerCase().includes(qq) ||
        o.product.toLowerCase().includes(qq) ||
        o.buyer.toLowerCase().includes(qq);
      const ok = status === "All" ? true : o.status === status;
      return hit && ok;
    });
  }, [q, status]);

  return (
    <Shell section="orders" variant="seller">
      <Toolbar
        title="Orders"
        subtitle="Search, filter, and view transactions (static demo)."
        right={
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order, product, buyer…"
              className="chip"
              style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid var(--line)", background: "#fff", minWidth: 240 }}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="chip"
              style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid var(--line)", background: "#fff" }}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </>
        }
      />

      <div style={{ height: 14 }} />

      <div className="card">
        <div style={{ padding: "10px 14px 14px" }}>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Product</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr className="row" key={o.id}>
                  <td style={{ fontWeight: 900 }}>{o.id}</td>
                  <td>{o.product}</td>
                  <td style={{ color: "var(--muted)" }}>{o.buyer}</td>
                  <td style={{ fontWeight: 900 }}>{o.amount}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td style={{ color: "var(--muted)" }}>{o.date}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr className="row">
                  <td colSpan={6} style={{ color: "var(--muted)", padding: 14 }}>
                    No results. Try a different keyword or status.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="note">
          Next: clicking an order would open details page (e.g. <Link href="/seller/orders" style={{ textDecoration: "underline" }}>/seller/orders/[id]</Link>).
        </div>
      </div>
    </Shell>
  );
}

