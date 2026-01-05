export default function UnauthorizedPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ margin: 0 }}>Unauthorized</h1>
      <p style={{ opacity: 0.8 }}>
        Bu sayfaya erişim yetkin yok. Lütfen uygun role ile giriş yap.
      </p>
    </main>
  );
}
