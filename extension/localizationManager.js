/**
 * Lead Scraper Pro - Localization Manager
 */

import { storageManager } from './storageManager.js';

export const localizationManager = {
    currentLanguage: 'en',
    translations: {},

    async init() {
        const settings = await storageManager.getSettings();
        this.currentLanguage = settings.language || 'en';
        await this.loadTranslations(this.currentLanguage);
    },

    async loadTranslations(lang) {
        try {
            const response = await fetch(chrome.runtime.getURL(`i18n/${lang}.json`));
            this.translations = await response.json();
            this.currentLanguage = lang;
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
            if (lang !== 'en') await this.loadTranslations('en');
        }
    },

    t(key) {
        return this.translations[key] || key;
    },

    async setLanguage(lang) {
        await this.loadTranslations(lang);
        await storageManager.saveSettings({ language: lang });
        this.applyToDOM();
    },

    applyToDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = this.t(key);
            } else {
                el.textContent = this.t(key);
            }
        });
    }
};
