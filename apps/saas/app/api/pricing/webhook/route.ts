export const runtime = "nodejs";

import { json } from "../../_common";

/**
 * POST /api/pricing/webhook
 *
 * TODO (Stripe):
 * - verify signature with STRIPE_WEBHOOK_SECRET
 * - handle events:
 *   - customer.subscription.created/updated/deleted
 *   - invoice.paid / invoice.payment_failed
 * - update:
 *   - src/data/pricing/subscriptions.json
 *   - src/data/pricing/billing_events.json
 */
export async function POST(req: Request) {
  try {
    // Stripe signature doğrulaması olmadığı için şimdilik stub.
    return json(
      {
        ok: false,
        module: "pricing_webhook",
        note: "Stripe webhook not configured yet (stub).",
        next: "TODO: verify Stripe signature + update subscriptions/events data",
      },
      501
    );
  } catch (e: any) {
    return json({ error: e?.message || "webhook failed", module: "pricing_webhook" }, 500);
  }
}
