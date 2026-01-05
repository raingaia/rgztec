import { cookies, headers } from "next/headers";
import { normalizeRole, Role } from "./roles";

/**
 * MVP session:
 * - role = cookie "rgz_role" OR header "x-rgz-role"
 * - default buyer
 *
 * Later: replace with real auth provider.
 */
export function getSession(): { role: Role } {
  const c = cookies().get("rgz_role")?.value;
  const h = headers().get("x-rgz-role");
  return { role: normalizeRole(c || h) };
}
