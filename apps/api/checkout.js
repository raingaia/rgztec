import Stripe from 'stripe';

// Basit CORS (GitHub Pages -> Vercel arası istekler için)
function withCors(req, res) {
  const origins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const origin = req.headers.origin || '';
  if (origins.length && origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origins.length) {
    // origins tanımlı değilse her origin'e izin ver (geliştirme)
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

export default async function handler(req, res) {
  if (withCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Empty cart' });
    }

    // Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2023-10-16' });

    // Tek para birimi (Stripe bunu şart koşuyor)
    const currency =
      (items[0]?.currency || 'USD').toString().toLowerCase();
    if (!items.every(i => (i.currency || 'USD').toString().toLowerCase() === currency)) {
      return res.status(400).json({ error: 'All items must use the same currency' });
    }

    // Validasyon + map
    const line_items = items.map((it) => {
      const type = (it.type || 'product').toString();
      const title = (it.title || (type === 'gift-card' ? 'RGZTEC Gift Card' : 'Item')).toString().slice(0, 250);
      const qty = Math.max(1, Number(it.qty || 1) | 0);
      const unit = type === 'gift-card' ? Number(it.amount || 0) : Number(it.price || 0);
      if (!isFinite(unit) || unit <= 0) {
        throw new Error(`Invalid price for item "${title}"`);
      }

      const metadata = {
        type,
        sku: (it.sku || it.id || '').toString().slice(0, 100),
        to_name: (it.to?.name || '').toString().slice(0, 120),
        to_email: (it.to?.email || '').toString().slice(0, 120),
        from_name: (it.from || '').toString().slice(0, 120),
        message: (it.message || '').toString().slice(0, 500), // Stripe metadata limit ~500 chars
        delivery_date: (it.delivery_date || it.deliveryDate || '').toString().slice(0, 40),
      };

      return {
        price_data: {
          currency,
          unit_amount: Math.round(unit * 100), // cents
          product_data: { name: title, metadata },
        },
        quantity: qty,
      };
    });

    // URL'ler
    const site = (process.env.SITE_ORIGIN || '').replace(/\/$/, '');
    if (!site) throw new Error('SITE_ORIGIN env is missing');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${site}/success.html?s={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cart`,
      // İstersen: automatic_tax: { enabled: true },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Checkout error' });
  }
}
