"use client";
import React from "react";
import Shell from "@src/modules/_ui/Shell";

export default function BuyerCheckout() {
  const [agree, setAgree] = React.useState(false);

  return (
    <Shell variant="buyer" section="buyer_checkout">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Payment</div>
          <div className="mt-3 grid gap-2">
            <input className="rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" placeholder="Card number (demo)" />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" placeholder="MM/YY" />
              <input className="rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" placeholder="CVC" />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I agree to Terms & Privacy.
          </label>

          <button
            disabled={!agree}
            className={
              agree
                ? "mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                : "mt-4 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
            }
          >
            Pay Now (demo)
          </button>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Order summary</div>
          <div className="mt-3 text-sm text-slate-600">
            This is UI only. Stripe wiring later.
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><span>Items</span><b>$118</b></div>
            <div className="mt-1 flex justify-between"><span>Fees</span><b>$0</b></div>
            <div className="mt-2 flex justify-between text-base"><span>Total</span><b>$118</b></div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

