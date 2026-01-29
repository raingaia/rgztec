"use client";
import React from "react";
import Shell from "@modules/_ui/Shell";

export default function SellerSettingsNotifications() {
  const [orderEmails, setOrderEmails] = React.useState(true);
  const [opsAlerts, setOpsAlerts] = React.useState(true);
  const [marketingEmails, setMarketingEmails] = React.useState(false);

  function Row({ label, sub, on, setOn }: any) {
    return (
      <button
        onClick={() => setOn(!on)}
        className="flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 hover:bg-slate-50"
      >
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-slate-600">{sub}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
          {on ? "On" : "Off"}
        </span>
      </button>
    );
  }

  return (
    <Shell section="settings_notifications" variant="seller">
      <div className="grid gap-3">
        <Row label="Order emails" sub="Receipts, delivery, refunds" on={orderEmails} setOn={setOrderEmails} />
        <Row label="Operational alerts" sub="Disputes, chargebacks, flags" on={opsAlerts} setOn={setOpsAlerts} />
        <Row label="Marketing emails" sub="Product tips, updates, promos" on={marketingEmails} setOn={setMarketingEmails} />

        <a href="/seller/settings" className="text-sm font-semibold text-slate-900 underline">
          ← Back to Settings
        </a>
      </div>
    </Shell>
  );
}
