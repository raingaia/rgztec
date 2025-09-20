// Header'a “is-scrolled” sınıfı ekle – kurumsal gölge için
(function(){
  const hdr = document.querySelector('.header-outer, .topbar');
  if(!hdr) return;
  const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();
