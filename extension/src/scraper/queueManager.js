/**
 * Lead Scraper Pro - Queue Manager
 * Coordinates extraction queues, throttles processing batches, and prevents CPU overload.
 */

import { debugLogger } from '../testing/debugLogger.js';

export class QueueManager {
    constructor(config = {}) {
        this.concurrency = config.concurrency || 2; // Process 2 elements in parallel
        this.delayBetweenBatches = config.delayBetweenBatches || 200; // 200ms delay between items
        this.activeJobs = 0;
        this.queue = [];
    }

    /**
     * Clear the queue.
     */
    clear() {
        this.queue = [];
        this.activeJobs = 0;
    }

    /**
     * Add listing elements to the queue.
     * @param {HTMLElement[]} elements 
     */
    enqueue(elements) {
        elements.forEach(el => {
            if (!this.queue.includes(el)) {
                this.queue.push(el);
            }
        });
        debugLogger.log(`QueueManager: Enqueued ${elements.length} items. Total queue length: ${this.queue.length}`, 'info');
    }

    /**
     * Processes all items in the queue with throttled batches.
     * @param {Function} processor - Async function to process a single element: (el, index) => Promise<any>
     * @returns {Promise<any[]>} Aggregated results from processing all items
     */
    async processAll(processor) {
        const results = [];
        const jobs = [];

        debugLogger.log(`QueueManager: Processing ${this.queue.length} items in concurrency batches...`, 'info');

        while (this.queue.length > 0) {
            // Take up to concurrency limit items
            const batch = this.queue.splice(0, this.concurrency);
            
            const batchPromises = batch.map(async (item, index) => {
                this.activeJobs++;
                try {
                    const res = await processor(item);
                    return res;
                } catch (e) {
                    debugLogger.log(`QueueManager item processing error: ${e.message}`, 'warning');
                    return null;
                } finally {
                    this.activeJobs--;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(r => {
                if (r !== null) results.push(r);
            });

            // Pause between batches to release the main execution thread and prevent CPU locking
            if (this.queue.length > 0) {
                await new Promise(r => setTimeout(r, this.delayBetweenBatches));
            }
        }

        this.clear();
        return results;
    }
}
