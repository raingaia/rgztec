"use client";

import React from "react";
import  Shell  from "@/modules/_ui/Shell";
import Toolbar from "../_components/Toolbar";
import AnalyticsChart from "../_components/AnalyticsChart";

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = React.useState<"7d" | "30d" | "90d">("30d");

  return (
    <Shell section="analytics" variant="seller">
      <Toolbar
        title="Analytics"
        subtitle="Views, CTR, conversion — static chart demo."
        right={
          <div style={{ display: "flex", gap: 10 }}>
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                className="chip"
                onClick={() => setPeriod(p)}
                style={{
                  fontWeight: 900,
                  borderColor: period === p ? "rgba(15,23,42,.20)" : "var(--line)",
                  background: period === p ? "rgba(15,23,42,.04)" : "#fff",
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ height: 14 }} />

      <AnalyticsChart />

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="note">
          Next: analytics will be driven by event ingestion (page views, add-to-cart, checkout, purchase).
          Current period: <b>{period}</b>
        </div>
      </div>
    </Shell>
  );
}

