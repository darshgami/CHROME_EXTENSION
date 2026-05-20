/**
 * Lead Scraper Pro - Utilities
 */

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatTimestamp = (date = new Date()) => {
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export const normalizeUrl = (url) => {
    if (!url) return '';
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = 'https://' + normalized;
    }
    return normalized;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
