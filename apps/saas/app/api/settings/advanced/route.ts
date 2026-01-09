import { NextResponse } from "next/server";

type AdvancedSettings = {
  dataExportRequestedAt: string | null;
  storeDisabled: boolean;
};

let mock: AdvancedSettings = {
  dataExportRequestedAt: null,
  storeDisabled: false,
};

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { action?: string } | null;

  if (body?.action === "request_export") {
    mock = { ...mock, dataExportRequestedAt: new Date().toISOString() };
    return NextResponse.json({ ok: true, data: mock });
  }

  if (body?.action === "disable_store") {
    mock = { ...mock, storeDisabled: true };
    return NextResponse.json({ ok: true, data: mock });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<AdvancedSettings> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  mock = { ...mock, ...body };
  return NextResponse.json({ ok: true, data: mock });
}
