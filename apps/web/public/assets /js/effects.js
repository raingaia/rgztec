/* RGZTEC Effects: Ambient hero light + Scroll reveal */
(function(){
  // Ambient light follow (hero)
  const hero = document.querySelector('.hero-outer');
  if (hero){
    const set = (x,y)=>{ hero.style.setProperty('--mx', x); hero.style.setProperty('--my', y); };
    set('60%','40%'); // initial
    hero.addEventListener('pointermove', (e)=>{
      const r = hero.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      set(mx.toFixed(2) + '%', my.toFixed(2) + '%');
    });
  }

  // Scroll reveal targets
  const targets = [];
  ['.promos', '#storeRow', '#gallery'].forEach(sel=>{
    const el = document.querySelector(sel);
    if(el){ el.setAttribute('data-reveal',''); targets.push(el); }
  });

  if(!targets.length) return;

  if(!('IntersectionObserver' in window)){
    targets.forEach(el=> el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  },{threshold:.12});

  targets.forEach(el=> io.observe(el));
})();
