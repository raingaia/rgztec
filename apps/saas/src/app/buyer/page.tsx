"use client";
import Shell from "@modules/_ui/Shell";

export default function BuyerHome() {
  return (
    <Shell variant="buyer" section="buyer_marketplace">
      <div className="grid gap-3 md:grid-cols-2">
        <a className="rounded-2xl border p-4 hover:bg-slate-50" href="/buyer/marketplace">
          <div className="font-semibold">Go to Marketplace</div>
          <div className="mt-1 text-sm text-slate-600">Browse products & bundles</div>
        </a>
        <a className="rounded-2xl border p-4 hover:bg-slate-50" href="/buyer/orders">
          <div className="font-semibold">View Orders</div>
          <div className="mt-1 text-sm text-slate-600">Downloads & receipts</div>
        </a>
      </div>
    </Shell>
  );
}
