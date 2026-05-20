/**
 * Lead Scraper Pro - Infinite Scroll Manager
 * Manages asynchronous page scrolling, dynamically tracking DOM additions and heights.
 */

export class InfiniteScrollManager {
    constructor(config = {}) {
        this.scrollDelay = config.scrollDelay || 2000;
        this.maxScrolls = config.maxScrolls || 15;
        this.scrollCount = 0;
        this.emptyScrollCount = 0;
        
        this.lastHeight = 0;
        this.lastCardCount = 0;
        this.mutationOccurred = false;
        this.observer = null;
    }

    /**
     * Start MutationObserver to track if new DOM nodes are being added.
     */
    startObserver() {
        this.mutationOccurred = false;
        
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
     * Stop the mutation observer.
     */
    stopObserver() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * Perform one slow scroll action.
     * @returns {Promise<Object>} { heightChanged: boolean, mutationsDetected: boolean, stopReached: boolean }
     */
    async scrollStep(currentCardCount = 0) {
        this.scrollCount++;
        this.mutationOccurred = false;
        
        const currentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        
        // Scroll in small chunks to trigger lazy-loaded images or scripts
        const steps = 4;
        const distance = window.innerHeight / steps;
        
        for (let i = 0; i < steps; i++) {
            window.scrollBy(0, distance);
            await new Promise(r => setTimeout(r, Math.round(this.scrollDelay / steps)));
        }

        // Wait a small extra buffer for AJAX completion
        await new Promise(r => setTimeout(r, 500));

        const newHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const heightChanged = newHeight > currentHeight;
        const cardsChanged = currentCardCount > this.lastCardCount;

        // Evaluate if this scroll fetched anything new
        if (!heightChanged && !this.mutationOccurred && !cardsChanged) {
            this.emptyScrollCount++;
        } else {
            this.emptyScrollCount = 0; // Reset on success
        }

        this.lastHeight = newHeight;
        this.lastCardCount = currentCardCount;

        const stopReached = this.evaluateStopConditions(currentCardCount);

        return {
            heightChanged,
            mutationsDetected: this.mutationOccurred,
            stopReached
        };
    }

    /**
     * Evaluate if the scraper must stop scrolling.
     * @returns {boolean}
     */
    evaluateStopConditions(currentCardCount) {
        // Stop condition 1: Exceeded max scroll count
        if (this.scrollCount >= this.maxScrolls) {
            console.log('🏁 InfiniteScrollManager: Max scrolls threshold reached.');
            return true;
        }

        // Stop condition 2: 5 consecutive scrolls with no DOM change, height change, or card count increase
        if (this.emptyScrollCount >= 5) {
            console.log('🏁 InfiniteScrollManager: 5 consecutive empty scroll attempts reached.');
            return true;
        }

        return false;
    }
}
