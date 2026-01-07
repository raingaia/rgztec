import type { ReactNode } from "react";
import "./seller-core.css";      // (bu dosya seller klasöründe olacak)
import "./seller-console.css";   // (opsiyonel, senin ek stilin)

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
  <div className="rgz-seller">      {/* 🔐 GLOBAL SCOPE */}
    <div className="rgz-seller-app">
      <aside className="rgz-seller-nav">
        <div className="rgz-seller-brand">RGZTEC.</div>

        <div className="rgz-seller-section">CORE</div>
        <a className="rgz-seller-link active" href="/seller/dashboard">Dashboard</a>
        <a className="rgz-seller-link" href="/seller/products">Digital Assets</a>
        <a className="rgz-seller-link" href="/seller/orders">Sales Logs</a>

        <div className="rgz-seller-section">COMMERCE</div>
        <a className="rgz-seller-link" href="/seller/payouts">Payouts</a>
        <a className="rgz-seller-link" href="/seller/analytics">Analytics</a>

        <div className="rgz-seller-bottom">
          <a className="rgz-seller-link" href="/seller/settings">Settings</a>
        </div>
      </aside>

      <main className="rgz-seller-main">
        {children}
      </main>
    </div>
  </div>
);
}

