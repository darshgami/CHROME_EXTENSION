/**
 * Lead Scraper Pro - Constants
 */

export const STORAGE_KEYS = {
    LEADS: 'lsp_leads',
    SETTINGS: 'lsp_settings',
    STATS: 'lsp_stats',
    CURRENT_SESSION: 'lsp_current_session'
};

export const SCRAPING_STATUS = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ERROR: 'error'
};

export const MESSAGES = {
    START_SCRAPING: 'START_SCRAPING',
    STOP_SCRAPING: 'STOP_SCRAPING',
    SCRAPING_STATUS: 'SCRAPING_STATUS',
    LEAD_FOUND: 'LEAD_FOUND',
    EXPORT_DATA: 'EXPORT_DATA',
    CLEAR_DATA: 'CLEAR_DATA'
};

export const DEFAULT_SETTINGS = {
    language: 'en',
    scrollDelay: 2000,
    maxLeads: 1000,
    autoScroll: true
};
