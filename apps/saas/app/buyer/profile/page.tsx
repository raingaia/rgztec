"use client";
import React from "react";
import Shell from "@src/modules/_ui/Shell";

export default function BuyerProfile() {
  const [twoFA, setTwoFA] = React.useState(false);

  return (
    <Shell variant="buyer" section="buyer_profile">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Account</div>
          <div className="mt-3 text-sm text-slate-600">
            Email: <span className="font-semibold text-slate-900">raingaia@outlook.com</span>
          </div>
          <button className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Edit profile
          </button>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Security</div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <div className="text-sm font-semibold">Two-factor authentication</div>
              <div className="text-xs text-slate-600">Protect account sign-in</div>
            </div>
            <button
              onClick={() => setTwoFA((v) => !v)}
              className={
                twoFA
                  ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-white"
              }
            >
              {twoFA ? "Enabled" : "Enable"}
            </button>
          </div>

          <button className="mt-4 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Reset password
          </button>
        </div>
      </div>
    </Shell>
  );
}


