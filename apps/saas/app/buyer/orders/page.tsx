
import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";


export default async function BuyerHome() {
  await requireRole(["buyer"]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="mt-1 text-sm opacity-70">
          Orders, marketplace, profile — all in one place.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/buyer/orders"
          className="rounded-xl border bg-white p-4 transition hover:shadow-sm"
        >
          <div className="font-semibold">My Orders</div>
          <div className="text-sm opacity-70">Track purchases & invoices</div>
        </Link>

        <Link
          href="/buyer/marketplace"
          className="rounded-xl border bg-white p-4 transition hover:shadow-sm"
        >
          <div className="font-semibold">Marketplace</div>
          <div className="text-sm opacity-70">Browse digital products</div>
        </Link>

        <Link
          href="/buyer/profile"
          className="rounded-xl border bg-white p-4 transition hover:shadow-sm"
        >
          <div className="font-semibold">Account Settings</div>
          <div className="text-sm opacity-70">Profile & preferences</div>
        </Link>
      </section>
    </main>
  );
}

