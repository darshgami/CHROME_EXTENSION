/**
 * Lead Scraper Pro - Storage Manager
 * Wrapper for chrome.storage.local
 */

import { STORAGE_KEYS } from './constants.js';

export const storageManager = {
    async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    },

    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    },

    async remove(key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove([key], () => {
                resolve();
            });
        });
    },

    async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(() => {
                resolve();
            });
        });
    },

    async getLeads() {
        return await this.get(STORAGE_KEYS.LEADS) || [];
    },

    async saveLead(lead) {
        const leads = await this.getLeads();
        leads.push(lead);
        await this.set(STORAGE_KEYS.LEADS, leads);
        return leads;
    },

    async clearLeads() {
        await this.set(STORAGE_KEYS.LEADS, []);
    },

    async getSettings() {
        return await this.get(STORAGE_KEYS.SETTINGS) || {};
    },

    async saveSettings(settings) {
        const currentSettings = await this.getSettings();
        const newSettings = { ...currentSettings, ...settings };
        await this.set(STORAGE_KEYS.SETTINGS, newSettings);
        return newSettings;
    }
};
