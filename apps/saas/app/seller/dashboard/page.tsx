import Link from "next/link";
import AnalyticsChart from "../_components/AnalyticsChart";
import  Shell  from "@/modules/_ui/Shell";

type Metric = { k: string; v: string; n: string };
type OrderRow = { id: string; product: string; amount: string; status: "Paid" | "Pending" | "Failed"; date: string };
type Step = { n: number; t: string; d: string; done: boolean };

const metrics: Metric[] = [
  { k: "Gross revenue (30d)", v: "$128,420", n: "Global · All channels" },
  { k: "Net revenue (30d)", v: "$94,110", n: "After fees · payout-ready" },
  { k: "Orders (30d)", v: "1,248", n: "Avg. 41.6/day" },
  { k: "Conversion", v: "2.84%", n: "Improve listing thumbnails" },
];

const orders: OrderRow[] = [
  { id: "#RGZ-10482", product: "Sticky Header UI Kit", amount: "$29", status: "Paid", date: "Today" },
  { id: "#RGZ-10479", product: "Next.js SaaS Starter", amount: "$89", status: "Pending", date: "Yesterday" },
  { id: "#RGZ-10473", product: "Admin Dashboard Pro", amount: "$59", status: "Paid", date: "2 days ago" },
  { id: "#RGZ-10465", product: "Checkout Components", amount: "$39", status: "Failed", date: "3 days ago" },
];

const steps: Step[] = [
  { n: 1, t: "Welcome aboard", d: "Complete your seller profile.", done: true },
  { n: 2, t: "Brand settings", d: "Logo, store name, payout email.", done: true },
  { n: 3, t: "Create first product", d: "Upload files and cover image.", done: false },
  { n: 4, t: "Pricing", d: "Set price, license and tiers.", done: false },
  { n: 5, t: "Checkout", d: "Test purchase flow & receipts.", done: false },
  { n: 6, t: "Email workflow", d: "Customer email automation.", done: false },
  { n: 7, t: "Analytics", d: "Track views, CTR and conversion.", done: false },
  { n: 8, t: "Payouts", d: "Connect Stripe & schedule payouts.", done: false },
];

function statusClass(s: OrderRow["status"]) {
  if (s === "Paid") return "ok";
  if (s === "Failed") return "fail";
  return "";
}

export default function SellerDashboardPage() {
  return (
    <Shell section="dashboard" variant="seller">
      <div className="grid">
        {/* LEFT */}
        <section>
          <div className="card">
            <div className="card-h">
              <div>
                <h2>Performance snapshot</h2>
                <span>Revenue, orders & conversion — last 30 days</span>
              </div>
              <span
                className="chip"
                style={{
                  borderColor: "rgba(34,197,94,.24)",
                  background: "rgba(34,197,94,.10)",
                  color: "#166534",
                }}
              >
                ▲ +12.4%
              </span>
            </div>

            <div className="metrics">
              {metrics.map((m) => (
                <div className="metric" key={m.k}>
                  <div className="k">{m.k}</div>
                  <div className="v">{m.v}</div>
                  <div className="n">{m.n}</div>
                </div>
              ))}
            </div>

            <div className="card-h" style={{ borderTop: "1px solid var(--line)", background: "rgba(15,23,42,.01)" }}>
              <div>
                <h2>Recent orders</h2>
                <span>Latest transactions and payment status</span>
              </div>

              <Link
                href="/seller/orders"
                style={{ color: "var(--brand-600)", fontSize: 12, cursor: "pointer", fontWeight: 800 }}
              >
                View all
              </Link>
            </div>

            <div style={{ padding: "6px 14px 14px" }}>
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr className="row" key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.product}</td>
                      <td style={{ fontWeight: 900 }}>{o.amount}</td>
                      <td>
                        <span className={`status ${statusClass(o.status)}`}>
                          <span className="s-dot" />
                          {o.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)" }}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div className="card">
            <div className="card-h">
              <div>
                <h2>Getting started</h2>
                <span>Clean onboarding — same card scale, same spacing, no clutter</span>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Show less</span>
            </div>

            <div className="steps">
              {steps.map((s) => (
                <div className="step" key={s.n}>
                  {s.done && <div className="check">✓</div>}
                  <div className="num">{s.n}</div>
                  <b>{s.t}</b>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>

            <div className="note">Tip: keep product cards Etsy-level — strong thumbnail, short title, clear price, one primary CTA.</div>
          </div>
        </section>

        {/* RIGHT */}
        <aside>
          <div className="card">
            <div className="card-h">
              <div>
                <h2>Quick actions</h2>
                <span>Shortcuts for seller operations</span>
              </div>
            </div>

            <div className="actions">
              <Link className="action" href="/seller/products">
                <div className="aico">⬆</div>
                <div>
                  <b>Upload product</b>
                  <p>Add a new digital listing and assets.</p>
                </div>
              </Link>

              <Link className="action" href="/seller/pricing">
                <div className="aico">%</div>
                <div>
                  <b>Pricing rules</b>
                  <p>Create discounts, bundles and tiers.</p>
                </div>
              </Link>

              <Link className="action" href="/seller/pricing">
                <div className="aico">💳</div>
                <div>
                  <b>Payouts</b>
                  <p>View balance and payout schedule.</p>
                </div>
              </Link>

              <Link className="action" href="/seller/orders">
                <div className="aico">🛟</div>
                <div>
                  <b>Support</b>
                  <p>Refunds, disputes and tickets.</p>
                </div>
              </Link>

              <div className="card" style={{ boxShadow: "none", background: "rgba(249,115,22,.03)" }}>
                <div className="note" style={{ borderTop: "none" }}>
                  This is a static UI demo. Production: Orders → API, Products → Storage, Analytics → Events.
                </div>
              </div>
            </div>
          </div>

          <AnalyticsChart />
        </aside>
      </div>
    </Shell>
  );
}
