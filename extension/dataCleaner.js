/**
 * Lead Scraper Pro - Data Cleaner
 */

export const dataCleaner = {
    cleanName(name) {
        if (!name) return '';
        return name
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '') // Emojis
            .replace(/\s+/g, ' ')
            .trim();
    },

    cleanAddress(address) {
        if (!address) return '';
        return address
            .replace(/\s+/g, ' ')
            .replace(/,+/g, ',')
            .trim();
    },

    normalizePhone(phone, countryCode) {
        if (!phone) return '';
        let cleaned = phone.replace(/[^\d+]/g, '');
        // Basic normalization, can be more complex per country
        return cleaned;
    }
};
