// apps/saas/app/seller/dashboard/page.tsx
import React from "react";

type Summary = {
  kpi: {
    totalOrders: number;
    totalProducts: number;
    grossRevenue: number;
    netRevenue: number;
  };
  chart7d: { key: string; gross: number; orders: number }[];
};

async function getSummary(): Promise<Summary> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/seller/summary`, {
    cache: "no-store",
  });
  if (!res.ok) return { kpi: { totalOrders: 0, totalProducts: 0, grossRevenue: 0, netRevenue: 0 }, chart7d: [] };
  const json = await res.json();
  return json;
}

async function getOrders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/seller/orders`, {
    cache: "no-store",
  });
  if (!res.ok) return { orders: [] as any[] };
  return res.json();
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

export default async function SellerDashboardPage() {
  const [summary, ordersResp] = await Promise.all([getSummary(), getOrders()]);
  const orders = (ordersResp?.orders ?? []).slice(0, 8);

  const chart = summary.chart7d ?? [];
  const max = Math.max(1, ...chart.map((c) => c.gross || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-slate-600">Sales & performance snapshot (dev data now, real data later).</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Orders" value={String(summary.kpi.totalOrders ?? 0)} />
        <Kpi title="Products" value={String(summary.kpi.totalProducts ?? 0)} />
        <Kpi title="Gross" value={fmtUSD(summary.kpi.grossRevenue ?? 0)} />
        <Kpi title="Net" value={fmtUSD(summary.kpi.netRevenue ?? 0)} />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Last 7 days revenue</div>
            <div className="text-xs text-slate-500">Simple bar chart (no extra libs)</div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {chart.map((c) => {
            const h = Math.round(((c.gross || 0) / max) * 100);
            return (
              <div key={c.key} className="flex flex-col items-center gap-2">
                <div className="relative h-28 w-full rounded-xl bg-slate-100">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-xl bg-slate-900"
                    style={{ height: `${Math.max(3, h)}%` }}
                    title={`${c.key} • ${fmtUSD(c.gross || 0)} • ${c.orders || 0} orders`}
                  />
                </div>
                <div className="text-[10px] text-slate-600">{c.key.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recent orders</div>
            <div className="text-xs text-slate-500">Shows top 8</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr className="border-b">
                <th className="py-2">Order</th>
                <th className="py-2">Created</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No orders yet (dev data empty).
                  </td>
                </tr>
              ) : (
                orders.map((o: any, i: number) => (
                  <tr key={o.id ?? i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{o.id ?? `order-${i + 1}`}</td>
                    <td className="py-2 text-slate-600">{String(o.created_at ?? o.date ?? "-")}</td>
                    <td className="py-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {String(o.status ?? "pending")}
                      </span>
                    </td>
                    <td className="py-2 text-right">{fmtUSD(Number(o.total ?? o.final_price ?? o.amount ?? 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">Dev → Prod ready</div>
    </div>
  );
}
