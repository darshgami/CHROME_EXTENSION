/**
 * Lead Scraper Pro - Core Scraping Engine (Universal)
 */

import { selectorDetector } from './selectorDetector.js';
import { structuredDataExtractor } from './structuredDataExtractor.js';
import { phoneExtractor } from './phoneExtractor.js';
import { addressExtractor } from './addressExtractor.js';
import { contactExtractor } from './contactExtractor.js';
import { dataCleaner } from './dataCleaner.js';
import { keywordMatcher } from './keywordMatcher.js';

export class UniversalScraper {
    constructor(config = {}) {
        this.config = config;
        this.leads = new Map();
    }

    async scrape() {
        console.log('Starting universal scrape session...');
        
        try {
            // 1. Try Structured Data (JSON-LD & Microdata)
            const sdLeads = [
                ...structuredDataExtractor.extractFromJsonLD(),
                ...structuredDataExtractor.extractFromMicrodata()
            ];
            console.log(`✓ Extracted ${sdLeads.length} items from structured data.`);
            sdLeads.forEach(l => this.addLead(l, 'StructuredData'));

            // 2. Try Heuristic DOM Detection
            const containers = selectorDetector.detectContainers();
            console.log(`✓ Detected ${containers.length} potential listing containers.`);
            
            containers.forEach((container, idx) => {
                const lead = this.extractFromContainer(container);
                if (lead.name) {
                    this.addLead(lead, 'DOM_Heuristic');
                } else {
                    // console.warn(`Container ${idx} failed name extraction.`);
                }
            });

        } catch (error) {
            console.error(' Scraping Engine Error:', error);
        }

        const finalLeads = this.getFinalLeads();
        console.log(`Scrape completed. Found ${finalLeads.length} valid leads.`);
        return finalLeads;
    }

    extractFromContainer(container) {
        // console.log("Extracting from container:", container);
        const lead = {
            name: this.extractName(container),
            phone: phoneExtractor.extract(container)[0] || '',
            email: contactExtractor.extractEmails(container)[0] || '',
            website: contactExtractor.extractWebsite(container),
            address: addressExtractor.extract(container),
            timestamp: new Date().toISOString()
        };

        const loc = addressExtractor.parseLocation(lead.address);
        lead.city = loc.city;
        lead.postalCode = loc.postalCode;

        return lead;
    }

    extractName(container) {
        // Priority: H tags, then strong, then elements with 'name' or 'title' in class
        const selectors = ['h1', 'h2', 'h3', 'h4', '[itemprop="name"]', '.name', '.title', '.company-name', 'strong', 'b'];
        for (const sel of selectors) {
            const el = container.querySelector(sel);
            if (el && el.innerText.trim().length > 1) {
                return el.innerText.trim();
            }
        }
        
        // Fallback: first significant text node
        return container.innerText.split('\n')[0].trim();
    }

    addLead(lead, source) {
        if (!lead.name || lead.name.length < 2) return;

        lead.source = source;
        lead.name = dataCleaner.cleanName(lead.name);
        lead.phone = phoneExtractor.normalize(lead.phone);
        lead.address = dataCleaner.cleanAddress(lead.address);

        // Keyword Match Filter
        if (this.config.keyword) {
            const score = keywordMatcher.match(`${lead.name} ${lead.address}`, this.config.keyword);
            if (score < 40) {
                // console.log(`Lead "${lead.name}" skipped (Low score: ${score})`);
                return;
            }
        }

        // Location Filter
        if (this.config.city && lead.address) {
            if (!lead.address.toLowerCase().includes(this.config.city.toLowerCase())) {
                // console.log(`Lead "${lead.name}" skipped (Location mismatch)`);
                return;
            }
        }

        const key = lead.phone || lead.email || `${lead.name}-${lead.city}`;
        if (!this.leads.has(key)) {
            console.log(`✅ Lead Found: ${lead.name} (${source})`);
            this.leads.set(key, { ...lead, isValid: true });
        }
    }

    getFinalLeads() {
        return Array.from(this.leads.values());
    }

    async autoScroll(maxScrolls = 3) {
        for (let i = 0; i < maxScrolls; i++) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}
