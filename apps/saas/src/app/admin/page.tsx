"use client";

// ✅ YÖNTEM A: Eğer @/ doğrudan 'src' klasörünü temsil ediyorsa bunu kullan:
import Shell from "@modules/_ui/Shell"; 

export default function AdminOverview() {
  return (
    <Shell variant="admin" section="admin_overview">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Metric Cards */}
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm text-slate-600 font-medium">Stores pending</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">12</div>
        </div>
        
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm text-slate-600 font-medium">Users flagged</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">7</div>
        </div>
        
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm text-slate-600 font-medium">Moderation queue</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">34</div>
        </div>
        
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm text-slate-600 font-medium">Payouts today</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">$4,210</div>
        </div>

        {/* Footer Card */}
        <div className="md:col-span-4 rounded-2xl border p-4 bg-slate-50">
          <div className="font-semibold text-slate-800">Admin ops</div>
          <div className="mt-1 text-sm text-slate-600">
            This is a functional UI skeleton aligned to your current folders.
          </div>
        </div>
      </div>
    </Shell>
  );
}