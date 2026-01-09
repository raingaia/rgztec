"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sellerShell.module.css";

const NAV = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/pricing", label: "Pricing" },
  { href: "/seller/analytics", label: "Analytics" },
  { href: "/seller/hardware", label: "Hardware" },
  { href: "/seller/profile", label: "Profile" },
  { href: "/seller/summary", label: "Summary" },
];

export default function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandRow}>
          <div className={styles.brand}>RGZTEC</div>
          <div className={styles.badge}>SELLER</div>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
              >
                <span>{item.label}</span>
                <span className={styles.arrow}>→</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.miniLine} />
          <Link className={styles.ghost} href="/login">
            Switch Account
          </Link>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topLeft}>
            <div className={styles.pageTitle}>Seller Console</div>
            <div className={styles.pageSub}>Corporate operations & partner tools</div>
          </div>

          <div className={styles.topRight}>
            <button className={styles.topBtn}>New Product</button>
            <button className={styles.topBtnGhost}>Support</button>
            <div className={styles.avatar} aria-label="account">
              A
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
