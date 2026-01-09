"use client";
import Shell from "@src/modules/_ui/Shell";

export default function SellerSettingsAdvanced() {
  return (
    <Shell section="settings_advanced" variant="seller">
      <div className="grid gap-4">
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Export data</div>
              <div className="mt-1 text-xs text-slate-600">Orders, products, payouts (demo)</div>
            </div>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Export CSV (demo)
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-red-900">Danger zone</div>
              <div className="mt-1 text-xs text-red-800">Irreversible actions (demo)</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100">
                Disable store
              </button>
              <button className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Delete store
              </button>
            </div>
          </div>
        </div>

        <a href="/seller/settings" className="text-sm font-semibold text-slate-900 underline">
          ← Back to Settings
        </a>
      </div>
    </Shell>
  );
}
