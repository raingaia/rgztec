import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Common helpers for App Router API routes (Node runtime).
 * NOTE: Any Node FS usage is inside functions via dynamic import.
 */

export type JsonResult = ReturnType<typeof NextResponse.json>;

/** Standard JSON response helper */
export function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit =
    typeof init === "number" ? { status: init } : (init ?? {});
  return NextResponse.json(data, resInit);
}

/** Safe ISO timestamp */
export function nowISO() {
  return new Date().toISOString();
}

/** Simple normalizer used by search/filters */
export function normalizeStr(v?: string | null) {
  return (v ?? "").trim().toLowerCase();
}

/** Simple id generator */
export function makeId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Bearer extractor */
export function getBearer(req: NextRequest) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

/** Read JSON from repo-relative path (cwd-based). */
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

/** Write JSON to repo-relative path (cwd-based). */
export async function writeJson(relPath: string, data: any): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");
  const abs = join(process.cwd(), relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, JSON.stringify(data, null, 2), "utf8");
}

/**
 * Minimal token → actor resolver (won't crash if files don't exist).
 * Expected optional files:
 *  - src/data/auth/tokens.json   [{ token, userId, role, email, ... }]
 *  - src/data/users/users.json   [{ id, email, role, ... }]
 */
export async function findActorByToken(token: string) {
  if (!token) return null;

  const tokens = await readJson<any[]>("src/data/auth/tokens.json", []);
  const users = await readJson<any[]>("src/data/users/users.json", []);

  const t = tokens.find((x) => x?.token === token) ?? null;
  if (!t) return null;

  const u =
    users.find((x) => x?.id === t.userId) ||
    users.find((x) => x?.email && t?.email && normalizeStr(x.email) === normalizeStr(t.email)) ||
    null;

  return {
    token: t.token,
    userId: t.userId ?? u?.id ?? null,
    role: t.role ?? u?.role ?? "user",
    email: t.email ?? u?.email ?? null,
    user: u ?? null,
  };
}

/**
 * Optional wrapper if some routes use it (safe to export).
 * You can ignore if unused.
 */
export function makeJsonRoute(
  handler: (req: NextRequest, ctx?: any) => Promise<Response> | Response
) {
  return async (req: NextRequest, ctx?: any) => {
    try {
      return await handler(req, ctx);
    } catch (e: any) {
      return json(
        { error: e?.message ?? "Internal error", at: "makeJsonRoute" },
        500
      );
    }
  };
}
