"use client";

import Shell from "@src/modules/_ui/Shell";

export default function AdminOverviewPage() {
  return (
    <Shell variant="admin" section="admin_overview">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Stores pending</div>
          <div className="mt-2 text-2xl font-extrabold">12</div>
          <div className="mt-1 text-xs text-slate-500">Verification queue</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Products flagged</div>
          <div className="mt-2 text-2xl font-extrabold">34</div>
          <div className="mt-1 text-xs text-slate-500">Needs review</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Banner inventory</div>
          <div className="mt-2 text-2xl font-extrabold">87</div>
          <div className="mt-1 text-xs text-slate-500">Active placements</div>
        </div>

        <div className="md:col-span-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">System checklist</div>
              <div className="mt-1 text-sm text-slate-600">Ops-first admin skeleton (demo)</div>
            </div>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Create report
            </button>
          </div>

          <ul className="mt-4 grid gap-2 text-sm">
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Store approvals queue</span><span className="text-slate-600">Running</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Fraud signals</span><span className="text-slate-600">Monitoring</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>Content compliance</span><span className="text-slate-600">Enabled</span>
            </li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
