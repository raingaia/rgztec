"use client";

import React from "react";
import  Shell  from "@modules/_ui/Shell";
import Toolbar from "../_components/Toolbar";

type Plan = { name: string; price: string; desc: string; items: string[]; badge?: string };

const PLANS: Plan[] = [
  { name: "Starter", price: "5% fee", desc: "For early-stage sellers", items: ["Basic listings", "Standard payouts", "Email receipts"] },
  { name: "Pro", price: "3% fee", desc: "For growing stores", badge: "Most popular", items: ["Priority payouts", "Bundles & tiers", "Advanced analytics"] },
  { name: "Enterprise", price: "Custom", desc: "For teams & partners", items: ["Dedicated support", "SLA", "Custom integrations"] },
];

export default function SellerPricingPage() {
  const [payout, setPayout] = React.useState<"Weekly" | "Daily">("Weekly");

  return (
    <Shell section="pricing" variant="seller">
      <Toolbar
        title="Pricing & Payouts"
        subtitle="Configure fees, tiers, and payout schedule (static demo)."
        right={
          <div style={{ display: "flex", gap: 10 }}>
            {(["Weekly", "Daily"] as const).map((t) => (
              <button
                key={t}
                className="chip"
                onClick={() => setPayout(t)}
                style={{
                  fontWeight: 900,
                  borderColor: payout === t ? "rgba(15,23,42,.20)" : "var(--line)",
                  background: payout === t ? "rgba(15,23,42,.04)" : "#fff",
                }}
              >
                Payout: {t}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ height: 14 }} />

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {PLANS.map((p) => (
          <div className="card" key={p.name}>
            <div className="card-h">
              <div>
                <h2>{p.name}</h2>
                <span>{p.desc}</span>
              </div>
              {p.badge ? <span className="chip" style={{ fontWeight: 900 }}>{p.badge}</span> : null}
            </div>

            <div style={{ padding: "0 14px 14px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 10 }}>{p.price}</div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
                Current payout schedule: <b>{payout}</b>
              </div>

              <div style={{ height: 12 }} />
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--sub)", fontSize: 13, lineHeight: 1.7 }}>
                {p.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>

              <div style={{ height: 14 }} />
              <button className="chip" style={{ width: "100%", fontWeight: 900 }}>
                Select {p.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="note">
          Next: connect Stripe, verify tax details, then payouts become live.
        </div>
      </div>
    </Shell>
  );
}
