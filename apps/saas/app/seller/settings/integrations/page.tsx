"use client";
import React from "react";
import Shell from "@src/modules/_ui/Shell";

export default function SellerSettingsIntegrations() {
  const [sandboxMode, setSandboxMode] = React.useState(true);
  const [webhooksEnabled, setWebhooksEnabled] = React.useState(false);

  async function copy(v: string) {
    try { await navigator.clipboard.writeText(v); } catch {}
  }
  
  return (
    <Shell section="settings_integrations" variant="seller">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">API keys</div>
          <div className="mt-2 rounded-2xl border bg-white p-3">
            <div className="text-xs text-slate-500">API Key</div>
            <div className="mt-1 font-mono text-sm">{apiKey.slice(0, 6)}••••••••••{apiKey.slice(-4)}</div>
            <button onClick={() => copy(apiKey)} className="mt-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
              Copy
            </button>
          </div>

          <div className="mt-3 rounded-2xl border bg-white p-3">
            <div className="text-xs text-slate-500">Webhook Secret</div>
            <div className="mt-1 font-mono text-sm">{secret.slice(0, 6)}••••••••••{secret.slice(-4)}</div>
            <button onClick={() => copy(secret)} className="mt-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
              Copy
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm font-semibold">Developer options</div>

          <button
            onClick={() => setWebhooksEnabled((v) => !v)}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <div className="text-sm font-semibold">Webhooks</div>
              <div className="text-xs text-slate-600">Enable event delivery (demo)</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${webhooksEnabled ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
              {webhooksEnabled ? "On" : "Off"}
            </span>
          </button>

          <button
            onClick={() => setSandboxMode((v) => !v)}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <div className="text-sm font-semibold">Sandbox mode</div>
              <div className="text-xs text-slate-600">Use test environment</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sandboxMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
              {sandboxMode ? "On" : "Off"}
            </span>
          </button>

          <a href="/seller/settings" className="mt-4 inline-block text-sm font-semibold text-slate-900 underline">
            ← Back to Settings
          </a>
        </div>
      </div>
    </Shell>
  );
}
