import Stripe from 'stripe';

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end();
  const { items } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({error:'Empty cart'});

  const stripe = new Stripe(process.env.STRIPE_SECRET, {apiVersion:'2023-10-16'});

  // Stripe line items
  const line_items = items.map((it)=>({
    price_data:{
      currency:'usd',
      unit_amount: Math.round(Number(it.price||0)*100),
      product_data:{
        name: it.title || 'Item',
        metadata:{
          type: it.type || 'product',     // gift-card | product
          sku: it.sku || it.id || '',
          // gift card alanları (varsa)
          to_name: it.to?.name || '',
          to_email: it.to?.email || '',
          from_name: it.from || '',
          message: it.message || '',
          delivery_date: it.delivery_date || ''
        }
      }
    },
    quantity: it.qty || 1
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${process.env.SITE_ORIGIN}/success.html?s={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.SITE_ORIGIN}/cart`,
  });

  return res.json({ url: session.url });
}
