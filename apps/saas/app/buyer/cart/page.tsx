"use client";
import React from "react";
import Shell from "@src/modules/_ui/Shell";

type CartItem = { id: string; title: string; price: number; qty: number };

const seed: CartItem[] = [
  { id: "C-01", title: "Next.js SaaS Starter", price: 89, qty: 1 },
  { id: "C-02", title: "Sticky Header UI Kit", price: 29, qty: 1 },
];

export default function BuyerCart() {
  const [items, setItems] = React.useState(seed);

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  function inc(id: string) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  }
  function dec(id: string) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)));
  }

  return (
    <Shell variant="buyer" section="buyer_cart">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-3">
          {items.map((x) => (
            <div key={x.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{x.title}</div>
                  <div className="mt-1 text-sm text-slate-600">${x.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => dec(x.id)} className="h-9 w-9 rounded-full border font-bold hover:bg-slate-50">-</button>
                  <div className="w-8 text-center font-semibold">{x.qty}</div>
                  <button onClick={() => inc(x.id)} className="h-9 w-9 rounded-full border font-bold hover:bg-slate-50">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Summary</div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Total</span>
            <span className="text-lg font-extrabold">${total}</span>
          </div>
          <a href="/buyer/checkout" className="mt-4 block rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">
            Continue to Checkout
          </a>
        </div>
      </div>
    </Shell>
  );
}


