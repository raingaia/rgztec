import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";

export default function Page() {
  requireRole(["admin"]);
  return (
    <Shell
      title="Admin • Users"
      nav={[
        { href: "/admin/stores", label: "Stores" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/moderation", label: "Moderation" },
        { href: "/admin/finance", label: "Finance" },
      ]}
    >
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: users UI</p>
    </Shell>
  );
}
