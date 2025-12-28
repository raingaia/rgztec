/**
 * RGZ Central Data & Search Hub
 * Veri dağıtımı, gelişmiş arama ve katalog filtreleme merkezi.
 */
const SearchHub = {
    cache: {
        all: [],
        hardware: [],
        digital: []
    },

    /**
     * Veriyi İndeksler: Engine'den gelen ham veriyi kategorize eder.
     */
    init(products) {
        this.cache.all = products || [];
        this.cache.hardware = this.cache.all.filter(p => p.type === 'hardware' || p.category === 'hardware');
        this.cache.digital = this.cache.all.filter(p => p.type === 'digital' || p.category === 'digital');
        console.log(`SearchHub: ${this.cache.all.length} items indexed.`);
    },

    /**
     * Gelişmiş Arama: İsim, açıklama ve etiketlerde (tags) arama yapar.
     */
    executeSearch(query, scope = 'all') {
        const term = query.toLowerCase().trim();
        const source = this.cache[scope] || this.cache.all;

        if (!term) return source;

        return source.filter(item => 
            item.name.toLowerCase().includes(term) || 
            (item.description && item.description.toLowerCase().includes(term)) ||
            (item.tags && item.tags.some(t => t.toLowerCase().includes(term)))
        );
    },

    /**
     * Akıllı Katalog Getirici: Filtreleme parametrelerine göre veri döner.
     */
    getFilteredCatalog({ type, minPrice, maxPrice, sortBy }) {
        let results = type ? (this.cache[type] || []) : [...this.cache.all];

        if (minPrice) results = results.filter(p => p.price >= minPrice);
        if (maxPrice) results = results.filter(p => p.price <= maxPrice);

        if (sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);

        return results;
    }
};

export default SearchHub;
