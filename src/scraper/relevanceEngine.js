/**
 * Lead Scraper Pro - Relevance Scoring Engine
 * Computes multi-criteria confidence percentages for scraped leads.
 */

import { keywordValidator } from './keywordValidator.js';
import { fuzzyMatcher } from '../parsers/fuzzyMatcher.js';
import { scoring } from '../utils/scoring.js';

import { synonymEngine } from '../parsers/synonymEngine.js';

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
            // Title (Business Name) match (with synonym boost)
            const directTitle = fuzzyMatcher.match(lead.name || '', keyword);
            let maxSynTitle = 0;
            if (config.matchSynonyms !== false) {
                const synonyms = synonymEngine.getSynonyms(keyword);
                synonyms.forEach(syn => {
                    const synScore = fuzzyMatcher.match(lead.name || '', syn);
                    if (synScore > maxSynTitle) {
                        maxSynTitle = synScore;
                    }
                });
            }
            titleScore = Math.max(directTitle, Math.round(maxSynTitle * 0.85));
            
            // Description (Extracted description or full text) match (with synonym boost)
            const textToMatch = `${lead.address || ''} ${lead.extractedDescription || ''}`;
            const directDesc = fuzzyMatcher.match(textToMatch, keyword);
            let maxSynDesc = 0;
            if (config.matchSynonyms !== false) {
                const synonyms = synonymEngine.getSynonyms(keyword);
                synonyms.forEach(syn => {
                    const synScore = fuzzyMatcher.match(textToMatch, syn);
                    if (synScore > maxSynDesc) {
                        maxSynDesc = synScore;
                    }
                });
            }
            descriptionScore = Math.max(directDesc, Math.round(maxSynDesc * 0.85));
            
            // Validate against full keyword validation config
            const kwResult = keywordValidator.validate(lead, config);
            productScore = kwResult.score;
            lead.matchedKeyword = kwResult.matchedKeyword;
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

        const minRequiredRelevance = config.minRelevance !== undefined ? config.minRelevance : 50;
        
        // Calculate Quality Score (0 - 100)
        let qualityScore = 0;
        if (lead.name && lead.name.length >= 3) qualityScore += 20;
        if (lead.phone && lead.phone.length >= 7) qualityScore += 25;
        if (lead.email && lead.email.length >= 5) qualityScore += 15;
        if (lead.website && lead.website.length >= 5) qualityScore += 15;
        if (lead.address && lead.address.length >= 5) qualityScore += 10;
        if (finalScore >= 80) qualityScore += 15;

        lead.relevanceScore = finalScore;
        lead.qualityScore = qualityScore;
        
        // Only valid if finalScore >= minRequiredRelevance AND qualityScore >= 50 AND (no city filter or city matches)
        lead.isValid = finalScore >= minRequiredRelevance && qualityScore >= 50 && (!city || cityMatch);
        lead.confidenceRating = qualityScore >= 80 ? 'High' : qualityScore >= 60 ? 'Medium' : 'Low';
        
        return lead;
    }
};
