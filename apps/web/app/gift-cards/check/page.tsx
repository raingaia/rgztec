"use client";
import { useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function CheckGiftCard() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${API}/gift-cards/verify/${code}`);
    setData(await r.json());
  }

  return (
    <div>
      <h2>Check</h2>
      <form onSubmit={submit}>
        <input placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} />
        <button type="submit">Check</button>
      </form>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
