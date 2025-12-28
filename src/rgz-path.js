/* =========================================================
   RGZTEC • PATH + BASE RESOLVER (NO "src/rgz" STICKY)
   File: /src/rgz-path.js
   Usage:
     import or include before other scripts
     const url = RGZ.abs("/data/store.data.json");
   ========================================================= */

(function (global) {
  "use strict";

  function trimSlashes(s) {
    return String(s || "").replace(/^\/+/, "").replace(/\/+$/, "");
  }

  function resolveBase() {
    const meta = document.querySelector('meta[name="rgz-base"]');
    if (meta && meta.content != null) {
      const v = String(meta.content).trim();
      if (v !== "") return trimSlashes(v); // "/rgztec" -> "rgztec"
    }

    const p = location.pathname || "/";
    // If site is served under /rgztec/* detect it
    if (p.includes("/rgztec/") || p === "/rgztec") return "rgztec";
    return ""; // root
  }

  function joinBase(base, path) {
    const b = trimSlashes(base);
    const p = String(path || "");
    const abs = p.startsWith("/") ? p : "/" + p; // FORCE absolute
    return (b ? "/" + b : "") + abs;
  }

  function abs(path) {
    return new URL(joinBase(resolveBase(), path), location.origin).toString();
  }

  function rel(path) {
    // returns "/rgztec/..." or "/..."
    return joinBase(resolveBase(), path);
  }

  global.RGZ = {
    base: resolveBase,
    join: joinBase,
    abs,
    rel
  };
})(window);
