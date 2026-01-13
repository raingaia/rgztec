import { NextResponse } from "next/server";
import { readJson } from "@/src/lib/fs/readJson";
import { writeJson } from "@/src/lib/fs/writeJson";

/**
 * RGZTEC API Engine (Central)
 * - Backward compatible with old scaffold
 * - makeJsonRoute(file) -> { GET, POST }
 * - makeJsonRoute(file, options) -> { GET, POST, PUT, DELETE } (enterprise)
 */

type Role = "seller" | "admin" | "buyer" | string;

type PublicOptions = {
  requireStoreKey?: boolean; // GET requires ?store_key=
  activeOnly?: boolean; // GET forces status=active
  allowQuery?: boolean; // GET supports ?q=
  queryFields?: string[]; // fields for q search (default: ["title","name"])
  tagsField?: string; // default: "tags"
};

type WriteOptions = {
  requireAuth?: boolean; // POST/PUT/DELETE requires Authorization: Bearer <api_key>
  roles?: Role[]; // default: ["seller","admin"]
  ownerKey?: string; // default: "store_key" (or "seller_id")
  // products için: "active" sadece admin
  allowStatusActiveForAdminOnly?: boolean;
  // serverless güvenlik: yazmayı kapat
  writeMode?: "file" | "off"; // default: process.env.RGZ_WRITE === "file" ? "file" : "off"
};

type MakeJsonRouteOptions = {
  module?: string; // response info
  public?: PublicOptions;
  write?: WriteOptions;
  idField?: string; // default "id"
};

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function nowISO() {
  return new Date().toISOString();
}

function makeId(prefix = "id") {
  return `${prefix}_` + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getBearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : "";
}

function envWriteMode(): "file" | "off" {
  return (process.env.RGZ_WRITE || "off").toLowerCase() === "file" ? "file" : "off";
}

/**
 * users.json -> same JSON engine
 * Expected fields (minimum):
 * { id, role, api_key, stores: ["store_key_1", ...] }
 *
 * For hardware (ownerKey="seller_id") stores can be empty: []
 */
async function findActorByToken(token: string) {
  if (!token) return null;
  const users = (await readJson("src/data/users/users.json", [])) as any[];
  const u = users.find((x) => x && x.api_key === token);
  if (!u) return null;
  return {
    id: String(u.id || ""),
    role: String(u.role || ""),
    stores: Array.isArray(u.stores) ? u.stores.map(String) : [],
    email: u.email ? String(u.email) : undefined,
  };
}

function normalizeStr(v: any) {
  return String(v ?? "").trim();
}

function containsQ(obj: any, q: string, fields: string[], tagsField: string) {
  if (!q) return true;
  const qq = q.toLowerCase();
  for (const f of fields) {
    const val = String(obj?.[f] || "").toLowerCase();
    if (val.includes(qq)) return true;
  }
  const tags = obj?.[tagsField];
  if (Array.isArray(tags) && tags.some((t) => String(t).toLowerCase().includes(qq))) return true;
  return false;
}

/**
 * Ownership / write authorization
 * - ownerKey="store_key": actor.stores must include store_key
 * - ownerKey="seller_id": actor.id must equal seller_id
 * - admin always allowed
 */
function canWrite(actor: any, owner: string, ownerKey: string) {
  if (!actor) return false;
  if (actor.role === "admin") return true;

  const okOwner = normalizeStr(owner);
  if (!okOwner) return false;

  if (ownerKey === "store_key") {
    return Array.isArray(actor.stores) && actor.stores.includes(okOwner);
  }

  if (ownerKey === "seller_id") {
    return normalizeStr(actor.id) === okOwner;
  }

  // Safe default: deny
  return false;
}

export function makeJsonRoute(file: string, options: MakeJsonRouteOptions = {}) {
  const moduleName = options.module || file.split("/").pop()?.replace(".json", "") || "module";
  const idField = options.idField || "id";

  const pub = options.public || {};
  const write = options.write || {};

  const ownerKey = write.ownerKey || "store_key";
  const roles = write.roles || ["seller", "admin"];
  const writeMode = write.writeMode || envWriteMode();

  const qFields = pub.queryFields && pub.queryFields.length ? pub.queryFields : ["title", "name"];
  const tagsField = pub.tagsField || "tags";

  // ---------- GET (Public) ----------
  async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const storeKey = normalizeStr(searchParams.get("store_key"));
      const q = normalizeStr(searchParams.get("q")).toLowerCase();
      const statusParam = normalizeStr(searchParams.get("status"));

      if (pub.requireStoreKey && !storeKey) {
        return json({ error: "store_key required", module: moduleName }, 400);
      }

      const items = (await readJson(file, [])) as any[];
      let out = Array.isArray(items) ? items : [];

      // NOTE: store_key filter is optional even if resource uses ownerKey=seller_id
      // If you want seller_id filter via query, add ?seller_id= and filter in route wrapper.
      if (storeKey) {
        // When storeKey is present, filter by ownerKey (usually store_key)
        out = out.filter((it) => normalizeStr(it?.[ownerKey]) === storeKey);
      }

      if (pub.activeOnly) {
        out = out.filter((it) => normalizeStr(it?.status) === "active");
      } else if (statusParam) {
        out = out.filter((it) => normalizeStr(it?.status) === statusParam);
      }

      if (pub.allowQuery && q) {
        out = out.filter((it) => containsQ(it, q, qFields, tagsField));
      }

      return json({ items: out, module: moduleName }, 200);
    } catch (e: any) {
      return json({ error: e?.message || "GET failed", module: moduleName }, 500);
    }
  }

  // ---------- POST (Write) ----------
  async function POST(req: Request) {
    try {
      const body = await req.json().catch(() => ({} as any));

      if (write.requireAuth) {
        const token = getBearer(req);
        const actor = await findActorByToken(token);
        if (!actor) return json({ error: "Unauthorized", module: moduleName }, 401);
        if (roles.length && !roles.includes(actor.role)) return json({ error: "Forbidden", module: moduleName }, 403);

        const owner = normalizeStr(body?.[ownerKey]);
        if (!owner) return json({ error: `${ownerKey} required`, module: moduleName }, 400);

        if (!canWrite(actor, owner, ownerKey)) {
          return json({ error: "Forbidden (not owner)", module: moduleName }, 403);
        }

        if (write.allowStatusActiveForAdminOnly && body.status === "active" && actor.role !== "admin") {
          body.status = "pending";
        }
      }

      const now = nowISO();
      const created = {
        [idField]: body?.[idField] || makeId(moduleName),
        ...body,
        created_at: body?.created_at || now,
        updated_at: now,
      };

      if (writeMode !== "file") {
        return json(
          { ok: true, item: created, module: moduleName, note: "WRITE disabled (set RGZ_WRITE=file for dev)." },
          201
        );
      }

      // IMPORTANT: We assume file holds an ARRAY for list resources
      const items = (await readJson(file, [])) as any[];
      const arr = Array.isArray(items) ? items : [];
      arr.push(created);

      await writeJson(file, arr);
      return json({ ok: true, item: created, module: moduleName }, 201);
    } catch (e: any) {
      return json({ error: e?.message || "POST failed", module: moduleName }, 500);
    }
  }

  // ---------- PUT (Write) ----------
  async function PUT(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = normalizeStr(searchParams.get(idField));
      if (!id) return json({ error: `${idField} required`, module: moduleName }, 400);

      const patch = await req.json().catch(() => null);
      if (!patch) return json({ error: "Invalid JSON", module: moduleName }, 400);

      let actor: any = null;
      if (write.requireAuth) {
        const token = getBearer(req);
        actor = await findActorByToken(token);
        if (!actor) return json({ error: "Unauthorized", module: moduleName }, 401);
        if (roles.length && !roles.includes(actor.role)) return json({ error: "Forbidden", module: moduleName }, 403);
      }

      const items = (await readJson(file, [])) as any[];
      const arr = Array.isArray(items) ? items : [];

      const idx = arr.findIndex((x) => normalizeStr(x?.[idField]) === id);
      if (idx < 0) return json({ error: "Not found", module: moduleName }, 404);

      const existing = arr[idx];
      const existingOwner = normalizeStr(existing?.[ownerKey]);

      if (write.requireAuth && actor) {
        if (!canWrite(actor, existingOwner, ownerKey)) {
          return json({ error: "Forbidden", module: moduleName }, 403);
        }
        if (write.allowStatusActiveForAdminOnly && patch.status === "active" && actor.role !== "admin") {
          return json({ error: "Only admin can set status=active", module: moduleName }, 403);
        }
        // ownership immutable
        if (ownerKey in patch) delete patch[ownerKey];
        if (idField in patch) delete patch[idField];
      }

      const updated = { ...existing, ...patch, updated_at: nowISO() };
      arr[idx] = updated;

      if (writeMode !== "file") {
        return json(
          { ok: true, item: updated, module: moduleName, note: "WRITE disabled (set RGZ_WRITE=file for dev)." },
          200
        );
      }

      await writeJson(file, arr);
      return json({ ok: true, item: updated, module: moduleName }, 200);
    } catch (e: any) {
      return json({ error: e?.message || "PUT failed", module: moduleName }, 500);
    }
  }

  // ---------- DELETE (Write) ----------
  async function DELETE(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = normalizeStr(searchParams.get(idField));
      if (!id) return json({ error: `${idField} required`, module: moduleName }, 400);

      let actor: any = null;
      if (write.requireAuth) {
        const token = getBearer(req);
        actor = await findActorByToken(token);
        if (!actor) return json({ error: "Unauthorized", module: moduleName }, 401);
        if (roles.length && !roles.includes(actor.role)) return json({ error: "Forbidden", module: moduleName }, 403);
      }

      const items = (await readJson(file, [])) as any[];
      const arr = Array.isArray(items) ? items : [];

      const existing = arr.find((x) => normalizeStr(x?.[idField]) === id);
      if (!existing) return json({ error: "Not found", module: moduleName }, 404);

      const existingOwner = normalizeStr(existing?.[ownerKey]);

      if (write.requireAuth && actor) {
        if (!canWrite(actor, existingOwner, ownerKey)) {
          return json({ error: "Forbidden", module: moduleName }, 403);
        }
      }

      const next = arr.filter((x) => normalizeStr(x?.[idField]) !== id);

      if (writeMode !== "file") {
        return json({ ok: true, module: moduleName, note: "WRITE disabled (set RGZ_WRITE=file for dev)." }, 200);
      }

      await writeJson(file, next);
      return json({ ok: true, module: moduleName }, 200);
    } catch (e: any) {
      return json({ error: e?.message || "DELETE failed", module: moduleName }, 500);
    }
  }

  // Backward compatibility: older routes destructure only GET/POST; fine.
  return { GET, POST, PUT, DELETE };
}


/* =========================
   Added for Amplify build
   ========================= */

export function nowISO() {
  return new Date().toISOString();
}

// JSON reader (Node runtime). Use only in server routes.
export async function readJson<T = any>(relPath: string): Promise<T> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");

  // relPath examples: "src/data/orders/orders.json"
  const abs = join(process.cwd(), relPath);
  const raw = await readFile(abs, "utf8");
  return JSON.parse(raw) as T;
}

