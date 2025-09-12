import { Injectable } from "@nestjs/common";

type LicenseStatus = "active" | "revoked" | "blocked";
type Activation = { machineId: string; hostname?: string; at: number };
type License = {
  key: string;
  productId: string;
  buyerEmail: string;
  orderId?: string;
  status: LicenseStatus;
  maxActivations: number;
  activations: Activation[];
};

const store = new Map<string, License>();

@Injectable()
export class LicensingService {
  issue(productId: string, buyerEmail: string, orderId?: string) {
    const key = this.key();
    const lic: License = {
      key,
      productId,
      buyerEmail: buyerEmail.toLowerCase(),
      orderId,
      status: "active",
      maxActivations: 2,
      activations: []
    };
    store.set(key, lic);
    return lic;
  }

  verify(key: string) { return store.get(key) ?? null; }

  activate(key: string, machineId: string, hostname?: string) {
    const lic = store.get(key);
    if (!lic || lic.status !== "active") return { error: "invalid_or_inactive" };
    const exists = lic.activations.find(a => a.machineId === machineId);
    if (exists) return { ok: true, license: lic };
    if (lic.activations.length >= lic.maxActivations) return { error: "activation_limit_exceeded" };
    lic.activations.push({ machineId, hostname, at: Date.now() });
    store.set(key, lic);
    return { ok: true, license: lic };
    }

  deactivate(key: string, machineId: string) {
    const lic = store.get(key);
    if (!lic) return { error: "not_found" };
    lic.activations = lic.activations.filter(a => a.machineId !== machineId);
    store.set(key, lic);
    return { ok: true, license: lic };
  }

  revoke(key: string) {
    const lic = store.get(key);
    if (!lic) return { error: "not_found" };
    lic.status = "revoked";
    store.set(key, lic);
    return { ok: true };
  }

  private key() {
    const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const pick = (n: number) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
    return `LIC-${pick(4)}-${pick(4)}-${pick(4)}`;
  }
}
