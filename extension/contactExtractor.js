/**
 * Lead Scraper Pro - Contact Extractor (Email/Website)
 */

export const contactExtractor = {
    EMAIL_REGEX: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

    extractEmails(container) {
        const text = container.innerText || '';
        const matches = text.match(this.EMAIL_REGEX) || [];
        
        const mailtoLinks = Array.from(container.querySelectorAll('a[href^="mailto:"]'))
            .map(a => a.href.replace('mailto:', '').split('?')[0].trim());

        return [...new Set([...matches, ...mailtoLinks])];
    },

    extractWebsite(container) {
        const links = Array.from(container.querySelectorAll('a[href]'));
        const internalKeywords = ['company', 'website', 'visit', 'official'];
        
        for (const link of links) {
            const href = link.href.toLowerCase();
            const text = link.innerText.toLowerCase();
            
            // Skip common non-website links
            if (href.includes('google.com/maps') || href.includes('facebook.com') || 
                href.includes('twitter.com') || href.includes('linkedin.com')) continue;
            
            if (internalKeywords.some(k => text.includes(k) || link.className.toLowerCase().includes(k))) {
                return link.href;
            }
        }

        // Fallback: first link that looks like a business site
        const externalLink = links.find(l => !l.href.includes(window.location.hostname) && l.href.startsWith('http'));
        return externalLink ? externalLink.href : '';
    }
};
