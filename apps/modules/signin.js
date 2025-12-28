// apps/modules/signin.js
import Engine from "/apps/core/engine.js";

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, String(v));
  });
  ([]).concat(children).forEach(c => {
    if (c == null) return;
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  });
  return el;
}

function css() {
  return `
  .auth{
    display:grid; grid-template-columns: 1.1fr .9fr; gap:14px;
  }
  .card{
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
    border-radius: 18px;
    padding: 18px;
  }
  .title{font-weight:1000; margin:0 0 6px}
  .sub{margin:0 0 14px; color: rgba(233,238,252,.70); line-height:1.6; font-size:13px}
  .grid{display:grid; gap:10px}
  .row{display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between}
  .lbl{font-size:12px; color: rgba(233,238,252,.75); font-weight:800; margin:8px 0 6px}
  .inp{
    height:44px; width:100%;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.22);
    color: #e9eefc;
    padding: 10px 12px;
    outline:none;
  }
  .inp:focus{ border-color: rgba(0,255,163,.35); box-shadow: 0 0 0 3px rgba(0,255,163,.12) }
  .btn{
    height:44px; padding: 0 14px; border-radius: 12px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color:#e9eefc; font-weight:900; cursor:pointer;
  }
  .btn.primary{
    border-color: rgba(0,255,163,.30);
    background: linear-gradient(180deg, rgba(0,255,163,.20), rgba(0,255,163,.10));
  }
  .btn.danger{
    border-color: rgba(255,107,107,.35);
    background: linear-gradient(180deg, rgba(255,107,107,.14), rgba(255,107,107,.08));
  }
  .pill{
    display:inline-flex; align-items:center; gap:8px;
    padding:8px 10px; border-radius:999px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.22);
    font-size:12px; color: rgba(233,238,252,.70);
  }
  .alert{
    display:none; padding:10px 12px; border-radius: 12px;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.25);
    color: rgba(233,238,252,.90);
    font-size:13px; line-height:1.5;
  }
  .alert.ok{ border-color: rgba(0,255,163,.28); }
  .alert.err{ border-color: rgba(255,107,107,.32); }
  .mutedLink{color: rgba(233,238,252,.75); font-weight:900; cursor:pointer; text-decoration:underline; text-decoration-color: rgba(255,255,255,.22)}
  @media (max-width: 980px){ .auth{grid-template-columns:1fr} }
  `;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim().toLowerCase());
}

export default {
  async render(root, ctx) {
    root.innerHTML = "";
    const style = h("style", {}, [css()]);
    const wrap = h("div", { class: "auth" });

    // If already logged in -> redirect
    const existing = Engine.getSession();
    if (existing && existing.email) {
      ctx.notify("Already signed in", existing.email);
      location.replace(existing.role === "admin" ? "/apps/admin" : "/apps/seller");
      return;
    }

    // Left form
    const left = h("div", { class: "card" });
    const title = h("h2", { class: "title" }, ["Sign in"]);
    const sub = h("p", { class: "sub" }, [
      "Premium access to Seller Hub & Admin. (MVP auth now, API later.)"
    ]);

    const ok = h("div", { class: "alert ok", id: "ok" });
    const err = h("div", { class: "alert err", id: "err" });

    const emailLbl = h("div", { class: "lbl" }, ["Email"]);
    const email = h("input", { class: "inp", type: "email", placeholder: "you@company.com", autocomplete: "username", id: "email" });

    const passLbl = h("div", { class: "lbl" }, ["Password"]);
    const pass = h("input", { class: "inp", type: "password", placeholder: "••••••••", minlength: "6", autocomplete: "current-password", id: "pass" });

    const roleRow = h("div", { class: "row" });
    const rolePill = h("span", { class: "pill" }, ["Role: ", h("b", {}, ["seller/admin"])]);
    const createLink = h("span", { class: "mutedLink" }, ["Create account"]);
    roleRow.append(rolePill, createLink);

    const btnRow = h("div", { class: "row" });
    const btnSignIn = h("button", { class: "btn primary", type: "button" }, ["Sign in"]);
    const btnDemoAdmin = h("button", { class: "btn", type: "button" }, ["Use Demo Admin"]);
    btnRow.append(btnSignIn, btnDemoAdmin);

    const note = h("p", { class: "sub" }, [
      "Demo Admin: ",
      h("code", {}, ["admin@rgztec.com / rgzadmin123"]),
      " • Demo Seller: ",
      h("code", {}, ["seller@rgztec.com / rgzseller123"])
    ]);

    left.append(title, sub, ok, err, emailLbl, email, passLbl, pass, roleRow, btnRow, note);

    // Right panel
    const right = h("div", { class: "card" });
    right.append(
      h("h2", { class: "title" }, ["Security & Control"]),
      h("p", { class: "sub" }, [
        "This shell enforces role guards (seller/admin), supports DB override sync, and isolates tools under /apps."
      ]),
      h("div", { class: "grid" }, [
        h("div", { class: "pill" }, ["🔒 Role-based access"]),
        h("div", { class: "pill" }, ["⚡ Instant tooling"]),
        h("div", { class: "pill" }, ["🧾 Audit-ready structure"]),
        h("div", { class: "pill" }, ["🧠 API-ready architecture"]),
      ])
    );

    wrap.append(left, right);
    root.append(style, wrap);

    // Ensure demo users exist
    const users = Engine.getUsers();
    if (!users["admin@rgztec.com"]) {
      users["admin@rgztec.com"] = { password: "rgzadmin123", role: "admin", sellerId: "rgztec-admin" };
    }
    if (!users["seller@rgztec.com"]) {
      users["seller@rgztec.com"] = { password: "rgzseller123", role: "seller", sellerId: "acme-store" };
    }
    Engine.setUsers(users);

    function show(el, msg) {
      ok.style.display = "none";
      err.style.display = "none";
      el.textContent = msg;
      el.style.display = "block";
    }

    function signIn(emailVal, passVal) {
      const e = String(emailVal || "").trim().toLowerCase();
      const p = String(passVal || "");
      if (!validEmail(e) || p.length < 6) {
        show(err, "Please enter a valid email and password (min 6 chars).");
        return;
      }
      const users = Engine.getUsers();
      const u = users[e];
      if (!u) { show(err, "Account not found. Click “Create account”."); return; }
      if (u.password !== p) { show(err, "Incorrect password."); return; }

      const session = { email: e, role: u.role || "seller", sellerId: u.sellerId || "unknown", t: Date.now() };
      Engine.setSession(session);
      show(ok, "Signed in successfully. Redirecting…");
      ctx.notify("Signed in", session.email);
      setTimeout(() => {
        location.replace(session.role === "admin" ? "/apps/admin" : "/apps/seller");
      }, 450);
    }

    btnSignIn.addEventListener("click", () => signIn(email.value, pass.value));
    pass.addEventListener("keydown", (e) => { if (e.key === "Enter") signIn(email.value, pass.value); });

    btnDemoAdmin.addEventListener("click", () => {
      email.value = "admin@rgztec.com";
      pass.value = "rgzadmin123";
      signIn(email.value, pass.value);
    });

    // Create account modal-ish (simple)
    createLink.addEventListener("click", () => {
      const e = prompt("Email for new account:");
      if (!e) return;
      const p = prompt("Password (min 6 chars):");
      if (!p) return;
      if (!validEmail(e) || String(p).length < 6) {
        show(err, "Invalid email or password.");
        return;
      }
      const users = Engine.getUsers();
      const key = String(e).trim().toLowerCase();
      if (users[key]) { show(err, "Account already exists. Sign in."); return; }

      const sellerId = prompt("Seller ID (slug) e.g. acme-store:") || "new-seller";
      users[key] = { password: String(p), role: "seller", sellerId: String(sellerId).trim() };
      Engine.setUsers(users);

      show(ok, "Account created. You can sign in now.");
      email.value = key;
      pass.value = String(p);
    });
  }
};
