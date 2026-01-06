// apps/saas/src/lib/auth/users.ts
import { readJson } from "@/src/lib/fs/readJson";
import type { Role } from "./roles";

export type UserRecord = {
  id: string;
  email: string;
  password?: string; // şimdilik demo (ileride hash)
  auth_provider?: "local" | "google" | string;
  email_verified?: boolean;
  roles?: Role[] | string[];
  active?: boolean;
  blocked?: boolean;
  store_key?: string | null;

  profile?: { name?: string; avatar?: string | null };
  meta?: {
    created_at?: number;
    last_login?: number | null;
    login_count?: number;
    verified_at?: number | null;
  };
};

const USERS_PATH = "src/data/users/users.json";

export async function readUsers(): Promise<UserRecord[]> {
  const data = await readJson<UserRecord[] | unknown>(USERS_PATH);
  if (Array.isArray(data)) return data as UserRecord[];
  return [];
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await readUsers();
  const e = String(email || "").trim().toLowerCase();
  return users.find((u) => String(u.email || "").trim().toLowerCase() === e) ?? null;
}

export async function validateLocalPassword(user: UserRecord, password: string): Promise<boolean> {
  // Şimdilik demo: düz string karşılaştırma
  // (Yarın hash'e geçeriz: bcrypt/argon2)
  return Boolean(user.password && String(user.password) === String(password));
}
