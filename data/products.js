// data/products.js
// Katalog başlangıçta boş. Ürünler UI'dan eklendiğinde localStorage'tan yüklenir.
// Geriye dönük uyumluluk: hem `products` hem `RGZ_PRODUCTS` global'leri set edilir.
// Yeni kullanım: window.RGZDB.getProducts(), addProduct(), replaceAll()// JSON uyumluluğu için window.products export
window.products = window.RGZDB.getAll();
(function (global) {
  const LS_KEY = 'RGZ_PRODUCTS';
  const initial = []; // statik seed istersen buraya ekleyebilirsin

  // ----- helpers -----
  function isPlainObject(o){ return o && typeof o === 'object' && !Array.isArray(o); }
  function normalize(p){
    // beklenen minimal şema
    return {
      id: String(p.id || ('p' + Math.floor(Math.random()*1e9))),
      store: String(p.store || p.storeId || '').toLowerCase(), // storeId -> store
      title: String(p.title || ''),
      price: Number(p.price || 0),
      img: p.img || p.image || './public/placeholder.png',
      desc: p.desc || p.description || '',
      tags: Array.isArray(p.tags) ? p.tags : []
    };
  }

  function readLS(){
    try {
      const raw = global.localStorage.getItem(LS_KEY);
      if(!raw) return null;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(normalize) : null;
    } catch { return null; }
  }

  function writeLS(arr){
    try {
      global.localStorage.setItem(LS_KEY, JSON.stringify(arr ?? []));
    } catch {}
  }

  // ----- state -----
  let _products = readLS() || initial.slice();

  // geri uyumluluk globalleri
  global.products = _products;
  global.RGZ_PRODUCTS = _products;

  // ----- public API -----
  const api = {
    getAll(){ return _products.slice(); },
    getProducts(filter = {}){
      const { store, q, tag } = filter;
      let list = _products.slice();
      if (store) list = list.filter(p => (p.store||'').toLowerCase() === String(store).toLowerCase());
      if (tag) {
        const t = String(tag).toLowerCase();
        list = list.filter(p =>
          (p.tags && p.tags.some(x => String(x).toLowerCase() === t)) ||
          String(p.title||'').toLowerCase().includes(t)
        );
      }
      if (q) {
        const s = String(q).toLowerCase();
        list = list.filter(p =>
          String(p.title||'').toLowerCase().includes(s) ||
          String(p.desc||'').toLowerCase().includes(s)
        );
      }
      return list;
    },
    addProduct(p){
      if(!isPlainObject(p)) return null;
      const item = normalize(p);
      _products.push(item);
      writeLS(_products);
      // geri uyumluluk güncelle
      global.products = _products;
      global.RGZ_PRODUCTS = _products;
      // event
      try { global.dispatchEvent(new CustomEvent('rgz:products:changed', { detail: { type:'add', item } })); } catch {}
      return item;
    },
    replaceAll(arr){
      _products = Array.isArray(arr) ? arr.map(normalize) : [];
      writeLS(_products);
      global.products = _products;
      global.RGZ_PRODUCTS = _products;
      try { global.dispatchEvent(new CustomEvent('rgz:products:changed', { detail: { type:'replace', items:_products } })); } catch {}
      return _products.slice();
    },
    clear(){
      _products = [];
      writeLS(_products);
      global.products = _products;
      global.RGZ_PRODUCTS = _products;
      try { global.dispatchEvent(new CustomEvent('rgz:products:changed', { detail: { type:'clear' } })); } catch {}
    }
  };

  global.RGZDB = Object.freeze(api);
})(window);

