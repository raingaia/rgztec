/**
 * RGZ Central Data & Search Hub
 * Katalog verilerini yönetir ve gelişmiş arama/filtreleme sağlar.
 */
const SearchHub = {
    // Ham veriyi kategorize ederek önbelleğe alır
    cache: {
        all: [],
        hardware: [],
        digital: []
    },

    /**
     * Veriyi Başlatır: Engine'den gelen veriyi tipine göre ayırır.
     */
    init(products) {
        this.cache.all = products;
        this.cache.hardware = products.filter(p => p.type === 'hardware');
        this.cache.digital = products.filter(p => p.type === 'digital');
        console.log("SearchHub: Data Indexed.");
    },

    /**
     * Merkezi Arama Fonksiyonu
     * @param {string} query - Arama terimi
     * @param {string} category - 'all', 'hardware', 'digital'
     */
    executeSearch(query, category = 'all') {
        const searchTerm = query.toLowerCase().trim();
        const dataSource = this.cache[category] || this.cache.all;

        if (!searchTerm) return dataSource;

        return dataSource.filter(item => {
            return (
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        });
    },

    /**
     * Katalog Verisi Getir (Filtreli)
     */
    getCatalog(filter = {}) {
        let results = [...this.cache.all];

        if (filter.type) {
            results = results.filter(p => p.type === filter.type);
        }
        
        if (filter.minPrice) {
            results = results.filter(p => p.price >= filter.minPrice);
        }

        return results;
    }
};

export default SearchHub;
