/**
 * Lead Scraper Pro - Extraction Fallback System (Auto-Repair)
 * Attempts alternative strategies when standard selectors or heuristics fail.
 */

import { REGEX, extractEmails } from '../utils/regex.js';
import { domHelpers } from '../utils/domHelpers.js';

const INVALID_NAME_PATTERNS = [
    /ratings?\s*&\s*reviews?/i,
    /stars?/i,
    /click\s*here/i,
    /view\s*more/i,
    /get\s*quotes?/i,
    /get\s*list/i,
    /view\s*mobile/i,
    /show\s*number/i,
    /call\s*now/i,
    /contact\s*us/i,
    /reviews?\s*as\s*on/i,
    /map\s*directions?/i,
    /verified\s*leads?/i,
    /top\s*results?/i,
    /search\s*results?/i,
    /^\s*\d+(\.\d+)?\s*(star|rating|review)/i, // ratings like "4.5 stars"
    /click\s*to\s*view/i,
    /enquire\s*now/i,
    /send\s*email/i,
    /send\s*inquiry/i,
];

const INVALID_ADDRESS_PATTERNS = [
    /get\s*quotes?/i,
    /view\s*mobile/i,
    /show\s*number/i,
    /click\s*here/i,
    /view\s*details/i,
    /ratings?\s*&/i,
    /reviews?/i,
    /visit\s*website/i,
];

function isValidBusinessName(name) {
    if (!name) return false;
    const clean = name.trim();
    if (clean.length < 3 || clean.length > 100) return false;
    if (!/[a-zA-Z]/.test(clean)) return false; // Must contain at least one letter
    
    // Check against forbidden standalone generic names
    const genericNames = ['business', 'company', 'shop', 'store', 'supplier', 'dealer', 'view more', 'get quotes'];
    if (genericNames.includes(clean.toLowerCase())) return false;
    
    // Check against invalid patterns
    for (const pattern of INVALID_NAME_PATTERNS) {
        if (pattern.test(clean)) return false;
    }
    return true;
}

function isValidAddress(address) {
    if (!address) return false;
    const clean = address.trim();
    if (clean.length < 5 || clean.length > 300) return false;
    for (const pattern of INVALID_ADDRESS_PATTERNS) {
        if (pattern.test(clean)) return false;
    }
    return true;
}

export const extractionFallback = {
    // High-precision selectors for popular business directories
    domainSelectors: {
        'justdial.com': {
            name: ['h2.store-name a', '.store-name', '.jcn a', '[itemprop="name"]', 'h2 a', 'h2'],
            phone: ['.contact-info', '[href^="tel:"]', '[onclick*="call"]', '.mobilesv', 'span[class*="sprite"]'],
            address: ['.address-info', '.cont_fl_addr', '[itemprop="address"]', '.adr', '.location'],
            website: ['a[href*="http"].website-link', 'a[href*="http"]:not([href*="justdial"])']
        },
        'indiamart.com': {
            name: ['.company-name', '.company_name', '.mcat-provname', '[class*="company"]', '[class*="supplier"]', 'h2', 'h3'],
            phone: ['[class*="phone"]', '[href^="tel:"]', '[class*="pns"]', '.cnt_dt'],
            address: ['.company-address', '.city-name', '[class*="address"]', '.location', '.desc-adr'],
            website: ['a[href*="http"]:not([href*="indiamart"])']
        },
        'sulekha.com': {
            name: ['.listing-title', 'h3[class*="title"]', '.title a', 'h3 a', 'h2', 'h3'],
            phone: ['.phone-number', '[href^="tel:"]', '.tel', '[class*="phone"]'],
            address: ['.address', '.location', '[class*="address"]', '.adr'],
            website: ['a[href*="http"]:not([href*="sulekha"])']
        },
        'yelp.com': {
            name: ['h3 a', 'h4 a', '[class*="businessName__"] a', 'h3', 'h4'],
            phone: ['[class*="phone__"]', 'p'],
            address: ['[class*="address__"]', 'address'],
            website: ['a[href*="http"]:not([href*="yelp"])']
        }
    },

    getDomainSelectors() {
        const hostname = window.location.hostname.toLowerCase();
        for (const domain in this.domainSelectors) {
            if (hostname.includes(domain)) {
                return this.domainSelectors[domain];
            }
        }
        return null;
    },

    /**
     * Extract a business name with domain-specific checking and strict validation.
     */
    extractName(container) {
        // 1. Try domain-specific selectors first
        const selectors = this.getDomainSelectors();
        if (selectors && selectors.name) {
            for (const sel of selectors.name) {
                const el = container.querySelector(sel);
                if (el) {
                    const txt = domHelpers.getCleanText(el);
                    if (isValidBusinessName(txt)) {
                        return txt;
                    }
                }
            }
        }

        // Fallback strategy 1: Look for first heading tag (H1-H6)
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of headings) {
            const txt = domHelpers.getCleanText(heading);
            if (isValidBusinessName(txt)) {
                return txt;
            }
        }

        // Fallback strategy 2: Look for elements styling like titles (font-weight: bold or equivalent)
        const bolds = container.querySelectorAll('strong, b, [class*="title"], [class*="name"]');
        for (const bold of bolds) {
            const txt = domHelpers.getCleanText(bold);
            if (isValidBusinessName(txt)) {
                return txt;
            }
        }

        // Fallback strategy 3: Take text lines and find the first one that is valid
        const textLines = container.innerText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 2);
            
        for (const line of textLines) {
            if (isValidBusinessName(line)) {
                return line;
            }
        }

        return '';
    },

    /**
     * Extract phone numbers using domain selectors, tel hrefs, whatsapp links, and clean regex parsing.
     */
    extractPhones(container) {
        const phones = new Set();

        // 1. Try domain-specific selectors first
        const selectors = this.getDomainSelectors();
        if (selectors && selectors.phone) {
            for (const sel of selectors.phone) {
                const els = container.querySelectorAll(sel);
                els.forEach(el => {
                    const txt = domHelpers.getCleanText(el);
                    const href = el.getAttribute('href') || '';
                    const title = el.getAttribute('title') || '';
                    const dataPhone = el.getAttribute('data-phone') || el.getAttribute('data-mobile') || '';
                    
                    [txt, href, title, dataPhone].forEach(candidate => {
                        const cleaned = this.cleanPhoneNumber(candidate);
                        if (cleaned) phones.add(cleaned);
                    });
                });
            }
        }

        // 2. Look in href tel attributes
        const telLinks = container.querySelectorAll('a[href^="tel:"]');
        telLinks.forEach(a => {
            const cleaned = this.cleanPhoneNumber(a.href);
            if (cleaned) phones.add(cleaned);
        });

        // 3. Look in wa.me or whatsapp links
        const waLinks = container.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');
        waLinks.forEach(a => {
            const cleaned = this.cleanPhoneNumber(a.href);
            if (cleaned) phones.add(cleaned);
        });

        // 4. Regex matching on innerText
        const text = container.innerText || '';
        const matches = text.match(REGEX.PHONE) || [];
        matches.forEach(m => {
            const cleaned = this.cleanPhoneNumber(m);
            if (cleaned) phones.add(cleaned);
        });

        return Array.from(phones);
    },

    cleanPhoneNumber(phone) {
        if (!phone) return '';
        let cleaned = phone.replace('tel:', '').replace(/[^\d+]/g, '').trim();
        
        // Strip leading +91 or 91 or 0 for standard Indian mobile check
        if (cleaned.startsWith('+91')) cleaned = cleaned.substring(3);
        if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
        if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);
        
        cleaned = cleaned.replace(/\D/g, ''); // Keep only digits
        
        if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
            return cleaned; // Indian Mobile
        }
        
        // Return standard number if valid length (7 to 15 digits)
        if (cleaned.length >= 7 && cleaned.length <= 15) {
            return cleaned;
        }
        
        return '';
    },

    /**
     * Extract emails.
     */
    extractEmails(container) {
        const text = container.innerText || '';
        const emails = extractEmails(text);

        // Strategy 2: Look in mailto links
        const mailtoLinks = Array.from(container.querySelectorAll('a[href^="mailto:"]'))
            .map(a => a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase())
            .filter(email => REGEX.EMAIL.test(email));

        return [...new Set([...emails, ...mailtoLinks])];
    },

    /**
     * Extract website.
     */
    extractWebsite(container) {
        // 1. Try domain-specific selectors first
        const selectors = this.getDomainSelectors();
        if (selectors && selectors.website) {
            for (const sel of selectors.website) {
                const el = container.querySelector(sel);
                if (el && el.href) {
                    const href = el.href;
                    if (this.isValidWebsite(href)) {
                        return href;
                    }
                }
            }
        }

        const links = Array.from(container.querySelectorAll('a[href]'));
        for (const link of links) {
            const href = link.href;
            if (this.isValidWebsite(href)) {
                return href;
            }
        }

        return '';
    },

    isValidWebsite(href) {
        if (!href) return false;
        
        // Skip common non-website paths
        if (
            href.includes(window.location.hostname) ||
            href.includes('javascript:') ||
            href.includes('tel:') ||
            href.includes('mailto:') ||
            /facebook\.com|twitter\.com|linkedin\.com|instagram\.com|youtube\.com|google\.com\/maps|wa\.me|whatsapp\.com/i.test(href)
        ) {
            return false;
        }

        return REGEX.WEBSITE.test(href);
    },

    /**
     * Extract address with strict validation.
     */
    extractAddress(container) {
        // 1. Try domain-specific selectors first
        const selectors = this.getDomainSelectors();
        if (selectors && selectors.address) {
            for (const sel of selectors.address) {
                const el = container.querySelector(sel);
                if (el) {
                    const txt = domHelpers.getCleanText(el);
                    if (isValidAddress(txt)) {
                        return txt;
                    }
                }
            }
        }

        const lines = container.innerText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 5);

        // Search for lines containing address indicators
        for (const line of lines) {
            if (REGEX.ADDRESS_KEYWORDS.test(line)) {
                // Ignore if it looks like a phone number or email or website
                if (!REGEX.EMAIL.test(line) && !/http/i.test(line) && line.replace(/\D/g, '').length < 8) {
                    if (isValidAddress(line)) {
                        return line;
                    }
                }
            }
        }

        // Fallback: search for postal code line
        for (const line of lines) {
            if (REGEX.POSTAL_CODE.test(line)) {
                if (isValidAddress(line)) {
                    return line;
                }
            }
        }

        return '';
    },

    extractRating(container) {
        const text = container.innerText || '';
        const match = text.match(/(\d\.\d)(?:\s*(?:\/|out of)\s*5|\s*stars?)/i);
        if (match) return match[1];

        // Sometimes it's just class names or title
        const stars = container.querySelector('[aria-label*="star"], [class*="rating"], [class*="stars"]');
        if (stars) {
            const attrText = stars.getAttribute('aria-label') || stars.innerText;
            const fallbackMatch = attrText.match(/(\d\.\d)/);
            if (fallbackMatch) return fallbackMatch[1];
        }
        return '';
    },

    extractReviews(container) {
        const text = container.innerText || '';
        const match = text.match(/(\d{1,5}(?:,\d{3})*)\s*(?:reviews?|ratings?|votes?)/i);
        if (match) return match[1].replace(/,/g, '');
        return '';
    },

    extractWhatsApp(container) {
        const waLinks = Array.from(container.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]'))
            .map(a => {
                const match = a.href.match(/phone=([0-9+]+)|wa\.me\/([0-9+]+)/);
                return match ? (match[1] || match[2]) : null;
            }).filter(Boolean);
            
        if (waLinks.length > 0) return waLinks[0];
        return '';
    },

    extractCategory(container) {
        const tags = Array.from(container.querySelectorAll('[class*="category"], [class*="tag"], [class*="label"], [class*="industry"]'));
        if (tags.length > 0 && tags[0].innerText) {
            return tags[0].innerText.trim();
        }
        return '';
    }
};
