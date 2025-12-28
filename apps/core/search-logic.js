export const executeSearch = (query, products) => {
    const term = query.toLowerCase().trim();
    if (!term) return products;

    return products.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(term);
        const matchTags = item.tags.some(t => t.toLowerCase().includes(term));
        const matchCat = item.category_id.toLowerCase().includes(term);
        return matchTitle || matchTags || matchCat;
    });
};
