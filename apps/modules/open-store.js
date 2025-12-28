// apps/modules/open-store.js
import Engine from "/apps/core/engine.js";

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));}

function css(){
  return `
  .grid{display:grid; gap:14px}
  .card{
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
    border-radius:18px;
    padding:16px;
  }
  .title{margin:0; font-size:16px; font-weight:1000}
  .sub{margin:6px 0 0; color:rgba(233,238,252,.68); font-size:13px; line-height:1.6}
  .form{display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px}
  .lbl{font-size:12px; color:rgba(233,238,252,.75); font-weight:900; margin:8px 0 6px}
  .inp{
    height:44px; width:100%;
    border-radius:12px;
    border:1.5px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.22);
    color:#e9eefc;
    padding:10px 12px;
    outline:none;
  }
  .inp:focus{ border-color: rgba(0,255,163,.35); box-shadow: 0 0 0 3px rgba(0,255,163,.10) }
  textarea{
    width:100%;
    min-height:140px;
    border-radius:16px;
    border:1.5px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.22);
    color:#e9eefc;
    padding:12px;
    outline:none;
    resize: vertical;
    grid-column: 1 / -1;
  }
  .row{display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:flex-end; margin-top:12px}
  .btn{
    height:42px; padding:0 14px; border-radius:12px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color:#e9eefc; cursor:pointer; font-weight:1000;
  }
  .btn.primary{
    border-color: rgba(0,255,163,.30);
    background: linear-gradient(180deg, rgba(0,255,163,.20), rgba(0,255,163,.10));
  }
  @media(max-width: 980px){ .form{grid-template-columns:1fr} }
  `;
}

export default {
  async render(root, ctx){
    root.innerHTML = `
      <style>${css()}</style>
      <div class="grid">
        <div class="card">
          <div class="title">Open a Store</div>
          <div class="sub">Apply to become a seller on RGZTEC. (MVP stores locally; later API approval flow.)</div>

          <div class="form">
            <div>
              <div class="lbl">Store Name</div>
              <input class="inp" id="storeName" placeholder="Acme Digital Lab" />
            </div>
            <div>
              <div class="lbl">Email</div>
              <input class="inp" id="email" placeholder="owner@acme.com" />
            </div>
            <div>
              <div class="lbl">Category</div>
              <input class="inp" id="category" placeholder="Templates, Hardware, AI Tools..." />
            </div>
            <div>
              <div class="lbl">Portfolio / Website</div>
              <input class="inp" id="site" placeholder="https://..." />
            </div>

            <div style="grid-column:1/-1">
              <div class="lbl">Notes</div>
              <textarea id="notes" placeholder="Tell us what you’ll sell and what quality level you aim for…"></textarea>
            </div>
          </div>

          <div class="row">
            <a class="btn" href="/">Back to Marketplace</a>
            <button class="btn primary" id="submit">Submit Application</button>
          </div>

          <div class="sub" id="msg" style="margin-top:10px"></div>
        </div>
      </div>
    `;

    const storeName = root.querySelector("#storeName");
    const email = root.querySelector("#email");
    const category = root.querySelector("#category");
    const site = root.querySelector("#site");
    const notes = root.querySelector("#notes");
    const msg = root.querySelector("#msg");

    root.querySelector("#submit").addEventListener("click", () => {
      const s = String(storeName.value || "").trim();
      const e = String(email.value || "").trim().toLowerCase();
      if (!s || !e) { msg.textContent = "Store name and email are required."; return; }

      const app = Engine.addApplication({
        storeName: s,
        email: e,
        category: String(category.value || "").trim(),
        site: String(site.value || "").trim(),
        notes: String(notes.value || "").trim(),
      });

      ctx.notify("Application submitted", app.id);
      msg.textContent = `Submitted ✅ (ID: ${app.id}). Admin can review in /apps/admin.`;
      storeName.value = email.value = category.value = site.value = notes.value = "";
    });
  }
};
