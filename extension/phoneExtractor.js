/**
 * Lead Scraper Pro - Global Phone Extractor
 */

export const phoneExtractor = {
    // Universal regex for phone numbers with various international formats
    PHONE_REGEX: /(\+?\d{1,4}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4,9}/g,

    extract(container) {
        const text = container.innerText || '';
        const matches = text.match(this.PHONE_REGEX) || [];
        
        // Also check for tel: links
        const telLinks = Array.from(container.querySelectorAll('a[href^="tel:"]'))
            .map(a => a.href.replace('tel:', '').trim());

        const allPhones = [...new Set([...matches.map(p => p.trim()), ...telLinks])];
        
        // Filter out very short or non-phone numbers
        return allPhones.filter(p => p.replace(/\D/g, '').length >= 7);
    },

    normalize(phone) {
        if (!phone) return '';
        // Basic normalization: remove non-essential chars but keep leading +
        let cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+') && cleaned.length > 7) return cleaned;
        return cleaned;
    }
};
