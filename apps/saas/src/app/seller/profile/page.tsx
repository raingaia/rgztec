"use client";

import React from "react";
import  Shell from "@modules/_ui/Shell";
import Toolbar from "@/app/seller/_components/Toolbar";

export default function SellerProfilePage() {
  const [form, setForm] = React.useState({
    storeName: "RGZTEC Studio",
    legalName: "RGZTEC LLC",
    payoutEmail: "payout@rgztec.com",
    country: "United States",
    website: "https://rgztec.com",
  });

  const [saved, setSaved] = React.useState(false);

  function update(k: keyof typeof form, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
    setSaved(false);
  }

  function save() {
    setSaved(true);
    // later: API call
  }

  return (
    <Shell section="profile" variant="seller">
      <Toolbar
        title="Profile"
        subtitle="Company details, payout info, and branding (static demo)."
        right={
          <button className="chip" style={{ fontWeight: 900 }} onClick={save}>
            Save changes
          </button>
        }
      />

      <div style={{ height: 14 }} />

      <div className="card">
        <div style={{ padding: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Store name" value={form.storeName} onChange={(v) => update("storeName", v)} />
            <Field label="Legal name" value={form.legalName} onChange={(v) => update("legalName", v)} />
            <Field label="Payout email" value={form.payoutEmail} onChange={(v) => update("payoutEmail", v)} />
            <Field label="Country" value={form.country} onChange={(v) => update("country", v)} />
            <Field label="Website" value={form.website} onChange={(v) => update("website", v)} />
          </div>

          <div style={{ height: 12 }} />
          {saved ? (
            <div className="note" style={{ borderTop: "none" }}>
              ✅ Saved (demo). In production this persists to DB.
            </div>
          ) : (
            <div className="note" style={{ borderTop: "none" }}>
              Changes are local until you click “Save changes”.
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="chip"
        style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid var(--line)", background: "#fff" }}
      />
    </label>
  );
}

