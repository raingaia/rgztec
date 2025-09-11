export const metadata = { title: "RGZTEC Web" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{fontFamily:"system-ui", margin:0}}>
        <header style={{padding:"12px 20px", borderBottom:"1px solid #eee", display:"flex", gap:16}}>
          <a href="/" style={{fontWeight:700}}>RGZTEC</a>
          <nav style={{display:"flex", gap:12}}>
            <a href="/products">Ürünler</a>
            <a href="/checkout">Satın Al</a>
            <a href="/wallet">Cüzdan</a>
          </nav>
        </header>
        <main style={{padding:24}}>{children}</main>
      </body>
    </html>
  );
}
