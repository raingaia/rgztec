import { readJson } from "../apps/rgz/lib/storage.js";

export default async function handler(req, res) {
  try {
    const latestPath = process.env.CATALOG_LATEST_PATH || "catalog/latest.json";
    const data = await readJson(latestPath);
    if (!data) return res.status(404).json({ ok: false, error: "CATALOG_NOT_FOUND" });

    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "CATALOG_READ_FAILED", message: e?.message || String(e) });
  }
}
