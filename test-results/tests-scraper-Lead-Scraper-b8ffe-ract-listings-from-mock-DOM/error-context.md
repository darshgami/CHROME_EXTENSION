# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\scraper.spec.js >> Lead Scraper Pro Heuristics & Extraction Tests >> should load the extension and detect/extract listings from mock DOM
- Location: tests\scraper.spec.js:30:5

# Error details

```
Error: page.evaluate: Error: Scraper modules not found on window context. Injection might have failed.
    at eval (eval at evaluate (:302:30), <anonymous>:8:15)
    at UtilityScript.evaluate (<anonymous>:304:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```