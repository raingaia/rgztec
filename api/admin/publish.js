import { requireAdmin } from "../../apps/rgz/middleware/adminKey.js";
import { db, FieldValue } from "../../apps/rgz/lib/firebaseAdmin.js";
import { buildCatalogSnapshot } from "../../apps/rgz/lib/catalogBuilder.js";
import { writeJson } from "../../apps/rgz/lib/storage.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"METHOD_NOT_ALLOWED" });
  if (!requireAdmin(req, res)) return;

  try {
    const fire = db();
    const metaRef = fire.collection("meta").doc("catalog");
    const metaSnap = await metaRef.get();
    const meta = metaSnap.exists ? metaSnap.data() : { version: 0 };

    const nextVersion = Number(meta.version || 0) + 1;
    const snapshot = await buildCatalogSnapshot();
    snapshot.meta.version = nextVersion;

    const latestPath = process.env.CATALOG_LATEST_PATH || "catalog/latest.json";
    const versionsPrefix = process.env.CATALOG_VERSIONS_PREFIX || "catalog/versions/v";
    const versionPath = `${versionsPrefix}${nextVersion}.json`;

    await writeJson(versionPath, snapshot, "public, max-age=31536000, immutable");
    await writeJson(latestPath, snapshot, "public, max-age=30, stale-while-revalidate=300");

    await metaRef.set({
      version: nextVersion,
      updatedAt: FieldValue.serverTimestamp(),
      latestPath,
      versionPath
    }, { merge: true });

    return res.status(200).json({ ok:true, version: nextVersion, latestPath, versionPath, counts: snapshot.meta });
  } catch (e) {
    return res.status(500).json({ ok:false, error:"PUBLISH_FAILED", message: e?.message || String(e) });
  }
}
