// apps/saas/src/lib/auth/users.ts
import { promises as fs } from "fs"; // Yerleşik Node.js modülü, klasör gerektirmez
import path from "path";
import type { Role } from "./roles";

export type UserRecord = {
  id: string;
  email: string;
  password?: string;
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

// JSON dosyasının yolu - process.cwd() kök dizini (saas klasörünü) verir
const USERS_PATH = path.join(process.cwd(), "src/data/users/users.json");

/**
 * Dosyadan tüm kullanıcıları okur.
 * Bağımlılık gerektirmez, doğrudan standart fs kullanır.
 */
export async function readUsers(): Promise<UserRecord[]> {
  try {
    const fileContent = await fs.readFile(USERS_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? (data as UserRecord[]) : [];
  } catch (error) {
    // Dosya yoksa veya okunamazsa boş dizi dön ki page'ler çökmesin
    console.error("Users data okuma hatası:", error);
    return [];
  }
}

/**
 * Email ile kullanıcı arar.
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await readUsers();
  const e = String(email || "").trim().toLowerCase();
  return users.find((u) => String(u.email || "").trim().toLowerCase() === e) ?? null;
}

/**
 * Şifre doğrulama.
 */
export async function validateLocalPassword(user: UserRecord, password: string): Promise<boolean> {
  return Boolean(user.password && String(user.password) === String(password));
}