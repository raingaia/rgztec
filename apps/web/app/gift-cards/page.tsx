"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function CheckGiftCard() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<any>(null);

  async function fetchBalance(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API}/gift-cards/${code}`);
    setData(await res.json());
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Check Balance</h2>
      <form onSubmit={fetchBalance}>
        <input placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} />
        <button type="submit">Check</button>
      </form>
      {data && <p>Balance: <b>{data.balance}</b> {data.currency}</p>}
    </div>
  );
}
