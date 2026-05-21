const { test, expect, chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Lead Scraper Pro Heuristics & Extraction Tests', () => {
    let context;
    let page;

    test.beforeAll(async () => {
        const pathToExtension = path.resolve(__dirname, '../dist');
        
        // Launch Chrome with the extension loaded
        context = await chromium.launchPersistentContext('', {
            headless: false, // Chrome extensions only work in headful mode
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
            ],
        });

        page = await context.newPage();
    });

    test.afterAll(async () => {
        if (context) {
            await context.close();
        }
    });

    test('should load the extension and detect/extract listings from mock DOM', async () => {
        // Navigate to any public page to trigger the extension content script context
        await page.goto('https://example.com');

        // Inject mock directory HTML content representing a typical JustDial / IndiaMART card list
        // This DOM contains hashed classes, navigation links, ratings, and contact info
        await page.setContent(`
            <html>
            <head><title>Mock Business Directory</title></head>
            <body>
                <div class="main-container">
                    <h1 class="page-title">Top Real Estate Agents in Rajkot</h1>
                    
                    <!-- Card 1: Excellent Lead -->
                    <div class="jsx-72e7372d82ccfa2e result-box card-container" style="display: block; width: 300px; height: 200px;">
                        <h2 class="jsx-72e7372d82ccfa2e store-name">
                            <a href="https://example.com/prestige-estate" class="title-link">Prestige Estate Agents</a>
                        </h2>
                        <div class="rating-section">
                            <span class="stars">★ 4.8</span>
                            <span class="count">162 Ratings & Reviews as on Google</span>
                        </div>
                        <div class="address-info font-medium">
                            15 Main Road, near Ring Road Circle, Rajkot, Gujarat - 360005
                        </div>
                        <div class="contact-info">
                            <a href="tel:+919876543210" class="phone-link">Call: +91 98765-43210</a>
                        </div>
                        <div class="actions">
                            <a href="https://wa.me/919876543210" class="wa-link">Chat on WhatsApp</a>
                            <a href="https://prestigeestate.com" class="website-link">Visit Website</a>
                        </div>
                    </div>

                    <!-- Card 2: Good Lead -->
                    <div class="jsx-72e7372d82ccfa2e result-box card-container" style="display: block; width: 300px; height: 200px;">
                        <h2 class="jsx-72e7372d82ccfa2e store-name">
                            <a href="https://example.com/royal-prop" class="title-link">Royal Property Dealers</a>
                        </h2>
                        <div class="rating-section">
                            <span class="stars">★ 4.2</span>
                            <span class="count">45 Reviews</span>
                        </div>
                        <div class="address-info font-medium">
                            23 Market St, Rajkot - 360001
                        </div>
                        <div class="contact-info">
                            <span class="mobilesv sprite-phone">Call: 09876543211</span>
                        </div>
                        <div class="actions">
                            <button class="quote-btn">Get Best Quotes</button>
                        </div>
                    </div>

                    <!-- Card 3: Generic garbage row that should NOT be detected as a business card -->
                    <div class="navigation-footer result-box" style="display: block; width: 300px; height: 50px;">
                        <h3>Get the List of Top Businesses</h3>
                        <a href="https://example.com/next" class="btn">View More Listings</a>
                    </div>
                </div>
            </body>
            </html>
        `);

        // Give the page and extension a moment to sync
        await page.waitForTimeout(1000);

        // Mock chrome API in page context to avoid ReferenceError when content-main.js loads
        await page.evaluate(() => {
            window.chrome = {
                runtime: {
                    onMessage: { addListener: () => {} },
                    sendMessage: () => {}
                }
            };
        });

        // Load and inject the compiled content-main.js bundle into the page
        const pathToContentMain = path.resolve(__dirname, '../dist/content-main.js');
        const contentMainScript = fs.readFileSync(pathToContentMain, 'utf8');
        await page.addScriptTag({ content: contentMainScript });

        // Inject and evaluate the Scraper components in the browser page context to test them
        const scrapeResults = await page.evaluate(async () => {
            const { smartDetector, extractionFallback, relevanceEngine } = window;

            if (!smartDetector || !extractionFallback || !relevanceEngine) {
                throw new Error('Scraper modules not found on window context. Injection might have failed.');
            }

            // 1. Run detection
            const containers = smartDetector.detect();
            
            // 2. Extract and score leads
            const leads = [];
            for (const container of containers) {
                const name = extractionFallback.extractName(container);
                const phones = extractionFallback.extractPhones(container);
                const address = extractionFallback.extractAddress(container);
                const website = extractionFallback.extractWebsite(container);
                const rating = extractionFallback.extractRating(container);

                const rawLead = {
                    name,
                    phone: phones[0] || '',
                    address,
                    website,
                    rating,
                    extractedDescription: container.innerText
                };

                const evaluated = relevanceEngine.evaluate(rawLead, {
                    keyword: 'estate agents',
                    city: 'Rajkot',
                    minRelevance: 50,
                    matchExact: true,
                    matchFuzzy: true,
                    matchSynonyms: true
                });

                leads.push(evaluated);
            }

            return {
                detectedCount: containers.length,
                leads: leads
            };
        });

        console.log('Scrape Results:', JSON.stringify(scrapeResults, null, 2));

        // 1. Verify container detection: should detect the 2 valid cards, but ignore the garbage footer row!
        expect(scrapeResults.detectedCount).toBe(2);

        const firstLead = scrapeResults.leads[0];
        const secondLead = scrapeResults.leads[1];

        // 2. Verify Card 1 extraction:
        // - Name should be exactly "Prestige Estate Agents", NOT including the ratings text!
        expect(firstLead.name).toBe('Prestige Estate Agents');
        // - Phone number must be properly cleaned to 10 digits
        expect(firstLead.phone).toBe('9876543210');
        // - Website extracted
        expect(firstLead.website.replace(/\/$/, '')).toBe('https://prestigeestate.com');
        // - Quality score should be very high (Excellent)
        expect(firstLead.qualityScore).toBeGreaterThanOrEqual(80);
        expect(firstLead.isValid).toBe(true);

        // 3. Verify Card 2 extraction:
        // - Name should be exactly "Royal Property Dealers"
        expect(secondLead.name).toBe('Royal Property Dealers');
        // - Phone number properly extracted and normalized from sprite text (stripping leading 0)
        expect(secondLead.phone).toBe('9876543211');
        // - Quality score should be Fair/Good
        expect(secondLead.qualityScore).toBeGreaterThanOrEqual(50);
        expect(secondLead.isValid).toBe(true);
    });
});
