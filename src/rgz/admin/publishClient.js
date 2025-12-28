import { makeAdminClient } from "./apiClient.js";

export async function quickPublish({ adminKey }) {
  const api = makeAdminClient({ adminKey });
  const r = await api.publish();
  return r;
}
