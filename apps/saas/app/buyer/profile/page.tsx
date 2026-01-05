import Link from "next/link";
import { requireRole } from "@/src/lib/auth/guard";

const nav = [
  { href: "/buyer/marketplace", label: "Marketplace" },
  { href: "/buyer/cart", label: "Cart" },
  { href: "/buyer/checkout", label: "Checkout" },
  { href: "/buyer/orders", label: "Orders" },
  { href: "/buyer/profile", label: "Profile" },
];

export default function BuyerProfilePage() {
  // Buyer profili: sadece buyer (istersen admin de eklenir)
  requireRole(["buyer"]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Buyer • Profile</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            Manage your account details and preferences.
          </p>
        </div>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" }}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: item.href === "/buyer/profile" ? "2px solid #111" : "1px solid rgba(0,0,0,0.12)",
                textDecoration: "none",
                color: "#111",
                fontWeight: item.href === "/buyer/profile" ? 800 : 600,
                opacity: item.href === "/buyer/profile" ? 1 : 0.9,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section style={{ marginTop: 18 }}>
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 16,
            padding: 16,
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Profile</h2>
          <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
            TODO: profile UI (name, email, address, billing prefs)
          </p>

          {/* Örnek “boş state” */}
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.12)", background: "#fff" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Name</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>—</div>
            </div>

            <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,0.12)", background: "#fff" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Email</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>—</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

