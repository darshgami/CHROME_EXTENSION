/**
 * Lead Scraper Pro - Structured Data Extractor
 * Extracts data from JSON-LD and Schema.org microdata.
 */

export const structuredDataExtractor = {
    /**
     * Extracts leads from JSON-LD scripts.
     */
    extractFromJsonLD() {
        const leads = [];
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                this.processObject(data, leads);
            } catch (e) {
                // Ignore parse errors
            }
        });
        
        return leads;
    },

    processObject(obj, leads) {
        if (Array.isArray(obj)) {
            obj.forEach(item => this.processObject(item, leads));
            return;
        }

        if (obj['@type'] === 'LocalBusiness' || obj['@type'] === 'Organization' || obj['@type'] === 'Store') {
            leads.push(this.mapToLead(obj));
        }

        // Deep search for nested types
        Object.values(obj).forEach(val => {
            if (val && typeof val === 'object') {
                this.processObject(val, leads);
            }
        });
    },

    mapToLead(obj) {
        return {
            name: obj.name || obj.legalName,
            phone: obj.telephone,
            email: obj.email,
            website: obj.url,
            address: this.formatAddress(obj.address),
            city: obj.address?.addressLocality,
            state: obj.address?.addressRegion,
            country: obj.address?.addressCountry,
            postalCode: obj.address?.postalCode,
            source: 'JSON-LD'
        };
    },

    formatAddress(addr) {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        return [
            addr.streetAddress,
            addr.addressLocality,
            addr.addressRegion,
            addr.postalCode,
            addr.addressCountry
        ].filter(Boolean).join(', ');
    },

    /**
     * Extracts leads from Schema.org microdata.
     */
    extractFromMicrodata() {
        const leads = [];
        const items = document.querySelectorAll('[itemtype*="schema.org/LocalBusiness"], [itemtype*="schema.org/Organization"]');
        
        items.forEach(item => {
            const lead = {
                name: item.querySelector('[itemprop="name"]')?.textContent?.trim(),
                phone: item.querySelector('[itemprop="telephone"]')?.textContent?.trim(),
                email: item.querySelector('[itemprop="email"]')?.textContent?.trim(),
                website: item.querySelector('[itemprop="url"]')?.href || item.querySelector('[itemprop="url"]')?.textContent?.trim(),
                address: item.querySelector('[itemprop="address"]')?.textContent?.trim(),
                source: 'Microdata'
            };
            if (lead.name) leads.push(lead);
        });

        return leads;
    }
};
