/**
 * Lead Scraper Pro - Background Service Worker
 */

import { MESSAGES, STORAGE_KEYS, SCRAPING_STATUS } from './constants.js';
import { storageManager } from './storageManager.js';

console.log('Lead Scraper Pro: Service Worker Initialized.');

chrome.runtime.onInstalled.addListener(() => {
    storageManager.set(STORAGE_KEYS.STATS, { total: 0, valid: 0, invalid: 0 });
    storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.IDLE });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log('📨 Message received in Background:', message.type);

    switch (message.type) {
        case MESSAGES.START_SCRAPING:
            handleStartScraping(message.payload);
            break;
        case MESSAGES.STOP_SCRAPING:
            handleStopScraping();
            break;
        case MESSAGES.LEAD_FOUND:
            handleLeadFound(message.payload);
            break;
        case MESSAGES.SCRAPING_STATUS:
            handleStatusUpdate(message.payload);
            break;
    }
    return true; // Keep channel open
});

async function handleStartScraping(payload) {
    console.log('🚀 Starting scrape process for:', payload);
    await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { 
        status: SCRAPING_STATUS.RUNNING, 
        config: payload,
        startTime: Date.now()
    });
}

async function handleStopScraping() {
    console.log('🛑 Stopping scrape process.');
    await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.IDLE });
    
    // Broadcast stop to all tabs
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: MESSAGES.STOP_SCRAPING }).catch(() => {});
    });
}

async function handleLeadFound(lead) {
    // console.log('💾 Saving lead:', lead.name);
    await storageManager.saveLead(lead);
    
    // Forward to popup if it's open
    chrome.runtime.sendMessage({ 
        type: MESSAGES.LEAD_FOUND, 
        payload: lead 
    }).catch(() => {}); // Ignore error if popup closed
}

async function handleStatusUpdate(status) {
    console.log('📊 Status update:', status);
    if (status === 'completed') {
        await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.IDLE });
    }
    chrome.runtime.sendMessage({ type: MESSAGES.SCRAPING_STATUS, payload: status }).catch(() => {});
}
