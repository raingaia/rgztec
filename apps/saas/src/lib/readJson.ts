import fs from "fs";
import path from "path";

export function readJson(relativePathFromRoot: string) {
  const filePath = path.join(process.cwd(), relativePathFromRoot);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
