import Stripe from 'stripe';

/* ------------------------- CORS (GitHub Pages -> Vercel) ------------------------- */
function withCors(req, res) {
  const origins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const origin = req.headers.origin || '';
  if (origins.length && origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origins.length) {
    // origins tanımlı değilse (geliştirme) her origin'e izin ver
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

/* ------------------------------- Yardımcılar ------------------------------- */
function toStr(x = '') { return String(x ?? ''); }
function clampQty(n, min = 1, max = 999) {
  const v = Math.floor(Number(n) || 0);
  return Math.min(Math.max(v, min), max);
}
function cents(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}
function cut(s, len) { return toStr(s).slice(0, len); }

/* --------------------------------- Handler -------------------------------- */
export default async function handler(req, res) {
  // CORS & preflight
  if (withCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Env kontrol
  const secret = process.env.STRIPE_SECRET;
  const site = (process.env.SITE_ORIGIN || '').replace(/\/$/, '');
  if (!secret) return res.status(500).json({ error: 'STRIPE_SECRET env is missing' });
  if (!site)   return res.status(500).json({ error: 'SITE_ORIGIN env is missing' });

  // Body parse (Vercel çoğu durumda json parse eder; yine de güvenli olalım)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { /* noop */ }
  }

  try {
    const items = Array.isArray(body?.items) ? body.items : null;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Empty cart' });
    }

    // Stripe client
    const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

    // Tek para birimi kuralı
    const firstCurrency = toStr(items[0]?.currency || 'USD').toLowerCase();
    if (!items.every(i => toStr(i?.currency || 'USD').toLowerCase() === firstCurrency)) {
      return res.status(400).json({ error: 'All items must use the same currency' });
    }
    const currency = firstCurrency; // lower-case kabul; Stripe case insensitive

    // Line items normalizasyonu
    const line_items = items.map((raw) => {
      const type = toStr(raw.type || 'product').toLowerCase();
      const isGift = type === 'gift-card';

      const title = cut(
        raw.title || (isGift ? 'RGZTEC Gift Card' : 'Item'),
        250
      );

      // Fiyat: gift-card -> amount, normal -> price
      const unit = isGift ? Number(raw.amount || 0) : Number(raw.price || 0);
      const unit_cents = cents(unit);
      if (!Number.isFinite(unit) || unit <= 0 || !Number.isFinite(unit_cents) || unit_cents <= 0) {
        throw new Error(`Invalid price for item "${title}"`);
      }

      // adet: gift-card her zaman 1
      const qty = isGift ? 1 : clampQty(raw.qty || 1, 1, 999);

      const metadata = {
        type: isGift ? 'gift-card' : 'product',
        sku: cut(raw.sku || raw.id || '', 100),
        to_name: cut(raw?.to?.name || '', 120),
        to_email: cut(raw?.to?.email || '', 120),
        from_name: cut(raw.from || '', 120),
        message: cut(raw.message || '', 500), // Stripe metadata max ~500 chars
        delivery_date: cut(raw.delivery_date || raw.deliveryDate || '', 40),
      };

      return {
        price_data: {
          currency,
          unit_amount: unit_cents,
          product_data: {
            name: title,
            metadata
          }
        },
        quantity: qty
      };
    });

    // Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${site}/success.html?s={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cart`,
      // digital içerik: shipping gerekmiyor; istersen:
      // automatic_tax: { enabled: true },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] error:', err);
    return res.status(500).json({ error: err?.message || 'Checkout error' });
  }
}

