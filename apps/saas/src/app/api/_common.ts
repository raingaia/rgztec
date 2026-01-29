// apps/saas/app/api/_common.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

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

/* ================== AUTH & SESSION HELPERS ================== */

export type Role = "buyer" | "seller" | "admin" | "user";

/** Role normalization */
export function normalizeRoles(roles: any): Role[] {
  if (Array.isArray(roles)) return roles as Role[];
  if (typeof roles === "string") return [roles as Role];
  return ["user"];
}

/** Bearer extractor */
export function getBearer(req: Request | NextRequest) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

/** * Hata 2345 Fix: Eğer tokenData bir obje (User object) olarak gelirse 
 * otomatik olarak JSON string'e çevrilir.
 */
export async function setSession(tokenData: string | object) {
  const cookieStore = await cookies();
  const value = typeof tokenData === "string" ? tokenData : JSON.stringify(tokenData);

  cookieStore.set("auth_token", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

/* ================== FILE HELPERS (NODE ONLY) ================== */

/**
 * Hata 1192 & 1259 Fix: 
 * node:fs ve node:path doğrudan "import x from '...'" ile çağrıldığında 
 * default export hatası verebilir. Dinamik import + destructuring bu sorunu çözer.
 */
export async function readJson<T = any>(relPath: string, fallback?: T): Promise<T> {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    
    const normalizedPath = relPath.startsWith("@data/") 
      ? relPath.replace("@data/", "src/data/") 
      : relPath;

    const abs = path.join(process.cwd(), normalizedPath);
    const raw = await fs.readFile(abs, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export async function writeJson(relPath: string, data: any): Promise<void> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  
  const normalizedPath = relPath.startsWith("@data/") 
    ? relPath.replace("@data/", "src/data/") 
    : relPath;

  const abs = path.join(process.cwd(), normalizedPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, JSON.stringify(data, null, 2), "utf8");
}

/* ================== ACTOR & USER RESOLVER ================== */

export async function findUserByEmail(email: string) {
  const users = await readJson<any[]>("@data/users/users.json", []);
  const search = normalizeStr(email);
  return users.find((u) => normalizeStr(u.email) === search) || null;
}

export async function validateLocalPassword(user: any, pass: string) {
  return user && user.password === pass;
}

export async function findActorByToken(token: string) {
  if (!token) return null;

  const tokens = await readJson<any[]>("@data/auth/tokens.json", []);
  const users = await readJson<any[]>("@data/users/users.json", []);

  const t = (Array.isArray(tokens) ? tokens : []).find((x) => x?.token === token) ?? null;
  if (!t) return null;

  const u =
    (Array.isArray(users) ? users : []).find((x) => x?.id === t.userId) ||
    (Array.isArray(users) ? users : []).find(
      (x) => x?.email && t?.email && normalizeStr(x.email) === normalizeStr(t.email)
    ) ||
    null;

  const roleFromUser =
    (typeof u?.role === "string" ? u.role : null) ??
    (Array.isArray(u?.roles) ? u.roles[0] : null);

  const role = (t.role ?? roleFromUser ?? "user") as Role;

  return {
    token: t.token,
    id: t.userId ?? u?.id ?? null,
    userId: t.userId ?? u?.id ?? null,
    role,
    email: t.email ?? u?.email ?? null,
    stores: Array.isArray(u?.stores) ? u.stores : Array.isArray(t?.stores) ? t.stores : [],
    user: u ?? null,
  };
}

/** * guardApi: Artık hem Role dizisi ( ['admin'] ) 
 * hem de nesne ( { roles: ['admin'], requireAuth: true } ) kabul eder.
 */
export async function guardApi(
  req: Request | NextRequest, 
  options?: Role[] | { requireAuth?: boolean; roles?: Role[] }
) {
  const token = getBearer(req) || (await cookies()).get("auth_token")?.value;
  
  const config = Array.isArray(options) ? { roles: options } : (options ?? {});
  const roles = config.roles;

  if (!token) {
    if (config.requireAuth === false) return { actor: null, token: null };
    return { error: json({ error: "Unauthorized" }, 401) };
  }
  
  const actor = await findActorByToken(token);
  if (!actor) return { error: json({ error: "Invalid token" }, 401) };

  if (roles && roles.length > 0 && !roles.includes(actor.role as Role)) {
    return { error: json({ error: "Forbidden" }, 403) };
  }

  return { actor, token };
}

/* ================== JSON CRUD FACTORY ================== */

type PublicPolicy = {
  publicReadable?: boolean;
  allowQuery?: boolean;
  activeOnly?: boolean;
  queryFields?: string[];
  tagsField?: string;
  requireStoreKey?: boolean;
};

type WritePolicy = {
  requireAuth?: boolean;
  roles?: Role[];
  ownerKey?: string; 
  allowStatusActiveForAdminOnly?: boolean;
  writeMode?: "memory" | "file";
};

export type JsonCrudPolicy = {
  module: string;
  idField?: string; 
  public?: PublicPolicy;
  write?: WritePolicy;
};

function actorRole(actor: any): Role {
  return (actor?.role ?? "user") as Role;
}

function hasWriteRole(actor: any, roles?: Role[]) {
  if (!roles || roles.length === 0) return true;
  return roles.includes(actorRole(actor));
}

function pickQueryParams(req: Request | NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = normalizeStr(searchParams.get("q") || "");
  const tag = normalizeStr(searchParams.get("tag") || "");
  const storeKey = normalizeStr(searchParams.get("store_key") || "");
  const id = normalizeStr(searchParams.get("id") || "");
  return { q, tag, storeKey, id, searchParams };
}

function matchQuery(item: any, q: string, fields: string[]) {
  if (!q) return true;
  for (const f of fields) {
    const v = normalizeStr(String(item?.[f] ?? ""));
    if (v.includes(q)) return true;
  }
  return false;
}

function matchTag(item: any, tag: string, tagsField?: string) {
  if (!tag) return true;
  if (!tagsField) return true;
  const arr = item?.[tagsField];
  if (!Array.isArray(arr)) return false;
  return arr.map((x: any) => normalizeStr(String(x))).includes(tag);
}

function isActive(item: any) {
  const s = normalizeStr(item?.status);
  if (!s) return true;
  return s === "active";
}

export function makeJsonCrudRoute(jsonPath: string, policy: JsonCrudPolicy) {
  const idField = policy.idField ?? "id";

  const GET = async (req: Request | NextRequest) => {
    const allowPublic = policy.public?.publicReadable === true;
    if (!allowPublic) {
      const { error } = await guardApi(req);
      if (error) return error;
    }

    const list = (await readJson<any[]>(jsonPath, [])) ?? [];
    const { q, tag, storeKey, id } = pickQueryParams(req);

    if (policy.public?.requireStoreKey === true && !storeKey) {
      return json({ error: "store_key required", module: policy.module }, 400);
    }

    let out = Array.isArray(list) ? list : [];
    if (id) out = out.filter((x) => normalizeStr(x?.[idField]) === id);
    if (policy.public?.activeOnly) out = out.filter(isActive);
    out = out.filter((x) => matchTag(x, tag, policy.public?.tagsField));

    if (policy.public?.allowQuery && q) {
      const fields = policy.public?.queryFields?.length ? policy.public.queryFields : [idField];
      out = out.filter((x) => matchQuery(x, q, fields));
    }

    return json({ module: policy.module, data: out }, 200);
  };

  const POST = async (req: Request | NextRequest) => {
    const { actor, error } = await guardApi(req);
    if (policy.write?.requireAuth && error) return error;
    if (!hasWriteRole(actor, policy.write?.roles)) return json({ error: "Forbidden" }, 403);

    const body = await (req as any).json().catch(() => ({}));
    const list = (await readJson<any[]>(jsonPath, [])) ?? [];

    if (policy.write?.ownerKey) {
      const k = policy.write.ownerKey;
      if (body?.[k] == null) return json({ error: `${k} required` }, 400);
      if (k === "store_key" && Array.isArray(actor?.stores) && actor.stores.length) {
        if (!actor.stores.map(normalizeStr).includes(normalizeStr(body?.[k]))) return json({ error: "Forbidden (store)" }, 403);
      }
    }

    if (policy.write?.allowStatusActiveForAdminOnly && normalizeStr(body?.status) === "active") {
      if (actorRole(actor) !== "admin") body.status = "pending";
    }

    const item = { [idField]: body?.[idField] ?? makeId(policy.module), ...body, _createdAt: nowISO() };
    (Array.isArray(list) ? list : []).unshift(item);
    await writeJson(jsonPath, list);
    return json({ ok: true, item, module: policy.module }, 201);
  };

  const PUT = async (req: Request | NextRequest) => {
    const { actor, error } = await guardApi(req);
    if (policy.write?.requireAuth && error) return error;
    if (!hasWriteRole(actor, policy.write?.roles)) return json({ error: "Forbidden" }, 403);

    const body = await (req as any).json().catch(() => ({}));
    const id = normalizeStr(body?.[idField]);
    if (!id) return json({ error: `Missing ${idField}` }, 400);

    const list = await readJson<any[]>(jsonPath, []);
    const arr = Array.isArray(list) ? list : [];
    const idx = arr.findIndex((x) => normalizeStr(x?.[idField]) === id);
    if (idx < 0) return json({ error: "Not found" }, 404);

    if (policy.write?.ownerKey) {
      const k = policy.write.ownerKey;
      const existingKey = normalizeStr(arr[idx][k]);
      const incomingKey = body?.[k] != null ? normalizeStr(body?.[k]) : existingKey;
      if (incomingKey !== existingKey) return json({ error: "Ownership change forbidden" }, 409);
    }

    if (policy.write?.allowStatusActiveForAdminOnly && normalizeStr(body?.status) === "active") {
      if (actorRole(actor) !== "admin") body.status = arr[idx]?.status ?? "pending";
    }

    arr[idx] = { ...arr[idx], ...body, _updatedAt: nowISO() };
    await writeJson(jsonPath, arr);
    return json({ ok: true, item: arr[idx], module: policy.module }, 200);
  };

  const DELETE = async (req: Request | NextRequest) => {
    const { actor, error } = await guardApi(req);
    if (policy.write?.requireAuth && error) return error;
    if (!hasWriteRole(actor, policy.write?.roles)) return json({ error: "Forbidden" }, 403);

    const { id } = pickQueryParams(req);
    if (!id) return json({ error: "Missing id" }, 400);

    const list = await readJson<any[]>(jsonPath, []);
    const arr = Array.isArray(list) ? list : [];
    const next = arr.filter((x) => normalizeStr(x?.[idField]) !== id);
    if (next.length === arr.length) return json({ error: "Not found" }, 404);

    await writeJson(jsonPath, next);
    return json({ ok: true, module: policy.module }, 200);
  };

  return { GET, POST, PUT, DELETE };
}

/* ================== BACKWARD COMPAT ================== */

export const makeJsonRoute = makeJsonCrudRoute;