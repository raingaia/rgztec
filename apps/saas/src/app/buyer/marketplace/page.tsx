"use client";
import React from "react";
import Shell from "@modules/_ui/Shell";

type Item = { id: string; title: string; price: string; tag: string };

const seed: Item[] = [
  { id: "MK-01", title: "Next.js SaaS Starter", price: "$89", tag: "Best Seller" },
  { id: "MK-02", title: "Admin Dashboard Pro", price: "$59", tag: "Premium" },
  { id: "MK-03", title: "Sticky Header UI Kit", price: "$29", tag: "UI Kit" },
];

export default function BuyerMarketplace() {
  const [q, setQ] = React.useState("");
  const items = seed.filter((x) => (x.title + x.tag).toLowerCase().includes(q.toLowerCase()));

  return (
    <Shell variant="buyer" section="buyer_marketplace">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search marketplace…"
          className="w-full rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 md:max-w-md"
        />
        <a href="/buyer/cart" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Open Cart
        </a>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-2xl border p-4">
            <div className="text-xs text-slate-500">{p.tag}</div>
            <div className="mt-1 font-semibold">{p.title}</div>
            <div className="mt-2 text-lg font-extrabold">{p.price}</div>
            <button className="mt-3 w-full rounded-full border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </Shell>
  );
}


