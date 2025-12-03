// =======================================================
// RGZTEC GLOBAL SEARCH ENGINE (Autocomplete + Live Results)
// =======================================================

window.RGZTEC_SEARCH = {
    data: null,

    async load() {
        if (this.data) return this.data;

        const res = await fetch("store.data.json");
        const json = await res.json();

        this.data = json.stores;
        return this.data;
    },

    async search(query) {
        query = query.toLowerCase().trim();
        if (!query) return [];

        const stores = await this.load();
        let results = [];

        stores.forEach(store => {
            store.sections.forEach(section => {
                if (!section.products) return;

                section.products.forEach(product => {
                    const haystack = `
                        ${product.title}
                        ${product.tagline}
                        ${section.name}
                        ${store.title}
                    `.toLowerCase();

                    if (haystack.includes(query)) {
                        results.push({
                            store: store.title,
                            section: section.name,
                            ...product
                        });
                    }
                });
            });
        });

        return results;
    }
};
