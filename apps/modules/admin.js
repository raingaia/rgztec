// apps/modules/admin.js
import Engine from "/apps/core/engine.js";

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));}

function css(){
  return `
  .grid{display:grid; gap:14px}
  .row{display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between}
  .card{
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
    border-radius: 18px;
    padding: 16px;
  }
  .title{margin:0; font-size:16px; font-weight:1000}
  .sub{margin:6px 0 0; color:rgba(233,238,252,.68); font-size:13px; line-height:1.6}
  .kpis{display:grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap:10px; margin-top:10px}
  .kpi{
    padding:12px;
    border-radius: 16px;
    border:1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.18);
  }
  .k{font-size:12px; color:rgba(233,238,252,.62); font-weight:900; letter-spacing:.12em; text-transform:uppercase}
  .v{margin-top:8px; font-size:20px; font-weight:1000}
  .btn{
    height:40px; padding:0 12px; border-radius:12px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color:#e9eefc; cursor:pointer; font-weight:900;
  }
  .btn.primary{
    border-color: rgba(0,255,163,.30);
    background: linear-gradient(180deg, rgba(0,255,163,.20), rgba(0,255,163,.10));
  }
  .table{
    width:100%;
    border-collapse: collapse;
    overflow:hidden;
    border-radius: 16px;
    border:1px solid rgba(255,255,255,.10);
  }
  th,td{
    padding:12px 12px;
    border-bottom:1px solid rgba(255,255,255,.08);
    text-align:left;
    font-size:13px;
    color:rgba(233,238,252,.85);
  }
  th{color:rgba(233,238,252,.65); font-weight:1000; letter-spacing:.08em; text-transform:uppercase; font-size:11px}
  tr:hover td{background: rgba(255,255,255,.03)}
  .mono{font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-size:12px; color:rgba(233,238,252,.70)}
  @media (max-width: 1100px){ .kpis{grid-template-columns: repeat(2, minmax(160px, 1fr));} }
  `;
}

export default {
  async render(root, ctx){
    const s = ctx.session;
    if (!s || s.role !== "admin") { location.replace("/apps/seller"); return; }

    const db = Engine.getDB();
    const meta = Engine.getMeta();
    const sum = Engine.inventorySummary(db);

    const storeSlugs = Object.keys(db || {});
    const apps = Engine.getApplications();

    root.innerHTML = `
      <style>${css()}</style>
      <div class="grid">

        <div class="card">
          <div class="row">
            <div>
              <div class="title">Admin Command Center</div>
              <div class="sub">Inventory scan, store list, and applications review (MVP).</div>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
              <span class="mono">engine: ${esc(meta.version)}</span>
              <span class="mono">source: ${esc(meta.source)}</span>
              <button class="btn primary" id="btnReload">Reload DB</button>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi"><div class="k">Stores</div><div class="v">${sum.stores}</div></div>
            <div class="kpi"><div class="k">Total Entries</div><div class="v">${sum.totalEntries}</div></div>
            <div class="kpi"><div class="k">Applications</div><div class="v">${apps.length}</div></div>
            <div class="kpi"><div class="k">Override</div><div class="v">${meta.source.includes("override") ? "ON" : "OFF"}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="row">
            <div>
              <div class="title">Stores</div>
              <div class="sub">Open live store or edit via Seller Hub (MVP).</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Slug</th>
                <th>Entries</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${storeSlugs.map(sl=>{
                const item = db[sl] || {};
                const title = item.title || item.name || sl;
                const entries = Engine.countTree(item);
                return `
                  <tr>
                    <td><b>${esc(title)}</b></td>
                    <td class="mono">/store/${esc(sl)}/</td>
                    <td>${entries}</td>
                    <td style="display:flex; gap:10px; flex-wrap:wrap;">
                      <a class="btn" href="/apps/seller?store=${encodeURIComponent(sl)}">Edit</a>
                      <a class="btn primary" href="/store/${esc(sl)}/" target="_blank" rel="noopener">Live</a>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="row">
            <div>
              <div class="title">Open Store Applications</div>
              <div class="sub">Captured from /apps/open-store (localStorage MVP).</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Store</th>
                <th>Email</th>
                <th>Category</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${
                apps.length
                  ? apps.slice(0, 50).map(a=>`
                      <tr>
                        <td class="mono">${new Date(a.createdAt).toLocaleString()}</td>
                        <td><b>${esc(a.storeName || "-")}</b></td>
                        <td class="mono">${esc(a.email || "-")}</td>
                        <td>${esc(a.category || "-")}</td>
                        <td>${esc((a.notes || "").slice(0, 120))}</td>
                      </tr>
                    `).join("")
                  : `<tr><td colspan="5" style="color:rgba(233,238,252,.65)">No applications yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>

      </div>
    `;

    root.querySelector("#btnReload").addEventListener("click", async () => {
      await Engine.reload({ preferOverride:true });
      ctx.notify("Reloaded", "DB refreshed.");
      location.reload();
    });
  }
};
