/**
 * Lead Scraper Pro - Content Script Loader
 * This file acts as a non-module entry point to load the actual logic using dynamic imports.
 */

(async () => {
    try {
        const src = chrome.runtime.getURL('content-main.js');
        await import(src);
    } catch (error) {
        console.error('Lead Scraper Pro: Failed to load content-main.js', error);
    }
})();
