export function isSlug(s) {
  return typeof s === "string" && /^[a-z0-9-]+$/.test(s) && s.length >= 2;
}

export function clampInt(n, min = 0, max = 1_000_000) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

export function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] != null) out[k] = obj[k];
  return out;
}
