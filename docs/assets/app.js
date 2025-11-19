// Yılı otomatik yaz
const y = document.getElementById("y");
if (y) y.textContent = new Date().getFullYear();

// Ana sayfadaki kartları doldur
async function loadHome() {
  const wrap = document.getElementById("cards");
  if (!wrap) return; // sadece index.html için çalışsın

  const res = await fetch("assets/data/products.json");
  const db = await res.json();

  wrap.innerHTML = db.categories.map(it => `
    <article class="card">
      <div class="card-inner">
        <div class="face front">
          <div>
            <div class="title">${it.name}</div>
            <div class="desc">Explore curated ${it.name.toLowerCase()}.</div>
          </div>
        </div>
        <div class="face back">
          <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
            <a class="btn small" href="#" data-demo="demos/${it.slug}/index.html">Demo</a>
            <a class="btn small secondary" href="products/category.html?cat=${it.slug}">View</a>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  // Demo butonlarını bağla
  document.querySelectorAll("[data-demo]").forEach(btn=>{
    btn.addEventListener("click", e=>{
      e.preventDefault();
      openDemo(btn.dataset.demo, btn.textContent);
    });
  });
}

// Demo modal aç/kapat
function openDemo(url, title){
  const modal = document.getElementById("demoModal");
  const frame = document.getElementById("demoFrame");
  if(!modal || !frame) return;
  frame.src = url;
  modal.classList.remove("hidden");
  document.title = `Demo – ${title}`;
}
const demoClose = document.getElementById("demoClose");
if (demoClose) {
  demoClose.addEventListener("click", ()=>{
    document.getElementById("demoModal").classList.add("hidden");
    document.getElementById("demoFrame").src = "";
  });
}

// sayfa yüklenince çalıştır
loadHome();
