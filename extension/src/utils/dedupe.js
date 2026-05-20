/**
 * Lead Scraper Pro - Deduplication Utilities
 */

export const dedupe = {
    /**
     * Generate a unique key for a lead based on phone, email, or normalized name + city.
     * @param {Object} lead 
     * @returns {string}
     */
    generateKey(lead) {
        if (lead.phone) {
            // Clean phone (keep only digits)
            const cleanPhone = lead.phone.replace(/\D/g, '');
            if (cleanPhone.length >= 7) return `phone-${cleanPhone}`;
        }
        
        if (lead.email) {
            return `email-${lead.email.trim().toLowerCase()}`;
        }
        
        const cleanName = (lead.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanCity = (lead.city || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        return `name-city-${cleanName}-${cleanCity}`;
    },

    /**
     * Deduplicates an array of leads, keeping the one with higher confidence/relevance score.
     * @param {Array} leads 
     * @returns {Array}
     */
    filterDuplicates(leads) {
        const seen = new Map();
        
        leads.forEach(lead => {
            const key = this.generateKey(lead);
            const existing = seen.get(key);
            
            if (!existing || (lead.relevanceScore || 0) > (existing.relevanceScore || 0)) {
                seen.set(key, lead);
            }
        });
        
        return Array.from(seen.values());
    }
};
