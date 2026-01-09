"use client";
import React from "react";
import Shell from "@src/modules/_ui/Shell";

type Case = { id: string; type: "Refund" | "DMCA" | "Fraud"; status: "Open" | "Review" | "Closed" };

const seed: Case[] = [
  { id: "M-301", type: "Refund", status: "Open" },
  { id: "M-289", type: "Fraud", status: "Review" },
  { id: "M-244", type: "DMCA", status: "Closed" },
];

export default function AdminModeration() {
  const [rows, setRows] = React.useState(seed);

  function advance(id: string) {
    setRows((r) =>
      r.map((x) => {
        if (x.id !== id) return x;
        const next = x.status === "Open" ? "Review" : x.status === "Review" ? "Closed" : "Open";
        return { ...x, status: next };
      })
    );
  }

  return (
    <Shell variant="admin" section="admin_moderation">
      <div className="grid gap-3">
        {rows.map((c) => (
          <button key={c.id} onClick={() => advance(c.id)} className="rounded-2xl border p-4 text-left hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{c.type} • {c.id}</div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{c.status}</span>
            </div>
            <div className="mt-1 text-sm text-slate-600">Click to cycle status (Open → Review → Closed)</div>
          </button>
        ))}
      </div>
    </Shell>
  );
}

