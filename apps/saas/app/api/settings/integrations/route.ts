import { NextResponse } from "next/server";

type IntegrationsSettings = {
  sandboxMode: boolean;
  webhooksEnabled: boolean;
  // NOTE: Never expose actual secrets/keys via API.
  apiKeyLast4: string | null;
  webhookSecretLast4: string | null;
};

let mock: IntegrationsSettings = {
  sandboxMode: true,
  webhooksEnabled: false,
  apiKeyLast4: null,
  webhookSecretLast4: null,
};

function last4(v?: string | null) {
  if (!v) return null;
  const s = String(v).trim();
  return s.length >= 4 ? s.slice(-4) : s;
}

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<IntegrationsSettings> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  // sanitize: only allow safe fields
  const next: IntegrationsSettings = {
    ...mock,
    sandboxMode: body.sandboxMode ?? mock.sandboxMode,
    webhooksEnabled: body.webhooksEnabled ?? mock.webhooksEnabled,
    apiKeyLast4: body.apiKeyLast4 ?? mock.apiKeyLast4,
    webhookSecretLast4: body.webhookSecretLast4 ?? mock.webhookSecretLast4,
  };

  mock = next;
  return NextResponse.json({ ok: true, data: mock });
}

// Optional: rotate endpoint (demo) — returns masked key only
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { action?: string; value?: string } | null;

  if (body?.action === "set_api_key_last4") {
    mock = { ...mock, apiKeyLast4: last4(body.value) };
    return NextResponse.json({ ok: true, data: mock });
  }

  if (body?.action === "set_webhook_last4") {
    mock = { ...mock, webhookSecretLast4: last4(body.value) };
    return NextResponse.json({ ok: true, data: mock });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
