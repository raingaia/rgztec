import { redirect } from "next/navigation";
import type { Role } from "./roles";
import { getSession } from "./session";

export async function requireRole(allowed: Role[]) {
  const session = await getSession();
  if (!session) redirect("/unauthorized");

  const ok = session.user.roles.some((r) => allowed.includes(r));
  if (!ok) redirect("/unauthorized");

  return session;
}
