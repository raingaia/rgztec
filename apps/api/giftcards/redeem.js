import { createClient } from '@supabase/supabase-js';
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body || {};
  if (!code) return res.status(400).json({error:'Missing code'});

  const { data, error } = await supa.from('gift_cards').select('*').eq('code', code).single();
  if (error || !data) return res.status(404).json({error:'Not found'});
  if (data.status !== 'active') return res.status(400).json({error:`Status ${data.status}`});

  await supa.from('gift_cards').update({ status:'used', redeemed_at: new Date().toISOString() }).eq('id', data.id);
  return res.json({ ok:true, amount_cents: data.amount_cents, currency: data.currency });
}
