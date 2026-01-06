// apps/saas/src/lib/auth/roles.ts

export type Role =
  | "admin"
  | "seller"
  | "buyer"
  | "support"
  | "moderator";

/**
 * Rol hiyerarşisi
 * üstte olan alttakinin yetkilerine sahiptir
 */
const ROLE_RANK: Record<Role, number> = {
  admin: 100,
  moderator: 80,
  support: 60,
  seller: 40,
  buyer: 20,
};

/**
 * Kullanıcıda rol var mı
 */
export function hasRole(userRoles: Role[] | undefined, role: Role): boolean {
  if (!userRoles) return false;
  return userRoles.includes(role);
}

/**
 * En az bu rol seviyesinde mi?
 * örn: seller >= buyer
 */
export function hasMinRole(
  userRoles: Role[] | undefined,
  required: Role
): boolean {
  if (!userRoles || userRoles.length === 0) return false;

  const maxUserRank = Math.max(
    ...userRoles.map((r) => ROLE_RANK[r] ?? 0)
  );

  return maxUserRank >= ROLE_RANK[required];
}

/**
 * API / Guard için
 */
export function isAllowed(
  userRoles: Role[] | undefined,
  allowed: Role[]
): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.some((r) => allowed.includes(r));
}

