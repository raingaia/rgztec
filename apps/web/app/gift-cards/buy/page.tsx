"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function BuyGiftCard() {
  const [amount, setAmount] = useState(5000); // cents
  const [code, setCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API}/gift-cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    setCode(data.code);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Buy Gift Card</h2>
      <form onSubmit={submit}>
        <label>Amount (cents): </label>
        <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value||"0"))} />
        <button type="submit">Create</button>
      </form>
      {code && <p>Gift card created: <b>{code}</b></p>}
    </div>
  );
}
