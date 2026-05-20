/**
 * Lead Scraper Pro - Universal Scraper Engine
 * Integrates listing detection, fallbacks, relevance, and scroll management.
 */

import { smartDetector } from './smartDetector.js';
import { extractionFallback } from './extractionFallback.js';
import { relevanceEngine } from './relevanceEngine.js';
import { InfiniteScrollManager } from './infiniteScrollManager.js';
import { dedupe } from '../utils/dedupe.js';
import { debugLogger } from '../testing/debugLogger.js';

export class UniversalScraper {
    /**
     * @param {Object} config - { keyword, city, scrollDelay, maxScrolls }
     */
    constructor(config = {}) {
        this.config = config;
        this.leads = [];
        this.scrollManager = new InfiniteScrollManager({
            scrollDelay: config.scrollDelay || 2000,
            maxScrolls: config.maxScrolls || 15
        });
    }

    /**
     * Extract leads from the current page structure.
     * @returns {Object[]} Extracted and scored leads
     */
    async scrape() {
        debugLogger.log('🎬 Scrape cycle started.', 'info');
        
        try {
            // 1. Detect candidate business card elements
            const containers = smartDetector.detect();
            debugLogger.log(`Found ${containers.length} potential business cards.`, 'info');
            
            const rawLeads = [];

            // 2. Loop through elements and extract fields
            containers.forEach((container, index) => {
                const lead = this.extractLeadFromContainer(container, index);
                if (lead.name) {
                    rawLeads.push(lead);
                } else {
                    debugLogger.log(`Skipped card ${index}: Name could not be resolved.`, 'warning');
                }
            });

            // 3. Score and filter leads via relevance engine
            const evaluatedLeads = rawLeads.map(lead => {
                return relevanceEngine.evaluate(lead, this.config);
            });

            // 4. Deduplicate
            const uniqueLeads = dedupe.filterDuplicates(evaluatedLeads);
            
            this.leads = uniqueLeads;
            debugLogger.log(`Scraped ${uniqueLeads.length} unique, evaluated leads in this step.`, 'success');
            return uniqueLeads;

        } catch (error) {
            debugLogger.log(`Scraper Error: ${error.message}`, 'error');
            return [];
        }
    }

    /**
     * Extract fields from a single container element, utilizing fallbacks as needed.
     */
    extractLeadFromContainer(container, index) {
        let name = '';
        let phones = [];
        let emails = [];
        let website = '';
        let address = '';

        try {
            // Extract using Fallback engine (which handles standard + alternate DOM traversal)
            name = extractionFallback.extractName(container);
            phones = extractionFallback.extractPhones(container);
            emails = extractionFallback.extractEmails(container);
            website = extractionFallback.extractWebsite(container);
            address = extractionFallback.extractAddress(container);
        } catch (err) {
            debugLogger.log(`Error parsing card ${index}: ${err.message}`, 'warning');
        }

        // Clean values
        const primaryPhone = phones[0] || '';
        const primaryEmail = emails[0] || '';

        // Extract city/postal code from address
        let city = '';
        let postalCode = '';
        if (address) {
            // Attempt simple city parse (usually before postal code, or comma separated)
            const parts = address.split(',');
            if (parts.length > 1) {
                // Take the second-to-last part as likely city
                city = parts[parts.length - 2].trim();
            }
            
            // Regex match postal code
            const postalMatch = address.match(/\b\d{5,6}\b/);
            if (postalMatch) {
                postalCode = postalMatch[0];
            }
        }

        return {
            name,
            phone: primaryPhone,
            email: primaryEmail,
            website,
            address,
            city: city || this.config.city || '',
            postalCode,
            extractedDescription: container.innerText || '',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Executes automated slow-scrolling while collecting leads.
     * @param {Function} pageScrapedCallback - Function called after each scroll/scrape step
     */
    async startScrapingSession(pageScrapedCallback) {
        this.scrollManager.startObserver();
        let sessionActive = true;
        
        while (sessionActive) {
            // 1. Scrape current DOM page
            const currentLeads = await this.scrape();
            if (pageScrapedCallback) {
                pageScrapedCallback(currentLeads);
            }

            // 2. Perform one scroll step
            debugLogger.log(`Scrolling page... Step ${this.scrollManager.scrollCount + 1}`, 'info');
            const result = await this.scrollManager.scrollStep(this.leads.length);
            
            if (result.stopReached) {
                debugLogger.log('Stopping scroll loop: Safety criteria triggered.', 'info');
                sessionActive = false;
            }
        }

        this.scrollManager.stopObserver();
        debugLogger.log('Scraping session finished.', 'success');
    }
}
