import fs from "fs";
import path from "path";

export function readJson<T = any>(relativePathFromRoot: string, fallback: T = {} as T): T {
  const filePath = path.join(process.cwd(), relativePathFromRoot);
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw?.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
