import "./seller.css";
import type { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default function SellerLayout({ children }: { children: ReactNode }) {
  // TODO: later replace with real auth/session
  const user = {
    username: "Ercan Seller",
    email: "seller@rgztec.com",
    id: "RGZ-S-10294",
  };

  return (
    <div className="rgz-seller">
      <div className="app">
        <Sidebar user={user} />
        <main className="main">
          <div className="wrap">
            <Topbar title="Dashboard" subtitle="Seller operations only. Marketplace header is disabled here." />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


