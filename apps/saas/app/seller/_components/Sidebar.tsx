"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconHome,
  IconProducts,
  IconOrders,
  IconAnalytics,
  IconPayouts,
  IconSettings,
} from "./icons";

type User = { username: string; email: string; id: string };

const nav = [
  { href: "/seller/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/seller/home", label: "Home", Icon: IconHome },
  { href: "/seller/products", label: "Products", Icon: IconProducts },
  { href: "/seller/orders", label: "Orders", Icon: IconOrders },
  { href: "/seller/analytics", label: "Analytics", Icon: IconAnalytics },
  { href: "/seller/payouts", label: "Payouts", Icon: IconPayouts },
  { href: "/seller/settings", label: "Settings", Icon: IconSettings },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="side">
      <div className="brand">
        <div className="logo" aria-hidden="true" />
        <div>
          <strong>RGZTEC</strong>
          <small>Seller Workspace</small>
        </div>
      </div>

      <div className="user">
        <div className="user-top">
          <div className="avatar" />
          <div>
            <b>{user.username}</b>
            <span>{user.email}</span>
          </div>
        </div>
        <div className="user-id">
          <span>Seller ID</span>
          <span className="chip">{user.id}</span>
        </div>
      </div>

      <nav className="nav">
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/seller/dashboard" && pathname?.startsWith(href));
          return (
            <Link key={href} href={href} className={active ? "active" : ""}>
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="spacer" />

      <div className="side-footer">
        <span style={{ color: "var(--muted)", fontSize: 12 }}>Seller account</span>
        <button
          className="btn-ghost"
          onClick={() => alert("Logout (demo)")}
          type="button"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
