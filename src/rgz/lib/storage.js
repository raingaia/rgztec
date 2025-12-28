import { bucket } from "./firebaseAdmin.js";

export async function writeJson(path, obj, cacheControl = "public, max-age=60") {
  const file = bucket().file(path);
  const data = Buffer.from(JSON.stringify(obj, null, 2), "utf8");

  await file.save(data, {
    contentType: "application/json",
    metadata: { cacheControl },
  });

  return { path, bytes: data.length };
}

export async function readJson(path) {
  const file = bucket().file(path);
  const [exists] = await file.exists();
  if (!exists) return null;

  const [buf] = await file.download();
  return JSON.parse(buf.toString("utf8"));
}
