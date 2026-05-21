/**
 * Lead Scraper Pro - Background Service Worker
 */

import { STORAGE_KEYS, SCRAPING_STATUS } from '../utils/constants.js';
import { storageManager } from '../storage/storageManager.js';

console.log('Lead Scraper Pro: Service Worker Initialized.');

chrome.runtime.onInstalled.addListener(() => {
    storageManager.set(STORAGE_KEYS.STATS, { total: 0, valid: 0, invalid: 0 });
    storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.IDLE });
});

// Broadcast messages to all extension pages (e.g. popup)
const broadcastMessage = (message) => {
    chrome.runtime.sendMessage(message).catch(() => {
        // Ignore error if popup or options page is not open
    });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'START_SCRAPING':
            handleStartScraping(message.payload);
            break;
        case 'STOP_SCRAPING':
            handleStopScraping();
            break;
        case 'PAUSE_SCRAPING':
            handlePauseScraping();
            break;
        case 'RESUME_SCRAPING':
            handleResumeScraping();
            break;
        case 'LEAD_FOUND':
            handleLeadFound(message.payload);
            break;
        case 'SCRAPING_STATUS':
            handleStatusUpdate(message.payload);
            break;
        case 'LOG_MESSAGE':
            // Forward log messages to popup
            broadcastMessage(message);
            break;
        case 'RUN_DIAGNOSTICS':
            // Forward diagnostics request to content script
            handleRunDiagnostics(sendResponse);
            return true; // Keep channel open for async response
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
    
    // Broadcast start to active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { type: 'START_SCRAPING', payload }).catch(err => {
            console.error('Failed to send START to content script:', err);
        });
    }
}

async function handleStopScraping() {
    console.log('🛑 Stopping scrape process.');
    await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.IDLE });
    
    // Broadcast stop to all tabs
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'STOP_SCRAPING' }).catch(() => {});
    });
    
    broadcastMessage({ type: 'SCRAPING_STATUS', payload: SCRAPING_STATUS.IDLE });
}

async function handlePauseScraping() {
    console.log('⏸ Pausing scrape process.');
    await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.PAUSED });
    
    // Broadcast pause to all tabs
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'PAUSE_SCRAPING' }).catch(() => {});
    });
    
    broadcastMessage({ type: 'SCRAPING_STATUS', payload: SCRAPING_STATUS.PAUSED });
}

async function handleResumeScraping() {
    console.log('▶ Resuming scrape process.');
    await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.RUNNING });
    
    // Broadcast resume to all tabs
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'RESUME_SCRAPING' }).catch(() => {});
    });
    
    broadcastMessage({ type: 'SCRAPING_STATUS', payload: SCRAPING_STATUS.RUNNING });
}

async function handleLeadFound(lead) {
    await storageManager.saveLead(lead);
    
    // Broadcast to update stats/table in popup
    broadcastMessage({ 
        type: 'LEAD_FOUND', 
        payload: lead 
    });
}

async function handleStatusUpdate(status) {
    console.log('📊 Status update:', status);
    if (status === 'completed' || status === 'idle') {
        await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.IDLE });
    }
    broadcastMessage({ type: 'SCRAPING_STATUS', payload: status });
}

async function handleRunDiagnostics(sendResponse) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
        sendResponse({ error: 'No active tab found.' });
        return;
    }
    
    chrome.tabs.sendMessage(tab.id, { type: 'RUN_DIAGNOSTICS' }, (response) => {
        if (chrome.runtime.lastError) {
            sendResponse({ error: 'Failed to communicate with content script. Make sure you are on a webpage and reload the page.' });
        } else {
            sendResponse(response);
        }
    });
}
