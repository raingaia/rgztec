
import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";


const NAV = [
  { href: "/buyer/marketplace", label: "Marketplace" },
  { href: "/buyer/cart", label: "Cart" },
  { href: "/buyer/checkout", label: "Checkout" },
  { href: "/buyer/orders", label: "Orders" },
  { href: "/buyer/profile", label: "Profile" },
];

export default function Page() {
  // Buyer ekranları: buyer + (istersen seller/admin da görebilir)
  requireRole(["buyer", "seller", "admin"]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Buyer • Checkout</h1>
          <span style={{ opacity: 0.7, fontSize: 13 }}>Secure payment</span>
        </div>

        <nav style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 10px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                textDecoration: "none",
                opacity: item.href === "/buyer/checkout" ? 1 : 0.8,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 16,
        }}
      >
        <p style={{ marginTop: 0, opacity: 0.85 }}>
          TODO: Checkout UI (Stripe Checkout / payment intent / order finalize)
        </p>

        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
          <li>Show order summary</li>
          <li>Collect billing info</li>
          <li>Start Stripe session</li>
          <li>Redirect to success/cancel</li>
        </ul>
      </section>
    </main>
  );
}

