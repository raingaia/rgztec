import { NextResponse } from "next/server";

type SecuritySettings = {
  twoFA: boolean;
  loginAlerts: boolean;
};

let mock: SecuritySettings = {
  twoFA: false,
  loginAlerts: true,
};

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<SecuritySettings> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  mock = { ...mock, ...body };
  return NextResponse.json({ ok: true, data: mock });
}
