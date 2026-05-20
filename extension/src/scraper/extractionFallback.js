/**
 * Lead Scraper Pro - Extraction Fallback System (Auto-Repair)
 * Attempts alternative strategies when standard selectors or heuristics fail.
 */

import { REGEX, extractPhones, extractEmails } from '../utils/regex.js';
import { domHelpers } from '../utils/domHelpers.js';

export const extractionFallback = {
    /**
     * Fallback to extract a business name if standard name extraction fails.
     * @param {HTMLElement} container 
     * @returns {string}
     */
    extractName(container) {
        // Fallback strategy 1: Look for first heading tag (H1-H6)
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of headings) {
            const txt = domHelpers.getCleanText(heading);
            if (txt && txt.length > 2 && txt.length < 100) {
                return txt;
            }
        }

        // Fallback strategy 2: Look for elements styling like titles (font-weight: bold or equivalent)
        const bolds = container.querySelectorAll('strong, b, [class*="title"], [class*="name"]');
        for (const bold of bolds) {
            const txt = domHelpers.getCleanText(bold);
            if (txt && txt.length > 2 && txt.length < 100) {
                return txt;
            }
        }

        // Fallback strategy 3: Take the first non-empty line of text in the container
        const textLines = container.innerText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 2);
            
        if (textLines.length > 0) {
            // Avoid choosing phone numbers, emails or websites as names
            const cleanLine = textLines[0];
            const isPhone = REGEX.PHONE.test(cleanLine);
            const isEmail = REGEX.EMAIL.test(cleanLine);
            
            if (!isPhone && !isEmail && cleanLine.length < 80) {
                return cleanLine;
            }
        }

        return '';
    },

    /**
     * Fallback to extract phone numbers using global regex searching on innerText.
     */
    extractPhones(container) {
        const text = container.innerText || '';
        const phones = extractPhones(text);
        
        // Strategy 2: Look in href tel attributes
        const telLinks = Array.from(container.querySelectorAll('a[href^="tel:"]'))
            .map(a => a.href.replace('tel:', '').replace(/[^\d+]/g, '').trim())
            .filter(tel => tel.length >= 7);

        return [...new Set([...phones, ...telLinks])];
    },

    /**
     * Fallback to extract emails.
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
     * Fallback to extract business website.
     */
    extractWebsite(container) {
        const links = Array.from(container.querySelectorAll('a[href]'));
        
        for (const link of links) {
            const href = link.href;
            
            // Skip common non-website paths
            if (
                href.includes(window.location.hostname) ||
                href.includes('javascript:') ||
                href.includes('tel:') ||
                href.includes('mailto:') ||
                /facebook\.com|twitter\.com|linkedin\.com|instagram\.com|youtube\.com|google\.com\/maps/i.test(href)
            ) {
                continue;
            }

            if (REGEX.WEBSITE.test(href)) {
                return href;
            }
        }

        return '';
    },

    /**
     * Fallback to extract address based on text lines and common keywords.
     */
    extractAddress(container) {
        const lines = container.innerText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 5);

        // Search for lines containing address indicators
        for (const line of lines) {
            if (REGEX.ADDRESS_KEYWORDS.test(line)) {
                // Ignore if it looks like a phone number or email or website
                if (!REGEX.EMAIL.test(line) && !/http/i.test(line) && line.replace(/\D/g, '').length < 8) {
                    return line;
                }
            }
        }

        // Fallback: search for postal code line
        for (const line of lines) {
            if (REGEX.POSTAL_CODE.test(line)) {
                return line;
            }
        }

        return '';
    }
};
