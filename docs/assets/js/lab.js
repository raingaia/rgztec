(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  function safeJSONParse(s, fallback) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  function setStatus(text, kind = "ok") {
    const st = $("#rgzStatus");
    const dot = $("#rgzDot");
    if (!st || !dot) return;
    st.textContent = text;

    dot.classList.remove("warn", "err");
    if (kind === "warn") dot.classList.add("warn");
    if (kind === "err") dot.classList.add("err");
  }

  // ---------- State ----------
  const KEY = "rgztec_lab_v1";
  const DEFAULTS = {
    theme: "corporate",
    html: `<div style="padding:16px;border-radius:14px;border:1px solid rgba(15,23,42,.12);background:#fff;max-width:720px;margin:18px auto;font-family:Inter,system-ui;">
  <h3 style="margin:0 0 8px;font-size:18px;letter-spacing:-.02em;color:#0f172a;">Hello RGZTEC</h3>
  <p style="margin:0;color:#64748b;line-height:1.55;">This is a test component inside RGZTEC layout.</p>
  <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
    <a href="#" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border-radius:999px;background:#0f172a;color:#fff;text-decoration:none;font-weight:800;font-size:12px;">Primary CTA</a>
    <a href="#" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border-radius:999px;border:1px solid rgba(15,23,42,.12);background:#fff;color:#0f172a;text-decoration:none;font-weight:800;font-size:12px;">Secondary</a>
  </div>
</div>`,
    css: `/* Add your CSS here (scoped if possible) */\n`,
    js: `// Add your JS here\nconsole.log("RGZTEC Lab ready");\n`,
  };

  let state = { ...DEFAULTS, ...safeJSONParse(localStorage.getItem(KEY), {}) };

  // ---------- Elements ----------
  const els = {
    tabBtns: $$(".rgz-tab"),
    html: $("#codeHtml"),
    css: $("#codeCss"),
    js: $("#codeJs"),
    theme: $("#rgzTheme"),
    btnRun: $("#btnRun"),
    btnOpen: $("#btnOpen"),
    btnCopy: $("#btnCopy"),
    btnReset: $("#btnReset"),
    btnRefresh: $("#btnRefresh"),
    frame: $("#rgzPreviewFrame"),
    save: $("#rgzSave"),
  };

  // ---------- Init values ----------
  els.theme.value = state.theme || "corporate";
  els.html.value = state.html ?? DEFAULTS.html;
  els.css.value = state.css ?? DEFAULTS.css;
  els.js.value = state.js ?? DEFAULTS.js;

  // ---------- Tabs ----------
  function setActiveTab(name) {
    els.tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    els.html.style.display = name === "html" ? "block" : "none";
    els.css.style.display = name === "css" ? "block" : "none";
    els.js.style.display = name === "js" ? "block" : "none";
  }
  els.tabBtns.forEach((b) => b.addEventListener("click", () => setActiveTab(b.dataset.tab || "html")));
  setActiveTab("html");

  // ---------- Autosave ----------
  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      state = {
        theme: els.theme.value,
        html: els.html.value,
        css: els.css.value,
        js: els.js.value,
      };
      localStorage.setItem(KEY, JSON.stringify(state));
      if (els.save) els.save.textContent = "on";
      setStatus("Saved", "ok");
      setTimeout(() => setStatus("Ready", "ok"), 500);
    }, 200);
  }
  ["input", "change"].forEach((ev) => {
    els.html.addEventListener(ev, persist);
    els.css.addEventListener(ev, persist);
    els.js.addEventListener(ev, persist);
    els.theme.addEventListener(ev, () => { persist(); runPreview(); });
  });
  if (els.save) els.save.textContent = "on";

  // ---------- Preview doc builder ----------
  function buildPreviewDoc() {
    const theme = els.theme.value || "corporate";

    // Theme tokens: minimal, preview internal only
    const themeCSS =
      theme === "dark"
        ? `html,body{background:#0b1220;color:#e5e7eb;} a{color:#93c5fd;}`
        : `html,body{background:#ffffff;color:#0f172a;} a{color:#0f172a;}`;

    // NOTE: No external parent CSS injection into iframe (cross-origin safe).
    // We keep the preview clean + predictable.

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
    /* user css */
    ${els.css.value || ""}
  </style>
</head>
<body>
  ${els.html.value || ""}
  <script>
    (function(){
      "use strict";
      try {
        ${els.js.value || ""}
      } catch (e) {
        console.error(e);
        const box = document.createElement("pre");
        box.style.cssText="padding:12px;margin:12px;border-radius:12px;background:#111827;color:#fca5a5;font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;";
        box.textContent = "JS Error: " + (e && e.message ? e.message : String(e));
        document.body.prepend(box);
      }
    })();
  </script>
</body>
</html>`;
  }

  function setFrameHTML(htmlDoc) {
    const frame = els.frame;
    if (!frame) return;

    // Use blob URL to avoid about:blank quirks & keep refresh stable
    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    frame.src = url;

    // revoke after load
    frame.onload = () => {
      setStatus("Rendered", "ok");
      setTimeout(() => URL.revokeObjectURL(url), 250);
    };
  }

  // ---------- Run ----------
  function runPreview() {
    try {
      setStatus("Rendering…", "warn");
      const doc = buildPreviewDoc();
      setFrameHTML(doc);
    } catch (e) {
      console.error(e);
      setStatus("Render error", "err");
    }
  }

  // Open preview in new tab (clean)
  function openPreviewNewTab() {
    const doc = buildPreviewDoc();
    const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus("Opened preview", "ok");
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // Copy full payload (json)
  async function copyPayload() {
    const payload = JSON.stringify(
      {
        theme: els.theme.value,
        html: els.html.value,
        css: els.css.value,
        js: els.js.value,
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(payload);
      setStatus("Copied", "ok");
    } catch {
      // fallback
      els.html.focus();
      document.execCommand("selectAll");
      document.execCommand("copy");
      setStatus("Copied (fallback)", "ok");
    }
  }

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

  // ---------- Wire buttons ----------
  els.btnRun.addEventListener("click", runPreview);
  els.btnOpen.addEventListener("click", openPreviewNewTab);
  els.btnCopy.addEventListener("click", copyPayload);
  els.btnReset.addEventListener("click", resetAll);
  els.btnRefresh.addEventListener("click", runPreview);

  // ---------- Keyboard shortcuts ----------
  document.addEventListener("keydown", (e) => {
    // Ctrl+Enter => Run
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      runPreview();
      return;
    }
    // Ctrl+S => Copy payload quickly
    if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      copyPayload();
      return;
    }
  });

  // ---------- First paint ----------
  setStatus("Ready", "ok");
  runPreview();

  // ---------- Important note about Next.js ----------
  // Static Lab can run only browser JS/HTML/CSS.
  // Next.js server components / routes cannot execute here.
})();
