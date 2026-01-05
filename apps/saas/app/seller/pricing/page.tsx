import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";

export default function Page() {
  requireRole(["seller","admin"]);
  return (
    <Shell
      title="Seller • Pricing"
      nav={[
        { href: "/seller/dashboard", label: "Dashboard" },
        { href: "/seller/products", label: "Products" },
        { href: "/seller/pricing", label: "Pricing" },
        { href: "/seller/orders", label: "Orders" },
        { href: "/seller/analytics", label: "Analytics" },
        { href: "/seller/profile", label: "Profile" },
      ]}
    >
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: pricing UI</p>
    </Shell>
  );
}
