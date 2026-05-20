/**
 * Lead Scraper Pro - Universal Address Extractor
 */

export const addressExtractor = {
    ADDRESS_KEYWORDS: ['street', 'road', 'st', 'rd', 'ave', 'lane', 'ln', 'block', 'city', 'state', 'zip', 'postal', 'address', 'location'],

    extract(container) {
        // 1. Look for <address> tag
        const addrTag = container.querySelector('address');
        if (addrTag) return addrTag.innerText.trim();

        // 2. Look for common class names
        const addrEl = container.querySelector('.address, .location, .company-address, [itemprop="address"]');
        if (addrEl) return addrEl.innerText.trim();

        // 3. Heuristic search: look for multiline text or text with keywords
        const divs = Array.from(container.querySelectorAll('div, p, span'));
        for (const div of divs) {
            const text = div.innerText.trim();
            if (text.length > 10 && text.length < 200) {
                if (this.ADDRESS_KEYWORDS.some(k => text.toLowerCase().includes(k))) {
                    return text;
                }
                // Check for zip/postal code pattern
                if (/\d{5,6}/.test(text) || /[A-Z]\d[A-Z] ?\d[A-Z]\d/i.test(text)) {
                    return text;
                }
            }
        }

        return '';
    },

    parseLocation(address) {
        if (!address) return {};
        const parts = address.split(/,|\n/).map(p => p.trim()).filter(Boolean);
        
        // Simple heuristic: City is often the second to last part
        return {
            city: parts.length > 1 ? parts[parts.length - 2] : '',
            postalCode: address.match(/\d{5,6}/)?.[0] || address.match(/[A-Z]\d[A-Z] ?\d[A-Z]\d/i)?.[0] || ''
        };
    }
};
