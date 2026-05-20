/**
 * Lead Scraper Pro - Main Content Script Entry
 * Runs as an ES module inside the page context.
 */

import { UniversalScraper } from './src/scraper/universalScraper.js';
import { autoTester } from './src/testing/autoTester.js';
import { debugLogger } from './src/testing/debugLogger.js';

let isScraping = false;
let isPaused = false;
let scraper = null;

debugLogger.log('Universal Scraper Content Script Loaded and Active.', 'success');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'START_SCRAPING':
            if (!isScraping) {
                isScraping = true;
                isPaused = false;
                startScrapingSession(message.payload);
            }
            break;
        case 'STOP_SCRAPING':
            isScraping = false;
            isPaused = false;
            debugLogger.log('Scraping session stopped by user.', 'warning');
            break;
        case 'PAUSE_SCRAPING':
            isPaused = true;
            debugLogger.log('Scraping session paused.', 'info');
            break;
        case 'RESUME_SCRAPING':
            isPaused = false;
            debugLogger.log('Scraping session resumed.', 'success');
            break;
        case 'RUN_DIAGNOSTICS':
            autoTester.runDiagnostics().then(results => {
                sendResponse({ diagnostics: results });
            }).catch(err => {
                sendResponse({ error: err.message });
            });
            return true; // Keep channel open for async response
    }
});

async function startScrapingSession(config) {
    debugLogger.log(`Starting Scraping session for query: "${config.keyword}"`, 'info');
    scraper = new UniversalScraper(config);

    try {
        await scraper.startScrapingSession(async (leads) => {
            // Callback executed after each scroll/scrape step
            
            // Wait while paused
            while (isScraping && isPaused) {
                await new Promise(r => setTimeout(r, 500));
            }

            if (!isScraping) return;

            // Send leads to background
            leads.forEach(lead => {
                chrome.runtime.sendMessage({
                    type: 'LEAD_FOUND',
                    payload: lead
                }).catch(() => {
                    // Ignore errors if runtime disconnects
                });
            });
        });

        // Loop finished
        isScraping = false;
        chrome.runtime.sendMessage({ 
            type: 'SCRAPING_STATUS', 
            payload: 'completed' 
        }).catch(() => {});
        
    } catch (error) {
        isScraping = false;
        debugLogger.log(`Scraping Session Crashed: ${error.message}`, 'error');
        chrome.runtime.sendMessage({ 
            type: 'SCRAPING_STATUS', 
            payload: 'error' 
        }).catch(() => {});
    }
}
