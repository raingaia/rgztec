"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RedeemGiftCard() {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(1000);
  const [result, setResult] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${API}/gift-cards/redeem`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, amount })
    });
    setResult(await r.json());
  }

  return (
    <div>
      <h2>Redeem</h2>
      <form onSubmit={submit}>
        <input placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} />
        <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value||"0"))} />
        <button type="submit">Use</button>
      </form>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
