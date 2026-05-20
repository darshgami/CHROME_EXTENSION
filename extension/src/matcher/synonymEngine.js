/**
 * Lead Scraper Pro - Synonym Detection Engine
 */

export const synonymEngine = {
    // Dictionary of common business categories, product terms, and synonyms
    dictionary: {
        'banana': ['fruit', 'agriculture', 'farm', 'produce', 'banana', 'bananas', 'agro', 'organic', 'wholesaler', 'distributor', 'musa'],
        'headphones': ['headphone', 'headset', 'earphone', 'earphones', 'bluetooth', 'audio', 'sound', 'music', 'electronics', 'wireless'],
        'bike parts': ['bicycle', 'motorcycle', 'bike', 'spares', 'accessories', 'components', 'gears', 'wheels', 'mechanic', 'automotive', 'auto parts'],
        'ac repair': ['air conditioning', 'hvac', 'heating', 'cooling', 'ventilation', 'ac service', 'repair', 'maintenance', 'technician'],
        'laptops': ['laptop', 'notebook', 'pc', 'computer', 'computers', 'electronics', 'hardware', 'dealers', 'it support', 'desktop'],
        'clothing': ['apparel', 'garments', 'clothes', 'fashion', 'boutique', 'wear', 'textiles', 'retailer', 'wholesaler'],
        'software': ['it', 'tech', 'software development', 'programming', 'developer', 'saas', 'web design', 'digital', 'agency'],
        'hotel': ['hotels', 'resort', 'stay', 'motel', 'lodging', 'guesthouse', 'accommodation', 'hospitality'],
        'restaurant': ['restaurants', 'food', 'cafe', 'diner', 'eatery', 'bistro', 'caterer', 'dining', 'kitchen']
    },

    /**
     * Get synonyms for a given search query, normalizing inputs.
     * @param {string} keyword 
     * @returns {string[]}
     */
    getSynonyms(keyword) {
        if (!keyword) return [];
        const normalized = keyword.toLowerCase().trim();
        
        // Direct matching
        if (this.dictionary[normalized]) {
            return this.dictionary[normalized];
        }
        
        // Partial matching
        for (const key in this.dictionary) {
            if (normalized.includes(key) || key.includes(normalized)) {
                return this.dictionary[key];
            }
        }
        
        // Fallback: splitting words and finding synonyms
        const words = normalized.split(/\s+/);
        if (words.length > 1) {
            const allSynonyms = new Set();
            words.forEach(word => {
                const syns = this.getSynonyms(word);
                syns.forEach(s => allSynonyms.add(s));
            });
            return Array.from(allSynonyms);
        }
        
        return [normalized];
    }
};
