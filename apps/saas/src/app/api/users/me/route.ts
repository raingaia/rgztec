// apps/saas/app/api/users/me/route.ts
import { json, getBearer, findActorByToken, readJson } from "@common";   // ✅ alias kullanıldı

const USERS_FILE = "@data/users/users.json";                             // ✅ alias kullanıldı


function sanitizeUser(u: any) {
  if (!u) return null;

  // Kurumsal SaaS: PII + secrets temizliği
  const {
    password,          // asla dönme
    reset_token,       // varsa
    verify_token,      // varsa
    ...safe
  } = u;

  // Ek güvenlik: meta içinde de hassas bir şey varsa filtrele
  if (safe?.meta) {
    const { ip, user_agent, ...metaSafe } = safe.meta;
    safe.meta = metaSafe;
  }

  return safe;
}

async function loadUsers(): Promise<any[]> {
  const data = await readJson(USERS_FILE, []);
  return Array.isArray(data) ? data : [];
}

export async function GET(req: Request) {
  try {
    const token = getBearer(req);
    const actor = await findActorByToken(token);

    if (!actor) {
      return json({ error: "Unauthorized", module: "users_me" }, 401);
    }

    const users = await loadUsers();

    // actor.id ile eşleşme; yoksa email fallback (senin auth modeline göre)
    const me =
      users.find((u) => u?.id && actor?.id && u.id === actor.id) ||
      users.find((u) => u?.email && actor?.email && String(u.email).toLowerCase() === String(actor.email).toLowerCase());

    if (!me) {
      return json({ error: "User not found", module: "users_me" }, 404);
    }

    // blocked/active kontrolü (enterprise davranış)
    if (me.blocked === true || me.active === false) {
      return json({ error: "Account disabled", module: "users_me" }, 403);
    }

    return json({ data: sanitizeUser(me), module: "users_me" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "Server error", module: "users_me" }, 500);
  }
}
