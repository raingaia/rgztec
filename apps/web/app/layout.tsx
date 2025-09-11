export const metadata = { title: "RGZTEC Web" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <header
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: 16
          }}
        >
          <a href="/" style={{ fontWeight: 700 }}>RGZTEC</a>
          <nav style={{ display: "flex", gap: 12 }}>
            <a href="/products">Products</a>
            <a href="/checkout">Checkout</a>
            <a href="/wallet">Wallet</a>
          </nav>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
