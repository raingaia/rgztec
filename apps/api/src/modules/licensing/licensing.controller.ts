import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { LicensingService } from "./licensing.service";

@Controller("licensing")
export class LicensingController {
  constructor(private readonly svc: LicensingService) {}

  @Post("issue")
  issue(@Body() b: { productId: string; buyerEmail: string; orderId?: string }) {
    if (!b?.productId || !b?.buyerEmail) return { error: "missing_fields" };
    return this.svc.issue(b.productId, b.buyerEmail, b.orderId);
  }

  @Get("verify/:key")
  verify(@Param("key") key: string) {
    const lic = this.svc.verify(key);
    return lic ? {
      key: lic.key, productId: lic.productId, status: lic.status,
      activations: lic.activations.length, remaining: Math.max(0, lic.maxActivations - lic.activations.length)
    } : { error: "not_found" };
  }

  @Post("activate")
  activate(@Body() b: { key: string; machineId: string; hostname?: string }) {
    if (!b?.key || !b?.machineId) return { error: "missing_fields" };
    return this.svc.activate(b.key, b.machineId, b.hostname);
  }

  @Post("deactivate")
  deactivate(@Body() b: { key: string; machineId: string }) {
    if (!b?.key || !b?.machineId) return { error: "missing_fields" };
    return this.svc.deactivate(b.key, b.machineId);
  }

  @Post("revoke")
  revoke(@Body() b: { key: string }) {
    if (!b?.key) return { error: "missing_fields" };
    return this.svc.revoke(b.key);
  }

  @Post("webhooks/codecanyon")
  ccWebhook() { return { ok: true, note: "stub" }; }
}
