// apps/web/app/layout.tsx
import Link from "next/link";
import "./globals.css";

export const metadata = { title: "RGZTEC Marketplace" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <header style={{ borderBottom: "1px solid #eee", padding: "12px 16px" }}>
          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/">RGZTEC</Link>
            <Link href="/gift-cards">Gift Cards</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/licensing">Licensing</Link>
          </nav>
        </header>
        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}

