"use client";

import React, { useState } from "react";
// Import yollarını senin alias mantığına göre güncelledik
import Shell from "@/modules/_ui/Shell"; 
import Toolbar from "../_components/Toolbar"; // Alias @toolbar çalışmıyorsa bu en güvenlisi
import AnalyticsChart from "../_components/AnalyticsChart";

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <Shell section="analytics" variant="seller">
      {/* Not: Eğer Toolbar bileşeninde title/right propları tanımlı değilse 
         hata alabilirsin. Şimdilik standart kullanım:
      */}
      <Toolbar /> 

      <div style={{ height: 14 }} />

      {/* Analytics grafiği */}
      <AnalyticsChart />

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-600">
            Next: analytics will be driven by event ingestion (page views, add-to-cart, checkout, purchase).
          </p>
          <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current period: <span className="text-slate-900">{period}</span>
          </p>
        </div>
      </div>

      {/* Periyot Seçici (Toolbar içinde değilse burada durabilir) */}
      <div className="mt-4 flex gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-3 py-1 text-xs font-black rounded-full border transition-all"
            style={{
              borderColor: period === p ? "rgba(15,23,42,.20)" : "#eee",
              background: period === p ? "rgba(15,23,42,.04)" : "#fff",
              color: period === p ? "#000" : "#666"
            }}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>
    </Shell>
  );
}