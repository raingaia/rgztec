// apps/modules/seller-hub.js
import Engine from "/apps/core/engine.js";

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));}

function css(){
  return `
  .grid{display:grid; gap:14px}
  .row{display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between}
  .card{
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
    border-radius:18px;
    padding:16px;
  }
  .title{margin:0; font-size:16px; font-weight:1000}
  .sub{margin:6px 0 0; color:rgba(233,238,252,.68); font-size:13px; line-height:1.6}
  .pill{
    display:inline-flex; align-items:center; gap:8px;
    padding:8px 10px; border-radius:999px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.22);
    font-size:12px; color: rgba(233,238,252,.70);
  }
  .btn{
    height:40px; padding:0 12px;
    border-radius:12px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color:#e9eefc; cursor:pointer; font-weight:900;
  }
  .btn:hover{transform: translateY(-1px)}
  .btn.primary{
    border-color: rgba(0,255,163,.30);
    background: linear-gradient(180deg, rgba(0,255,163,.20), rgba(0,255,163,.10));
  }
  .btn.warn{
    border-color: rgba(255,204,102,.35);
    background: linear-gradient(180deg, rgba(255,204,102,.14), rgba(255,204,102,.08));
  }
  .btn.danger{
    border-color: rgba(255,107,107,.35);
    background: linear-gradient(180deg, rgba(255,107,107,.14), rgba(255,107,107,.08));
  }
  .split{
    display:grid;
    grid-template-columns: 1.05fr .95fr;
    gap:14px;
    align-items:start;
  }
  textarea{
    width:100%;
    min-height:520px;
    resize: vertical;
    border-radius:16px;
    border:1px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.25);
    color:#e9eefc;
    padding:12px;
    outline:none;
    font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
    font-size:12.5px;
    line-height:1.55;
  }
  textarea:focus{ border-color: rgba(0,255,163,.35); box-shadow: 0 0 0 3px rgba(0,255,163,.10) }
  .list{display:grid; gap:10px}
  .item{
    padding:12px;
    border-radius:16px;
    border:1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.18);
  }
  .item b{font-weight:1000}
  .meta{margin-top:6px; color:rgba(233,238,252,.65); font-size:12px; line-height:1.6}
  @media (max-width: 1100px){ .split{grid-template-columns:1fr} textarea{min-height:420px} }
  `;
}

function downloadText(filename, text){
  const blob = new Blob([text], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default {
  async render(root, ctx){
    const s = ctx.session;
    if (!s) { location.replace("/apps/signin"); return; }

    const db = Engine.getDB();
    const meta = Engine.getMeta();
    const summary = Engine.inventorySummary(db);

    // seller scope store selection (MVP):
    // if sellerId matches a store slug, open that store. Otherwise let pick any.
    const sellerPreferred = s.sellerId || "";
    const storeSlugs = Object.keys(db || {});
    const defaultStore = storeSlugs.includes(sellerPreferred) ? sellerPreferred : (storeSlugs[0] || "");

    root.innerHTML = `
      <style>${css()}</style>
      <div class="grid">

        <div class="card">
          <div class="row">
            <div>
              <div class="title">Seller Hub</div>
              <div class="sub">
                Edit store JSON (MVP). <b>Sync</b> writes a local override. Later: API commit/publish.
              </div>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
              <span class="pill">source: <b>${esc(meta.source)}</b></span>
              <span class="pill">stores: <b>${summary.stores}</b></span>
              <span class="pill">entries: <b>${summary.totalEntries}</b></span>
            </div>
          </div>
        </div>

        <div class="split">
          <div class="card">
            <div class="row">
              <div>
                <div class="title">JSON Editor</div>
                <div class="sub">Store: <b id="storeName">${esc(defaultStore)}</b></div>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                <select id="storeSelect" class="btn" style="height:40px; padding:0 10px;">
                  ${storeSlugs.map(sl=>`<option value="${esc(sl)}"${sl===defaultStore?" selected":""}>${esc(sl)}</option>`).join("")}
                </select>
                <button class="btn" id="btnLoad">Load</button>
                <button class="btn warn" id="btnValidate">Validate</button>
                <button class="btn primary" id="btnSync">Sync Override</button>
                <button class="btn" id="btnExport">Export JSON</button>
                <button class="btn danger" id="btnClearOverride">Clear Override</button>
              </div>
            </div>

            <div class="meta" id="editorMeta"></div>
            <textarea id="editor" spellcheck="false"></textarea>
          </div>

          <div class="card">
            <div class="row">
              <div>
                <div class="title">Quick Preview</div>
                <div class="sub">Shows parsed overview of the store JSON.</div>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <a class="btn primary" id="btnOpenLive" href="/store/${esc(defaultStore)}/" target="_blank" rel="noopener">Open Live Store</a>
              </div>
            </div>

            <div class="list" id="preview"></div>
          </div>
        </div>
      </div>
    `;

    const editor = root.querySelector("#editor");
    const preview = root.querySelector("#preview");
    const storeSelect = root.querySelector("#storeSelect");
    const storeName = root.querySelector("#storeName");
    const editorMeta = root.querySelector("#editorMeta");
    const btnOpenLive = root.querySelector("#btnOpenLive");

    function setMeta(text){ editorMeta.innerHTML = `<span class="pill">${esc(text)}</span>`; }

    function loadStore(slug){
      const obj = db?.[slug] || {};
      storeName.textContent = slug;
      btnOpenLive.href = `/store/${slug}/`;
      editor.value = JSON.stringify(obj, null, 2);
      setMeta(`Loaded ${slug}. Tip: validate before sync.`);
      buildPreview(obj, slug);
    }

    function buildPreview(obj, slug){
      const title = obj?.title || obj?.name || slug;
      const sections = Array.isArray(obj?.sections) ? obj.sections : [];
      const products = Array.isArray(obj?.products) ? obj.products : [];
      preview.innerHTML = `
        <div class="item">
          <b>${esc(title)}</b>
          <div class="meta">Slug: <code>${esc(slug)}</code></div>
          <div class="meta">Sections: <b>${sections.length}</b> • Products: <b>${products.length}</b></div>
        </div>

        <div class="item">
          <b>Top Sections</b>
          <div class="meta">${sections.slice(0,10).map(s=>esc(s?.name||s?.title||s?.slug||"section")).join(" • ") || "—"}</div>
        </div>

        <div class="item">
          <b>Top Products</b>
          <div class="meta">${products.slice(0,10).map(p=>esc(p?.title||"product")).join(" • ") || "—"}</div>
        </div>

        <div class="item">
          <b>Validation Tips</b>
          <div class="meta">
            • Store must be an object<br/>
            • Sections: array of {slug,name/title,sections?,products?}<br/>
            • Products: array of {title,tagline?,image?,url?}
          </div>
        </div>
      `;
    }

    function validateJSON(){
      try{
        const obj = JSON.parse(editor.value || "{}");
        if (!obj || typeof obj !== "object") throw new Error("Store JSON must be an object.");
        if (obj.sections && !Array.isArray(obj.sections)) throw new Error("sections must be an array.");
        if (obj.products && !Array.isArray(obj.products)) throw new Error("products must be an array.");
        // simple deep checks (light)
        if (Array.isArray(obj.sections)) {
          obj.sections.forEach((s,i)=>{
            if (!s || typeof s !== "object") throw new Error(`sections[${i}] is invalid`);
          });
        }
        return { ok:true, obj };
      }catch(e){
        return { ok:false, error: e?.message || String(e) };
      }
    }

    // events
    root.querySelector("#btnLoad").addEventListener("click", () => loadStore(storeSelect.value));
    storeSelect.addEventListener("change", () => loadStore(storeSelect.value));

    root.querySelector("#btnValidate").addEventListener("click", () => {
      const r = validateJSON();
      if (!r.ok) { ctx.notify("Invalid JSON", r.error); setMeta("❌ Invalid JSON: " + r.error); return; }
      ctx.notify("Valid JSON", "Ready to sync.");
      setMeta("✅ JSON valid. You can sync now.");
      buildPreview(r.obj, storeSelect.value);
    });

    root.querySelector("#btnExport").addEventListener("click", () => {
      const r = validateJSON();
      if (!r.ok) { ctx.notify("Export failed", r.error); return; }
      downloadText(`store-${storeSelect.value}.json`, JSON.stringify(r.obj, null, 2));
      ctx.notify("Exported", `store-${storeSelect.value}.json`);
    });

    root.querySelector("#btnSync").addEventListener("click", async () => {
      const r = validateJSON();
      if (!r.ok) { ctx.notify("Sync failed", r.error); return; }

      // Merge into full DB, then Engine.sync()
      const newDB = structuredClone(db);
      newDB[storeSelect.value] = r.obj;

      await Engine.sync(newDB);
      ctx.notify("Synced override", "Local override saved. Reload to see source=override.");
      setMeta("✅ Synced to local override. This is your ‘preview DB’ until API exists.");
    });

    root.querySelector("#btnClearOverride").addEventListener("click", async () => {
      if (!confirm("Clear local override? (DB returns to /data/store.data.json)")) return;
      Engine.clearOverride();
      await Engine.reload({ preferOverride:false });
      ctx.notify("Override cleared", "Reloading DB from /data");
      location.reload();
    });

    // init
    loadStore(defaultStore);
  }
};

