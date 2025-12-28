// apps/modules/search.js
import Engine from "/apps/core/engine.js";

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));}

function css(){
  return `
  .wrap{display:grid; gap:14px}
  .card{
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
    border-radius:18px;
    padding:16px;
  }
  .title{margin:0; font-size:16px; font-weight:1000}
  .sub{margin:6px 0 0; color:rgba(233,238,252,.68); font-size:13px; line-height:1.6}
  .searchRow{display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-top:10px}
  input{
    flex:1;
    min-width: 280px;
    height:44px;
    border-radius:999px;
    border:1.5px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.22);
    color:#e9eefc;
    padding:10px 14px;
    outline:none;
  }
  input:focus{ border-color: rgba(0,255,163,.35); box-shadow:0 0 0 3px rgba(0,255,163,.10) }
  .btn{
    height:44px; padding:0 14px; border-radius:999px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color:#e9eefc; cursor:pointer; font-weight:1000;
  }
  .grid{
    display:grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap:12px;
  }
  .cardx{
    border:1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.18);
    border-radius:16px;
    padding:12px;
    display:flex;
    flex-direction:column;
    gap:8px;
    min-height: 120px;
  }
  .tag{font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:rgba(233,238,252,.62); font-weight:1000}
  .h{font-weight:1000}
  .m{color:rgba(233,238,252,.70); font-size:12px; line-height:1.5}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-size:12px; color:rgba(233,238,252,.65)}
  .cardx a.btn{height:36px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center}
  @media (max-width: 1100px){ .grid{grid-template-columns: repeat(2, minmax(0, 1fr));} }
  @media (max-width: 720px){ .grid{grid-template-columns: 1fr;} }
  `;
}

export default {
  async render(root, ctx){
    const db = Engine.getDB();
    const qs = ctx.qs || new URLSearchParams(location.search);
    const initial = qs.get("q") || "";

    root.innerHTML = `
      <style>${css()}</style>
      <div class="wrap">
        <div class="card">
          <div class="title">Global Search</div>
          <div class="sub">Scans products + sections across all stores (MVP). Minimum 2 chars.</div>
          <div class="searchRow">
            <input id="q" type="search" placeholder="Search… (e.g., dashboard, ai, wordpress)" value="${esc(initial)}"/>
            <button class="btn" id="go">Search</button>
          </div>
        </div>

        <div class="card">
          <div class="sub" id="meta">Ready.</div>
          <div class="grid" id="grid"></div>
        </div>
      </div>
    `;

    const q = root.querySelector("#q");
    const grid = root.querySelector("#grid");
    const meta = root.querySelector("#meta");

    function renderResults(list, query){
      if (!query || query.trim().length < 2){
        meta.textContent = "Enter at least 2 characters.";
        grid.innerHTML = "";
        return;
      }

      meta.textContent = `${list.length} result(s) for “${query}”`;
      if (!list.length){
        grid.innerHTML = `<div class="m" style="grid-column:1/-1; padding:12px; color:rgba(233,238,252,.65)">No matches.</div>`;
        return;
      }

      grid.innerHTML = list.map(item => {
        const tag = item.type === "product" ? "Product" : "Section";
        const url = item.url || "#";
        const external = !!item.isExternal;
        const store = item.storeSlug || "-";
        return `
          <div class="cardx">
            <div class="tag">${esc(tag)} • ${esc(store)}</div>
            <div class="h">${esc(item.title || "")}</div>
            <div class="m">${esc(item.tagline || "")}</div>
            <div class="mono">${esc(item.path || "")}</div>
            <div style="display:flex; gap:10px; margin-top:auto; flex-wrap:wrap;">
              <a class="btn" href="${esc(url)}" ${external ? 'target="_blank" rel="noopener"' : ""}>Open</a>
              ${external ? "" : `<a class="btn" href="/apps/seller?store=${encodeURIComponent(store)}">Edit Store</a>`}
            </div>
          </div>
        `;
      }).join("");
    }

    function run(){
      const query = q.value || "";
      const list = Engine.search(db, query, { limit: 200 });
      renderResults(list, query.trim());
      // push state for sharable URL
      const u = new URL(location.href);
      u.searchParams.set("q", query.trim());
      history.replaceState({}, "", u.toString());
    }

    root.querySelector("#go").addEventListener("click", run);
    q.addEventListener("keydown", (e)=>{ if (e.key === "Enter") run(); });
    if (initial) run();
  }
};
