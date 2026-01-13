import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Force Node runtime for all helpers here */
export const runtime = "nodejs";

/* ================== BASIC HELPERS ================== */

export type JsonResult = ReturnType<typeof NextResponse.json>;

export function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit =
    typeof init === "number" ? { status: init } : (init ?? {});
  return NextResponse.json(data, resInit);
}

export function nowISO() {
  return new Date().toISOString();
}

export function normalizeStr(v?: string | null) {
  return (v ?? "").trim().toLowerCase();
}

export function makeId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/* ================== AUTH HELPERS ================== */

export function getBearer(req: NextRequest) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

/* ================== FILE HELPERS (NODE ONLY) ================== */

export async function readJson<T = any>(relPath: string, fallback?: T): Promise<T> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const abs = join(process.cwd(), relPath);
    const raw = await readFile(abs, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export async function writeJson(relPath: string, data: any): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");
  const abs = join(process.cwd(), relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, JSON.stringify(data, null, 2), "utf8");
}

/* ================== ACTOR RESOLVER ================== */

export async function findActorByToken(token: string) {
  if (!token) return null;

  const tokens = await readJson<any[]>("src/data/auth/tokens.json", []);
  const users = await readJson<any[]>("src/data/users/users.json", []);

  const t = tokens.find((x) => x?.token === token) ?? null;
  if (!t) return null;

  const u =
    users.find((x) => x?.id === t.userId) ||
    users.find(
      (x) =>
        x?.email &&
        t?.email &&
        normalizeStr(x.email) === normalizeStr(t.email)
    ) ||
    null;

  return {
    token: t.token,
    userId: t.userId ?? u?.id ?? null,
    role: t.role ?? u?.role ?? "user",
    email: t.email ?? u?.email ?? null,
    user: u ?? null,
  };
}

/* ================== JSON CRUD FACTORY ================== */

type Role = "buyer" | "seller" | "admin" | "user";

type JsonCrudPolicy = {
  module: string;
  public?: { publicReadable?: boolean };
  write?: { requireAuth?: boolean; roles?: Role[] };
};

function hasWriteRole(actor: any, roles?: Role[]) {
  if (!roles || roles.length === 0) return true;
  const r = (actor?.role ?? "user") as Role;
  return roles.includes(r);
}

export function makeJsonCrudRoute(jsonPath: string, policy: JsonCrudPolicy) {
  async function requireActor(req: NextRequest) {
    const token = getBearer(req);
    const actor = token ? await findActorByToken(token) : null;
    return { token, actor };
  }

  const GET = async (req: NextRequest) => {
    const allowPublic = policy.public?.publicReadable === true;
    if (!allowPublic) {
      const { actor } = await requireActor(req);
      if (!actor) return json({ error: "Unauthorized" }, 401);
    }
    const data = await readJson<any[]>(jsonPath, []);
    return json({ module: policy.module, data });
  };

  const POST = async (req: NextRequest) => {
    const { actor } = await requireActor(req);
    if (policy.write?.requireAuth && !actor)
      return json({ error: "Unauthorized" }, 401);
    if (!hasWriteRole(actor, policy.write?.roles))
      return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const list = await readJson<any[]>(jsonPath, []);
    const item = { id: makeId(policy.module), ...body, _createdAt: nowISO() };
    list.unshift(item);
    await writeJson(jsonPath, list);
    return json({ ok: true, item }, 201);
  };

  const PUT = async (req: NextRequest) => {
    const { actor } = await requireActor(req);
    if (policy.write?.requireAuth && !actor)
      return json({ error: "Unauthorized" }, 401);
    if (!hasWriteRole(actor, policy.write?.roles))
      return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const id = body?.id;
    if (!id) return json({ error: "Missing id" }, 400);

    const list = await readJson<any[]>(jsonPath, []);
    const idx = list.findIndex((x) => x?.id === id);
    if (idx < 0) return json({ error: "Not found" }, 404);

    list[idx] = { ...list[idx], ...body, _updatedAt: nowISO() };
    await writeJson(jsonPath, list);
    return json({ ok: true, item: list[idx] });
  };

  const DELETE = async (req: NextRequest) => {
    const { actor } = await requireActor(req);
    if (policy.write?.requireAuth && !actor)
      return json({ error: "Unauthorized" }, 401);
    if (!hasWriteRole(actor, policy.write?.roles))
      return json({ error: "Forbidden" }, 403);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);

    const list = await readJson<any[]>(jsonPath, []);
    const next = list.filter((x) => x?.id !== id);
    if (next.length === list.length)
      return json({ error: "Not found" }, 404);

    await writeJson(jsonPath, next);
    return json({ ok: true });
  };

  return { GET, POST, PUT, DELETE };
}

