import { requireRole } from "@/src/lib/auth/guard";
import { Shell } from "@/src/modules/_ui/Shell";

export default function BuyerHome() {
  requireRole(["buyer"]);

  return (
    <Shell title="My Account">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/orders" className="card">My Orders</a>
          <a href="/search" className="card">Search Products</a>
          <a href="/account" className="card">Account Settings</a>
        </div>
      </div>
    </Shell>
  );
}

