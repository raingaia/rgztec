import type { ReactNode } from "react";
import "../globals.css";
import "./seller-core.css"; // ✅ bizim kurumsal core css burada

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="rgz-seller">{children}</body>
    </html>
  );
}
