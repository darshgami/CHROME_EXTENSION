/**
 * Lead Scraper Pro - Content Script Loader
 * This file acts as a non-module entry point to load the actual logic using dynamic imports.
 */

// Content Script Loader
// Instead of dynamically importing the module into the extension isolated world,
// inject a <script type="module"> tag that loads the module in the page context.
// This allows the module to attach helpers to the page `window` and operate
// with the same global environment as page scripts and selectors.

(function injectModuleIntoPage() {
    try {
        const src = chrome.runtime.getURL('content-main.js');

        // If the module is already injected, don't inject again
        if (document.querySelector(`script[src="${src}"]`)) {
            return;
        }

        const script = document.createElement('script');
        script.type = 'module';
        script.src = src;
        script.async = true;

        script.onload = () => {
            // Optionally remove the tag after load to keep DOM clean
            try { script.remove(); } catch (e) {}
            console.log('Lead Scraper Pro: content-main.js injected successfully.');
        };

        script.onerror = (err) => {
            console.error('Lead Scraper Pro: Failed to inject content-main.js', err);
        };

        // Insert into document.documentElement to ensure module executes early
        (document.documentElement || document.head || document.body).appendChild(script);
    } catch (error) {
        console.error('Lead Scraper Pro: Error while injecting content-main.js', error);
    }
})();
