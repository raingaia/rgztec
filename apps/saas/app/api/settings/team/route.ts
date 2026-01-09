import { NextResponse } from "next/server";

type Role = "Owner" | "Manager" | "Support" | "Member";
type Status = "Active" | "Invited";

type Member = {
  id: string;
  email: string;
  role: Role;
  status: Status;
};

let mock: Member[] = [
  { id: "m_1", email: "raingaia@outlook.com", role: "Owner", status: "Active" },
  { id: "m_2", email: "seller@rgztec.com", role: "Manager", status: "Active" },
];

export async function GET() {
  return NextResponse.json({ ok: true, data: mock });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; role?: Role } | null;
  const email = body?.email?.trim().toLowerCase();
  const role = body?.role ?? "Member";

  if (!email) return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
  if (mock.some((m) => m.email === email)) {
    return NextResponse.json({ ok: false, error: "Already exists" }, { status: 409 });
  }

  const id = `m_${Date.now()}`;
  const member: Member = { id, email, role, status: "Invited" };
  mock = [member, ...mock];

  return NextResponse.json({ ok: true, data: member });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: string; role?: Role; status?: Status } | null;
  if (!body?.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  mock = mock.map((m) => (m.id === body.id ? { ...m, ...body } : m));
  return NextResponse.json({ ok: true, data: mock });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  mock = mock.filter((m) => m.id !== id);
  return NextResponse.json({ ok: true, data: mock });
}
