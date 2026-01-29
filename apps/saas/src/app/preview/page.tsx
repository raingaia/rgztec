"use client";

import Link from "next/link";
import styles from "./preview.module.css";

type Tile = {
  title: string;
  desc: string;
  href: string;
  badge?: string;
};

const tiles: Tile[] = [
  { title: "Buyer Dashboard", desc: "Overview, KPIs, recent activity, shortcuts", href: "/buyer/dashboard", badge: "Buyer" },
  { title: "Orders", desc: "Order list, filters, order detail entry", href: "/buyer/orders" },
  { title: "Settings", desc: "Account security, preferences, billing shell", href: "/buyer/settings" },
  { title: "Profile", desc: "Profile info, company, verification, docs", href: "/buyer/profile" },
];

export default function PreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <div>
            <h1 className={styles.brand}>RGZTEC</h1>
            <p className={styles.sub}>UI Preview • Buyer Area (Corporate)</p>
          </div>

          <div className={styles.actions}>
            <Link className={styles.ghost} href="/login">Login</Link>
            <Link className={styles.primary} href="/buyer/dashboard">Open Buyer</Link>
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <h2 className={styles.hTitle}>We build screens first.</h2>
            <p className={styles.hText}>
              Here we lock the look & feel (layout, typography, spacing, components). Then we split into routes and connect logic.
            </p>

            <div className={styles.kpiRow}>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Status</div>
                <div className={styles.kpiValue}>Design Locked</div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Pages</div>
                <div className={styles.kpiValue}>4 Buyer</div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Next</div>
                <div className={styles.kpiValue}>Split Routes</div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.miniCard}>
              <div className={styles.miniTitle}>Today’s Goal</div>
              <div className={styles.miniText}>Preview index approved ✅</div>
              <div className={styles.miniLine} />
              <div className={styles.miniHint}>Then: dashboard → orders → settings → profile</div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Buyer Screens</h3>
            <p className={styles.sectionSub}>Click to open routes (we will implement next)</p>
          </div>

          <div className={styles.grid}>
            {tiles.map((t) => (
              <Link key={t.title} href={t.href} className={styles.tile}>
                <div className={styles.tileTop}>
                  <div className={styles.tileTitle}>{t.title}</div>
                  {t.badge ? <span className={styles.badge}>{t.badge}</span> : null}
                </div>
                <div className={styles.tileDesc}>{t.desc}</div>
                <div className={styles.tileFoot}>
                  <span className={styles.open}>Open</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Component Style</h3>
            <p className={styles.sectionSub}>Buttons, cards, tables — same language everywhere</p>
          </div>

          <div className={styles.demoRow}>
            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>Primary Actions</div>
              <div className={styles.btnRow}>
                <button className={styles.btnPrimary}>Save Changes</button>
                <button className={styles.btnGhost}>Cancel</button>
                <button className={styles.btnSoft}>Export</button>
              </div>
            </div>

            <div className={styles.demoCard}>
              <div className={styles.demoTitle}>Table Shell</div>
              <div className={styles.table}>
                <div className={styles.tHead}>
                  <span>Order</span><span>Status</span><span>Total</span>
                </div>
                <div className={styles.tRow}>
                  <span>#RGZ-1042</span><span className={styles.pill}>Processing</span><span>$129</span>
                </div>
                <div className={styles.tRow}>
                  <span>#RGZ-1039</span><span className={styles.pillMuted}>Delivered</span><span>$89</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>RGZTEC • Corporate UI baseline</span>
        <span className={styles.dot}>•</span>
        <span>Next step: implement routes exactly like this preview</span>
      </footer>
    </div>
  );
}
