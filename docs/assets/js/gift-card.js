/* RGZTEC • Gift Card -> Cart (robust, no alerts) */
(function () {
  const KEY = 'rgz_cart_v1';
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const money = (a = 0, c = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(Number(a) || 0);

  // ---- Flexible selectors (ID yoksa name'lere de bak) ----
  const pick = (sels) => sels.map(s => document.querySelector(s)).find(Boolean);

  const els = {
    btnAdd   : pick(['#btnGiftAdd', 'button[data-action="add-gc"]', '#addToCart', '.add-to-cart button', '.add-to-cart']),
    currency : pick(['#currency', '#giftCurrency', 'select[name="currency"]']),
    amountPresetAll: () => $$('input[name="amountPreset"], input[name="amount"]'),
    amtCustom: pick(['#amtCustom', '#amountCustom', 'input[name="custom-amount"]']),
    toName   : pick(['#toName', 'input[name="recipient_name"]']),
    toEmail  : pick(['#toEmail', 'input[name="recipient_email"]']),
    fromName : pick(['#fromName', 'input[name="from_name"]']),
    delivery : pick(['#delivery', 'input[name="delivery_date"]']),
    message  : pick(['#message', 'textarea[name="message"]']),
    pvAmount : pick(['#pvAmount']),
    pvToName : pick(['#pvToName']),
    pvFrom   : pick(['#pvFromName']),
    pvMsg    : pick(['#pvMessage']),
    pvCode   : pick(['#pvCode'])
  };

  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
  function save(v){ localStorage.setItem(KEY, JSON.stringify(v)); }
  const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const toast = (() => {
    let box;
    return (msg) => {
      if (!box) {
        box = document.createElement('div');
        Object.assign(box.style, {
          position:'fixed', left:'50%', bottom:'18px', transform:'translateX(-50%)',
          background:'#111827', color:'#fff', padding:'10px 14px', borderRadius:'10px',
          fontWeight:'600', zIndex:2147483647, transition:'opacity .25s'
        });
        document.body.appendChild(box);
      }
      box.textContent = msg; box.style.opacity = '1';
      clearTimeout(box._t); box._t = setTimeout(()=> box.style.opacity='0', 1200);
    };
  })();

  const pickCurrency = () => {
    const v = (els.currency?.value || 'USD').toUpperCase().trim();
    return /^[A-Z]{3}$/.test(v) ? v : 'USD';
  };

  const pickAmount = () => {
    let v = 0;
    // preset (radio)
    const sel = els.amountPresetAll().find(r => r.checked);
    if (sel) v = Number(sel.value);
    // custom > 0 ise override
    const custom = Number(els.amtCustom?.value || 0);
    if (custom > 0) v = custom;
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const genCode = () => {
    const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const g = n => Array(n).fill(0).map(()=> s[Math.floor(Math.random()*s.length)]).join('');
    return `RGZ-${g(4)}${g(4)}-${g(4)}`;
  };

  function updatePreview(){
    const cur = pickCurrency();
    const amt = pickAmount();
    const to  = els.toName?.value || '';
    const fr  = els.fromName?.value || '';
    const mg  = els.message?.value || '';

    if (els.pvAmount) els.pvAmount.textContent = money(amt, cur);
    if (els.pvToName) els.pvToName.textContent = to || '—';
    if (els.pvFrom)   els.pvFrom.textContent   = fr || '—';
    if (els.pvMsg)    els.pvMsg.textContent    = mg || '';

    if (els.pvCode && !els.pvCode.dataset.fixed){
      els.pvCode.textContent = genCode();
      els.pvCode.dataset.fixed = '1';
    }
  }

  function addToCart(e){
    e?.preventDefault?.();
    e?.stopImmediatePropagation?.();

    const amount = pickAmount();
    const currency = pickCurrency();
    const toName = els.toName?.value?.trim() || '';
    const toEmail = els.toEmail?.value?.trim() || '';
    const fromName = els.fromName?.value?.trim() || '';
    const message = els.message?.value?.trim() || '';
    const delivery = els.delivery?.value || '';

    if (!amount)  return toast('Choose an amount');
    if (!toEmail) return toast('Recipient email required');

    const gc = {
      type: 'gift-card',
      currency,
      amount,
      to: { name: toName, email: toEmail },
      from: fromName,
      message,
      delivery_date: delivery
    };

    const items = load(); items.push(gc); save(items);
    toast('Added to cart');
    setTimeout(()=> { location.href = 'cart'; }, 250);
  }

  // Event bind + eski onclick’i iptal et
  if (els.btnAdd){
    try { els.btnAdd.onclick = null; els.btnAdd.removeAttribute?.('onclick'); } catch {}
    els.btnAdd.addEventListener('click', addToCart);
  }

  // Live preview
  ['input','change','keyup'].forEach(ev=>{
    els.currency?.addEventListener(ev, updatePreview);
    els.amtCustom?.addEventListener(ev, updatePreview);
    els.amountPresetAll().forEach(r => r.addEventListener('change', updatePreview));
    els.toName?.addEventListener(ev, updatePreview);
    els.fromName?.addEventListener(ev, updatePreview);
    els.message?.addEventListener(ev, updatePreview);
  });

  updatePreview();
  // Konsol hızlı kontrol
  window.gcReady = true;
})();
