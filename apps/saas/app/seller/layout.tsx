import type { ReactNode } from "react";
import "./seller-core.css";      // (bu dosya seller klasöründe olacak)
import "./seller-console.css";   // (opsiyonel, senin ek stilin)

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rgz-seller">
      <div className="rgz-seller-app">{children}</div>
    </div>
  );
}


