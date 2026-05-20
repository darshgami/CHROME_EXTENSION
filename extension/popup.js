/**
 * Lead Scraper Pro - Popup UI Logic
 */

import { MESSAGES, STORAGE_KEYS, SCRAPING_STATUS } from './constants.js';
import { storageManager } from './storageManager.js';
import { exporter } from './exporter.js';

document.addEventListener('DOMContentLoaded', async () => {
    const cityInput = document.getElementById('cityInput');
    const keywordInput = document.getElementById('keywordInput');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const totalLeadsEl = document.getElementById('totalLeads');
    const validLeadsEl = document.getElementById('validLeads');
    const invalidLeadsEl = document.getElementById('invalidLeads');
    const statusText = document.getElementById('statusText');
    const progressBar = document.getElementById('progressBar');
    const resultsTableBody = document.querySelector('#resultsTable tbody');

    // Update UI from Storage
    const updateUI = async () => {
        const leads = await storageManager.getLeads();
        const session = await storageManager.get(STORAGE_KEYS.CURRENT_SESSION) || { status: SCRAPING_STATUS.IDLE };

        totalLeadsEl.textContent = leads.length;
        validLeadsEl.textContent = leads.filter(l => l.isValid).length;
        invalidLeadsEl.textContent = leads.filter(l => !l.isValid).length;

        // Render Table
        resultsTableBody.innerHTML = '';
        leads.slice(-20).reverse().forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lead.name}</td>
                <td>${lead.city || 'N/A'}</td>
                <td class="${lead.isValid ? 'text-success' : 'text-danger'}">${lead.isValid ? '✓' : '✗'}</td>
            `;
            resultsTableBody.appendChild(row);
        });

        // Update Buttons
        const isRunning = session.status === SCRAPING_STATUS.RUNNING;
        startBtn.disabled = isRunning;
        stopBtn.disabled = !isRunning;
        exportBtn.disabled = leads.length === 0;
        
        statusText.textContent = isRunning ? 'Scraping in progress...' : 'Ready to scrape';
        progressBar.style.width = isRunning ? '100%' : '0%';
        if (isRunning) progressBar.classList.add('animating'); else progressBar.classList.remove('animating');
    };

    // Initial Load
    await updateUI();

    // Event Listeners
    startBtn.addEventListener('click', async () => {
        const config = { city: cityInput.value, keyword: keywordInput.value };
        if (!config.keyword) {
            alert('Please enter keywords.');
            return;
        }

        chrome.runtime.sendMessage({ type: MESSAGES.START_SCRAPING, payload: config });
        await storageManager.set(STORAGE_KEYS.CURRENT_SESSION, { status: SCRAPING_STATUS.RUNNING, config });
        updateUI();
    });

    stopBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: MESSAGES.STOP_SCRAPING });
        updateUI();
    });

    exportBtn.addEventListener('click', async () => {
        const leads = await storageManager.getLeads();
        exporter.toExcel(leads, keywordInput.value || 'leads');
    });

    clearBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all leads?')) {
            await storageManager.clearLeads();
            updateUI();
        }
    });

    // Listen for real-time updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === MESSAGES.LEAD_FOUND || message.type === MESSAGES.SCRAPING_STATUS) {
            updateUI();
        }
    });
});
