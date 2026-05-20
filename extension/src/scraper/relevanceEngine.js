/**
 * Lead Scraper Pro - Relevance Scoring Engine
 * Computes multi-criteria confidence percentages for scraped leads.
 */

import { keywordValidator } from './keywordValidator.js';
import { fuzzyMatcher } from '../matcher/fuzzyMatcher.js';
import { scoring } from '../utils/scoring.js';

export const relevanceEngine = {
    /**
     * Compute confidence score and validity for a single lead.
     * @param {Object} lead 
     * @param {Object} config - { keyword, city }
     * @returns {Object} Updated lead with confidence score details
     */
    evaluate(lead, config = {}) {
        const { keyword, city } = config;
        
        // Default base scores
        let titleScore = 100;
        let descriptionScore = 100;
        let productScore = 100;
        let cityMatch = true;

        if (keyword) {
            // Title (Business Name) match
            titleScore = fuzzyMatcher.match(lead.name || '', keyword);
            
            // Description (Extracted description or full text) match
            const textToMatch = `${lead.address || ''} ${lead.extractedDescription || ''}`;
            descriptionScore = fuzzyMatcher.match(textToMatch, keyword);
            
            // Validate against full keyword validation
            const kwResult = keywordValidator.validate(lead, keyword);
            productScore = kwResult.score;
        }

        // City Filtering & Scoring
        if (city && lead.address) {
            const normalizedCity = scoring.normalizeText(city);
            const normalizedAddress = scoring.normalizeText(lead.address);
            
            // Check if city name is in address
            if (normalizedAddress.includes(normalizedCity)) {
                cityMatch = true;
            } else {
                // Fuzzy match city to avoid spelling/abbreviation drops
                const cityFuzzy = fuzzyMatcher.match(normalizedAddress, normalizedCity);
                cityMatch = cityFuzzy >= 60;
            }
        }

        // Aggregate scores with weights
        const scores = {
            title: titleScore,
            description: descriptionScore,
            product: productScore
        };

        const weights = {
            title: 0.50,         // Business Name is key
            description: 0.20,   // Context
            product: 0.30        // Overall relevance
        };

        let finalScore = scoring.weightedScore(scores, weights);

        // Apply penalties
        if (!cityMatch && city) {
            // Severe penalty for location mismatch if city filter is active
            finalScore = Math.round(finalScore * 0.3); 
        }

        // Must have phone or email or website to be highly actionable
        const hasContact = !!(lead.phone || lead.email || lead.website);
        if (!hasContact) {
            finalScore = Math.round(finalScore * 0.8); // 20% penalty for no contacts
        }

        lead.relevanceScore = finalScore;
        lead.isValid = finalScore >= 35 && (!city || cityMatch);
        lead.confidenceRating = finalScore >= 75 ? 'High' : finalScore >= 50 ? 'Medium' : 'Low';
        
        return lead;
    }
};
