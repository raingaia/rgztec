import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";

export default function Page() {
  requireRole(["buyer","seller","admin"]);
  return (
    <Shell
      title="Buyer • Checkout"
      nav={[
        { href: "/buyer/marketplace", label: "Marketplace" },
        { href: "/buyer/cart", label: "Cart" },
        { href: "/buyer/checkout", label: "Checkout" },
        { href: "/buyer/orders", label: "Orders" },
        { href: "/buyer/profile", label: "Profile" },
      ]}
    >
      <p style={{ margin: 0, opacity: 0.85 }}>TODO: checkout UI</p>
    </Shell>
  );
}
