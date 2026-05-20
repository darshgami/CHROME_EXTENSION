/**
 * Lead Scraper Pro - Intelligent Infinite Scroll Manager
 * Manages throttled page scrolling, dynamic height validation, and position recovery.
 */

import { debugLogger } from '../testing/debugLogger.js';

export class InfiniteScrollManager {
    constructor(config = {}) {
        this.scrollDelay = config.scrollDelay || 2000;
        this.maxScrolls = config.maxScrollLimit || 100; // Safety limit: max 100 scrolls
        this.maxEmptyScrolls = 5; // Stop after 5 empty scroll attempts
        
        this.scrollCount = 0;
        this.emptyScrollCount = 0;
        
        this.originalScrollY = 0;
        this.originalScrollHeight = 0;
        
        this.lastHeight = 0;
        this.mutationOccurred = false;
        
        this.observer = null;
        this.seenLeadKeys = new Set();
        this.stopReason = '';
    }

    /**
     * Start the MutationObserver and save initial page coordinates.
     */
    startObserver() {
        this.originalScrollY = window.scrollY;
        this.originalScrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        this.lastHeight = this.originalScrollHeight;
        
        this.scrollCount = 0;
        this.emptyScrollCount = 0;
        this.mutationOccurred = false;
        this.seenLeadKeys.clear();
        this.stopReason = '';

        debugLogger.log(`Saving original page height: ${this.originalScrollHeight}px, scroll position: ${this.originalScrollY}px`, 'info');

        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    this.mutationOccurred = true;
                    break;
                }
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Disconnect observer and clean up variables.
     */
    stopObserver() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
            debugLogger.log('MutationObserver disconnected and resources released.', 'info');
        }
    }

    /**
     * Restore original scroll position smoothly.
     */
    restorePosition() {
        debugLogger.log(`Restoring page position back to: ${this.originalScrollY}px`, 'info');
        window.scrollTo({
            top: this.originalScrollY,
            behavior: 'smooth'
        });
    }

    /**
     * Generates a randomized delay between 1.2s and 2.5s.
     * @returns {number} Delay in ms
     */
    getRandomDelay() {
        // 1200ms to 2500ms
        return Math.floor(Math.random() * (2500 - 1200 + 1)) + 1200;
    }

    /**
     * Perform one slow, incremental, throttled scroll step.
     * @param {Object[]} currentLeads - Current leads array collected so far
     * @returns {Promise<boolean>} Should the scraping stop?
     */
    async scrollStep(currentLeads = []) {
        this.scrollCount++;
        this.mutationOccurred = false;
        
        const currentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        
        // Throttled slow scroll in small increments to prevent dynamic page jumps and CPU lags
        const viewportHeight = window.innerHeight;
        const scrollIncrements = 5;
        const scrollDistance = viewportHeight / scrollIncrements;
        
        debugLogger.log(`Scroll Step ${this.scrollCount}: Scrolling ${viewportHeight}px down in chunks...`, 'info');

        for (let i = 0; i < scrollIncrements; i++) {
            window.scrollBy(0, scrollDistance);
            // Throttled chunk wait (100ms - 200ms)
            await new Promise(r => setTimeout(r, 150));
        }

        // Wait for dynamic AJAX loading using a randomized delay (1.2s - 2.5s)
        const loadDelay = this.getRandomDelay();
        await new Promise(r => setTimeout(r, loadDelay));

        const newHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const heightIncreased = newHeight > this.lastHeight;
        
        // 1. Check for new leads and duplicate frequencies
        let newLeadsFound = false;
        let duplicateLeadCount = 0;

        currentLeads.forEach(lead => {
            const key = lead.phone || lead.email || `${lead.name}-${lead.city}`;
            if (!this.seenLeadKeys.has(key)) {
                this.seenLeadKeys.add(key);
                newLeadsFound = true;
            } else {
                duplicateLeadCount++;
            }
        });

        // 2. Identify if this scroll step fetched nothing new
        const contentMutated = this.mutationOccurred;
        const gotFreshData = heightIncreased || contentMutated || newLeadsFound;

        if (!gotFreshData) {
            this.emptyScrollCount++;
            debugLogger.log(`Empty scroll detected. Attempts remaining: ${this.maxEmptyScrolls - this.emptyScrollCount}`, 'warning');
        } else {
            this.emptyScrollCount = 0; // Reset consecutive empty attempts counter
        }

        this.lastHeight = newHeight;

        // 3. Evaluate stop conditions
        const shouldStop = this.evaluateStop(currentLeads.length, newLeadsFound, duplicateLeadCount);
        
        if (shouldStop) {
            debugLogger.log(`[SCROLL STOPPED] Reason: ${this.stopReason}`, 'warning');
        }

        return shouldStop;
    }

    /**
     * Compute and log stop evaluations.
     */
    evaluateStop(totalLeads, newLeadsFound, duplicateCount) {
        // Stop Condition 1: Max scrolls threshold limit hit
        if (this.scrollCount >= this.maxScrolls) {
            this.stopReason = `Exceeded maximum safety scroll limit of ${this.maxScrolls} scrolls.`;
            return true;
        }

        // Stop Condition 2: Max consecutive empty scrolls hit
        if (this.emptyScrollCount >= this.maxEmptyScrolls) {
            this.stopReason = `No new content or elements loaded after ${this.maxEmptyScrolls} attempts.`;
            return true;
        }

        // Stop Condition 3: Bottom of page reached (height did not increase and no mutations)
        const isPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
        if (isPageBottom && !this.mutationOccurred && !newLeadsFound) {
            this.stopReason = 'End of page reached.';
            return true;
        }

        // Stop Condition 4: High duplicate ratio (Same listings repeat)
        if (totalLeads > 10 && duplicateCount / totalLeads > 0.85 && !newLeadsFound) {
            this.stopReason = 'Duplicate listings repeated. Same content detected.';
            return true;
        }

        return false;
    }
}
