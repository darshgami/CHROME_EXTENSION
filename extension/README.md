# Lead Scraper Pro - Universal Business Directory Lead Finder

Lead Scraper Pro is a production-ready, highly intelligent Chrome Extension (Manifest V3) designed to dynamically extract B2B business leads (Name, Phone, Email, Website, Address, and Relevance Confidence) from ANY online directory website globally.

Using visual shape clustering, repeating class heuristics, and text-density analysis, the scraper automatically detects listing cards and adjusts to DOM structures without static or hardcoded query selectors.

---

## 📁 File Structure

```
/extension
│
├── manifest.json            # MV3 Manifest
├── background.js            # Background service worker (state, tabs, diagnostics)
├── content.js               # Content script entry (loads main context)
├── content-main.js          # Core content scripting execution
├── popup.html               # Compiled React entry HTML
├── popup.js                 # Compiled React code (built with Vite)
├── popup.css                # Compiled Tailwind CSS styles
│
├── /libs/
│   ├── fuse.js              # Local Fuse.js fuzzy library
│   ├── papaparse.js         # Local PapaParse CSV generator
│   └── xlsx.full.min.js     # SheetJS library
│
└── /src/
    ├── /scraper/
    │   ├── universalScraper.js      # Main extraction and scroll session loop
    │   ├── smartDetector.js         # Heuristic repeated card & visual layout detector
    │   ├── relevanceEngine.js       # Confidence scoring and location verification
    │   ├── keywordValidator.js      # Direct and synonym matching validations
    │   ├── infiniteScrollManager.js # Mutation-based scroll tracker
    │   └── extractionFallback.js    # Fallback and auto-repair extraction routines
    ├── /matcher/
    │   ├── fuzzyMatcher.js          # Token-overlap and Sørensen-Dice similarity
    │   └── synonymEngine.js         # Query expansion synonyms dictionary
    ├── /export/
    │   ├── csvExport.js             # UTF-8 CSV generator with BOM support
    │   └── excelExport.js           # SheetJS Excel exporter
    ├── /testing/
    │   ├── autoTester.js            # Self-tests and page diagnostic checks
    │   └── debugLogger.js           # Real-time console logger and broadcaster
    └── /utils/
        ├── regex.js                 # Unified regex library (Phone, Email, Postal)
        ├── dedupe.js                # Unique key generation and duplication filters
        ├── domHelpers.js            # DOM visibility and traversal helpers
        └── scoring.js               # Numeric weights and text normalizations
```

---

## 🚀 Step-by-Step Running Instructions

### 1. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed, open the root workspace folder in your terminal, and run:
```bash
npm install
```

### 2. Build the Extension
Compile the React and Tailwind CSS popup frontend and copy the runtime modules:
```bash
npm run build
```
This builds and packages all files directly into the `/extension` directory.

### 3. Load the Unpacked Extension in Chrome
1. Open Google Chrome and go to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `/extension` folder from this project directory.

### 4. Enable Developer Mode & Verify
Once loaded, you should see the **Lead Scraper Pro - Universal Business Lead Finder** card active in your Chrome Extensions menu.

---

## 🛠️ Testing & Debugging Guide

### 5. Test on Directory Websites
Open any business directory listing search page, such as:
- [Justdial](https://www.justdial.com/)
- [IndiaMART](https://www.indiamart.com/)
- [Yelp](https://www.yelp.com/)
- [Sulekha](https://www.sulekha.com/)
- [Google Maps Search](https://www.google.com/maps)
Open the extension popup, enter a keyword (e.g. `Auto parts`), specify a city, and click **START SCRAPING**.

### 6. Review Debug Logs
In the extension popup, click on the **Logs** tab. The console outputs real-time operations, details about card discovery counts, regex matching, scoring details, and scrolling steps.

### 7. How to Inspect Content Script
1. Press `F12` on the target directory page to open Chrome DevTools.
2. Go to the **Console** tab.
3. In the top-left dropdown of the console (which defaults to `top`), select the dropdown and choose the context representing the extension (e.g., `Lead Scraper Pro...`).
4. You will see all extension operations, fallback triggers, and smart selector detections outputted directly to the console.

### 8. How to Test Extraction (Page Health Diagnostics)
In the popup UI, click **Page Health**. The extension will run diagnostic checks on the active tab and display:
- Total card containers detected.
- Feature coverage percentages (Name, Phone, Email, Address).
- Extractor health status (`HEALTHY`, `WEAK`, `CRITICAL`).
- Recommendations to optimize selection.

### 9. How to Fix Selector Failures
If diagnostics return a `CRITICAL` state (meaning it cannot extract business names):
1. The smart detector defaults to checking class frequencies, tag groupings (like `<li>` and `<article>`), and adjacent bounds.
2. If class names change dynamically, ensure that the target directory isn't blocking DOM elements or running inside nested iframes.
3. If necessary, you can expand class candidate matches in `src/scraper/smartDetector.js` or add custom rules to `src/scraper/extractionFallback.js`.

### 10. How to Export Leads
Once scraping has run and populated items:
1. Click the **Excel** button in the popup leads table header to download a styled spreadsheet (`.xlsx`) matching the current search parameters.
2. Alternatively, click the **CSV** button to download a standard comma-separated text file.

---

## ⚖️ License
MIT
