/**
 * Lead Scraper Pro - Scoring and Normalization Calculations
 */

export const scoring = {
    /**
     * Compute a weighted average score.
     * @param {Object} scores - Key-value pair of category and raw score
     * @param {Object} weights - Key-value pair of category and weights (summing to 1 or normalized)
     * @returns {number} Weighted score from 0 to 100
     */
    weightedScore(scores, weights) {
        let totalScore = 0;
        let totalWeight = 0;

        for (const category in weights) {
            if (scores[category] !== undefined) {
                totalScore += scores[category] * weights[category];
                totalWeight += weights[category];
            }
        }

        if (totalWeight === 0) return 0;
        const finalScore = totalScore / totalWeight;
        return Math.min(100, Math.max(0, Math.round(finalScore)));
    },

    /**
     * Normalizes text for better scoring consistency (lowercase, removes punctuation and extra spacing).
     * @param {string} text 
     * @returns {string}
     */
    normalizeText(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize('NFD') // Normalizes accents
            .replace(/[\u0300-\u036f]/g, '') // Removes accents
            .replace(/[^\w\s-]/g, '') // Removes special punctuation (keeps alphanumeric, spaces, hyphens)
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim();
    }
};
