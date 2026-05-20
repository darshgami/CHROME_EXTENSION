/**
 * Lead Scraper Pro - DOM Helper Utilities
 */

export const domHelpers = {
    /**
     * Safely checks if an element is visible to the user.
     * @param {HTMLElement} el 
     * @returns {boolean}
     */
    isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            el.offsetWidth > 0 &&
            el.offsetHeight > 0
        );
    },

    /**
     * Get clean inner text from an element, removing excess spacing/newlines.
     * @param {HTMLElement} el 
     * @returns {string}
     */
    getCleanText(el) {
        if (!el) return '';
        return el.innerText
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Finds the nearest parent element matching a selector or condition.
     * @param {HTMLElement} el 
     * @param {Function} predicate 
     * @param {number} maxDepth 
     * @returns {HTMLElement|null}
     */
    findParent(el, predicate, maxDepth = 10) {
        let current = el;
        let depth = 0;
        while (current && depth < maxDepth) {
            if (predicate(current)) return current;
            current = current.parentElement;
            depth++;
        }
        return null;
    },

    /**
     * Get paths (tag and class) of an element for debugging or fallback strategies.
     * @param {HTMLElement} el 
     * @returns {string}
     */
    getElementSelectorPath(el) {
        if (!el) return '';
        const path = [];
        let current = el;
        while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName !== 'BODY') {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break; // Stop at ID, it's unique
            } else if (current.className) {
                const classes = Array.from(current.classList)
                    .filter(c => !c.includes('active') && !c.includes('hover') && !c.includes('selected'))
                    .join('.');
                if (classes) selector += `.${classes}`;
            }
            path.unshift(selector);
            current = current.parentElement;
        }
        return path.join(' > ');
    },

    /**
     * Checks if two elements occupy roughly the same vertical or horizontal space.
     * @param {HTMLElement} el1 
     * @param {HTMLElement} el2 
     * @returns {boolean}
     */
    isVisualCardSibling(el1, el2) {
        if (!el1 || !el2) return false;
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        
        // Similar height and width (within 15% threshold)
        const hDiff = Math.abs(rect1.height - rect2.height) / Math.max(rect1.height, 1);
        const wDiff = Math.abs(rect1.width - rect2.width) / Math.max(rect1.width, 1);
        
        return hDiff < 0.15 && wDiff < 0.15;
    }
};
