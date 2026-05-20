/**
 * Lead Scraper Pro - Main Content Logic
 */

import { MESSAGES } from './constants.js';
import { UniversalScraper } from './scraper.js';

let isScraping = false;
let scraper = null;

console.log('Lead Scraper Pro: Universal Engine Ready.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case MESSAGES.START_SCRAPING:
            if (!isScraping) {
                isScraping = true;
                startScrapingProcess(message.payload);
            }
            break;
        case MESSAGES.STOP_SCRAPING:
            isScraping = false;
            console.log('🛑 Scraping stopped by user.');
            break;
    }
});

async function startScrapingProcess(config) {
    console.log('📍 START SCRAPING', config);
    scraper = new UniversalScraper(config);
    
    let pageCount = 1;
    const maxPages = 20;

    try {
        while (isScraping && pageCount <= maxPages) {
            console.log(`📄 Processing Page ${pageCount}...`);
            
            // 1. Scroll for dynamic content
            await scraper.autoScroll(2);
            
            // 2. Extract Leads
            const leads = await scraper.scrape();
            console.log(`📦 Page ${pageCount}: Found ${leads.length} leads.`);
            
            // 3. Send to background immediately
            if (leads.length > 0) {
                leads.forEach(lead => {
                    chrome.runtime.sendMessage({
                        type: MESSAGES.LEAD_FOUND,
                        payload: lead
                    });
                });
            } else {
                console.warn(`⚠️ No leads extracted from page ${pageCount}.`);
            }

            // 4. Handle Pagination
            if (isScraping) {
                const hasMore = await handlePagination();
                if (!hasMore) {
                    console.log('🏁 No more pages detected.');
                    break;
                }
                pageCount++;
                await new Promise(r => setTimeout(r, 2500)); // Delay for page load
            }
        }
    } catch (error) {
        console.error('❌ Content Script Error:', error);
    }

    console.log('✅ Scraping session finished.');
    isScraping = false;
    chrome.runtime.sendMessage({ 
        type: MESSAGES.SCRAPING_STATUS, 
        payload: 'completed' 
    });
}

async function handlePagination() {
    const nextButtons = [
        'Next', 'next', '→', '>', '»', 'Following', 'Load More', 'Show More',
        'Siguiente', 'Suivant', 'Nächste', 'Próximo', 'अगला'
    ];

    const allLinks = Array.from(document.querySelectorAll('a, button, span'));
    
    const nextBtn = allLinks.find(el => {
        const text = el.innerText.trim();
        // Check for exact text match or primary "Next" patterns
        return (nextButtons.includes(text) || nextButtons.some(k => text.length < 20 && text.includes(k))) && 
               el.offsetParent !== null;
    });

    if (nextBtn) {
        console.log('👉 Clicking Next Button:', nextBtn.innerText);
        nextBtn.click();
        return true;
    }

    // Numbered pagination fallback
    const activePage = document.querySelector('.active, .current, [aria-current="page"]');
    if (activePage) {
        const nextNum = parseInt(activePage.innerText) + 1;
        if (!isNaN(nextNum)) {
            const nextNumBtn = allLinks.find(el => el.innerText.trim() === nextNum.toString());
            if (nextNumBtn) {
                console.log('👉 Clicking Page Number:', nextNum);
                nextNumBtn.click();
                return true;
            }
        }
    }

    return false;
}
