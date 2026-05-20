/**
 * Lead Scraper Pro - Universal Keyword Matcher
 */

export const keywordMatcher = {
    /**
     * Matches text against keywords with support for partial and fuzzy matching.
     * @param {string} text - The text to search in.
     * @param {string} keywordInput - Comma-separated keywords from user.
     * @returns {number} Score from 0 to 100.
     */
    match(text, keywordInput) {
        if (!text || !keywordInput) return 0;
        
        const normalizedText = text.toLowerCase();
        // Split by comma first for multiple keyword groups
        const groups = keywordInput.toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
        
        let maxScore = 0;

        groups.forEach(group => {
            // Split group into individual words for partial matching
            const words = group.split(/\s+/).filter(w => w.length > 2);
            if (words.length === 0) return;

            let matchCount = 0;
            words.forEach(word => {
                if (normalizedText.includes(word)) {
                    matchCount++;
                }
            });

            // Calculate percentage of words matched
            const matchRatio = matchCount / words.length;
            let currentScore = matchRatio * 100;

            // Bonus for exact group match
            if (normalizedText.includes(group)) {
                currentScore = Math.max(currentScore, 90);
            }

            maxScore = Math.max(maxScore, currentScore);
        });

        return Math.round(maxScore);
    }
};
