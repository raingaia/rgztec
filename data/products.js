// data/products.js
// Başlangıçta katalog boş. Ürünler UI'dan eklendiğinde localStorage/Firebase'ten yüklenecek.
// Geriye dönük uyumluluk için hem `products` hem de `RGZ_PRODUCTS` export ediyoruz.

(function (global) {
  const initial = []; // statik başlangıç ürünleri yok
  global.products = initial;
  global.RGZ_PRODUCTS = initial; // eski sayfalar bunu kullanıyorsa bozulmasın
})(window);
