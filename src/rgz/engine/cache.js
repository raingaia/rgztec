let mem = {
  ts: 0,
  data: null,
  version: null,
};

export function getCache(maxAgeMs = 20_000) {
  const now = Date.now();
  if (mem.data && (now - mem.ts) < maxAgeMs) return mem;
  return null;
}

export function setCache(data) {
  mem = {
    ts: Date.now(),
    data,
    version: data?.meta?.version ?? null,
  };
  return mem;
}
