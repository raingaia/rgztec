(async function(){
  try{
    const res = await fetch('/rgztec/assets/partials/header.html?v=4', {cache:'no-store'});
    const html = await res.text();
    document.body.insertAdjacentHTML('afterbegin', html);
  }catch(e){ console.error('header load failed', e); }

  // aktif kategori işaretle
  const path = location.pathname.toLowerCase();
  const map = [
    {key:'web',      match:['/dev-studio-one','/web-templates']},
    {key:'ecom',     match:['/ecommerce','/e-commerce','/marketplace']},
    {key:'widgets',  match:['/widgets','/icon-smith','/ai-tools-hub','/wp-plugins','/tiny-js-lab']},
    {key:'software', match:['/reactorium','/game-makers','/unity-hub','/software']},
    {key:'niche',    match:['/email-forge','/niche']}
  ];
  const activeKey = (map.find(m => m.match.some(seg => path.includes(seg)))||{}).key;
  if (activeKey){
    const el = document.querySelector(`.categories a[data-key="${activeKey}"]`);
    if (el) el.classList.add('active');
  }
})();
