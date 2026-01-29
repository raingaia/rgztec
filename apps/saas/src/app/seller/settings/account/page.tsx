"use client";
import React from "react";
import Shell from "@modules/_ui/Shell";

export default function SellerSettingsAccount() {
  const [storeName, setStoreName] = React.useState("RGZTEC Store");
  const [supportEmail, setSupportEmail] = React.useState("support@rgztec.com");
  const [timezone, setTimezone] = React.useState("Europe/Istanbul");
  
  return (
    <Shell section="settings_account" variant="seller">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Store identity</div>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">Store name</span>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">Support email</span>
              <input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">Timezone</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option>Europe/Istanbul</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
                <option>Europe/Berlin</option>
              </select>
            </label>
          </div>

          <button className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Save changes (demo)
          </button>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold">Tips</div>
          <div className="mt-2 text-sm text-slate-700">
            Keep your support email consistent across receipts, disputes and seller verification.
          </div>
          <a href="/seller/settings" className="mt-3 inline-block text-sm font-semibold text-slate-900 underline">
            ← Back to Settings
          </a>
        </div>
      </div>
    </Shell>
  );
}
