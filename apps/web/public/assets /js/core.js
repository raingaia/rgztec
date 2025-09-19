/* RGZTEC Core Utils (global) */
window.RGZ = window.RGZ || {};
(function(RGZ){
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  async function fetchJSON(url){
    const r = await fetch(url, {cache:'no-store'});
    if(!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json();
  }
  function setYear(sel){ const el = $(sel); if(el) el.textContent = new Date().getFullYear(); }

  RGZ.$ = $; RGZ.$$ = $$; RGZ.esc = esc; RGZ.fetchJSON = fetchJSON; RGZ.setYear = setYear;
})(window.RGZ);
