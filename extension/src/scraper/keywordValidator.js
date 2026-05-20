/**
 * Lead Scraper Pro - Keyword Validator
 * Verifies matches against keywords, synonym boosts, and relevance levels.
 */

import { synonymEngine } from '../matcher/synonymEngine.js';
import { fuzzyMatcher } from '../matcher/fuzzyMatcher.js';
import { scoring } from '../utils/scoring.js';

export const keywordValidator = {
    /**
     * Check if the lead's textual content matches the keyword query.
     * @param {Object} lead - Lead data object
     * @param {string} keyword - Search query
     * @returns {Object} { isValid: boolean, score: number }
     */
    validate(lead, keyword) {
        if (!keyword) return { isValid: true, score: 100 };

        const targetText = `${lead.name || ''} ${lead.address || ''} ${lead.extractedDescription || ''}`;
        const normalizedText = scoring.normalizeText(targetText);
        
        // 1. Check direct keyword match
        const directScore = fuzzyMatcher.match(normalizedText, keyword);
        
        // 2. Check synonym match
        const synonyms = synonymEngine.getSynonyms(keyword);
        let maxSynonymScore = 0;
        
        synonyms.forEach(syn => {
            const synScore = fuzzyMatcher.match(normalizedText, syn);
            if (synScore > maxSynonymScore) {
                maxSynonymScore = synScore;
            }
        });

        // 3. Blend scores (give premium weight to direct keyword matches)
        const finalScore = Math.max(directScore, Math.round(maxSynonymScore * 0.85));

        // Threshold score: 35 is a reasonable cut-off for listing validity
        const isValid = finalScore >= 35;

        return {
            isValid,
            score: finalScore
        };
    }
};
