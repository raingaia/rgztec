// apps/saas/app/seller/hardware/page.tsx
import Link from "next/link";

export default async function HardwareSellerHome() {
  // şimdilik dev: sonra API'den gelecek (seller profile)
  const status: "not_started" | "pending" | "approved" | "rejected" = "not_started";

  const badge = (() => {
    if (status === "approved") return "APPROVED";
    if (status === "pending") return "PENDING REVIEW";
    if (status === "rejected") return "REJECTED";
    return "NOT STARTED";
  })();

  const canAccessStore = status === "approved";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hardware Seller</h1>
          <p className="text-sm text-slate-600">
            Physical products onboarding & compliance (dev now → prod ready).
          </p>
        </div>
        <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          {badge}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Apply as Hardware Seller"
          desc="Company details, payout setup, policies, category scope."
          cta="Start / Edit Application"
          href="/seller/hardware/apply"
        />

        <Card
          title="Application Status"
          desc="Track review progress and requested changes."
          cta="View Status"
          href="/seller/hardware/status"
        />
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">After approval</div>
        <div className="mt-1 text-xs text-slate-500">
          Store setup and product listings become available when your application is approved.
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DisabledCard
            enabled={canAccessStore}
            title="Store Settings"
            desc="Branding, shipping regions, return policy, support contacts."
            href="/seller/hardware/store"
          />
          <DisabledCard
            enabled={canAccessStore}
            title="Products"
            desc="Add hardware products, inventory, pricing, shipping profiles."
            href="/seller/hardware/products"
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  desc,
  cta,
  href,
}: {
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function DisabledCard({
  enabled,
  title,
  desc,
  href,
}: {
  enabled: boolean;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${enabled ? "bg-white" : "bg-slate-50"}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
      <div className="mt-4">
        {enabled ? (
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Open
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-400">
            Locked (needs approval)
          </span>
        )}
      </div>
    </div>
  );
}
