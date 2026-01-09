"use client";

import React from "react";

export default function Toolbar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-h">
        <div>
          <h2>{title}</h2>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        {right ? <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{right}</div> : null}
      </div>
    </div>
  );
}
