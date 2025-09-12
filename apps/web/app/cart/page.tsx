// apps/web/app/cart/page.tsx
"use client";
import { useEffect, useState } from "react";

type CartItem = any;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  function clearCart() {
    localStorage.removeItem("cart");
    setItems([]);
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
            {items.map((it, i) => (
              <li key={i} style={{ border: "1px solid #eee", padding: 12, borderRadius: 10 }}>
                <div style={{ fontWeight: 700 }}>{it.type === "gift-card" ? "Gift Card" : "Item"}</div>
                <div>Amount: {it.amount} {it.currency}</div>
                <div>To: {it.to?.name} &lt;{it.to?.email}&gt;</div>
                <div>From: {it.from}</div>
                <div>Deliver: {it.deliver_on}</div>
                <div>Code (hint): {it.code_hint}</div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button onClick={clearCart}>Clear cart</button>
            {/* Buraya checkout entegrasyonu eklenecek */}
          </div>
        </>
      )}
    </div>
  );
}
