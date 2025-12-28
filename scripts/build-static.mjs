import fs from "fs";
import path from "path";

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

const map = [
  { from: "apps/seller", to: "docs/rgztec/seller" },
  { from: "apps/admin",  to: "docs/rgztec/admin"  },
  { from: "apps/lab",    to: "docs/rgztec/lab"    },
];

for (const m of map) {
  if (!fs.existsSync(m.from)) continue;
  cleanDir(m.to);
  copyDir(m.from, m.to);
  console.log("✅ built:", m.from, "->", m.to);
}

console.log("DONE ✅");
