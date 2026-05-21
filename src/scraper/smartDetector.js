/**
 * Lead Scraper Pro - Smart Detector (CPU Optimized)
 * Dynamic heuristic discovery of business listings with selector caching.
 */

import { REGEX } from '../utils/regex.js';
import { domHelpers } from '../utils/domHelpers.js';

export const smartDetector = {
    cachedSelector: null,

    // High-precision selectors for popular business directories
    domainSelectors: {
        'justdial.com': [
            'li.cntanr',
            '[id^="card-"]',
            '.result-box',
            'div[class*="result-box"]',
            'div[class*="store-details"]'
        ],
        'indiamart.com': [
            '.lst_col',
            '.mcat-card',
            '.prd-card',
            '[id^="product-card-"]',
            'div.flx_grw',
            '.product-card',
            'div[class*="product-card"]'
        ],
        'sulekha.com': [
            '[class*="listing-card"]',
            '.listing-item',
            'li[class*="list-item"]',
            'div[class*="list-card"]'
        ],
        'yelp.com': [
            'div[class*="container__"]',
            'li.aria-paper-row',
            'div.businessName__'
        ],
        'tradeindia.com': [
            '.product-card',
            '.company-card',
            '.listing-card',
            'div[class*="company-card"]',
            'div[class*="listing-card"]'
        ],
        'exportersindia.com': [
            '.prod-list',
            '.comp-card',
            'div[class*="list-card"]',
            'div[class*="company-card"]'
        ]
    },

    // Utility classes to ignore in repeating class analysis
    utilityClasses: new Set([
        'flex', 'grid', 'hidden', 'block', 'inline', 'relative', 'absolute', 'fixed',
        'w-full', 'h-full', 'w-screen', 'h-screen', 'col', 'row', 'container',
        'mx-auto', 'my-auto', 'p-0', 'm-0', 'bg-white', 'bg-transparent', 'border',
        'rounded', 'shadow', 'text-center', 'text-left', 'text-right',
        'd-flex', 'd-block', 'd-none', 'fade', 'show', 'active', 'row-fluid',
        'clearfix', 'pull-right', 'pull-left'
    ]),

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

        // 2. Try platform-specific high-precision selectors first
        const hostname = window.location.hostname.toLowerCase();
        for (const domain in this.domainSelectors) {
            if (hostname.includes(domain)) {
                console.log(`🎯 Known directory platform detected: ${domain}. Trying optimized selectors...`);
                for (const selector of this.domainSelectors[domain]) {
                    try {
                        const els = Array.from(document.querySelectorAll(selector))
                            .filter(el => domHelpers.isVisible(el));
                        if (els.length >= 2) {
                            this.cachedSelector = selector;
                            console.log(`✓ High-precision selector matched: "${selector}" (Count: ${els.length})`);
                            return els;
                        }
                    } catch (e) {
                        // Fail silently
                    }
                }
            }
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
                if (cls.length > 2 && !this.utilityClasses.has(cls.toLowerCase()) && !/^\d+$/.test(cls)) {
                    classCounts[cls] = (classCounts[cls] || 0) + 1;
                }
            });
        });

        const candidates = [];
        // Look for classes repeating between 3 and 500 times (raised threshold)
        Object.entries(classCounts)
            .filter(([_, count]) => count >= 3 && count <= 500)
            .forEach(([cls, count]) => {
                const els = Array.from(document.querySelectorAll(`.${cls}`)).filter(el => domHelpers.isVisible(el));
                if (els.length >= 3) {
                    // Filter out size outliers to exclude headers, footers, or sidebars that accidentally share the class
                    const heights = els.map(el => el.offsetHeight);
                    const widths = els.map(el => el.offsetWidth);
                    
                    const median = (arr) => {
                        const sorted = [...arr].sort((a, b) => a - b);
                        return sorted[Math.floor(sorted.length / 2)];
                    };
                    
                    const medianHeight = median(heights);
                    const medianWidth = median(widths);
                    
                    const filteredEls = els.filter(el => {
                        const hDiff = Math.abs(el.offsetHeight - medianHeight) / Math.max(medianHeight, 1);
                        const wDiff = Math.abs(el.offsetWidth - medianWidth) / Math.max(medianWidth, 1);
                        return hDiff < 0.20 && wDiff < 0.20;
                    });
                    
                    if (filteredEls.length >= 3 || (filteredEls.length >= 2 && els.length < 5)) {
                        // Score the first few elements and take the average
                        const sampleEls = filteredEls.slice(0, 3);
                        const avgScore = sampleEls.reduce((sum, el) => sum + this.scoreElement(el), 0) / sampleEls.length;
                        
                        if (avgScore > 35) {
                            candidates.push({
                                selector: `.${cls}`,
                                score: Math.round(avgScore + (count > 5 ? 10 : 0)), // Boost for longer lists
                                elements: filteredEls
                            });
                        }
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
