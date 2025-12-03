/* ============================================================
   RGZTEC • GLOBAL SEARCH ENGINE
   Tek beyin - Tüm sayfalarda ortak çalışan arama sistemi
   ------------------------------------------------------------
   Çalışma Mantığı:
   - Kullanıcı .search-input içine yazınca 250ms debounce
   - store.data.json hafızaya bir kez yüklenir (cache)
   - Listeleme için: /rgztec/listings.html?q=SEARCH_TEXT
   ============================================================ */

window.RGZTEC_SEARCH = {
    cache: null,
    loading: false,
    timer: null,
    DATA_URL: "/rgztec/data/store.data.json",

    /* JSON'u 1 kez yükler, bellekten kullanır */
    async loadData() {
        if (this.cache) return this.cache;

        try {
            this.loading = true;
            const res = await fetch(this.DATA_URL + "?v=" + Date.now());
            if (!res.ok) throw new Error("Cannot load store.data.json");

            this.cache = await res.json();
            this.loading = false;
            return this.cache;

        } catch (err) {
            console.error("RGZTEC SEARCH ERROR:", err);
            this.loading = false;
            return {};
        }
    },

    /* Arama kutusuna yazılan değeri yakalar */
    query(text) {
        clearTimeout(this.timer);
        const q = text.trim();

        if (!q) return;

        this.timer = setTimeout(() => {
            const encoded = encodeURIComponent(q);
            window.location.href = `/rgztec/listings.html?q=${encoded}`;
        }, 250);
    }
};


/* ============================================================
   OTOMATİK INPUT DİNLEYİCİ
   - Tüm sayfalardaki .search-input öğelerini otomatik yakalar
   ============================================================ */
document.addEventListener("input", (e) => {
    if (e.target.matches(".search-input")) {
        RGZTEC_SEARCH.query(e.target.value);
    }
});
