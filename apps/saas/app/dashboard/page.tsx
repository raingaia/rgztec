export default function Dashboard() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-extrabold">Dashboard</h1>
      <p className="mt-2 opacity-80">
        This is the RGZTEC SaaS layer. URL: <code>/app/dashboard</code>
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <a className="rounded-2xl border p-5 hover:bg-black/5" href="/app/search">Search</a>
        <a className="rounded-2xl border p-5 hover:bg-black/5" href="/app/categories">Categories</a>
        <a className="rounded-2xl border p-5 hover:bg-black/5" href="/app/billing">Billing</a>
      </div>
    </main>
  );
}
