/**
 * Lead Scraper Pro - Regex Utilities
 */

export const REGEX = {
    // Universal regex for phone numbers supporting various formats, country codes, spaces, dashes
    PHONE: /(\+?\d{1,4}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4,9}/g,
    
    // Standard email matching regex
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    
    // Website matcher to identify valid HTTP/S links
    WEBSITE: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    
    // Postal code patterns for global support (e.g. US ZIP, Indian Pincode, Canada postal code, UK postcode)
    POSTAL_CODE: /\b\d{5,6}\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b|\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i,
    
    // Address keywords to score container text
    ADDRESS_KEYWORDS: /\b(street|road|lane|ave|st|rd|block|highway|nagar|colony|building|floor|apartment|suite|zip|pincode|postal|city|state|country)\b/i
};

export function extractPhones(text) {
    if (!text) return [];
    const matches = text.match(REGEX.PHONE) || [];
    return matches
        .map(p => p.trim())
        .filter(p => {
            const digits = p.replace(/\D/g, '');
            return digits.length >= 7 && digits.length <= 15;
        });
}

export function extractEmails(text) {
    if (!text) return [];
    return (text.match(REGEX.EMAIL) || []).map(e => e.trim().toLowerCase());
}

export function isPostalCode(text) {
    return REGEX.POSTAL_CODE.test(text);
}
