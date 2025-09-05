<script>
/**
 * PromoEngine v1 — RGZTEC
 * Beklenen sepet modeli:
 * cart = {
 *   items: [{ id, title, price, qty, cat, store }...],
 *   shipping:  { cost: number },
 *   subtotal:  number, // items toplamı
 *   currency:  "USD"
 * }
 */
const PromoEngine = (() => {
  const loadJSON = async (url) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed: "+url);
    return res.json();
  };

  const nowISO = () => new Date().toISOString();

  // Kullanım takibi (localStorage) — login yoksa cihaz bazlı.
  const usedKey = (code) => `rgztec_promo_used_${code}`;
  const incUsageLocal = (code) => {
    const k = usedKey(code);
    const n = +localStorage.getItem(k) || 0;
    localStorage.setItem(k, String(n+1));
  };
  const getUsageLocal = (code) => +localStorage.getItem(usedKey(code)) || 0;

  // Kapsam kontrolü
  const fitsScope = (item, scope) => {
    if (!scope || scope.type === "site") return true;
    if (scope.type === "category") return scope.ids?.includes(item.cat);
    if (scope.type === "product")  return scope.ids?.includes(String(item.id));
    if (scope.type === "store")    return scope.ids?.includes(item.store);
    return false;
  };

  // İndirim hesaplama
  const computeDiscount = (cart, promo) => {
    const eligibleItems = cart.items.filter(i => fitsScope(i, promo.scope));
    const eligibleSubtotal = eligibleItems.reduce((s,i)=>s + i.price * i.qty, 0);

    if (promo.type === "shipping") {
      const val = Math.min(cart.shipping?.cost || 0, promo.value || 0);
      return { itemsTotal: 0, shippingOff: val, totalOff: val };
    }

    if (promo.type === "fixed") {
      const off = Math.min(eligibleSubtotal, promo.value || 0);
      return { itemsTotal: off, shippingOff: 0, totalOff: off };
    }

    if (promo.type === "percent") {
      const off = Math.round(eligibleSubtotal * (promo.value || 0) / 100 * 100) / 100;
      return { itemsTotal: off, shippingOff: 0, totalOff: off };
    }

    return { itemsTotal: 0, shippingOff: 0, totalOff: 0 };
  };

  // Doğrulama
  const validate = (promo, cart, totalsUsage) => {
    const now = nowISO();
    if (promo.start && now < promo.start) return "Campaign not started yet.";
    if (promo.end   && now > promo.end)   return "Campaign expired.";
    if ((promo.usage_limit|0) > 0 && (totalsUsage[promo.code] || 0) >= promo.usage_limit)
      return "Campaign usage limit reached.";
    if ((promo.per_user_limit|0) > 0 && getUsageLocal(promo.code) >= promo.per_user_limit)
      return "You already used this code.";

    if ((promo.min_cart|0) > 0) {
      const eligibleSubtotal = cart.items
        .filter(i => fitsScope(i, promo.scope))
        .reduce((s,i)=>s + i.price * i.qty, 0);
      if (eligibleSubtotal < promo.min_cart) return `Min. cart ${promo.min_cart} required.`;
    }
    return null;
  };

  // Toplam kullanım sayacı (basit) — gerçek üretimde backend sayar.
  let USAGE = {};
  const bumpUsage = (code) => { USAGE[code] = (USAGE[code]||0)+1; };

  // Public API
  return {
    async init() {
      const [promos, giftcards] = await Promise.all([
        loadJSON("/data/promos.json"),
        loadJSON("/data/giftcards.json")
      ]);
      this.promos = (promos.promos || []).map(p => ({ stacking:false, ...p, code:String(p.code||"").toUpperCase().trim() }));
      this.giftcards = (giftcards.giftcards || []).map(g => ({ ...g, code:String(g.code||"").toUpperCase().trim() }));
      return this;
    },

    findPromo(code) {
      const k = String(code||"").toUpperCase().trim();
      return this.promos.find(p => p.code === k);
    },

    findGift(code) {
      const k = String(code||"").toUpperCase().trim();
      return this.giftcards.find(g => g.code === k);
    },

    // Ana uygulama noktası
    applyCode(cart, code) {
      const k = String(code||"").toUpperCase().trim();
      if (!k) return { ok:false, kind:null, message:"Enter a code." };

      // Gift card mı?
      const gift = this.findGift(k);
      if (gift) {
        if (!gift.active) return { ok:false, kind:"gift", message:"Gift card inactive." };
        if (gift.expires && nowISO() > gift.expires) return { ok:false, kind:"gift", message:"Gift card expired." };
        const subtotalPlusShip = cart.subtotal + (cart.shipping?.cost || 0);
        const use = Math.min(gift.balance, subtotalPlusShip);
        if (use <= 0) return { ok:false, kind:"gift", message:"Nothing to pay with gift card." };
        // Not: gerçek uygulamada bakiyeyi sunucu düşer.
        return {
          ok:true, kind:"gift",
          gift: { code:k, used: use, remaining: gift.balance - use },
          discount: { itemsTotal: 0, shippingOff: 0, totalOff: use },
          message: `Gift card applied: -${use} ${cart.currency}`
        };
      }

      // Promo mu?
      const promo = this.findPromo(k);
      if (!promo) return { ok:false, kind:"promo", message:"Invalid code." };

      const vmsg = validate(promo, cart, USAGE);
      if (vmsg) return { ok:false, kind:"promo", message: vmsg };

      const discount = computeDiscount(cart, promo);
      if (discount.totalOff <= 0) return { ok:false, kind:"promo", message:"Code not applicable to items in cart." };

      // sayacı artır (lokal & bellek)
      bumpUsage(promo.code);
      incUsageLocal(promo.code);

      return {
        ok:true, kind:"promo",
        promo: { code: promo.code, type: promo.type, value: promo.value, scope: promo.scope, stacking: !!promo.stacking },
        discount,
        message: `Applied ${promo.code}: -${discount.totalOff} ${cart.currency}`
      };
    }
  };
})();
</script>
