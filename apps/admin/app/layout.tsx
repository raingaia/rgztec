export const metadata = { title: "RGZTEC Admin" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <header style={{ padding: "12px 20px", borderBottom: "1px solid #eee" }}>
          <a href="/" style={{ fontWeight: 700 }}>Admin</a>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
