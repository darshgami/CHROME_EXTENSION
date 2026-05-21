/**
 * Lead Scraper Pro - Universal Scraper Engine (CPU & Scroll Optimized)
 * Coordinates listing discovery, queued extraction, relevance scoring, and safety-scrolling.
 */

import { smartDetector } from './smartDetector.js';
import { extractionFallback } from './extractionFallback.js';
import { relevanceEngine } from './relevanceEngine.js';
import { InfiniteScrollManager } from './infiniteScrollManager.js';
import { QueueManager } from './queueManager.js';
import { dedupe } from '../utils/dedupe.js';
import { debugLogger } from '../automation/debugLogger.js';

export class UniversalScraper {
    /**
     * @param {Object} config - { keyword, city, scrollDelay, maxScrolls }
     */
    constructor(config = {}) {
        this.config = config;
        this.leads = [];
        this.scrollManager = new InfiniteScrollManager({
            scrollDelay: config.scrollDelay || 2000,
            maxScrollLimit: config.maxScrolls || 100
        });
        this.queueManager = new QueueManager({
            concurrency: 2, // Parse 2 cards concurrently
            delayBetweenBatches: 100 // 100ms pause to yield CPU thread
        });

        this.isStopped = false;
        this.isPaused = false;
    }

    /**
     * Trigger stopping of the scraper session.
     */
    stop() {
        this.isStopped = true;
        this.scrollManager.stopObserver();
        debugLogger.log('Scraper instance stopped.', 'info');
    }

    /**
     * Trigger pause state.
     */
    pause() {
        this.isPaused = true;
        debugLogger.log('Scraper instance paused.', 'info');
    }

    /**
     * Trigger resume state.
     */
    resume() {
        this.isPaused = false;
        debugLogger.log('Scraper instance resumed.', 'info');
    }

    /**
     * Extract leads from the current page structure using throttled queue management.
     * @returns {Promise<Object[]>} Extracted and scored leads
     */
    async scrape() {
        debugLogger.log('🎬 Scrape cycle started.', 'info');
        
        try {
            // 1. Detect candidate business card elements
            const containers = smartDetector.detect();
            debugLogger.log(`Found ${containers.length} potential business cards on page.`, 'info');
            
            if (containers.length === 0) {
                return [];
            }

            // 2. Queue containers for throttled CPU-safe extraction
            this.queueManager.clear();
            this.queueManager.enqueue(containers);

            const rawLeads = await this.queueManager.processAll(async (container) => {
                if (this.isStopped) return null;
                const lead = this.extractLeadFromContainer(container);
                return lead && lead.name ? lead : null;
            });

            // 3. Score and filter leads via relevance engine
            const evaluatedLeads = rawLeads
                .filter(Boolean)
                .map(lead => relevanceEngine.evaluate(lead, this.config))
                .filter(lead => lead.isValid && lead.relevanceScore >= (this.config.minRelevance || 50));

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
     * Extract fields from a single container element.
     */
    extractLeadFromContainer(container) {
        let name = '';
        let phones = [];
        let emails = [];
        let website = '';
        let address = '';
        let rating = '';
        let reviews = '';
        let whatsapp = '';
        let category = '';

        try {
            name = extractionFallback.extractName(container);
            phones = extractionFallback.extractPhones(container);
            emails = extractionFallback.extractEmails(container);
            website = extractionFallback.extractWebsite(container);
            address = extractionFallback.extractAddress(container);
            rating = extractionFallback.extractRating(container);
            reviews = extractionFallback.extractReviews(container);
            whatsapp = extractionFallback.extractWhatsApp(container);
            category = extractionFallback.extractCategory(container);
        } catch (err) {
            // Fail silently
        }

        const primaryPhone = phones[0] || '';
        const primaryEmail = emails[0] || '';

        // Extract city/postal code
        let city = '';
        let postalCode = '';
        if (address) {
            const parts = address.split(',');
            if (parts.length > 1) {
                city = parts[parts.length - 2].trim();
            }
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
            rating,
            reviews,
            whatsapp,
            category,
            city: city || this.config.city || '',
            postalCode,
            extractedDescription: container.innerText || '',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Executes automated slow-scrolling while collecting leads.
     */
    async startScrapingSession(pageScrapedCallback) {
        this.isStopped = false;
        this.isPaused = false;
        
        // Reset cache at the start of a session
        smartDetector.clearCache();
        
        // Start scroll observer and save coordinates
        this.scrollManager.startObserver();
        
        let sessionActive = true;
        
        while (sessionActive && !this.isStopped) {
            // Check for paused state
            while (this.isPaused && !this.isStopped) {
                await new Promise(r => setTimeout(r, 500));
            }
            if (this.isStopped) break;

            // 1. Scrape page
            const currentLeads = await this.scrape();
            if (this.isStopped) break;
            
            if (pageScrapedCallback) {
                await pageScrapedCallback(currentLeads);
            }
            
            if (this.isStopped) break;

            // 2. Perform scroll step
            const shouldStop = await this.scrollManager.scrollStep(this.leads);
            if (shouldStop || this.isStopped) {
                sessionActive = false;
            }
        }

        // Disconnect MutationObserver
        this.scrollManager.stopObserver();
        
        // Restore page position smoothly
        this.scrollManager.restorePosition();
        
        debugLogger.log('Scraping session finished.', 'success');
    }
}
