export type Role = "buyer" | "seller" | "admin";

export const ROLES: Role[] = ["buyer", "seller", "admin"];

export function isRole(x: any): x is Role {
  return typeof x === "string" && (ROLES as string[]).includes(x);
}
