"use client";

import Shell from "@src/modules/_ui/Shell";

type Row = { id: string; item: string; date: string; status: "Paid" | "Refunded" | "Pending" };

const rows: Row[] = [
  { id: "O-20018", item: "Next.js SaaS Starter", date: "Today", status: "Paid" },
  { id: "O-20011", item: "Sticky Header UI Kit", date: "Yesterday", status: "Paid" },
  { id: "O-19997", item: "Admin Dashboard Pro", date: "3 days ago", status: "Refunded" },
];

export default function BuyerOrdersPage() {
  return (
    <Shell variant="buyer" section="buyer_orders">
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{r.id}</td>
                <td className="px-4 py-3">{r.item}</td>
                <td className="px-4 py-3 text-slate-600">{r.date}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{r.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

