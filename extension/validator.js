/**
 * Lead Scraper Pro - Data Validator
 */

import { getCountryByCode } from './countryData.js';

export const validator = {
    validate(lead, config) {
        const countryData = getCountryByCode(config.country);
        if (!countryData) return true; // Fallback if country data missing

        let isValid = true;
        const reasons = [];

        // Phone Validation
        if (lead.phone && countryData.phoneRegex) {
            const cleanPhone = lead.phone.replace(/[\s\(\)\-]/g, '');
            if (!countryData.phoneRegex.test(lead.phone)) {
                // isValid = false; // Don't reject just because of phone, but mark it
                reasons.push('Invalid phone format');
            }
        }

        // Postal Code Validation
        if (lead.postalCode && countryData.postalRegex) {
            if (!countryData.postalRegex.test(lead.postalCode)) {
                reasons.push('Invalid postal code');
            }
        }

        // Location Match (Simplified)
        if (config.city && lead.address) {
            if (!lead.address.toLowerCase().includes(config.city.toLowerCase())) {
                reasons.push('City mismatch');
            }
        }

        lead.validationReasons = reasons;
        return reasons.length === 0;
    },

    cleanPhone(phone, countryCode) {
        if (!phone) return '';
        // Basic cleaning
        return phone.replace(/[^\d+]/g, '');
    }
};
