export const runtime = "nodejs";

import { json, getBearer, findActorByToken, normalizeStr, readJson } from "../../../_common";

const PRODUCTS_FILE = "src/data/hardware/products.json";
const INVENTORY_FILE = "src/data/hardware/inventory.json";

export async function POST(req: Request) {
  try {
    const token = getBearer(req);
    if (!token) return json({ error: "Unauthorized", module: "hardware_shipping_quote" }, 401);

    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "hardware_shipping_quote" }, 401);

    const body = await req.json().catch(() => ({} as any));
    const productId = normalizeStr(body?.product_id);
    const qty = Number(body?.qty ?? 1);
    const country = normalizeStr(body?.country ?? "US");
    const postal = normalizeStr(body?.postal ?? "");

    if (!productId) return json({ error: "product_id required", module: "hardware_shipping_quote" }, 400);
    if (!qty || qty < 1) return json({ error: "qty invalid", module: "hardware_shipping_quote" }, 400);

    const products = (await readJson<any[]>(PRODUCTS_FILE, [])) ?? [];
    const inv = (await readJson<any[]>(INVENTORY_FILE, [])) ?? [];

    const p = products.find((x) => normalizeStr(x?.id) === productId);
    if (!p) return json({ error: "product not found", module: "hardware_shipping_quote" }, 404);

    const inStock = inv
      .filter((x) => normalizeStr(x?.product_id) === productId)
      .reduce((sum, x) => sum + Number(x?.on_hand ?? 0), 0);

    const base = 9.9;
    const perItem = 1.5;
    const shipping = Math.round((base + perItem * qty) * 100) / 100;

    return json({
      module: "hardware_shipping_quote",
      product_id: productId,
      qty,
      destination: { country, postal },
      in_stock: inStock,
      quote: {
        currency: "USD",
        shipping,
        eta_days: country === "US" ? [2, 5] : [5, 12],
        carrier: "mock",
      },
      note: "TODO: carrier + tax + duties",
    });
  } catch (e: any) {
    return json(
      { error: "Server error", detail: String(e?.message ?? e), module: "hardware_shipping_quote" },
      500
    );
  }
}

