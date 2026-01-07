"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RangeKey = "7d" | "30d" | "90d";

const ranges = {
  "7d":  { label: "Last 7 days",  revenue:[12,18,14,22,19,26,24], orders:[8,10,9,13,11,15,14] },
  "30d": { label: "Last 30 days", revenue:[10,12,9,14,16,15,18,20,19,21,22,24], orders:[6,7,5,8,9,8,10,11,10,12,12,13] },
  "90d": { label: "Last 90 days", revenue:[8,9,10,11,12,14,13,15,16,18,17,19], orders:[4,5,6,6,7,8,7,9,9,10,10,11] }
} as const;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function AnalyticsChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [range, setRange] = useState<RangeKey>("30d");

  const data = ranges[range];

  const aov = useMemo(() => {
    const revSum = data.revenue.reduce((a,b)=>a+b,0);
    const ordSum = data.orders.reduce((a,b)=>a+b,0);
    const v = ordSum ? (revSum/ordSum*10).toFixed(1) : "0.0";
    return "$" + v;
  }, [data]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      el.width = Math.floor(rect.width * dpr);
      el.height = Math.floor(140 * dpr);

      ctx.setTransform(dpr,0,0,dpr,0,0);

      const w = rect.width;
      const h = 140;

      const padL = 34, padR = 14, padT = 14, padB = 24;

      ctx.clearRect(0,0,w,h);

      // grid
      ctx.strokeStyle = "rgba(15,23,42,.06)";
      ctx.lineWidth = 1;
      const gridLines = 4;
      for(let i=0;i<=gridLines;i++){
        const y = padT + (h - padT - padB) * (i/gridLines);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();
      }

      const all = [...data.revenue, ...data.orders];
      const max = Math.max(...all) * 1.15;

      const x = (i:number, n:number) => padL + (w - padL - padR) * (i/(n-1));
      const y = (v:number) => padT + (h - padT - padB) * (1 - (v/max));

      // labels
      ctx.fillStyle = "rgba(71,85,105,.85)";
      ctx.font = "11px Inter";
      ctx.fillText(String(Math.round(max)), 8, padT + 10);
      ctx.fillText(String(Math.round(max*0.5)), 8, padT + (h-padT-padB)/2 + 4);

      const drawLine = (series:number[], stroke:string, fill:string) => {
        const n = series.length;

        // area
        ctx.beginPath();
        ctx.moveTo(x(0,n), y(series[0]));
        for(let i=1;i<n;i++) ctx.lineTo(x(i,n), y(series[i]));
        ctx.lineTo(x(n-1,n), h - padB);
        ctx.lineTo(x(0,n), h - padB);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        // stroke
        ctx.beginPath();
        ctx.moveTo(x(0,n), y(series[0]));
        for(let i=1;i<n;i++) ctx.lineTo(x(i,n), y(series[i]));
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // points
        for(let i=0;i<n;i++){
          ctx.beginPath();
          ctx.arc(x(i,n), y(series[i]), 3, 0, Math.PI*2);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      };

      const brand = cssVar("--brand") || "#f97316";
      drawLine(data.revenue, brand, "rgba(249,115,22,.14)");
      drawLine(data.orders, "#60a5fa", "rgba(96,165,250,.12)");
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data]);

  const activeBtnStyle = { borderColor: "rgba(249,115,22,.28)", background: "rgba(249,115,22,.06)" };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-h">
        <div>
          <h2>Analytics</h2>
          <span>Revenue & orders trend</span>
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button className="btn" style={{ padding:"8px 10px", ...(range==="7d" ? activeBtnStyle : {}) }} onClick={() => setRange("7d")} type="button">7d</button>
          <button className="btn" style={{ padding:"8px 10px", ...(range==="30d" ? activeBtnStyle : {}) }} onClick={() => setRange("30d")} type="button">30d</button>
          <button className="btn" style={{ padding:"8px 10px", ...(range==="90d" ? activeBtnStyle : {}) }} onClick={() => setRange("90d")} type="button">90d</button>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <span className="pill" style={{ padding:"7px 10px" }}>
              <span style={{ width:10,height:10,borderRadius:999,background:"var(--brand)",display:"inline-block" }} />
              Revenue
            </span>
            <span className="pill" style={{ padding:"7px 10px" }}>
              <span style={{ width:10,height:10,borderRadius:999,background:"#60a5fa",display:"inline-block" }} />
              Orders
            </span>
          </div>

          <span style={{ color:"var(--muted)", fontSize:12 }}>{data.label}</span>
        </div>

        <canvas ref={canvasRef} height={140} style={{ width:"100%", background:"#fff", border:"1px solid var(--line)", borderRadius:16 }} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:12 }}>
          <div className="metric" style={{ margin:0 }}>
            <div className="k">Avg order value</div>
            <div className="v">{aov}</div>
            <div className="n">Based on selected range</div>
          </div>
          <div className="metric" style={{ margin:0 }}>
            <div className="k">Conversion</div>
            <div className="v">2.84%</div>
            <div className="n">Listing thumbnails focus</div>
          </div>
        </div>
      </div>
    </div>
  );
}
