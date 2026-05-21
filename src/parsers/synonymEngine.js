/**
 * Lead Scraper Pro - Synonym Detection Engine
 */

export const synonymEngine = {
    // Dictionary of common business categories, product terms, and synonyms
    dictionary: {
        // Construction & Materials
        'tiles': ['tile', 'ceramic', 'flooring', 'granite', 'marble', 'vitrified', 'floor tiles', 'wall tiles', 'tiles dealer'],
        'cement': ['concrete', 'building material', 'construction material', 'cement supplier'],
        'steel': ['iron', 'metal', 'steel rods', 'TMT', 'construction steel'],
        
        // Electronics & Technology
        'mobile': ['smartphone', 'phone', 'cell phone', 'handset', 'mobile phone'],
        'laptop': ['notebook', 'computer', 'PC', 'MacBook', 'Chromebook', 'personal computer', 'computers', 'electronics', 'hardware', 'desktop'],
        'ac': ['air conditioner', 'cooling', 'HVAC', 'air conditioning', 'ac repair', 'cooling system', 'heating', 'ventilation', 'technician'],
        'headphones': ['headphone', 'headset', 'earphone', 'earphones', 'bluetooth', 'audio', 'sound', 'music', 'electronics', 'wireless'],
        
        // Services
        'plumber': ['plumbing', 'pipe repair', 'water fitting', 'sanitary', 'drainage', 'plumbing service', 'repair', 'maintenance'],
        'electrician': ['electrical', 'wiring', 'electrical work', 'electric repair', 'electrician'],
        'carpenter': ['carpentry', 'wood work', 'furniture', 'woodworking'],
        
        // Real Estate
        'estate': ['real estate', 'property', 'realty', 'estate agent', 'property dealer', 'property developers'],
        'villa': ['bungalow', 'house', 'independent house', 'luxury home'],
        'flat': ['apartment', 'residential unit', 'flat', 'housing'],
        
        // Automotive
        'bike': ['motorcycle', 'two wheeler', 'motorbike', 'bike parts', 'bicycle', 'spares', 'accessories'],
        'car': ['automobile', 'vehicle', 'motor vehicle', 'car parts'],
        'tyre': ['tire', 'wheel', 'tyre shop', 'tire dealer'],
        
        // Food & Agriculture
        'banana': ['fruit', 'fresh banana', 'banana supplier', 'produce', 'agriculture', 'farm', 'organic'],
        'rice': ['grain', 'basmati', 'rice supplier', 'food grain'],
        
        // General
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
