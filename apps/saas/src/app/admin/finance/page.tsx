"use client";

import React, { useState } from "react";
// Import yolunu @/ ile standardize edelim, bazen @src alias çakışması yapabilir
import Shell from "@/modules/_ui/Shell";

export default function AdminFinancePage() {
  const [payoutsOn, setPayoutsOn] = useState(true);

  return (
    <Shell variant="admin" section="admin_finance">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Payout Controls */}
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Payout controls</div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <div className="text-sm font-semibold">Auto payouts</div>
              <div className="text-xs text-slate-600">Enable scheduled payouts</div>
            </div>
            <button
              type="button" // Next.js 16'da buton tipi belirtmek iyi bir pratiktir
              onClick={() => setPayoutsOn((v) => !v)}
              className={
                payoutsOn
                  ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-white"
              }
            >
              {payoutsOn ? "On" : "Off"}
            </button>
          </div>
        </div>

        {/* Settlement Summary */}
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Settlement summary</div>
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <span>Gross</span>
              <span className="font-bold">$128,420</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Fees</span>
              <span className="font-bold">$34,310</span>
            </div>
            <div className="mt-2 flex justify-between text-base">
              <span>Net</span>
              <span className="font-bold">$94,110</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}