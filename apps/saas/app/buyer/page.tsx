import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";

export default function BuyerHome() {
  requireRole(["buyer","seller","admin"]);
  return (
    <Shell
      title="Buyer • Home"
      nav={[
        { href: "/buyer/marketplace", label: "Marketplace" },
        { href: "/buyer/cart", label: "Cart" },
        { href: "/buyer/orders", label: "Orders" },
        { href: "/buyer/profile", label: "Profile" },
      ]}
    >
      <p style={{ margin: 0, opacity: 0.85 }}>
        Buyer panel is live. Next: marketplace cards + checkout flow.
      </p>
    </Shell>
  );
}
