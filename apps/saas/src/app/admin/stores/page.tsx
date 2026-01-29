"use client";

import React from "react";
import Shell from "@modules/_ui/Shell";

type StoreRow = { id: string; name: string; owner: string; status: "Pending" | "Approved" | "Rejected" };

const seed: StoreRow[] = [
  { id: "ST-1021", name: "Hardware Lab", owner: "ercan", status: "Pending" },
  { id: "ST-1013", name: "UI Kits", owner: "partner-01", status: "Approved" },
  { id: "ST-1007", name: "AI Tools", owner: "team-a", status: "Pending" },
  { id: "ST-0992", name: "Templates Pro", owner: "seller-x", status: "Rejected" },
];

export default function AdminStoresPage() {
  const [rows, setRows] = React.useState(seed);

  function setStatus(id: string, status: StoreRow["status"]) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  return (
    <Shell variant="admin" section="admin_stores">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">Moderation demo: approve/reject works locally.</div>
        <button className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          Export CSV
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Store</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{s.owner}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => setStatus(s.id, "Approved")}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setStatus(s.id, "Rejected")}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

