"use client";
import React from "react";
import Shell from "@modules/_ui/Shell";

type Member = { email: string; role: string; status: "Active" | "Invited" };

export default function SellerSettingsTeam() {
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [team, setTeam] = React.useState<Member[]>([
    { email: "raingaia@outlook.com", role: "Owner", status: "Active" },
    { email: "seller@rgztec.com", role: "Manager", status: "Active" },
    { email: "ops@rgztec.com", role: "Support", status: "Invited" },
  ]);

  function invite() {
    const e = inviteEmail.trim().toLowerCase();
    if (!e) return;
    setTeam((t) => [{ email: e, role: "Member", status: "Invited" }, ...t]);
    setInviteEmail("");
  }

  return (
    <Shell section="settings_team" variant="seller">
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite by email…"
            className="w-full rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <button onClick={invite} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
            Send invite
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.email} className="border-t">
                  <td className="px-4 py-3 font-semibold">{m.email}</td>
                  <td className="px-4 py-3">{m.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{m.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                      Manage (demo)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a href="/seller/settings" className="text-sm font-semibold text-slate-900 underline">
          ← Back to Settings
        </a>
      </div>
    </Shell>
  );
}
