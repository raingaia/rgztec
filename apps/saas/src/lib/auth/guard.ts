import { redirect } from "next/navigation";
import { Role } from "./roles";
import { getSession } from "./session";

export function requireRole(allowed: Role[]) {
  const { role } = getSession();
  if (!allowed.includes(role)) {
    redirect(`/unauthorized?need=${allowed.join(",")}&have=${role}`);
  }
  return role;
}
