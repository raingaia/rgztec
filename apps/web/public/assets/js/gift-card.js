/* RGZTEC • Gift Card -> Cart (no alerts, preview friendly) */
(function () {
  const KEY = 'rgz_cart_v1';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const money = (amt = 0, cur = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(Number(amt) || 0);

  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(items){ localStorage.setItem(KEY, JSON.stringify(items)); }

  function esc(s=''){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function readCurrency(){
    const c = ($('#currency')?.value || 'USD').toUpperCase().trim();
    return /^[A-Z]{3}$/.test(c) ? c : 'USD';
  }

  function readAmount(){
    // preset radio -> custom input > 0 ise custom öncelikli
    const preset = $('input[name="amountPreset"]:checked');
    let v = preset ? Number(preset.value) : 0;
    const custom = Number($('#amtCustom')?.value || 0);
    if (custom > 0) v = custom;
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  function genCode(){
    const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const pick = n => Array(n).fill(0).map(()=> s[Math.floor(Math.random()*s.length)]).join('');
    return `RGZ-${pick(4)}${pick(4)}-${pick(4)}`; // sadece önizleme
  }

  function toast(msg){
    let t = $('#toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'toast';
      Object.assign(t.style, {
        position:'fixed', left:'50%', bottom:'18px', transform:'translateX(-50%)',
        background:'#111827', color:'#fff', padding:'10px 14px', borderRadius:'10px',
        fontWeight:'600', zIndex:2147483647, transition:'opacity .25s'
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._hide);
    t._hide = setTimeout(()=> t.style.opacity = '0', 1200);
  }

  function updatePreview(){
    const cur = readCurrency();
    const amt = readAmount();
    const toName = $('#toName')?.value || '';
    const from = $('#fromName')?.value || '';
    const msg = $('#message')?.value || '';

    const pAmt = $('#pvAmount');   if (pAmt) pAmt.textContent = money(amt, cur);
    const pTo  = $('#pvToName');   if (pTo)  pTo.textContent  = toName || '—';
    const pFr  = $('#pvFromName'); if (pFr)  pFr.textContent  = from   || '—';
    const pMsg = $('#pvMessage');  if (pMsg) pMsg.textContent = msg    || '';

    // bir kere üret, sabit kalsın
    const pCode = $('#pvCode');
    if (pCode && !pCode.dataset.fixed) {
      pCode.textContent = genCode();
      pCode.dataset.fixed = '1';
    }
  }

  function addToCart(e){
    e?.preventDefault?.();

    const amount   = readAmount();
    const currency = readCurrency();
    const toName   = $('#toName')?.value?.trim() || '';
    const toEmail  = $('#toEmail')?.value?.trim() || '';
    const fromName = $('#fromName')?.value?.trim() || '';
    const message  = $('#message')?.value?.trim() || '';
    const delivery = $('#delivery')?.value || '';

    if (!amount)  { toast('Choose an amount'); return; }
    if (!toEmail) { toast('Recipient email required'); return; }

    const gcItem = {
      type: 'gift-card',
      currency,
      amount,
      to: { name: toName, email: toEmail },
      from: fromName,
      message,
      delivery_date: delivery
    };

    const items = load();
    items.push(gcItem);
    save(items);

    toast('Added to cart');
    setTimeout(()=> { location.href = 'cart'; }, 300);
  }

  // Bağlantılar
  $('#btnGiftAdd')?.addEventListener('click', addToCart);

  // Canlı önizleme (varsa)
  ['input','change','keyup'].forEach(ev=>{
    $('#currency')?.addEventListener(ev, updatePreview);
    $('#amtCustom')?.addEventListener(ev, updatePreview);
    $$('input[name="amountPreset"]').forEach(r => r.addEventListener('change', updatePreview));
    $('#toName')?.addEventListener(ev, updatePreview);
    $('#fromName')?.addEventListener(ev, updatePreview);
    $('#message')?.addEventListener(ev, updatePreview);
  });
  updatePreview();
})();
