// apps/saas/app/seller/hardware/page.tsx
import Link from "next/link";
import  Shell  from "@/modules/_ui/Shell";

type Status = "not_started" | "pending" | "approved" | "rejected";

export default async function HardwareSellerHome() {
  // DEV: sonra API'den gelecek (seller profile)
  const status: Status = "not_started";

  const badge = (() => {
    if (status === "approved") return { text: "APPROVED", tone: "ok" as const };
    if (status === "pending") return { text: "PENDING REVIEW", tone: "" as const };
    if (status === "rejected") return { text: "REJECTED", tone: "fail" as const };
    return { text: "NOT STARTED", tone: "" as const };
  })();

  const canAccessStore = status === "approved";

  return (
    <Shell section="hardware" variant="seller">
      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 16 }}>
        {/* Header */}
        <div className="card">
          <div className="card-h">
            <div>
              <h2>Hardware Seller</h2>
              <span>Physical products onboarding & compliance (dev now → prod ready).</span>
            </div>

            <span className={`status ${badge.tone}`} style={{ fontWeight: 900 }}>
              <span className="s-dot" />
              {badge.text}
            </span>
          </div>

          <div className="note">
            Hardware seller flow is separate from digital products. Application → review → store unlock.
          </div>
        </div>

        {/* Two main cards */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <Card
            title="Apply as Hardware Seller"
            desc="Company details, payout setup, policies, category scope."
            cta="Start / Edit Application"
            href="/seller/hardware/apply"
          />

          <Card
            title="Application Status"
            desc="Track review progress and requested changes."
            cta="View Status"
            href="/seller/hardware/status"
          />
        </div>

        {/* Locked after approval area */}
        <div className="card">
          <div className="card-h">
            <div>
              <h2>After approval</h2>
              <span>Store setup and product listings become available when your application is approved.</span>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              {canAccessStore ? "Unlocked" : "Locked"}
            </span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            <DisabledCard
              enabled={canAccessStore}
              title="Store Settings"
              desc="Branding, shipping regions, return policy, support contacts."
              href="/seller/hardware/store"
            />
            <DisabledCard
              enabled={canAccessStore}
              title="Products"
              desc="Add hardware products, inventory, pricing, shipping profiles."
              href="/seller/hardware/products"
            />
          </div>

          {!canAccessStore && (
            <div className="note">
              Locked until approval. In production, status will come from seller profile / compliance review.
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Card({
  title,
  desc,
  cta,
  href,
}: {
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="card">
      <div className="card-h">
        <div>
          <h2>{title}</h2>
          <span>{desc}</span>
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <Link
          href={href}
          className="btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderRadius: 12,
            background: "var(--ink)",
            color: "#fff",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function DisabledCard({
  enabled,
  title,
  desc,
  href,
}: {
  enabled: boolean;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div
      className="card"
      style={{
        background: enabled ? "#fff" : "rgba(15,23,42,.02)",
        borderColor: enabled ? "var(--line)" : "rgba(15,23,42,.10)",
      }}
    >
      <div className="card-h">
        <div>
          <h2>{title}</h2>
          <span>{desc}</span>
        </div>
        {!enabled && (
          <span className="chip" style={{ opacity: 0.75 }}>
            Locked
          </span>
        )}
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        {enabled ? (
          <Link
            href={href}
            className="btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--ink)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            Open
          </Link>
        ) : (
          <span
            className="chip"
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "#fff",
              color: "var(--muted)",
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            Locked (needs approval)
          </span>
        )}
      </div>
    </div>
  );
}
