import { NextResponse } from "next/server";

type NotificationsSettings = {
  orderUpdates: boolean;
  payoutUpdates: boolean;
  productReviews: boolean;
  marketing: boolean;
  security: boolean;
};

let mock: NotificationsSettings = {
  orderUpdates: true,
  payoutUpdates: true,
  productReviews: true,
  marketing: false,
  security: true,
};

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<NotificationsSettings> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  mock = { ...mock, ...body };
  return NextResponse.json({ ok: true, data: mock });
}
