"use client";
import React from "react";
import Shell from "@src/modules/_ui/Shell";

export default function SellerSettingsSecurity() {
  const [twoFA, setTwoFA] = React.useState(false);
  const [loginAlerts, setLoginAlerts] = React.useState(true);

  return (
    <Shell section="settings_security" variant="seller">
      <div className="grid gap-3">
        <button
          onClick={() => setTwoFA((v) => !v)}
          className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 hover:bg-slate-50"
        >
          <div>
            <div className="text-sm font-semibold">Two-factor authentication</div>
            <div className="text-xs text-slate-600">Recommended for seller accounts</div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${twoFA ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {twoFA ? "Enabled" : "Disabled"}
          </span>
        </button>

        <button
          onClick={() => setLoginAlerts((v) => !v)}
          className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 hover:bg-slate-50"
        >
          <div>
            <div className="text-sm font-semibold">Login alerts</div>
            <div className="text-xs text-slate-600">Email for new devices & suspicious sign-ins</div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loginAlerts ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {loginAlerts ? "On" : "Off"}
          </span>
        </button>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold">Password & sessions</div>
          <div className="mt-2 flex gap-2">
            <button className="rounded-full border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Reset password (demo)
            </button>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Sign out all devices (demo)
            </button>
          </div>
        </div>

        <a href="/seller/settings" className="text-sm font-semibold text-slate-900 underline">
          ← Back to Settings
        </a>
      </div>
    </Shell>
  );
}
