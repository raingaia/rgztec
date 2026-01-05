export default function Unauthorized({ searchParams }: { searchParams: any }) {
  const need = searchParams?.need || "";
  const have = searchParams?.have || "";
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Unauthorized</h1>
      <p style={{ opacity: 0.8 }}>Need: <b>{need}</b> — Have: <b>{have}</b></p>
      <p style={{ marginTop: 16, opacity: 0.8 }}>
        Dev test: set cookie <code>rgz_role</code> to <code>buyer</code>, <code>seller</code>, or <code>admin</code>.
      </p>
    </main>
  );
}
