"use client";
import React from "react";
import Shell from "@modules/_ui/Shell";

export default function SellerSettingsPayouts() {
  const [stripeConnected, setStripeConnected] = React.useState(false);
  const [autoPayout, setAutoPayout] = React.useState(true);
  const [schedule, setSchedule] = React.useState<"daily" | "weekly" | "monthly">("weekly");

  return (
    <Shell section="settings_payouts" variant="seller">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Stripe Connect</div>
          <div className="mt-1 text-sm text-slate-600">Required for real payouts (demo toggle).</div>

          <button
            onClick={() => setStripeConnected((v) => !v)}
            className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold ${
              stripeConnected ? "bg-slate-900 text-white" : "border hover:bg-slate-50"
            }`}
          >
            {stripeConnected ? "Connected" : "Connect Stripe (demo)"}
          </button>

          <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold">Auto payouts</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-700">Enable</span>
              <button
                disabled={!stripeConnected}
                onClick={() => setAutoPayout((v) => !v)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  !stripeConnected
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : autoPayout
                      ? "bg-slate-900 text-white"
                      : "border bg-white hover:bg-slate-50"
                }`}
              >
                {autoPayout ? "On" : "Off"}
              </button>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-600">Schedule</div>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as any)}
                disabled={!stripeConnected || !autoPayout}
                className={`mt-1 w-full rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 ${
                  (!stripeConnected || !autoPayout) ? "bg-slate-100 text-slate-500" : ""
                }`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold">Settlement snapshot</div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Gross</span><b>$128,420</b></div>
            <div className="flex justify-between"><span className="text-slate-600">Fees</span><b>$34,310</b></div>
            <div className="flex justify-between text-base"><span className="text-slate-600">Net</span><b>$94,110</b></div>
          </div>

          <a href="/seller/settings" className="mt-4 inline-block text-sm font-semibold text-slate-900 underline">
            ← Back to Settings
          </a>
        </div>
      </div>
    </Shell>
  );
}
