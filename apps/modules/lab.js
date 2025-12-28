// apps/modules/lab.js
function css(){
  return `
  :root{
    --bg:#0b0f17; --panel:rgba(255,255,255,.06); --line:rgba(255,255,255,.12);
    --ink:#e9eefc; --muted:rgba(233,238,252,.7);
  }
  .labWrap{display:grid; grid-template-columns: 1fr 1fr; gap:12px}
  .pane{
    border:1px solid var(--line);
    background: rgba(0,0,0,.18);
    border-radius: 18px;
    overflow:hidden;
    min-height: 640px;
    display:flex;
    flex-direction:column;
  }
  .tabs{display:flex; gap:8px; padding:10px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.03)}
  .tab{padding:8px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.14);
    background:rgba(0,0,0,.2); color:var(--ink); cursor:pointer; font-weight:900; font-size:12px}
  .tab.active{background:#fff; color:#0b0f17; border-color:#fff}
  textarea{
    flex:1; width:100%; resize:none; border:0; outline:none; padding:14px;
    background:transparent; color:var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size:13px; line-height:1.5;
  }
  .actions{display:flex; gap:10px; padding:10px; border-top:1px solid var(--line); background:rgba(255,255,255,.03)}
  .btn{padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); color:#fff; cursor:pointer; font-weight:1000}
  .btn.primary{background:#fff; color:#0b0f17}
  iframe{flex:1; width:100%; border:0; background:#fff}
  .top{display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid var(--line);
    background:rgba(255,255,255,.03)}
  .muted{color:var(--muted); font-size:12px}
  @media (max-width:1100px){ .labWrap{grid-template-columns:1fr} .pane{min-height:520px} }
  `;
}

export default {
  async render(root, ctx){
    root.innerHTML = `
      <style>${css()}</style>
      <div class="labWrap">
        <div class="pane">
          <div class="tabs">
            <button class="tab active" data-tab="html">HTML</button>
            <button class="tab" data-tab="css">CSS</button>
            <button class="tab" data-tab="js">JS</button>
          </div>
          <textarea id="editor"></textarea>
          <div class="actions">
            <button class="btn primary" id="run">Run</button>
            <button class="btn" id="reset">Reset</button>
            <button class="btn" id="share">Share Link</button>
          </div>
        </div>

        <div class="pane">
          <div class="top">
            <div class="muted">Live Preview</div>
            <div class="muted" id="status">Ready</div>
          </div>
          <iframe id="preview" sandbox="allow-scripts allow-forms allow-modals allow-popups"></iframe>
        </div>
      </div>
    `;

    const DEFAULT = {
      html: `<!doctype html>
<html>
<head><meta charset="utf-8"><title>RGZTEC LAB</title></head>
<body>
  <h1>RGZTEC LAB</h1>
  <p>Burada HTML/CSS/JS test edebilirsin.</p>
  <button id="btn">Click</button>
  <div id="out"></div>
</body>
</html>`,
      css: `body{font-family:system-ui,Arial; padding:24px}
h1{margin:0 0 8px}
button{padding:10px 12px; border-radius:10px; border:1px solid #ddd; cursor:pointer}`,
      js: `document.getElementById("btn").addEventListener("click", ()=>{
  document.getElementById("out").textContent = "OK ✅ " + new Date().toLocaleString();
});`
    };

    const tabs = root.querySelectorAll(".tab");
    const editor = root.querySelector("#editor");
    const preview = root.querySelector("#preview");
    const status = root.querySelector("#status");

    function loadState(){
      if (location.hash && location.hash.length > 1){
        try{
          const json = decodeURIComponent(atob(location.hash.slice(1)));
          const obj = JSON.parse(json);
          return { ...DEFAULT, ...obj };
        }catch(e){}
      }
      try{
        const saved = JSON.parse(localStorage.getItem("rgz_lab_state") || "null");
        if (saved) return { ...DEFAULT, ...saved };
      }catch(e){}
      return { ...DEFAULT };
    }

    let state = loadState();

    function saveState(){
      localStorage.setItem("rgz_lab_state", JSON.stringify(state));
    }

    function activeTab(){
      return root.querySelector(".tab.active").dataset.tab;
    }

    function setActive(tab){
      tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
      editor.value = state[tab] || "";
    }

    tabs.forEach(t => t.addEventListener("click", ()=> setActive(t.dataset.tab)));

    editor.addEventListener("input", ()=>{
      const tab = activeTab();
      state[tab] = editor.value;
      saveState();
    });

    function buildDoc(){
      const html = state.html || "";
      const css = `<style>${state.css || ""}</style>`;
      const js  = `<script>${state.js || ""}<\/script>`;
      if (html.includes("</head>")){
        return html.replace("</head>", css + "\n</head>").replace("</body>", js + "\n</body>");
      }
      return css + "\n" + html + "\n" + js;
    }

    function run(){
      status.textContent = "Running…";
      preview.srcdoc = buildDoc();
      setTimeout(()=> status.textContent = "Live", 150);
    }

    root.querySelector("#run").addEventListener("click", run);
    root.querySelector("#reset").addEventListener("click", ()=>{
      state = { ...DEFAULT };
      saveState();
      setActive(activeTab());
      run();
    });

    root.querySelector("#share").addEventListener("click", async ()=>{
      try{
        const payload = btoa(encodeURIComponent(JSON.stringify(state)));
        const url = location.origin + "/apps/lab#" + payload;
        await navigator.clipboard.writeText(url);
        status.textContent = "Link copied ✅";
        setTimeout(()=> status.textContent = "Live", 800);
      }catch(e){
        status.textContent = "Copy failed";
      }
    });

    setActive("html");
    run();
  }
};
