import { requireAdmin } from "../../../src/rgz/middleware/adminKey.js";
import { db, FieldValue } from "../../../src/rgz/lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const id = req.query.id;
  const fire = db();

  if (req.method === "PUT") {
    const body = req.body || {};
    const patch = {};
    if (body.name != null) patch.name = String(body.name).trim();
    if (body.slug != null) patch.slug = String(body.slug).trim();
    if (body.status != null) patch.status = (body.status === "active" ? "active" : "draft");
    if (body.order != null) patch.order = Number(body.order) || 0;

    patch.updatedAt = FieldValue.serverTimestamp();

    // slug validation if provided
    if (patch.slug && !/^[a-z0-9-]+$/.test(patch.slug)) {
      return res.status(400).json({ ok:false, error:"VALIDATION_ERROR" });
    }

    await fire.collection("stores").doc(id).set(patch, { merge:true });
    return res.status(200).json({ ok:true });
  }

  if (req.method === "DELETE") {
    await fire.collection("stores").doc(id).delete();
    return res.status(200).json({ ok:true });
  }

  return res.status(405).json({ ok:false, error:"METHOD_NOT_ALLOWED" });
}
