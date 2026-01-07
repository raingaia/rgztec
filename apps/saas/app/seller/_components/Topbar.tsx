"use client";

import { useState } from "react";

export default function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [cmd, setCmd] = useState("");

  function runCommand(v: string) {
    const q = v.trim().toLowerCase();
    if (!q) return;
    if (q.includes("product") || q.includes("upload")) alert("→ Go to Products / New (demo)");
    else if (q.includes("discount") || q.includes("pricing")) alert("→ Go to Pricing (demo)");
    else if (q.includes("payout")) alert("→ Go to Payouts (demo)");
    else alert("Command not found (demo)");
  }

  return (
    <div className="topbar">
      <div className="top-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="top-right">
        <span className="pill">
          <span className="dot" /> Live
        </span>

        <div className="search">
          <span style={{ color: "var(--muted)", fontSize: 12 }}>⌘</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Quick action: new product, discount, payouts..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                runCommand(cmd);
                setCmd("");
              }
            }}
          />
        </div>

        <button className="btn" type="button" onClick={() => alert("Export (demo)")}>
          Export
        </button>
        <button className="btn primary" type="button" onClick={() => alert("New product (demo)")}>
          New product
        </button>
      </div>
    </div>
  );
}
