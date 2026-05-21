/**
 * Lead Scraper Pro - Fuzzy Matcher
 * Computes text similarity scores without requiring external dependencies, with high performance.
 */

export const fuzzyMatcher = {
    /**
     * Compute Sørensen-Dice coefficient similarity between two strings (0 to 1).
     * @param {string} str1 
     * @param {string} str2 
     * @returns {number}
     */
    diceCoefficient(str1, str2) {
        const s1 = str1.replace(/\s+/g, '').toLowerCase();
        const s2 = str2.replace(/\s+/g, '').toLowerCase();

        if (s1 === s2) return 1.0;
        if (s1.length < 2 || s2.length < 2) return 0.0;

        const bigrams1 = new Map();
        for (let i = 0; i < s1.length - 1; i++) {
            const bigram = s1.substr(i, 2);
            const count = bigrams1.get(bigram) || 0;
            bigrams1.set(bigram, count + 1);
        }

        let intersection = 0;
        for (let i = 0; i < s2.length - 1; i++) {
            const bigram = s2.substr(i, 2);
            const count = bigrams1.get(bigram) || 0;
            if (count > 0) {
                intersection++;
                bigrams1.set(bigram, count - 1);
            }
        }

        return (2.0 * intersection) / (s1.length + s2.length - 2);
    },

    /**
     * Checks if search keyword tokens overlap with candidate text tokens.
     * @param {string} text 
     * @param {string} keyword 
     * @returns {number} Score from 0 to 100
     */
    tokenSimilarity(text, keyword) {
        if (!text || !keyword) return 0;
        
        const cleanText = text.toLowerCase();
        const cleanKw = keyword.toLowerCase();
        
        // Exact substring match gives high score
        if (cleanText.includes(cleanKw)) {
            return 90;
        }

        const textTokens = cleanText.split(/[\s,-/()]+/);
        const kwTokens = cleanKw.split(/[\s,-/()]+/);
        
        let matchCount = 0;
        kwTokens.forEach(kwToken => {
            if (kwToken.length < 2) return;
            
            // Check exact token or very close fuzzy token match
            const found = textTokens.some(textToken => {
                if (textToken === kwToken) return true;
                if (textToken.includes(kwToken) && kwToken.length > 3) return true;
                // Dice similarity threshold for single token
                return this.diceCoefficient(textToken, kwToken) > 0.7;
            });
            
            if (found) matchCount++;
        });

        const score = (matchCount / kwTokens.length) * 100;
        return Math.round(score);
    },

    /**
     * Compute final fuzzy match score (0 to 100).
     * @param {string} text 
     * @param {string} keyword 
     * @returns {number}
     */
    match(text, keyword) {
        if (!text || !keyword) return 0;
        
        const tokenScore = this.tokenSimilarity(text, keyword);
        const diceScore = this.diceCoefficient(text, keyword) * 100;
        
        // Weighted blend: token similarity is more important for matching queries
        return Math.round((tokenScore * 0.7) + (diceScore * 0.3));
    }
};
