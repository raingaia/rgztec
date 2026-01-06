// apps/saas/src/lib/auth/roles.ts
export type Role = "admin" | "seller" | "buyer";

export function isRole(x: unknown): x is Role {
  return x === "admin" || x === "seller" || x === "buyer";
}

export function normalizeRoles(input: unknown): Role[] {
  if (Array.isArray(input)) return input.filter(isRole);
  if (typeof input === "string" && isRole(input)) return [input];
  return [];
}

