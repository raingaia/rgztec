import fs from "fs";
import path from "path";

const root = process.cwd();

const pairs = [
  ["api/data/categories.json", "docs/data/categories.json"],
  ["api/data/search.index.json", "docs/data/search.index.json"],
];

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

for (const [srcRel, dstRel] of pairs) {
  const src = path.join(root, srcRel);
  const dst = path.join(root, dstRel);
  if (!fs.existsSync(src)) {
    console.warn("Missing:", srcRel);
    continue;
  }
  ensureDir(dst);
  fs.copyFileSync(src, dst);
  console.log("Copied:", srcRel, "->", dstRel);
}
