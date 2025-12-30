export const SellerDashboard = (() => {
  let ROOT, SHELL, TOKEN;

  const qs = (s, r = document) => r.querySelector(s);

  const goLogin = () => {
    localStorage.removeItem("rgz_seller_token");
    location.replace("/seller/login/");
  };

  const api = async (path, opts = {}) => {
    const res = await fetch(path, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: "Bearer " + TOKEN,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw data;
    return data;
  };

  const money = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

  function shellHooks() {
    // StoreShell varsa güzelce bağlan
    SHELL?.setActiveNav?.("seller");
    SHELL?.setPageTitle?.("Seller Dashboard");
  }

  function renderShell() {
    ROOT.innerHTML = `
      <div class="sd-shell">
        <aside class="sd-side">
          <div class="sd-brand">
            <a class="sd-logo" href="/">RGZTEC</a>
            <div class="sd-sub">Seller Console</div>
          </div>

          <nav class="sd-nav">
            <a class="sd-link is-active" href="/seller/">Dashboard</a>
            <a class="sd-link" href="/store/">Marketplace</a>
            <a class="sd-link" href="/open-store.html">Store Settings</a>
            <a class="sd-link" href="/lab/">LAB</a>
          </nav>

          <div class="sd-side-foot">
            <div class="sd-mini">
              <div class="sd-mini-k">Seller</div>
              <div class="sd-mini-v" id="sdSellerId">—</div>
            </div>
            <button class="sd-btn sd-btn-soft" id="btnLogout" type="button">Logout</button>
          </div>
        </aside>

        <section class="sd-main">
          <header class="sd-top">
            <div>
              <div class="sd-title" id="sdTitle">Dashboard</div>
              <div class="sd-muted" id="sdSub">Loading…</div>
            </div>
            <div class="sd-actions">
              <button class="sd-btn sd-btn-soft" id="btnRefresh" type="button">Refresh</button>
              <button class="sd-btn sd-btn-primary" id="btnNew" type="button">New Listing</button>
            </div>
          </header>

          <section class="sd-grid sd-kpis">
            <article class="sd-card">
              <div class="k">Views</div><div class="v" id="kViews">—</div><div class="s">Last 30 days</div>
            </article>
            <article class="sd-card">
              <div class="k">Orders</div><div class="v" id="kOrders">—</div><div class="s">Last 30 days</div>
            </article>
            <article class="sd-card">
              <div class="k">Revenue</div><div class="v" id="kRevenue">—</div><div class="s">Estimated</div>
            </article>
            <article class="sd-card">
              <div class="k">Rating</div><div class="v" id="kRating">—</div><div class="s">Store score</div>
            </article>
          </section>

          <section class="sd-grid sd-two">
            <article class="sd-card sd-lg">
              <div class="hd"><h3>Recent Activity</h3><span class="pill">Live</span></div>
              <div class="list" id="sdActivity"><div class="skel">Loading…</div></div>
            </article>

            <article class="sd-card sd-lg">
              <div class="hd"><h3>Quick Actions</h3><span class="pill">Pro</span></div>
              <div class="qa">
                <button class="qabtn" id="qaProfile"><div class="t">Edit store profile</div><div class="s">Logo, description, links</div></button>
                <button class="qabtn" id="qaAdd"><div class="t">Add product</div><div class="s">Create a premium listing</div></button>
                <button class="qabtn" id="qaPayout"><div class="t">Payout settings</div><div class="s">Bank, invoices, tax</div></button>
              </div>
            </article>
          </section>

          <footer class="sd-foot">RGZTEC Seller Console • Production-minded</footer>
        </section>
      </div>
    `;
  }

  function bindUI() {
    qs("#btnLogout").onclick = goLogin;
    qs("#btnRefresh").onclick = () => load();
    qs("#btnNew").onclick = () => alert("Next: New Listing wizard (build it).");

    qs("#qaProfile").onclick = () => alert("Next: Profile editor (seller/settings).");
    qs("#qaAdd").onclick = () => alert("Next: Product create wizard.");
    qs("#qaPayout").onclick = () => alert("Next: payouts & invoices settings.");
  }

  function renderActivity(activity) {
    const host = qs("#sdActivity");
    host.innerHTML = "";
    const list = Array.isArray(activity) ? activity : [];
    if (!list.length) {
      host.innerHTML = `<div class="skel">No activity yet.</div>`;
      return;
    }
    list.slice(0, 8).forEach((a) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div>
          <div class="rt">${a.title || "Activity"}</div>
          <div class="rs">${a.sub || ""}</div>
        </div>
        <div class="rr">${a.when || ""}</div>
      `;
      host.appendChild(row);
    });
  }

  async function load() {
    try {
      const me = await api("/api/seller/me");
      const boot = await api("/api/seller/load");

      qs("#sdSellerId").textContent = me.session?.sellerId || "—";
      qs("#sdTitle").textContent = `Welcome, ${me.seller?.name || me.session?.sellerId}`;
      qs("#sdSub").textContent = "Session OK • Console Ready";

      const main = boot?.data?.main || {};
      qs("#kViews").textContent = Number(main.views30d || 0).toLocaleString("en-US");
      qs("#kOrders").textContent = Number(main.orders30d || 0).toLocaleString("en-US");
      qs("#kRevenue").textContent = money(main.revenue30d || 0);
      qs("#kRating").textContent = main.rating ?? "—";

      renderActivity(main.activity);

    } catch {
      goLogin();
    }
  }

  function mount({ root, shell }) {
    ROOT = typeof root === "string" ? qs(root) : root;
    SHELL = shell || null;
    TOKEN = localStorage.getItem("rgz_seller_token");

    if (!ROOT || !TOKEN) return goLogin();

    shellHooks();
    renderShell();
    bindUI();
    load();
  }

  return { mount };
})();
