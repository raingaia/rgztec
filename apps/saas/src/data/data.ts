// apps/saas/src/lib/data.ts
import fs from "node:fs/promises";
import path from "node:path";

type AnyJson = any;

function dataRoot() {
  // apps/saas kökünden çalışıyoruz
  return path.join(process.cwd(), "src", "data");
}

async function readJsonFile(filePath: string): Promise<AnyJson> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// JSON normalize:
// - [] ise OK
// - {} ise -> []
// - { items: [] } / { data: [] } gibi ise items/data döndür
export function toArray<T = any>(v: any): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v as T[];
  if (Array.isArray(v.items)) return v.items as T[];
  if (Array.isArray(v.data)) return v.data as T[];
  return [];
}

export async function readDataFile(rel: string): Promise<any> {
  const fp = path.join(dataRoot(), rel);
  return readJsonFile(fp);
}

export async function readArrayFile<T = any>(rel: string): Promise<T[]> {
  const v = await readDataFile(rel);
  return toArray<T>(v);
}
