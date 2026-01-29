"use client";

import React from "react";

interface ToolbarProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function Toolbar({ title, subtitle, right }: ToolbarProps) {
  return (
    <div className="toolbar" style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: "0 20px", 
      height: "72px", 
      borderBottom: "1px solid var(--line)",
      background: "#fff"
    }}>
      <div>
        {title && <div style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</div>}
        {subtitle && <div style={{ fontSize: "12px", color: "var(--muted)" }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>{right}</div>}
    </div>
  );
}