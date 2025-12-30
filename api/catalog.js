async function loadCategories() {
  const response = await fetch('/api/catalog'); // Senin handler fonksiyonuna gider
  const result = await response.json();
  
  if (result.ok) {
    const catalogData = result.data;
    // catalogData içindeki kategorileri (Category 1, 2 vb.) bul ve 
    // Ana sayfadaki yatay menüye (Hardware Lab, Game Makers vb.) bas
    renderCategoryMenu(catalogData.categories); 
  }
}

function renderCategoryMenu(categories) {
  const menuContainer = document.querySelector('.categories-nav'); // Menü sınıfın
  menuContainer.innerHTML = categories.map(cat => `
    <button class="nav-item" onclick="filterByCategory('${cat.id}')">
      ${cat.name}
    </button>
  `).join('');
}
