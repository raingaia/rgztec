(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const KEY = "rgztec_lab_v2";

  const DEFAULTS = {
    theme: "corporate",
    html: `<div style="padding:16px;border-radius:14px;border:1px solid rgba(15,23,42,.12);background:#fff;max-width:720px;margin:18px auto;font-family:Inter,system-ui;">
  <h3 style="margin:0 0 8px;font-size:18px;letter-spacing:-.02em;color:#0f172a;">Hello RGZTEC</h3>
  <p style="margin:0;color:#64748b;line-height:1.55;">This is a test component inside RGZTEC Lab.</p>
</div>`,
    css: `/* Add your CSS here */\n`,
    js: `// Add your JS here\nconsole.log("RGZTEC Lab ready");\n`,
  };

  function safeParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }

  const els = {
    tabs: $$(".rgz-tab"),
    html: $("#codeHtml"),
    css: $("#codeCss"),
    js: $("#codeJs"),
    theme: $("#rgzTheme"),
    run: $("#btnRun"),
    open: $("#btnOpen"),
    copy: $("#btnCopy"),
    reset: $("#btnReset"),
    refresh: $("#btnRefresh"),
    frame: $("#rgzPreviewFrame"),
    status: $("#rgzStatus"),
    dot: $("#rgzDot"),
  };

  function setStatus(text, kind = "ok") {
    if (els.status) els.status.textContent = text;
    if (!els.dot) return;
    els.dot.classList.remove("warn", "err");
    if (kind === "warn") els.dot.classList.add("warn");
    if (kind === "err") els.dot.classList.add("err");
  }

  // ---- Load state
  const stored = safeParse(localStorage.getItem(KEY), {});
  const state = { ...DEFAULTS, ...stored };

  els.theme.value = state.theme || "corporate";
  els.html.value = state.html || DEFAULTS.html;
  els.css.value = state.css || DEFAULTS.css;
  els.js.value = state.js || DEFAULTS.js;

  // ---- Tabs
  function setTab(name) {
    els.tabs.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    els.html.style.display = (name === "html") ? "block" : "none";
    els.css.style.display  = (name === "css")  ? "block" : "none";
    els.js.style.display   = (name === "js")   ? "block" : "none";
  }
  els.tabs.forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab || "html")));
  setTab("html");

  // ---- Save
  let t = null;
  function persist() {
    clearTimeout(t);
    t = setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify({
        theme: els.theme.value,
        html: els.html.value,
        css: els.css.value,
        js: els.js.value
      }));
      setStatus("Saved", "ok");
      setTimeout(() => setStatus("Ready", "ok"), 400);
    }, 150);
  }
  ["input","change"].forEach(ev => {
    els.html.addEventListener(ev, persist);
    els.css.addEventListener(ev, persist);
    els.js.addEventListener(ev, persist);
    els.theme.addEventListener(ev, () => { persist(); runPreview(); });
  });

  // ---- Build doc (NO blob)
  function buildDoc() {
    const theme = els.theme.value || "corporate";
    const themeCSS =
      theme === "dark"
        ? `html,body{background:#0b1220;color:#e5e7eb;} a{color:#93c5fd;}`
        : `html,body{background:#ffffff;color:#0f172a;} a{color:#0f172a;}`;

    const userCSS = els.css.value || "";
    const userHTML = els.html.value || "";
    const userJS = els.js.value || "";

    // IMPORTANT: JS error surface
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    ${themeCSS}
    body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;}
    ${userCSS}
  </style>
</head>
<body>
  ${userHTML}
  <script>
    (function(){
      "use strict";
      try {
        ${userJS}
      } catch(e){
        console.error(e);
        const pre=document.createElement("pre");
        pre.style.cssText="padding:12px;margin:12px;border-radius:12px;background:#111827;color:#fca5a5;font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;";
        pre.textContent="JS Error: "+(e && e.message ? e.message : String(e));
        document.body.prepend(pre);
      }
    })();
  </script>
</body>
</html>`;
  }

  // ---- Run (CSP-safe)
  function runPreview() {
    if (!els.frame) return;
    setStatus("Rendering…", "warn");
    const doc = buildDoc();

    // ✅ CSP-safe: srcdoc
    els.frame.srcdoc = doc;

    // Some browsers don’t trigger onload reliably with srcdoc; set status manually
    setTimeout(() => setStatus("Rendered", "ok"), 120);
  }

  // ---- Open in new tab (CSP-safe)
  function openPreview() {
    const doc = buildDoc();
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) { setStatus("Popup blocked", "err"); return; }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setStatus("Opened preview", "ok");
  }

  // ---- Copy payload
  async function copyPayload() {
    const payload = JSON.stringify({
      theme: els.theme.value,
      html: els.html.value,
      css: els.css.value,
      js: els.js.value
    }, null, 2);

    try {
      await navigator.clipboard.writeText(payload);
      setStatus("Copied", "ok");
    } catch {
      setStatus("Copy failed", "err");
    }
  }

  // ---- Reset
  function resetAll() {
    if (!confirm("Reset editor to defaults?")) return;
    els.theme.value = DEFAULTS.theme;
    els.html.value = DEFAULTS.html;
    els.css.value = DEFAULTS.css;
    els.js.value = DEFAULTS.js;
    localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
    setStatus("Reset", "warn");
    runPreview();
  }

  // ---- Buttons
  els.run.addEventListener("click", runPreview);
  els.refresh.addEventListener("click", runPreview);
  els.open.addEventListener("click", openPreview);
  els.copy.addEventListener("click", copyPayload);
  els.reset.addEventListener("click", resetAll);

  // ---- Shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); runPreview(); }
    if (e.ctrlKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); copyPayload(); }
  });

  // Init
  setStatus("Ready", "ok");
  runPreview();
})();

