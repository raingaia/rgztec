"use client";

import Shell from "@src/modules/_ui/Shell";

const cards = [
  { href: "/seller/settings/account", title: "Account", desc: "Store name, support email, timezone" },
  { href: "/seller/settings/security", title: "Security", desc: "2FA, sessions, login alerts" },
  { href: "/seller/settings/payouts", title: "Payouts", desc: "Stripe Connect, payout schedule" },
  { href: "/seller/settings/team", title: "Team", desc: "Invite members, roles & permissions" },
  { href: "/seller/settings/notifications", title: "Notifications", desc: "Operational & marketing emails" },
  { href: "/seller/settings/integrations", title: "Integrations", desc: "API keys, webhooks, sandbox mode" },
  { href: "/seller/settings/advanced", title: "Advanced", desc: "Exports, disable/delete store" },
];

export default function SellerSettingsOverviewPage() {
  return (
    <Shell section="settings" variant="seller">
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="rounded-2xl border bg-white p-4 hover:bg-slate-50"
          >
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="mt-1 text-sm text-slate-600">{c.desc}</div>
          </a>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
        <b>Final note:</b> These pages are UI-first. API wiring comes next (auth, Stripe, webhooks, exports).
      </div>
    </Shell>
  );
}
