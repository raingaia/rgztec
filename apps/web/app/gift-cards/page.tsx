// apps/web/app/gift-cards/page.tsx
"use client";
import { useMemo, useState } from "react";

type GiftItem = {
  type: "gift-card";
  currency: "USD" | "EUR" | "GBP";
  amount: number;
  to: { name: string; email: string };
  from: string;
  message: string;
  deliver_on: string; // ISO date or "now"
  code_hint: string;
};

export default function GiftCardsPage() {
  const [currency, setCurrency] = useState<GiftItem["currency"]>("USD");
  const [amount, setAmount] = useState<number>(50);
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [sendDate, setSendDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const code = useMemo(() => {
    const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const pick = (n: number) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
    return `RGZ-${pick(4)}-${pick(4)}`;
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);

  function addToCart() {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      setError("Please enter a valid recipient email.");
      return;
    }
    if (amount < 1) {
      setError("Amount must be at least 1.");
      return;
    }
    const item: GiftItem = {
      type: "gift-card",
      currency,
      amount: Math.round(amount),
      to: { name: toName, email: toEmail },
      from: fromName,
      message,
      deliver_on: sendDate || "now",
      code_hint: code,
    };
    const cart: GiftItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 20, maxWidth: 1100 }}>
      {/* LEFT: form */}
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Create your gift card</h2>

        <label>
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} style={{ display: "block", marginTop: 6 }}>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>
        </label>

        <div style={{ marginTop: 12 }}>
          <label>Amount</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {[25, 50, 75, 100].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                aria-pressed={amount === v}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: amount === v ? "#111827" : "#fff",
                  color: amount === v ? "#fff" : "#111827",
                  fontWeight: 800,
                }}
              >
                {fmt(v)}
              </button>
            ))}
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px" }}>
              Custom
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: 96, border: 0, borderLeft: "1px solid #eee", paddingLeft: 8 }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <label>
            Recipient name
            <input value={toName} onChange={(e) => setToName(e.target.value)} />
          </label>
          <label>
            Recipient email
            <input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Your name
            <input value={fromName} onChange={(e) => setFromName(e.target.value)} />
          </label>
          <label>
            Delivery date (optional)
            <input type="date" value={sendDate} onChange={(e) => setSendDate(e.target.value)} />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          Personal message
          <textarea maxLength={280} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>

        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={addToCart} style={{ padding: "10px 14px", fontWeight: 800, borderRadius: 10, background: "#f97316", color: "#fff", border: "1px solid #f97316" }}>
            Add to Cart
          </button>
        </div>
      </section>

      {/* RIGHT: preview */}
      <aside style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Preview</h2>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>RGZTEC • Gift Card</strong>
            <code>{code}</code>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{fmt(amount)}</div>
            <p style={{ color: "#475569" }}>
              To {toName || "Friend"} — from {fromName || "You"}
            </p>
            <p style={{ color: "#475569" }}>{message ? `“${message}”` : "“Enjoy building something awesome!”"}</p>
          </div>
          <p style={{ color: "#475569" }}>Redeemable across participating stores. No fees, no expiration.</p>
        </div>
      </aside>
    </div>
  );
}
