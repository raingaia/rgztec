import { NextResponse } from "next/server";

type PayoutSchedule = "daily" | "weekly" | "monthly";
type PayoutsSettings = {
  stripeConnected: boolean;
  autoPayout: boolean;
  schedule: PayoutSchedule;
};

let mock: PayoutsSettings = {
  stripeConnected: false,
  autoPayout: true,
  schedule: "weekly",
};

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<PayoutsSettings> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  // guard: autoPayout cannot be enabled unless stripeConnected
  const next = { ...mock, ...body };
  if (!next.stripeConnected) next.autoPayout = false;

  mock = next;
  return NextResponse.json({ ok: true, data: mock });
}
