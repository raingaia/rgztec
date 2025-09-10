// Minimal HMAC "JWT-like" lisans: header.payload.signature (base64url)
// Header sabit: {"alg":"HS256","typ":"LJ"}  -> "License JSON"
const enc = new TextEncoder();

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
}
async function hmacSHA256(keyBytes, dataStr){
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name:'HMAC', hash:'SHA-256' }, false, ['sign','verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(dataStr));
  return b64url(sig);
}
function nowSec(){ return Math.floor(Date.now()/1000); }
function days(n){ return n*24*60*60; }
function json(body, status=200){ return new Response(JSON.stringify(body), {status, headers:{'content-type':'application/json'}}); }
function parseJSONSafe(txt){ try{return JSON.parse(txt)}catch(_){return null} }

// Basit memory revocation store (prod'da KV/DB kullan)
const revoked = new Set();

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'OPTIONS') {
      return new Response(null, {headers: corsHeaders()});
    }

    // CORS
    const withCors = (res) => {
      const h = new Headers(res.headers);
      for (const [k,v] of Object.entries(corsHeaders())) h.set(k,v);
      return new Response(res.body, {status:res.status, headers:h});
    };

    if (path === '/api/license/issue' && req.method === 'POST') {
      const body = parseJSONSafe(await req.text()) || {};
      const { product, type='regular', buyer=null, days_valid=365 } = body;

      // Basit doğrulamalar
      const allowed = (env.ALLOWED_PRODUCTS||'').split(',').map(s=>s.trim()).filter(Boolean);
      if (!product || (allowed.length && !allowed.includes(product))) {
        return withCors(json({ok:false, error:'invalid_product'}, 400));
      }
      if (!['regular','extended'].includes(type)) {
        return withCors(json({ok:false, error:'invalid_type'}, 400));
      }

      // Payload (claims)
      const iat = nowSec();
      const exp = iat + days(days_valid);
      const claims = {
        p: product,
        t: type,
        iss: env.ISSUER_ADDR, // zincirdeki/duyurduğun cüzdan adresi
        iat, exp,
        buyer: buyer || null,
        v: 1 // schema versiyon
      };

      const header = { alg:'HS256', typ:'LJ' };
      const keyBytes = enc.encode(env.LIC_SECRET);
      const payloadStr = b64url(enc.encode(JSON.stringify(header))) + '.' +
                         b64url(enc.encode(JSON.stringify(claims)));
      const sig = await hmacSHA256(keyBytes, payloadStr);

      const token = `${payloadStr}.${sig}`;
      return withCors(json({ ok:true, token, claims }));
    }

    if (path === '/api/license/verify' && req.method === 'POST') {
      const body = parseJSONSafe(await req.text()) || {};
      const { token } = body;
      if (!token) return withCors(json({ok:false,error:'missing_token'},400));

      const parts = token.split('.');
      if (parts.length !== 3) return withCors(json({ok:false,error:'bad_format'},400));

      const [h64, p64, sig] = parts;
      let claims;
      try {
        claims = JSON.parse(atob(p64.replaceAll('-','+').replaceAll('_','/')));
      } catch {
        return withCors(json({ok:false,error:'bad_payload'},400));
      }

      // İmza doğrula
      const keyBytes = enc.encode(env.LIC_SECRET);
      const expectSig = await hmacSHA256(keyBytes, `${h64}.${p64}`);
      if (sig !== expectSig) return withCors(json({ok:false,status:'INVALID_SIGNATURE'},200));

      // Süre/iptal/issuer kontrol
      const now = nowSec();
      if (now > (claims.exp||0)) return withCors(json({ok:false,status:'EXPIRED', claims}),200);
      if (env.ISSUER_ADDR && (claims.iss||'').toLowerCase() !== env.ISSUER_ADDR.toLowerCase()) {
        return withCors(json({ok:false,status:'BAD_ISSUER', claims}),200);
      }
      // revoke edilmiş mi?
      const id = await tokenId(token);
      if (revoked.has(id)) return withCors(json({ok:false,status:'REVOKED', claims}),200);

      return withCors(json({ok:true,status:'VALID', claims}));
    }

    if (path === '/api/license/revoke' && req.method === 'POST') {
      // basit demo; prod'da auth şart
      const body = parseJSONSafe(await req.text()) || {};
      const { token } = body;
      if (!token) return withCors(json({ok:false,error:'missing_token'},400));
      revoked.add(await tokenId(token));
      return withCors(json({ok:true,status:'REVOKED'}));
    }

    return withCors(json({ok:false,error:'not_found'},404));
  }
};

async function tokenId(token){
  // kısa, deterministic id: SHA-256(token) -> ilk 16 hex
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const hex = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  return hex.slice(0,16);
}

function corsHeaders(){
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization'
  };
}
