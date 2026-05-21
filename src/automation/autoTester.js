/**
 * Lead Scraper Pro - Automatic Testing and Diagnostics Engine
 * Runs local unit tests and scans directories to diagnose DOM extractor health.
 */

import { fuzzyMatcher } from '../parsers/fuzzyMatcher.js';
import { synonymEngine } from '../parsers/synonymEngine.js';
import { relevanceEngine } from '../scraper/relevanceEngine.js';
import { smartDetector } from '../scraper/smartDetector.js';
import { extractionFallback } from '../scraper/extractionFallback.js';
import { REGEX } from '../utils/regex.js';
import { debugLogger } from './debugLogger.js';

export const autoTester = {
    /**
     * Runs live DOM diagnostic checks on the active directory page.
     * @returns {Object} Diagnostic summary
     */
    async runDiagnostics() {
        debugLogger.log('🔍 Starting Page Extraction Diagnostics...', 'info');
        
        const containers = smartDetector.detect();
        if (containers.length === 0) {
            debugLogger.log('✗ Diagnostics: No cards detected on this page. Extraction cannot run.', 'error');
            return { status: 'CRITICAL', reason: 'No card containers found.' };
        }

        let nameCount = 0;
        let phoneCount = 0;
        let emailCount = 0;
        let websiteCount = 0;
        let addressCount = 0;

        containers.forEach(container => {
            if (extractionFallback.extractName(container)) nameCount++;
            if (extractionFallback.extractPhones(container).length > 0) phoneCount++;
            if (extractionFallback.extractEmails(container).length > 0) emailCount++;
            if (extractionFallback.extractWebsite(container)) websiteCount++;
            if (extractionFallback.extractAddress(container)) addressCount++;
        });

        const cardCount = containers.length;
        const nameCoverage = Math.round((nameCount / cardCount) * 100);
        const phoneCoverage = Math.round((phoneCount / cardCount) * 100);
        const emailCoverage = Math.round((emailCount / cardCount) * 100);
        const addressCoverage = Math.round((addressCount / cardCount) * 100);

        debugLogger.log(`--- Page Extract Diagnostic ---`, 'info');
        debugLogger.log(`Detected Business Cards: ${cardCount}`, 'info');
        debugLogger.log(`Name Extraction Coverage: ${nameCoverage}%`, nameCoverage > 80 ? 'success' : 'warning');
        debugLogger.log(`Phone Extraction Coverage: ${phoneCoverage}%`, phoneCoverage > 50 ? 'success' : 'warning');
        debugLogger.log(`Address Extraction Coverage: ${addressCoverage}%`, addressCoverage > 70 ? 'success' : 'warning');
        debugLogger.log(`Email Extraction Coverage: ${emailCoverage}%`, 'info');

        let status = 'HEALTHY';
        let recommendation = 'Page extractor is ready to scrape.';
        
        if (nameCoverage < 50) {
            status = 'CRITICAL';
            recommendation = 'Name extractor cannot identify businesses. Selectors must be updated.';
        } else if (phoneCoverage === 0 && addressCoverage === 0) {
            status = 'WEAK';
            recommendation = 'No contact information detected. Check if listings are dynamic/lazy-loaded.';
        }

        debugLogger.log(`Diagnostic Status: ${status} - ${recommendation}`, status === 'HEALTHY' ? 'success' : 'warning');

        return {
            status,
            cardCount,
            nameCoverage,
            phoneCoverage,
            emailCoverage,
            addressCoverage,
            recommendation
        };
    }
};
