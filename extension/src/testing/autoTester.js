/**
 * Lead Scraper Pro - Automatic Testing and Diagnostics Engine
 * Runs local unit tests and scans directories to diagnose DOM extractor health.
 */

import { fuzzyMatcher } from '../matcher/fuzzyMatcher.js';
import { synonymEngine } from '../matcher/synonymEngine.js';
import { relevanceEngine } from '../scraper/relevanceEngine.js';
import { smartDetector } from '../scraper/smartDetector.js';
import { extractionFallback } from '../scraper/extractionFallback.js';
import { REGEX } from '../utils/regex.js';
import { debugLogger } from './debugLogger.js';

export const autoTester = {
    /**
     * Run unit test suite on core logical functions.
     * @returns {Object} Test report
     */
    async runSelfTests() {
        debugLogger.log('🧪 Starting Extension Self-Tests...', 'info');
        
        let passed = 0;
        let failed = 0;
        const report = [];

        const assert = (name, condition) => {
            if (condition) {
                passed++;
                report.push({ name, status: 'PASSED' });
                debugLogger.log(`✓ Test: ${name} - PASSED`, 'success');
            } else {
                failed++;
                report.push({ name, status: 'FAILED' });
                debugLogger.log(`✗ Test: ${name} - FAILED`, 'error');
            }
        };

        try {
            // Test 1: Fuzzy Matcher Exact Similarity
            assert('Fuzzy Matcher Exact Match', fuzzyMatcher.match('Software developer', 'Software developer') === 100);
            
            // Test 2: Fuzzy Matcher Token Similarity
            assert('Fuzzy Matcher Token Overlap', fuzzyMatcher.match('Software Solutions Inc', 'Software') >= 60);

            // Test 3: Synonym Engine matches
            const bananasyns = synonymEngine.getSynonyms('banana');
            assert('Synonym Lookup', bananasyns.includes('fruit') && bananasyns.includes('produce'));

            // Test 4: Regex Phone Extractor
            const testPhoneText = 'Contact us at: +1 (555) 123-4567 or email info@test.com';
            const phoneMatch = testPhoneText.match(REGEX.PHONE);
            assert('Regex Phone Matching', phoneMatch !== null && phoneMatch.length > 0);

            // Test 5: Regex Email Extractor
            const emailMatch = testPhoneText.match(REGEX.EMAIL);
            assert('Regex Email Matching', emailMatch !== null && emailMatch[0] === 'info@test.com');

            // Test 6: Relevance Engine City Weighting
            const mockLead = {
                name: 'Mumbai Electronics',
                address: '12, Link Road, Mumbai, Maharashtra, 400001',
                phone: '9876543210',
                extractedDescription: 'Wholesaler of mobile chargers'
            };
            const resultLead = relevanceEngine.evaluate(mockLead, { keyword: 'Electronics', city: 'Mumbai' });
            assert('Relevance Score calculation (Valid)', resultLead.relevanceScore >= 70 && resultLead.isValid === true);

            // Test 7: Relevance Engine City Mismatch Penalty
            const resultMismatch = relevanceEngine.evaluate(mockLead, { keyword: 'Electronics', city: 'Delhi' });
            assert('Relevance Penalty on Mismatched City', resultMismatch.isValid === false || resultMismatch.relevanceScore < 50);

        } catch (e) {
            failed++;
            debugLogger.log(`Self-Test Crash: ${e.message}`, 'error');
        }

        const summary = `Self-tests completed. Passed: ${passed}, Failed: ${failed}`;
        debugLogger.log(summary, failed > 0 ? 'warning' : 'success');
        
        return {
            passed,
            failed,
            report
        };
    },

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
