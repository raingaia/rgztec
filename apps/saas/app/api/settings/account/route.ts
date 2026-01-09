import { NextResponse } from "next/server";

type AccountSettings = {
  storeName: string;
  supportEmail: string;
  timezone: string;
};

let mock: AccountSettings = {
  storeName: "RGZTEC Store",
  supportEmail: "seller@rgztec.com",
  timezone: "Europe/Istanbul",
};

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<AccountSettings> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  mock = { ...mock, ...body };
  return NextResponse.json({ ok: true, data: mock });
}
