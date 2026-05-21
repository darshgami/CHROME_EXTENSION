/**
 * Lead Scraper Pro - Keyword Validator
 * Verifies matches against keywords, synonym boosts, and relevance levels.
 */

import { synonymEngine } from '../parsers/synonymEngine.js';
import { fuzzyMatcher } from '../parsers/fuzzyMatcher.js';
import { scoring } from '../utils/scoring.js';

export const keywordValidator = {
    /**
     * Check if the lead's textual content matches the keyword query.
     * @param {Object} lead - Lead data object
     * @param {string} keyword - Search query
     * @returns {Object} { isValid: boolean, score: number }
     */
    validate(lead, config) {
        const keyword = config.keyword;
        if (!keyword) return { isValid: true, score: 100 };

        const targetText = `${lead.name || ''} ${lead.address || ''} ${lead.extractedDescription || ''}`;
        const normalizedText = scoring.normalizeText(targetText);
        
        // 1. Check direct keyword match
        let directScore = 0;
        if (config.matchExact) {
            // Strict substring match: 100 if present, 0 otherwise
            directScore = normalizedText.includes(scoring.normalizeText(keyword)) ? 100 : 0;
        } else if (config.matchFuzzy !== false) {
            // Use fuzzy matching for the main keyword
            directScore = fuzzyMatcher.match(normalizedText, keyword);
        }

        // 2. Check synonym match
        let maxSynonymScore = 0;
        if (config.matchSynonyms !== false) {
            const synonyms = synonymEngine.getSynonyms(keyword);
            synonyms.forEach(syn => {
                const synScore = fuzzyMatcher.match(normalizedText, syn);
                if (synScore > maxSynonymScore) {
                    maxSynonymScore = synScore;
                }
            });
        }

        // 3. Blend scores (give premium weight to direct keyword matches)
        const finalScore = Math.max(directScore, Math.round(maxSynonymScore * 0.85));

        // Let the relevanceEngine handle the minRelevance threshold
        return {
            isValid: true, // we leave dropping up to relevanceEngine
            score: finalScore,
            matchedKeyword: finalScore === directScore ? keyword : 'Synonym' // Basic tracking for now
        };
    }
};
