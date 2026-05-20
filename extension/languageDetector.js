/**
 * Lead Scraper Pro - Language Detector
 */

export const languageDetector = {
    /**
     * Detects the UI language based on browser preference.
     */
    detectUILanguage() {
        const lang = navigator.language || navigator.userLanguage || 'en';
        return lang.split('-')[0];
    },

    /**
     * Detects the page language from metadata or content.
     */
    detectPageLanguage() {
        const htmlLang = document.documentElement.lang;
        if (htmlLang) return htmlLang.split('-')[0];

        const metaLang = document.querySelector('meta[http-equiv="content-language"], meta[name="language"]');
        if (metaLang) return metaLang.getAttribute('content').split('-')[0];

        // Basic heuristic: check for common words in certain languages
        const text = document.body.innerText.substring(0, 1000).toLowerCase();
        if (text.includes(' de ') || text.includes(' und ')) return 'de';
        if (text.includes(' el ') || text.includes(' la ')) return 'es';
        if (text.includes(' le ') || text.includes(' la ')) return 'fr';
        
        return 'en';
    }
};
