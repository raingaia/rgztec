"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function BuyGiftCard() {
  const [amount, setAmount] = useState(5000);
  const [code, setCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${API}/gift-cards/issue`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "USD" })
    });
    const data = await r.json(); setCode(data.code);
  }

  return (
    <div>
      <h2>Buy Gift Card</h2>
      <form onSubmit={submit}>
        <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value||"0"))} />
        <button type="submit">Issue</button>
      </form>
      {code && <p>Created: <b>{code}</b></p>}
    </div>
  );
}

