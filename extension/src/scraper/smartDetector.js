/**
 * Lead Scraper Pro - Smart Detector (CPU Optimized)
 * Dynamic heuristic discovery of business listings with selector caching.
 */

import { REGEX } from '../utils/regex.js';
import { domHelpers } from '../utils/domHelpers.js';

export const smartDetector = {
    cachedSelector: null,

    /**
     * Clear selector cache when a new session starts.
     */
    clearCache() {
        this.cachedSelector = null;
    },

    /**
     * Automatically discover and return DOM elements that likely represent business listing cards.
     * Reuses cached selectors if valid to optimize CPU and memory footprint.
     * @returns {HTMLElement[]}
     */
    detect() {
        // 1. Try cached selector first to prevent heavy DOM traversals
        if (this.cachedSelector) {
            try {
                const els = Array.from(document.querySelectorAll(this.cachedSelector))
                    .filter(el => domHelpers.isVisible(el));
                if (els.length >= 2) {
                    return els;
                }
            } catch (err) {
                // Selector syntax error or DOM detached
            }
            this.cachedSelector = null; // Reset if invalid
        }

        console.log('🔍 Running Smart Container Heuristic Discovery...');
        let candidates = [];

        // Strategy 1: Class Repetition & Text Density
        const classCandidates = this.detectByClassRepetition();
        candidates.push(...classCandidates);

        // Strategy 2: Visual Structure Clustering
        const visualCandidates = this.detectByVisualClustering();
        candidates.push(...visualCandidates);

        // Strategy 3: Text Density & Element Tags (li, article, section)
        const tagCandidates = this.detectByTagStructures();
        candidates.push(...tagCandidates);

        // Sort by heuristic score (highest first)
        candidates.sort((a, b) => b.score - a.score);

        // Filter out overlapping candidates (choose parent/child logically)
        const bestContainers = this.filterOverlapping(candidates);

        if (bestContainers.length > 0) {
            const best = bestContainers[0];
            // Cache the selector for subsequent scrolls in the same session
            this.cachedSelector = best.selector;
            console.log(`🎯 Chosen Card Selector: "${best.selector}" (Score: ${best.score}, Count: ${best.elements.length})`);
            return best.elements;
        }

        console.warn('⚠️ No repeating card structures detected via heuristics.');
        return [];
    },

    /**
     * Score a candidate container element based on its features.
     * @param {HTMLElement} el 
     * @returns {number} Score from 0 to 100
     */
    scoreElement(el) {
        if (!el) return 0;
        let score = 0;
        const text = el.innerText || '';

        // 1. Presence of header tags
        if (el.querySelector('h1, h2, h3, h4, h5, h6, strong, b')) {
            score += 25;
        }

        // 2. Presence of phone number
        const phones = text.match(REGEX.PHONE) || [];
        if (phones.length > 0) score += 30;

        // 3. Presence of email address
        const emails = text.match(REGEX.EMAIL) || [];
        if (emails.length > 0) score += 20;

        // 4. Presence of address indicators
        if (REGEX.ADDRESS_KEYWORDS.test(text)) {
            score += 20;
        }

        // 5. Normal number of links (business listings have detail page, reviews, website)
        const links = el.querySelectorAll('a').length;
        if (links > 0 && links <= 12) {
            score += 15;
        }

        // 6. Schema.org metadata
        if (el.querySelector('[itemprop]')) {
            score += 20;
        }

        return score;
    },

    /**
     * Find repeating class names and score their groups.
     */
    detectByClassRepetition() {
        const classCounts = {};
        const elements = document.querySelectorAll('div, section, article, li');
        
        elements.forEach(el => {
            el.classList.forEach(cls => {
                if (cls.length > 2) {
                    classCounts[cls] = (classCounts[cls] || 0) + 1;
                }
            });
        });

        const candidates = [];
        // Look for classes repeating between 3 and 100 times (common for listings page)
        Object.entries(classCounts)
            .filter(([_, count]) => count >= 3 && count <= 100)
            .forEach(([cls, count]) => {
                const els = Array.from(document.querySelectorAll(`.${cls}`)).filter(el => domHelpers.isVisible(el));
                if (els.length >= 3) {
                    // Score the first few elements and take the average
                    const sampleEls = els.slice(0, 3);
                    const avgScore = sampleEls.reduce((sum, el) => sum + this.scoreElement(el), 0) / sampleEls.length;
                    
                    if (avgScore > 35) {
                        candidates.push({
                            selector: `.${cls}`,
                            score: Math.round(avgScore + (count > 5 ? 10 : 0)), // Boost for longer lists
                            elements: els
                        });
                    }
                }
            });

        return candidates;
    },

    /**
     * Visual size clustering of adjacent DOM elements.
     */
    detectByVisualClustering() {
        const candidates = [];
        const parents = Array.from(document.querySelectorAll('div, ul, ol, section'));

        parents.forEach(parent => {
            const children = Array.from(parent.children).filter(el => domHelpers.isVisible(el));
            if (children.length >= 3 && children.length <= 100) {
                // Check if adjacent children have matching dimensions (visual cards)
                let visualMatchCount = 0;
                for (let i = 0; i < children.length - 1; i++) {
                    if (domHelpers.isVisualCardSibling(children[i], children[i + 1])) {
                        visualMatchCount++;
                    }
                }

                // If most children match visually
                if (visualMatchCount >= children.length - 2) {
                    const sampleChildren = children.slice(0, 3);
                    const avgScore = sampleChildren.reduce((sum, el) => sum + this.scoreElement(el), 0) / sampleChildren.length;
                    
                    if (avgScore > 35) {
                        const path = domHelpers.getElementSelectorPath(parent);
                        candidates.push({
                            selector: `${path} > ${children[0].tagName.toLowerCase()}`,
                            score: Math.round(avgScore),
                            elements: children
                        });
                    }
                }
            }
        });

        return candidates;
    },

    /**
     * Checks listing-oriented HTML tag sets (like lists, article grids).
     */
    detectByTagStructures() {
        const candidates = [];
        const tags = ['article', 'li', 'section'];

        tags.forEach(tag => {
            const els = Array.from(document.querySelectorAll(tag)).filter(el => domHelpers.isVisible(el));
            if (els.length >= 4 && els.length <= 100) {
                const sampleEls = els.slice(0, 3);
                const avgScore = sampleEls.reduce((sum, el) => sum + this.scoreElement(el), 0) / sampleEls.length;
                
                if (avgScore > 35) {
                    candidates.push({
                        selector: tag,
                        score: Math.round(avgScore),
                        elements: els
                    });
                }
            }
        });

        return candidates;
    },

    /**
     * Deduplicates lists of candidates that reference nesting or intersecting elements.
     */
    filterOverlapping(candidates) {
        const unique = [];
        
        candidates.forEach(cand => {
            if (!cand.elements || cand.elements.length === 0) return;
            
            const isDuplicate = unique.some(existing => {
                const e0 = existing.elements[0];
                const c0 = cand.elements[0];
                return e0 === c0 || e0.contains(c0) || c0.contains(e0);
            });

            if (!isDuplicate) {
                unique.push(cand);
            }
        });

        return unique;
    }
};
