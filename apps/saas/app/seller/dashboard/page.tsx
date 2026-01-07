// apps/saas/app/seller/dashboard/page.tsx
type Metric = { label: string; value: string; note?: string };

const metrics: Metric[] = [
  { label: "Gross Revenue (30d)", value: "$128,420", note: "Global · All channels" },
  { label: "Net Revenue (30d)", value: "$94,110", note: "After fees & refunds" },
  { label: "Open Orders", value: "38", note: "7 urgent (SLA < 2h)" },
  { label: "Payout Balance", value: "$18,740", note: "Next payout: Fri" },
];

export default function SellerDashboardPage() {
  return (
    <div className="store-body">
      <header className="store-header">
        <div className="store-header-inner">
          <div className="store-header-left">
            <a className="store-header-logo" href="/seller/dashboard">RGZTEC</a>

            <button className="store-header-categories-btn" type="button">
              <svg className="store-header-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" />
              </svg>
              <span>Console</span>
            </button>
          </div>

          <div className="store-header-center">
            <div className="store-header-search">
              <input placeholder="Search orders, products, customers…" />
              <button aria-label="Search" type="button">
                <svg className="store-header-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="store-header-right">
            <div className="store-header-secondary">
              <a className="store-header-secondary-link" href="/seller/products">Products</a>
              <a className="store-header-secondary-link" href="/seller/orders">Orders</a>
              <a className="store-header-secondary-link" href="/seller/analytics">Analytics</a>
            </div>

            <div className="store-header-actions">
              <a className="store-header-icon-pill" href="/seller/settings" aria-label="Settings">
                <svg className="store-header-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" />
                  <path
                    d="M19.4 15a7.9 7.9 0 0 0 .1-6l-2 1.2a6 6 0 0 0-1.4-1.4l1.2-2a7.9 7.9 0 0 0-6-.1l.3 2.3a6 6 0 0 0-2 0l.3-2.3a7.9 7.9 0 0 0-6 .1l1.2 2a6 6 0 0 0-1.4 1.4l-2-1.2a7.9 7.9 0 0 0 .1 6l2-1.2a6 6 0 0 0 1.4 1.4l-1.2 2a7.9 7.9 0 0 0 6 .1l-.3-2.3a6 6 0 0 0 2 0l-.3 2.3a7.9 7.9 0 0 0 6-.1l-1.2-2a6 6 0 0 0 1.4-1.4l2 1.2Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <a className="store-header-cta" href="/seller/products/new">
                Deploy New Asset →
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="store-hero" style={{ paddingTop: "2.5rem" }}>
        <div className="store-hero-inner" style={{ alignItems: "flex-start" }}>
          <div className="store-hero-left" style={{ maxWidth: 680 }}>
            <span className="store-badge">Enterprise Console</span>
            <h1 style={{ marginBottom: "0.75rem" }}>Seller Command Center</h1>
            <p className="store-hero-tagline" style={{ marginBottom: "0.75rem" }}>
              Global operations, digital assets, orders, payouts — unified.
            </p>
            <p className="store-hero-description" style={{ maxWidth: 560 }}>
              This console uses RGZTEC Store Core design language for a consistent, sponsor-ready enterprise appearance.
            </p>
          </div>

          <div className="store-hero-right">
            <div className="shop-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              {metrics.map((m) => (
                <div key={m.label} className="shop-card">
                  <div className="shop-card-body">
                    <div className="shop-card-tagline" style={{ marginBottom: 8 }}>
                      {m.label}
                    </div>
                    <div className="shop-card-title" style={{ fontSize: "1.6rem" }}>
                      {m.value}
                    </div>
                    <div className="shop-card-tagline" style={{ marginTop: 10 }}>
                      {m.note ?? ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="store-products">
        <div className="store-products-header">
          <h2>Operational Overview</h2>
        </div>

        <div className="products-grid">
          <div className="product-card">
            <div className="product-body">
              <div className="product-title">Recent Orders</div>
              <div className="product-tagline">Last 24h activity. (Wire real data later)</div>
              <div className="product-price">View Orders →</div>
            </div>
          </div>

          <div className="product-card">
            <div className="product-body">
              <div className="product-title">Digital Assets</div>
              <div className="product-tagline">Upload, version, license and publish assets in one place.</div>
              <div className="product-price">Manage Products →</div>
            </div>
          </div>

          <div className="product-card">
            <div className="product-body">
              <div className="product-title">Payouts</div>
              <div className="product-tagline">Stripe-ready payout center & compliance ledger.</div>
              <div className="product-price">Open Payouts →</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


