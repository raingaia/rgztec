"use client";

import React from "react";
import Shell from "@modules/_ui/Shell";

type IntegrationSettings = {
  sandboxMode?: boolean;
  webhooksEnabled?: boolean;
  webhookEndpoint?: string;

  // Güvenlik: secret’ı asla burada taşımıyoruz.
  // Sadece göstermek istersen backend tarafında "last4" gibi maskeleme alanları döndür.
  signingSecretLast4?: string; // örn: "xYz9"
  apiKeyLast4?: string;        // örn: "a1b2"
};

export default function SellerSettingsIntegrations() {
  const [sandboxMode, setSandboxMode] = React.useState<boolean>(true);
  const [webhooksEnabled, setWebhooksEnabled] = React.useState<boolean>(false);

  const [webhookEndpoint, setWebhookEndpoint] = React.useState<string>("");
  const [signingSecretLast4, setSigningSecretLast4] = React.useState<string>("");
  const [apiKeyLast4, setApiKeyLast4] = React.useState<string>("");

  const [loading, setLoading] = React.useState<boolean>(true);
  const [err, setErr] = React.useState<string | null>(null);

  async function copy(v: string) {
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      // clipboard engelli olabilir, sessiz geç
    }
  }

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Bu endpoint sende var: apps/saas/app/api/settings/integrations/route.ts
        const res = await fetch("/api/settings/integrations", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as IntegrationSettings;

        if (!alive) return;

        setSandboxMode(Boolean(data?.sandboxMode ?? true));
        setWebhooksEnabled(Boolean(data?.webhooksEnabled ?? false));
        setWebhookEndpoint(String(data?.webhookEndpoint ?? ""));

        // Bunlar opsiyonel (backend maskeleyip verirse gösterir)
        setSigningSecretLast4(String(data?.signingSecretLast4 ?? ""));
        setApiKeyLast4(String(data?.apiKeyLast4 ?? ""));
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load integration settings");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <Shell section="settings_integrations" variant="seller">
      <div className="mb-6">
        <div className="text-xl font-semibold">Integrations</div>
        <div className="mt-1 text-sm text-slate-600">
          Stripe ve webhook entegrasyonları. Güvenlik için secret’lar UI’da gösterilmez.
        </div>

        {err ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Webhooks */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Webhooks</div>
              <div className="text-xs text-slate-500">Event delivery (demo)</div>
            </div>

            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                webhooksEnabled ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              {webhooksEnabled ? "On" : "Off"}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-slate-500">Webhook endpoint</div>
            <div className="mt-1 flex items-center gap-2">
              <input
                value={webhookEndpoint}
                readOnly
                placeholder="(not set)"
                className="w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => copy(webhookEndpoint)}
                disabled={!webhookEndpoint}
                className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Copy
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Not: Endpoint boşsa backend tarafında tanımlanması gerekir.
            </div>
          </div>

          {/* Secret asla gösterme — sadece last4 varsa göster */}
          {signingSecretLast4 ? (
            <div className="mt-4 rounded-xl border bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Signing secret (masked)</div>
              <div className="mt-1 font-mono text-sm">••••••••••••{signingSecretLast4}</div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Signing secret</div>
              <div className="mt-1 text-sm text-slate-700">
                UI’da gösterilmiyor. Secret sadece server/env tarafında tutulmalı.
              </div>
            </div>
          )}
        </div>

        {/* Environment */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Sandbox mode</div>
              <div className="text-xs text-slate-500">Use test environment</div>
            </div>

            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                sandboxMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              {sandboxMode ? "On" : "Off"}
            </span>
          </div>

          <div className="mt-4 rounded-xl border bg-slate-50 p-3">
            <div className="text-xs text-slate-500">API key</div>
            {apiKeyLast4 ? (
              <div className="mt-1 font-mono text-sm">••••••••••••{apiKeyLast4}</div>
            ) : (
              <div className="mt-1 text-sm text-slate-700">
                UI’da key gösterilmez. Gerekirse sadece last4 backend’den döndürülür.
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Bu sayfa sadece görüntüleme amaçlı. Düzenleme/anahtar üretme işlemleri server üzerinden yapılmalı.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-slate-500">Loading…</div>
      ) : null}

      <div className="mt-6">
        <a href="/seller/settings" className="inline-block text-sm font-semibold text-slate-900 underline">
          ← Back to Settings
        </a>
      </div>
    </Shell>
  );
}

