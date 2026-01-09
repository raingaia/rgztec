export default function LoginPage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>
      <p>Temporary login page (MVP)</p>

      <form action="/api/auth/login" method="post" style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" type="password" />
        <button type="submit">Sign in</button>
      </form>

      <p style={{ marginTop: 16 }}>
        <a href="/seller/dashboard">Go Seller Dashboard</a>
      </p>
    </main>
  );
}

