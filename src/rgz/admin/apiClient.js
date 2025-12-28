export function makeAdminClient({ adminKey, base = "" }) {
  async function req(path, { method = "GET", body } = {}) {
    const headers = { "x-admin-key": adminKey };
    let payload;
    if (body != null) {
      headers["content-type"] = "application/json";
      payload = JSON.stringify(body);
    }

    const res = await fetch(base + path, { method, headers, body: payload });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || json?.ok === false) {
      const msg = json?.error || json?.message || `HTTP_${res.status}`;
      throw new Error(msg);
    }
    return json;
  }

  return {
    getStores: () => req("/api/admin/stores"),
    createStore: (data) => req("/api/admin/stores", { method: "POST", body: data }),
    updateStore: (id, patch) => req(`/api/admin/stores/${id}`, { method: "PUT", body: patch }),
    deleteStore: (id) => req(`/api/admin/stores/${id}`, { method: "DELETE" }),
    publish: () => req("/api/admin/publish", { method: "POST" }),
  };
}
