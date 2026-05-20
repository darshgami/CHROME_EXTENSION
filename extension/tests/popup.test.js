const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Lead Scraper Pro - Extension Loading', () => {
  test('extension should load and popup should open', async ({ page, context }) => {
    // Note: Loading extensions in Playwright requires specific launch options 
    // usually handled in playwright.config.js
    
    await page.goto('chrome-extension://<EXT_ID>/popup.html');
    await expect(page.locator('h1')).toContainText('Lead Scraper');
    await expect(page.locator('#startBtn')).toBeVisible();
  });

  test('country dropdown should populate', async ({ page }) => {
    await page.goto('chrome-extension://<EXT_ID>/popup.html');
    const options = await page.locator('#countrySelect option').count();
    expect(options).toBeGreaterThan(1);
  });
});
