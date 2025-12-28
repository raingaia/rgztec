import { requireAdmin } from "../../../apps/rgz/middleware/adminKey.js";
import { db, FieldValue } from "../../../apps/rgz/lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const fire = db();

  if (req.method === "GET") {
    const snap = await fire.collection("stores").orderBy("order","asc").get();
    return res.status(200).json({ ok:true, items: snap.docs.map(d=>({ id:d.id, ...d.data() })) });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const status = (body.status === "active" ? "active" : "draft");
    const order = Number.isFinite(body.order) ? Number(body.order) : 0;

    if (!name || !slug || !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ ok:false, error:"VALIDATION_ERROR" });
    }

    const exists = await fire.collection("stores").where("slug","==",slug).limit(1).get();
    if (!exists.empty) return res.status(409).json({ ok:false, error:"SLUG_EXISTS" });

    const ref = await fire.collection("stores").add({
      name, slug, status, order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return res.status(200).json({ ok:true, id: ref.id });
  }

  return res.status(405).json({ ok:false, error:"METHOD_NOT_ALLOWED" });
}
