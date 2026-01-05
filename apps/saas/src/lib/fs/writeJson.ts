import fs from "fs";
import path from "path";

export function writeJson(relativePathFromRoot: string, data: any) {
  const filePath = path.join(process.cwd(), relativePathFromRoot);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data ?? {}, null, 2) + "\n", "utf-8");
  return true;
}
