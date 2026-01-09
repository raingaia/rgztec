"use client";
import Shell from "@src/modules/_ui/Shell";

export default function AdminOverview() {
  return (
    <Shell variant="admin" section="admin_overview">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Stores pending</div>
          <div className="mt-2 text-2xl font-extrabold">12</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Users flagged</div>
          <div className="mt-2 text-2xl font-extrabold">7</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Moderation queue</div>
          <div className="mt-2 text-2xl font-extrabold">34</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600">Payouts today</div>
          <div className="mt-2 text-2xl font-extrabold">$4,210</div>
        </div>

        <div className="md:col-span-4 rounded-2xl border p-4">
          <div className="font-semibold">Admin ops</div>
          <div className="mt-1 text-sm text-slate-600">This is a functional UI skeleton aligned to your current folders.</div>
        </div>
      </div>
    </Shell>
  );
}

