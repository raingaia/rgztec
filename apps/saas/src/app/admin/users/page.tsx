"use client";
import React from "react";
import Shell from "@modules/_ui/Shell";

type U = { id: string; email: string; role: "buyer" | "seller" | "admin"; status: "Active" | "Suspended" };

const seed: U[] = [
  { id: "U-1001", email: "raingaia@outlook.com", role: "admin", status: "Active" },
  { id: "U-1402", email: "seller@rgztec.com", role: "seller", status: "Active" },
  { id: "U-2018", email: "buyer@rgztec.com", role: "buyer", status: "Suspended" },
];

export default function AdminUsers() {
  const [rows, setRows] = React.useState(seed);

  function toggle(id: string) {
    setRows((r) =>
      r.map((x) =>
        x.id === id ? { ...x, status: x.status === "Active" ? "Suspended" : "Active" } : x
      )
    );
  }

  return (
    <Shell variant="admin" section="admin_users">
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold">{u.email}</div>
                  <div className="text-xs text-slate-500">{u.id}</div>
                </td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{u.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggle(u.id)}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                  >
                    Toggle
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

