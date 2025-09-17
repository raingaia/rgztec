// api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // sk_live_... .env’de

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).end();

    const { items } = req.body; 
    // items örn: [{ price: 'price_abc', quantity: 1 }, ...]

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'No items' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items,
      // canlıda domainini yaz:
      success_url: 'https://raingaia.github.io/rgztec/apps/web/public/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:  'https://raingaia.github.io/rgztec/apps/web/public/cancel.html',
      // opsiyonel:
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['US','GB','DE','TR','NL','FR'] }
    });

    res.status(200).json({ id: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'stripe_error' });
  }
}
