import Stripe from 'stripe';
import crypto from 'crypto';

import { createClient } from '@supabase/supabase-js';
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

const stripe = new Stripe(process.env.STRIPE_SECRET, {apiVersion:'2023-10-16'});

// basit kod üretici
function makeCode(){
  const base = crypto.randomBytes(6).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g,'');
  return `RGZ-${base.slice(0,4)}-${base.slice(4,8)}`;
}

async function sendEmail({to,name,code,amount,currency,message}){
  const r = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{
      'Authorization':`Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      from: process.env.SENDER_EMAIL,
      to,
      subject: `You received an RGZTEC Gift Card (${code})`,
      html: `<h2>RGZTEC Gift Card</h2>
             <p>Hi ${name||''}, you’ve received a gift card.</p>
             <p><b>Code:</b> ${code}<br/><b>Amount:</b> ${amount/100} ${currency.toUpperCase()}</p>
             ${message ? `<p><i>${message}</i></p>`:''}
             <p>Redeem: ${process.env.SITE_ORIGIN}/redeem.html?code=${code}</p>`
    })
  });
  if (!r.ok) console.error('email failed', await r.text());
}

export default async function handler(req, res){
  const sig = req.headers['stripe-signature'];
  let event;
  try{
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(err){
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed'){
    const session = event.data.object;
    const li = await stripe.checkout.sessions.listLineItems(session.id, {limit:100});

    for (const item of li.data){
      const md = item.price?.product?.metadata || item.description?.metadata || {};
      // Stripe product metadata Checkout'ta doğrudan gelmediği için:
      // safer: event'den retrieve et
      const product = await stripe.products.retrieve(item.price.product);
      const meta = product.metadata || {};

      if ((meta.type||'') === 'gift-card'){
        const amount_cents = item.amount_total || (item.amount_subtotal||0);
        const code = makeCode();

        await supa.from('gift_cards').insert({
          code,
          currency: session.currency,
          amount_cents,
          to_name: meta.to_name || '',
          to_email: meta.to_email || '',
          from_name: meta.from_name || '',
          message: meta.message || '',
          delivery_date: meta.delivery_date || null,
          status:'active',
          stripe_session: session.id
        });

        await sendEmail({
          to: meta.to_email,
          name: meta.to_name,
          code,
          amount: amount_cents,
          currency: session.currency,
          message: meta.message
        });
      }
    }
  }

  res.json({received:true});
}

// Vercel özel: raw body
export const config = { api: { bodyParser: false } };
