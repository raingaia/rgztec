// apps/saas/app/api/users/me/profile/route.ts
import { json, getBearer, findActorByToken, readJson, writeJson } from "@common";   // ✅ alias kullanıldı

const USERS_FILE = "@data/users/users.json";                                       // ✅ alias kullanıldı


function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

function isNonEmptyString(v: any) {
  return typeof v === "string" && v.trim().length > 0;
}

// Kurumsal SaaS: Sadece allow edilen alanlar güncellenir
function applyProfilePatch(targetUser: any, patch: any) {
  const next = { ...targetUser };
  const p = patch?.profile ?? patch ?? {};

  // Allow-list (roles/email/store_key asla)
  const name = p?.name;
  const avatar = p?.avatar;

  next.profile = { ...(next.profile || {}) };

  if (name !== undefined) {
    if (name === null || name === "") next.profile.name = "";
    else if (isNonEmptyString(name)) next.profile.name = String(name).trim().slice(0, 80);
  }

  if (avatar !== undefined) {
    // Şimdilik url veya null; ileride upload/storage gelince burayı genişletiriz
    if (avatar === null || avatar === "") next.profile.avatar = null;
    else if (isNonEmptyString(avatar)) next.profile.avatar = String(avatar).trim().slice(0, 500);
  }

  next.meta = { ...(next.meta || {}) };
  next.meta.updated_at = nowUnix();

  return next;
}

function sanitizeUser(u: any) {
  if (!u) return null;
  const { password, reset_token, verify_token, ...safe } = u;
  return safe;
}

async function loadUsers(): Promise<any[]> {
  const data = await readJson(USERS_FILE, []);
  return Array.isArray(data) ? data : [];
}

export async function PUT(req: Request) {
  try {
    const token = getBearer(req);
    const actor = await findActorByToken(token);

    if (!actor) {
      return json({ error: "Unauthorized", module: "users_me_profile" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const users = await loadUsers();

    const idx =
      users.findIndex((u) => u?.id && actor?.id && u.id === actor.id) ??
      -1;

    let meIndex = idx;
    if (meIndex < 0) {
      meIndex = users.findIndex(
        (u) => u?.email && actor?.email && String(u.email).toLowerCase() === String(actor.email).toLowerCase()
      );
    }

    if (meIndex < 0) {
      return json({ error: "User not found", module: "users_me_profile" }, 404);
    }

    const me = users[meIndex];

    if (me.blocked === true || me.active === false) {
      return json({ error: "Account disabled", module: "users_me_profile" }, 403);
    }

    // PATCH uyguluyoruz (allow-list)
    const updated = applyProfilePatch(me, body);

    // Kritik güvenlik: burada roles/email/store_key değiştirilirse geri al
    updated.roles = me.roles;
    updated.email = me.email;
    updated.store_key = me.store_key;
    updated.auth_provider = me.auth_provider;

    users[meIndex] = updated;

    // Dosyaya yaz
    await writeJson(USERS_FILE, users);

    return json({ data: sanitizeUser(updated), module: "users_me_profile" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "Server error", module: "users_me_profile" }, 500);
  }
}