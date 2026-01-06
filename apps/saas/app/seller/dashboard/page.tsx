// apps/saas/app/seller/dashboard/page.tsx
export default function SellerDashboard() {
  return (
    <main style={styles.page}>
      {/* Top Command Bar */}
      <header style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <div style={styles.brandDot} />
          <div>
            <div style={styles.topTitle}>RGZTEC Seller • Enterprise Console</div>
            <div style={styles.topSub}>
              Command Center • Region: Global • Period: Last 30 days • Role: Seller
            </div>
          </div>
        </div>

        <div style={styles.topbarRight}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌘</span>
            <input
              placeholder="Search orders, products, customers…"
              style={styles.search}
            />
          </div>

          <button style={{ ...styles.btn, ...styles.btnPrimary }}>New Product</button>
          <button style={styles.btn}>Review Orders</button>
          <button style={styles.btn}>Payouts</button>

          <div style={styles.avatar}>AO</div>
        </div>
      </header>

      {/* Content Grid */}
      <section style={styles.grid}>
        {/* Left: KPIs + Signals + Recent Orders */}
        <div style={styles.leftCol}>
          <div style={styles.sectionHead}>
            <div>
              <div style={styles.h1}>Command Center</div>
              <div style={styles.lead}>
                Operational overview for orders, products, payouts, and platform status.
              </div>
            </div>
            <div style={styles.pillRow}>
              <span style={styles.pill}>Uptime 99.98%</span>
              <span style={styles.pill}>Latency 128ms</span>
              <span style={styles.pillWarn}>2 Action Required</span>
            </div>
          </div>

          {/* KPI Row */}
          <div style={styles.kpiRow}>
            <KpiCard title="Gross Volume (30d)" value="$128,420" meta="Global • All channels" delta="+12.4%" />
            <KpiCard title="Net Revenue (30d)" value="$94,110" meta="After fees & refunds" delta="+8.1%" />
            <KpiCard title="Open Orders" value="38" meta="7 urgent (SLA &lt; 24h)" delta="SLA 97%" />
            <KpiCard title="Payout Balance" value="$18,740" meta="Next payout: Fri" delta="Verified" />
          </div>

          {/* Signals */}
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardTitle}>Signals • Operational</div>
              <div style={styles.cardHint}>Actionable items from orders, listings, payments</div>
            </div>
            <div style={styles.signalList}>
              <Signal kind="warn" title="2 listings require compliance fields" desc="Add SKU + license metadata to publish in Enterprise Stores." />
              <Signal kind="info" title="7 orders approaching SLA window" desc="Review addresses / shipping labels before escalation." />
              <Signal kind="ok" title="No payment provider incidents detected" desc="Last 24h • Stripe: OK • Webhooks: OK" />
            </div>
          </div>

          {/* Recent Orders */}
          <div style={styles.card}>
            <div style={styles.cardHeadRow}>
              <div>
                <div style={styles.cardTitle}>Recent Orders</div>
                <div style={styles.cardHint}>Last activity across all storefronts</div>
              </div>
              <button style={styles.linkBtn}>Open →</button>
            </div>

            <div style={styles.table}>
              <div style={styles.thead}>
                <div>Order</div><div>Customer</div><div>Total</div><div>Status</div><div>When</div>
              </div>
              <Row order="RGZ-19421" customer="A. Demir" total="$120.00" status="Paid" when="Today" />
              <Row order="RGZ-19420" customer="S. Kaya" total="$80.00" status="Pending" when="Yesterday" />
              <Row order="RGZ-19419" customer="M. Yılmaz" total="$240.00" status="Paid" when="Yesterday" />
              <Row order="RGZ-19418" customer="E. Aslan" total="$19.00" status="Refunded" when="2d ago" />
            </div>
          </div>
        </div>

        {/* Right: Platform Health + Top Products */}
        <aside style={styles.rightCol}>
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardTitle}>API & Platform Health</div>
              <div style={styles.cardHint}>Internal platform diagnostics</div>
            </div>

            <div style={styles.healthGrid}>
              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>API Status</div>
                <div style={styles.healthValueOk}>Operational</div>
              </div>
              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>Orders Service</div>
                <div style={styles.healthValueOk}>OK</div>
              </div>
              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>Payments</div>
                <div style={styles.healthValueOk}>OK</div>
              </div>
              <div style={styles.healthItem}>
                <div style={styles.healthLabel}>Webhooks</div>
                <div style={styles.healthValueWarn}>Degraded</div>
              </div>
            </div>

            <button style={{ ...styles.btn, width: "100%", marginTop: 12 }}>
              Request reconciliation
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeadRow}>
              <div>
                <div style={styles.cardTitle}>Top Products</div>
                <div style={styles.cardHint}>Revenue leaders (30d)</div>
              </div>
              <button style={styles.linkBtn}>Manage →</button>
            </div>

            <div style={styles.prodList}>
              <Prod name="AI Tools Starter Pack" sku="AT-001" price="$2,050" sales="42" />
              <Prod name="Hardware Lab Bundle" sku="HL-014" price="$1,420" sales="21" />
              <Prod name="UI Kit Pro" sku="UI-122" price="$1,180" sales="18" />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

/* ---------- Components ---------- */

function KpiCard({ title, value, meta, delta }: { title: string; value: string; meta: string; delta: string }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiMeta}>{meta}</div>
      <div style={styles.kpiDelta}>{delta}</div>
    </div>
  );
}

function Signal({ kind, title, desc }: { kind: "ok" | "info" | "warn"; title: string; desc: string }) {
  const badge =
    kind === "ok" ? styles.badgeOk : kind === "warn" ? styles.badgeWarn : styles.badgeInfo;

  return (
    <div style={styles.signal}>
      <div style={badge}>{kind.toUpperCase()}</div>
      <div>
        <div style={styles.signalTitle}>{title}</div>
        <div style={styles.signalDesc}>{desc}</div>
      </div>
    </div>
  );
}

function Row({ order, customer, total, status, when }: any) {
  const s =
    status === "Paid" ? styles.statusPaid :
    status === "Pending" ? styles.statusPending :
    styles.statusRefunded;

  return (
    <div style={styles.tr}>
      <div style={styles.mono}>{order}</div>
      <div>{customer}</div>
      <div>{total}</div>
      <div><span style={s}>{status}</span></div>
      <div style={styles.muted}>{when}</div>
    </div>
  );
}

function Prod({ name, sku, price, sales }: any) {
  return (
    <div style={styles.prod}>
      <div>
        <div style={styles.prodName}>{name}</div>
        <div style={styles.prodSku}>SKU: <span style={styles.mono}>{sku}</span></div>
      </div>
      <div style={styles.prodMeta}>
        <div style={styles.mono}>{price}</div>
        <div style={styles.muted}>Sales: {sales}</div>
      </div>
    </div>
  );
}

/* ---------- Styles (enterprise / store-core aligned) ---------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,0.06), transparent 60%), #0b1220",
    color: "rgba(255,255,255,0.92)",
    padding: 22,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 14px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "rgba(120,180,255,0.95)",
    boxShadow: "0 0 0 6px rgba(120,180,255,0.15)",
  },
  topTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 0.2 },
  topSub: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    minWidth: 360,
  },
  searchIcon: { fontSize: 12, opacity: 0.6 },
  search: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },

  btn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.9)",
    padding: "10px 12px",
    borderRadius: 14,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    background: "rgba(120,180,255,0.16)",
    border: "1px solid rgba(120,180,255,0.35)",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.65fr",
    gap: 18,
    marginTop: 18,
    alignItems: "start",
  },
  leftCol: { display: "flex", flexDirection: "column", gap: 16 },
  rightCol: { display: "flex", flexDirection: "column", gap: 16 },

  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  h1: { fontSize: 44, fontWeight: 800, letterSpacing: -0.6 },
  lead: { fontSize: 13, opacity: 0.75, marginTop: 8, maxWidth: 720 },

  pillRow: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  pill: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    opacity: 0.9,
  },
  pillWarn: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,140,80,0.10)",
    border: "1px solid rgba(255,140,80,0.28)",
  },

  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  kpi: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 26px rgba(0,0,0,0.22)",
  },
  kpiTitle: { fontSize: 12, opacity: 0.7, fontWeight: 700 },
  kpiValue: { fontSize: 26, fontWeight: 900, marginTop: 8, letterSpacing: -0.3 },
  kpiMeta: { fontSize: 12, opacity: 0.7, marginTop: 6 },
  kpiDelta: { fontSize: 12, marginTop: 10, opacity: 0.9 },

  card: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 26px rgba(0,0,0,0.22)",
  },
  cardHead: { marginBottom: 12 },
  cardHeadRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 800, letterSpacing: 0.2 },
  cardHint: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(180,220,255,0.95)",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    padding: 6,
  },

  signalList: { display: "flex", flexDirection: "column", gap: 10 },
  signal: { display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, alignItems: "start" },
  signalTitle: { fontSize: 13, fontWeight: 800 },
  signalDesc: { fontSize: 12, opacity: 0.75, marginTop: 4 },
  badgeOk: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(80,220,160,0.12)",
    border: "1px solid rgba(80,220,160,0.30)",
    textAlign: "center",
  },
  badgeInfo: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(120,180,255,0.12)",
    border: "1px solid rgba(120,180,255,0.30)",
    textAlign: "center",
  },
  badgeWarn: {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,140,80,0.12)",
    border: "1px solid rgba(255,140,80,0.30)",
    textAlign: "center",
  },

  table: { display: "flex", flexDirection: "column", gap: 8 },
  thead: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr 0.7fr 0.8fr 0.7fr",
    gap: 10,
    fontSize: 12,
    opacity: 0.65,
    fontWeight: 800,
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  tr: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr 0.7fr 0.8fr 0.7fr",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  statusPaid: { padding: "5px 10px", borderRadius: 999, background: "rgba(80,220,160,0.12)", border: "1px solid rgba(80,220,160,0.26)", fontSize: 12, fontWeight: 800 },
  statusPending: { padding: "5px 10px", borderRadius: 999, background: "rgba(120,180,255,0.12)", border: "1px solid rgba(120,180,255,0.26)", fontSize: 12, fontWeight: 800 },
  statusRefunded: { padding: "5px 10px", borderRadius: 999, background: "rgba(255,140,80,0.12)", border: "1px solid rgba(255,140,80,0.26)", fontSize: 12, fontWeight: 800 },

  healthGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 },
  healthItem: { padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" },
  healthLabel: { fontSize: 12, opacity: 0.7, fontWeight: 800 },
  healthValueOk: { marginTop: 8, fontSize: 14, fontWeight: 900 },
  healthValueWarn: { marginTop: 8, fontSize: 14, fontWeight: 900, opacity: 0.95 },

  prodList: { display: "flex", flexDirection: "column", gap: 10 },
  prod: { display: "flex", justifyContent: "space-between", gap: 12, padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" },
  prodName: { fontSize: 13, fontWeight: 900 },
  prodSku: { fontSize: 12, opacity: 0.75, marginTop: 4 },
  prodMeta: { textAlign: "right", display: "flex", flexDirection: "column", gap: 4 },

  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
  muted: { opacity: 0.7 },
};

