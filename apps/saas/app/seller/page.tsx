import Link from "next/link";
import styles from "./sellerHome.module.css";

const tiles = [
  { href: "/seller/dashboard", title: "Dashboard", desc: "KPIs, revenue, shortcuts" },
  { href: "/seller/orders", title: "Orders", desc: "Manage orders & fulfillment" },
  { href: "/seller/products", title: "Products", desc: "Add, edit, publish items" },
  { href: "/seller/pricing", title: "Pricing", desc: "Plans, fees, payout setup" },
  { href: "/seller/analytics", title: "Analytics", desc: "Charts, performance, trends" },
  { href: "/seller/profile", title: "Profile", desc: "Identity, company, verification" },
];

export default function SellerHome() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.h1}>Seller Home</h1>
        <p className={styles.p}>This is the reference hub. Same corporate language across all seller pages.</p>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kLabel}>Gross (30d)</div>
          <div className={styles.kVal}>$128,420</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kLabel}>Orders (30d)</div>
          <div className={styles.kVal}>1,284</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kLabel}>Payout</div>
          <div className={styles.kVal}>Weekly</div>
        </div>
      </div>

      <div className={styles.grid}>
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={styles.tile}>
            <div className={styles.tTitle}>{t.title}</div>
            <div className={styles.tDesc}>{t.desc}</div>
            <div className={styles.tFoot}>
              <span>Open</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

