/**
 * Lead Scraper Pro - Universal Selector Detector
 * Heuristic-based discovery of business listing containers.
 */

import { structuredDataExtractor } from './structuredDataExtractor.js';

export const selectorDetector = {
    /**
     * Detect potential business listing containers using multiple strategies.
     */
    detectContainers() {
        console.log("🔍 Starting universal business card detection...");
        console.log("Page URL:", window.location.href);

        const candidates = [];

        // Strategy 1: Structured Data (JSON-LD, Microdata)
        const sdLeads = structuredDataExtractor.extractFromJsonLD();
        console.log(`✓ JSON-LD items found: ${sdLeads.length}`);
        if (sdLeads.length > 0) {
            // Note: JSON-LD items are data objects, not DOM elements.
            // We return them as virtual containers if needed, but usually 
            // the scraper handles them separately.
        }

        // Strategy 2: Repeating Div Patterns (Heuristic)
        console.log("🎯 Strategy 2: Looking for repeating patterns...");
        const divCandidates = this.analyzeDOMStructure();
        candidates.push(...divCandidates);

        // Strategy 3: Common Business Patterns
        const patterns = ['card', 'listing', 'item', 'product', 'business', 'vendor', 'result', 'entry', 'row', 'tile'];
        patterns.forEach(pattern => {
            const selector = `[class*="${pattern}"]`;
            const elements = Array.from(document.querySelectorAll(selector));
            if (elements.length >= 3) {
                const score = this.scoreContainer(elements[0]);
                if (score > 30) {
                    candidates.push({
                        selector: selector,
                        score: score + (elements.length > 5 ? 10 : 0),
                        elements: elements
                    });
                }
            }
        });

        // Sort by score and filter
        const bestCandidates = candidates
            .sort((a, b) => b.score - a.score)
            .filter(c => c.elements && c.elements.length >= 2);

        if (bestCandidates.length === 0) {
            console.warn("⚠️ NO CONTAINERS DETECTED. Page structure might be unique.");
            this.dumpPageStructure();
            return [];
        }

        console.log(`✓ Best container candidate: "${bestCandidates[0].selector}" (Score: ${bestCandidates[0].score}, Count: ${bestCandidates[0].elements.length})`);
        return bestCandidates[0].elements;
    },

    analyzeDOMStructure() {
        const results = [];
        const classFrequency = {};
        const allElements = document.querySelectorAll('div, section, article, li');

        allElements.forEach(el => {
            if (el.classList.length > 0) {
                el.classList.forEach(cls => {
                    classFrequency[cls] = (classFrequency[cls] || 0) + 1;
                });
            }
        });

        // Find frequent classes that look like containers
        Object.entries(classFrequency)
            .filter(([cls, count]) => count >= 3 && count <= 100)
            .forEach(([cls, count]) => {
                const elements = Array.from(document.querySelectorAll(`.${cls}`));
                const score = this.scoreContainer(elements[0]);
                if (score > 30) {
                    results.push({
                        selector: `.${cls}`,
                        score: score,
                        elements: elements
                    });
                }
            });

        return results;
    },

    scoreContainer(element) {
        if (!element) return 0;
        let score = 0;
        const text = element.innerText || '';

        // Name-like presence (H tags or bold)
        if (element.querySelector('h1, h2, h3, h4, h5, strong, b')) score += 25;
        
        // Contact info presence
        if (/\+?[\d\s()-]{10,}/.test(text)) score += 20; // Phone
        if (text.includes('@')) score += 15; // Email
        
        // Address keywords
        if (/street|address|city|road|lane|ave|st|rd|block/i.test(text)) score += 20;

        // Links count
        const links = element.querySelectorAll('a').length;
        if (links > 0 && links < 10) score += 10;

        // Structured data attributes
        if (element.querySelector('[itemprop]')) score += 20;

        return score;
    },

    dumpPageStructure() {
        console.log("Body children count:", document.body.children.length);
        console.log("Top 5 class names by frequency:");
        // Basic debug info
    }
};
