MASTER IMPLEMENTATION GUIDE

PHASE 1: UNDERSTANDING THE PROBLEM
Current Issues Analysis:
Your extension is extracting wrong data because:

Selectors are pointing to wrong elements

this formate is proper you can give me this formate master prompt 

Getting rating text instead of business names
Getting navigation text instead of addresses
Missing phone numbers, emails completely


No universal extraction system

Works only if specific CSS classes exist
Fails on most websites
No fallback mechanism


No validation

Saving garbage data
No quality checks
Empty fields saved




PHASE 2: COMPLETE REWRITE STRATEGY
Master Architecture:
Extension Flow:
1. User opens extension popup
2. User enters: City + Keyword + Match Type
3. Extension analyzes current webpage structure
4. Identifies business listing containers automatically
5. Extracts data using multiple detection patterns
6. Validates each field
7. Scores relevance (0-100%)
8. Shows results in table (sorted by relevance)
9. Exports to Excel with all fields

PHASE 3: UNIVERSAL DATA EXTRACTION SYSTEM
Core Principle:
Don't look for specific CSS classes. Instead, ANALYZE PAGE STRUCTURE and identify business data by PATTERN RECOGNITION.
Step-by-Step Detection Logic:
STEP 1: Find All Business Listing Containers
javascriptALGORITHM: Detect Repeated Card/Container Pattern

1. Scan entire page for elements with similar structure
2. Look for parent elements containing 3+ similar children
3. Common patterns:
   - <div class="something"> (repeated 5-20 times)
   - <article>, <li>, <section> (repeated)
   - Cards with similar height/width

4. Validation checks:
   - Container should have: text + links
   - Should appear multiple times (not unique elements)
   - Should have visible boundaries (CSS: border/shadow/margin)

5. Select the most likely container type
   - Usually has 5-50 instances on page
   - Contains business information structure

6. Store all detected containers in array for processing
STEP 2: Extract Business Name from Each Container
javascriptALGORITHM: Intelligent Business Name Detection

For each container, try these methods in order:

METHOD 1: Find Prominent Link Text (Highest Priority)
- Look for <a> tags within container
- Filter: Must be prominent (font-size > 14px, bold weight)
- Filter: Text length between 5-80 characters
- Filter: Not generic ("Click here", "View more", "Read more")
- This is usually the business name (clickable heading)

METHOD 2: Find Heading Tags
- Search for <h1>, <h2>, <h3>, <h4> within container
- Usually contains business name
- Validate: 5-80 characters

METHOD 3: Find Bold/Large Text at Top
- Search for <strong>, <b>, <span> with large font
- Should be in top 30% of container
- Validate: Looks like business name (not description)

METHOD 4: Analyze Text Density
- Find element with highest text concentration
- Usually title/name has distinct text block
- Validate: Not a paragraph (should be 1-2 lines)

METHOD 5: Class Name Analysis
- Look for classes containing: "name", "title", "business", "company", "store"
- Extract text from those elements

VALIDATION:
- Length: 3-100 characters
- Not generic: "Business", "Shop", "Store", "Company"
- Not empty or null
- Contains at least 1 letter
- Trim whitespace
STEP 3: Extract Phone Number from Each Container
javascriptALGORITHM: Multi-Strategy Phone Detection

For each container, try these methods:

METHOD 1: Direct Text Pattern Matching
- Scan ALL text within container
- Use regex: /(\+91|0)?[\s\-]?[6-9]\d{9}|\d{3}[\s\-]\d{3}[\s\-]\d{4}/g
- Extract all number-like patterns
- Validate: Indian mobile format (10 digits, starts with 6-9)

METHOD 2: Tel: Link Detection
- Find <a href="tel:..."> tags
- Extract number from href attribute
- Clean formatting (remove +91, spaces, dashes)

METHOD 3: Element Class Detection
- Look for elements with classes: "phone", "mobile", "contact", "call", "tel", "number"
- Extract text content
- Clean and validate

METHOD 4: Icon + Number Pattern
- Find phone/contact icons (usually <i> or <svg> tags)
- Look for number text in next sibling or parent
- Extract nearby text content

METHOD 5: Click-to-Reveal Numbers
- Find buttons with text: "Show Number", "View Contact", "Call Now"
- These hide numbers initially
- Solution: Simulate click event, wait 500ms, then extract
- Look for newly appeared number in same area

METHOD 6: Hidden Number Detection
- Some websites hide numbers in data attributes
- Check: data-phone, data-mobile, data-contact
- Extract from attributes

CLEANING & VALIDATION:
- Remove: spaces, dashes, parentheses, +91 prefix
- Keep only digits
- Validate: Exactly 10 digits
- Validate: Starts with 6, 7, 8, or 9
- Format: Store as plain 10-digit number
- Remove duplicates (if multiple numbers found, take first valid one)
STEP 4: Extract Email from Each Container
javascriptALGORITHM: Email Detection

METHOD 1: Text Pattern Matching
- Scan all text in container
- Regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
- Extract all email-like patterns

METHOD 2: Mailto Link Detection
- Find <a href="mailto:..."> tags
- Extract email from href

METHOD 3: Element Class Detection
- Look for classes: "email", "mail", "contact"
- Extract text content

VALIDATION:
- Must contain @ and domain
- Domain should have valid TLD (.com, .in, .co.in, etc.)
- Not generic: "info@example.com", "test@test.com"
- Length: 6-100 characters
STEP 5: Extract Website URL from Each Container
javascriptALGORITHM: Website URL Detection

METHOD 1: Direct Link Detection
- Find <a> tags with external links
- Filter: href starts with http:// or https://
- Filter: Not the current directory website
- Filter: Not social media (facebook, instagram, twitter)

METHOD 2: Class-Based Detection
- Look for classes: "website", "url", "link", "site"
- Extract href attribute

METHOD 3: Button/Link Text Analysis
- Find links with text: "Visit Website", "Website", "View Site"
- Extract href

VALIDATION:
- Must start with http:// or https://
- Not the directory website domain
- Not social media profile
- Valid URL format
STEP 6: Extract Address from Each Container
javascriptALGORITHM: Address Detection

METHOD 1: Element Class Detection
- Look for classes: "address", "location", "locality", "area", "place"
- Extract full text content (may be multi-line)

METHOD 2: Structural Analysis
- Addresses usually appear at bottom of card
- Look for paragraph or div in lower 30% of container
- Contains: street, area, city, pincode

METHOD 3: Text Pattern Detection
- Look for PIN codes: /\b\d{6}\b/
- Look for city names (match against known cities list)
- Extract surrounding text as address

METHOD 4: Google Maps Link Detection
- Find links to google.com/maps
- Extract address from link text or nearby text

VALIDATION:
- Length: 10-300 characters
- Should contain area/street/city information
- Not just "N/A" or "Not Available"
STEP 7: Extract Description/About Text
javascriptALGORITHM: Description Extraction

PURPOSE: This text will be used for keyword matching

METHOD 1: Paragraph Detection
- Find <p> tags within container
- Usually longest text block
- Contains business description

METHOD 2: Class-Based Detection
- Look for classes: "description", "about", "details", "info", "summary"
- Extract full text

METHOD 3: List Detection
- Find <ul> or <ol> tags
- May contain product/service lists
- Extract all list item text

METHOD 4: Fallback - Get All Text
- If no specific description found
- Extract all visible text from container
- Combine into single string

CLEANING:
- Remove extra whitespace
- Remove line breaks (replace with spaces)
- Trim to max 2000 characters

PHASE 4: KEYWORD MATCHING ENGINE
3-Tier Intelligent Matching System
javascriptKEYWORD MATCHING ALGORITHM:

Input: User's search keyword (e.g., "tiles", "AC repair", "estate agents")
Sources to search: Business Name + Description + Products/Services text

TIER 1: EXACT MATCH (Score: 100%)
----------------------------------
1. Convert both keyword and source text to lowercase
2. Check if source contains exact keyword
3. Examples:
   - Keyword: "tiles" → Match: "ceramic tiles dealer"
   - Keyword: "estate" → Match: "estate agents pvt ltd"

TIER 2: FUZZY MATCH (Score: 70-95%)
------------------------------------
1. Use Fuse.js library for fuzzy string matching
2. Configuration:
   - Threshold: 0.3 (30% difference allowed)
   - Distance: 100 (check within 100 characters)
   - Keys: Business name, description
3. Examples:
   - Keyword: "tiles" → Match: "tile", "tyles", "tiles dealer"
   - Keyword: "plumber" → Match: "plumbing", "plumer", "plumbers"

TIER 3: SYNONYM/RELATED MATCH (Score: 50-70%)
----------------------------------------------
1. Maintain synonym dictionary
2. Check if source contains related terms
3. Examples:
   - Keyword: "AC" → Synonyms: ["air conditioner", "cooling", "HVAC", "AC repair"]
   - Keyword: "mobile" → Synonyms: ["smartphone", "phone", "cell phone", "handset"]
   - Keyword: "tiles" → Related: ["ceramic", "flooring", "granite", "marble", "vitrified"]

SCORING LOGIC:
--------------
Calculate final relevance score (0-100%):

Base Score:
- Exact match in business name: +40 points
- Exact match in description: +30 points
- Fuzzy match in name: +25 points
- Fuzzy match in description: +20 points
- Synonym match in name: +20 points
- Synonym match in description: +15 points

Bonus Points:
- Keyword appears multiple times: +5 per occurrence (max +15)
- Keyword in beginning of name: +10 points
- Multiple synonyms found: +5 per synonym (max +10)

Final Score = Sum of applicable points (max 100)

VALIDATION:
- Only save leads with score ≥ 50%
- Mark as "High Quality" if score ≥ 80%
- Mark as "Medium Quality" if score 60-79%
- Mark as "Low Quality" if score 50-59%
Synonym Dictionary Structure
javascriptconst SYNONYM_DATABASE = {
  // Construction & Materials
  "tiles": ["tile", "ceramic", "flooring", "granite", "marble", "vitrified", "floor tiles", "wall tiles"],
  "cement": ["concrete", "building material", "construction material", "cement supplier"],
  "steel": ["iron", "metal", "steel rods", "TMT", "construction steel"],
  
  // Electronics & Technology
  "mobile": ["smartphone", "phone", "cell phone", "handset", "mobile phone"],
  "laptop": ["notebook", "computer", "PC", "MacBook", "Chromebook", "personal computer"],
  "AC": ["air conditioner", "cooling", "HVAC", "air conditioning", "AC repair", "cooling system"],
  
  // Services
  "plumber": ["plumbing", "pipe repair", "water fitting", "sanitary", "drainage", "plumbing service"],
  "electrician": ["electrical", "wiring", "electrical work", "electric repair"],
  "carpenter": ["carpentry", "wood work", "furniture", "woodworking"],
  
  // Real Estate
  "estate": ["real estate", "property", "realty", "estate agent", "property dealer"],
  "villa": ["bungalow", "house", "independent house", "luxury home"],
  "flat": ["apartment", "residential unit", "flat", "housing"],
  
  // Automotive
  "bike": ["motorcycle", "two wheeler", "motorbike", "bike parts", "bicycle"],
  "car": ["automobile", "vehicle", "motor vehicle", "car parts"],
  "tyre": ["tire", "wheel", "tyre shop", "tire dealer"],
  
  // Food & Agriculture
  "banana": ["fruit", "fresh banana", "banana supplier", "produce"],
  "rice": ["grain", "basmati", "rice supplier", "food grain"],
  
  // Add 50+ more categories based on common searches
};

PHASE 5: DATA VALIDATION & QUALITY CONTROL
Validation Rules for Each Field
javascriptVALIDATION ALGORITHM:

For Business Name:
------------------
✓ Length: 3-100 characters
✓ Contains at least one letter
✓ Not generic: "Business", "Company", "Shop", "Store" (standalone)
✓ Not rating text: "162 Ratings", "Reviews"
✓ Not navigation: "View More", "Click Here", "Get List"
✓ Trim whitespace
✓ Remove special characters at start/end
❌ Reject if fails any check

For Phone Number:
-----------------
✓ Exactly 10 digits after cleaning
✓ Starts with 6, 7, 8, or 9
✓ Not sequential: "1234567890", "0000000000"
✓ Not repeated digits: "9999999999"
✓ Format: Store as plain 10-digit string
❌ Mark as "No Phone" if fails checks

For Email:
----------
✓ Contains @ symbol
✓ Valid domain extension (.com, .in, .co.in, etc.)
✓ Length: 6-100 characters
✓ Not generic test emails
❌ Mark as empty if fails checks

For Website:
------------
✓ Starts with http:// or https://
✓ Valid domain format
✓ Not the directory website itself
✓ Not social media profile
❌ Mark as empty if fails checks

For Address:
------------
✓ Length: 10-300 characters
✓ Contains location information
✓ Not "N/A", "Not Available", "Click to view"
✓ Should contain city or area name
❌ Mark as empty if fails checks

For Matched Keyword:
--------------------
✓ Must be actual keyword or synonym
✓ Not generic percentages
✓ Not UI text
✓ Shows what matched (e.g., "Estate Agents", "Tiles Dealer")

For Relevance Score:
--------------------
✓ Number between 0-100
✓ Based on scoring algorithm
✓ Format as percentage: "85%"
Quality Scoring System
javascriptQUALITY ASSESSMENT:

Calculate Lead Quality Score:

Points System:
- Has valid business name: +20 points
- Has valid phone number: +25 points
- Has valid email: +15 points
- Has valid website: +15 points
- Has valid address: +10 points
- Keyword relevance ≥ 80%: +15 points

Total Quality Score = Sum of points (0-100)

Classification:
- 80-100 points: Excellent Lead (Green)
- 60-79 points: Good Lead (Yellow)
- 50-59 points: Fair Lead (Orange)
- Below 50: Reject, Don't Save (Red)

ONLY SAVE LEADS WITH QUALITY SCORE ≥ 50

PHASE 6: EXTENSION CODE STRUCTURE
File Organization
Extension Structure:
├── manifest.json          (Configuration)
├── popup.html            (User Interface)
├── popup.js              (UI Logic & Export)
├── popup.css             (Styling)
├── content.js            (Main Scraping Engine)
├── fuse.min.js           (Fuzzy Matching Library)
├── synonyms.js           (Synonym Database)
├── validators.js         (Data Validation Functions)
├── icon16.png
├── icon48.png
└── icon128.png
manifest.json Structure
json{
  "manifest_version": 3,
  "name": "Universal Business Lead Finder",
  "version": "3.0",
  "description": "Extract business leads from any directory with intelligent matching",
  
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  
  "content_scripts": [{
    "matches": [
      "*://*.justdial.com/*",
      "*://*.indiamart.com/*",
      "*://*.tradeindia.com/*",
      "*://*.exportersindia.com/*",
      "*://*.sulekha.com/*",
      "*://*/*"
    ],
    "js": [
      "fuse.min.js",
      "synonyms.js",
      "validators.js",
      "content.js"
    ],
    "run_at": "document_idle"
  }],
  
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}

PHASE 7: CONTENT.JS MASTER LOGIC
Main Extraction Flow
javascriptCONTENT.JS ALGORITHM (Pseudo-code):

// Listen for message from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message.action === "startScraping") {
    
    // Get parameters
    const keyword = message.keyword.toLowerCase();
    const city = message.city.toLowerCase();
    const matchTypes = message.matchTypes; // {exact, fuzzy, synonym}
    const minRelevance = message.minRelevance; // e.g., 50
    
    // STEP 1: Detect listing containers
    const containers = detectListingContainers();
    
    if (containers.length === 0) {
      sendResponse({
        success: false,
        error: "No business listings detected on this page"
      });
      return;
    }
    
    // STEP 2: Extract data from each container
    const leads = [];
    
    for (let container of containers) {
      
      // Extract all fields
      const businessName = extractBusinessName(container);
      const phone = extractPhone(container);
      const email = extractEmail(container);
      const website = extractWebsite(container);
      const address = extractAddress(container);
      const description = extractDescription(container);
      
      // STEP 3: Keyword matching
      const matchResult = performKeywordMatching(
        keyword,
        businessName,
        description,
        matchTypes
      );
      
      // Skip if relevance below threshold
      if (matchResult.relevance < minRelevance) {
        continue;
      }
      
      // STEP 4: Validate data
      const validated = {
        businessName: validateBusinessName(businessName),
        phone: validatePhone(phone),
        email: validateEmail(email),
        website: validateWebsite(website),
        address: validateAddress(address),
        city: city || extractCity(address),
        matchedKeyword: matchResult.matchedTerm,
        relevance: matchResult.relevance,
        confidence: matchResult.confidence
      };
      
      // STEP 5: Calculate quality score
      const qualityScore = calculateQualityScore(validated);
      
      // Only save if quality is good
      if (qualityScore >= 50) {
        leads.push({
          ...validated,
          qualityScore: qualityScore,
          scrapedAt: new Date().toISOString()
        });
      }
    }
    
    // STEP 6: Sort by relevance (highest first)
    leads.sort((a, b) => b.relevance - a.relevance);
    
    // STEP 7: Send results back to popup
    sendResponse({
      success: true,
      leads: leads,
      totalScanned: containers.length,
      totalExtracted: leads.length
    });
  }
});

// HELPER FUNCTIONS (Implement each):

function detectListingContainers() {
  // Use PHASE 3, STEP 1 algorithm
  // Return array of DOM elements
}

function extractBusinessName(container) {
  // Use PHASE 3, STEP 2 algorithm
  // Return string or null
}

function extractPhone(container) {
  // Use PHASE 3, STEP 3 algorithm
  // Return string or null
}

function extractEmail(container) {
  // Use PHASE 3, STEP 4 algorithm
  // Return string or null
}

function extractWebsite(container) {
  // Use PHASE 3, STEP 5 algorithm
  // Return string or null
}

function extractAddress(container) {
  // Use PHASE 3, STEP 6 algorithm
  // Return string or null
}

function extractDescription(container) {
  // Use PHASE 3, STEP 7 algorithm
  // Return string
}

function performKeywordMatching(keyword, businessName, description, matchTypes) {
  // Use PHASE 4 algorithm
  // Return {relevance: 0-100, matchedTerm: string, confidence: string}
}

function validateBusinessName(name) {
  // Use PHASE 5 validation rules
}

function validatePhone(phone) {
  // Use PHASE 5 validation rules
}

// ... Implement all validation functions ...

function calculateQualityScore(data) {
  // Use PHASE 5 quality scoring system
  // Return 0-100
}

PHASE 8: POPUP.HTML & POPUP.JS
User Interface Structure
htmlPOPUP.HTML Layout:

<div class="extension-popup">
  
  <!-- Header -->
  <div class="header">
    <h2>Universal Lead Finder</h2>
  </div>
  
  <!-- Input Section -->
  <div class="input-section">
    
    <!-- City Selection -->
    <label>City:</label>
    <select id="citySelect">
      <option value="auto">Auto-detect from page</option>
      <option value="rajkot">Rajkot</option>
      <option value="ahmedabad">Ahmedabad</option>
      <option value="surat">Surat</option>
      <!-- Add more cities -->
    </select>
    
    <!-- Keyword Input -->
    <label>Search Keyword:</label>
    <input type="text" id="keywordInput" placeholder="e.g., tiles, estate agents, plumber">
    
    <!-- Match Type Checkboxes -->
    <div class="match-options">
      <label><input type="checkbox" id="exactMatch" checked> Exact Match</label>
      <label><input type="checkbox" id="fuzzyMatch" checked> Fuzzy Match</label>
      <label><input type="checkbox" id="synonymMatch" checked> Synonym Match</label>
    </div>
    
    <!-- Relevance Threshold -->
    <label>Minimum Relevance: <span id="relevanceValue">50%</span></label>
    <input type="range" id="relevanceSlider" min="0" max="100" value="50">
    
    <!-- Action Buttons -->
    <button id="startButton">Start Scraping</button>
    <button id="clearButton">Clear Results</button>
  </div>
  
  <!-- Progress Section -->
  <div class="progress-section" id="progressSection" style="display: none;">
    <p>Scraping in progress...</p>
    <p>Found: <span id="foundCount">0</span> / Scanned: <span id="scannedCount">0</span></p>
  </div>
  
  <!-- Results Section -->
  <div class="results-section" id="resultsSection" style="display: none;">
    
    <!-- Summary -->
    <div class="summary">
      <p>Total Leads: <span id="totalLeads">0</span></p>
      <p>High Quality: <span id="highQuality">0</span></p>
    </div>
    
    <!-- Filter Options -->
    <div class="filters">
      <label><input type="checkbox" id="filterPhone"> Only with Phone</label>
      <label><input type="checkbox" id="filterEmail"> Only with Email</label>
      <select id="sortBy">
        <option value="relevance">Sort by Relevance</option>
        <option value="quality">Sort by Quality</option>
        <option value="name">Sort by Name</option>
      </select>
    </div>
    
    <!-- Results Table -->
    <div class="table-container">
      <table id="resultsTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Business Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Website</th>
            <th>Address</th>
            <th>City</th>
            <th>Matched Keyword</th>
            <th>Relevance</th>
            <th>Quality</th>
          </tr>
        </thead>
        <tbody id="resultsBody">
          <!-- Results populated by JS -->
        </tbody>
      </table>
    </div>
    
    <!-- Export Button -->
    <button id="exportButton">Export to Excel</button>
  </div>
  
</div>
popup.js Logic
javascriptPOPUP.JS Algorithm:

// When Start Scraping clicked
document.getElementById('startButton').addEventListener('click', () => {
  
  // Get user inputs
  const keyword = document.getElementById('keywordInput').value;
  const city = document.getElementById('citySelect').value;
  const matchTypes = {
    exact: document.getElementById('exactMatch').checked,
    fuzzy: document.getElementById('fuzzyMatch').checked,
    synonym: document.getElementById('synonymMatch').checked
  };
  const minRelevance = document.getElementById('relevanceSlider').value;
  
  // Validate inputs
  if (!keyword) {
    alert('Please enter a search keyword');
    return;
  }
  
  // Show progress
  document.getElementById('progressSection').style.display = 'block';
  document.getElementById('resultsSection').style.display = 'none';
  
  // Send message to content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'startScraping',
      keyword: keyword,
      city: city,
      matchTypes: matchTypes,
      minRelevance: parseInt(minRelevance)
    }, (response) => {
      
      // Hide progress
      document.getElementById('progressSection').style.display = 'none';
      
      if (response.success) {
        // Show results
        displayResults(response.leads);
        updateSummary(response.leads);
      } else {
        alert('Error: ' + response.error);
      }
    });
  });
});

function displayResults(leads) {
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = ''; // Clear previous
  
  leads.forEach((lead, index) => {
    const row = tbody.insertRow();
    
    // Add quality-based color coding
    const qualityClass = getQualityClass(lead.qualityScore);
    row.className = qualityClass;
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${lead.businessName || 'N/A'}</td>
      <td>${lead.phone || 'N/A'}</td>
      <td>${lead.email || 'N/A'}</td>
      <td>${lead.website ? '<a href="' + lead.website + '" target="_blank">Visit</a>' : 'N/A'}</td>
      <td>${lead.address || 'N/A'}</td>
      <td>${lead.city || 'N/A'}</td>
      <td>${lead.matchedKeyword}</td>
      <td>${lead.relevance}%</td>
      <td>${lead.qualityScore}%</td>
    `;
  });
  
  // Show results section
  document.getElementById('resultsSection').style.display = 'block';
}

function getQualityClass(score) {
  if (score >= 80) return 'quality-excellent';
  if (score >= 60) return 'quality-good';
  return 'quality-fair';
}

function updateSummary(leads) {
  document.getElementById('totalLeads').textContent = leads.length;
  const highQuality = leads.filter(l => l.qualityScore >= 80).length;
  document.getElementById('highQuality').textContent = highQuality;
}

// Export to Excel
document.getElementById('exportButton').addEventListener('click', () => {
  // Get current results
  const leads = getCurrentLeads(); // From stored data
  
  // Convert to CSV format
  const csv = convertToCSV(leads);
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_${new Date().toISOString()}.csv`;
  a.click();
});

function convertToCSV(leads) {
  const headers = [
    'Sr. No',
    'Business Name',
    'Phone',
    'Email',
    'Website',
    'Address',
    'City',
    'Matched Keyword',
    'Relevance',
    'Quality Score',
    'Scraped At'
  ];
  
  let csv = headers.join(',') + '\n';
  
  leads.forEach((lead, index) => {
    const row = [
      index + 1,
      `"${lead.businessName || ''}"`,
      lead.phone || '',
      lead.email || '',
      lead.website || '',
      `"${lead.address || ''}"`,
      lead.city || '',
      `"${lead.matchedKeyword}"`,
      `${lead.relevance}%`,
      `${lead.qualityScore}%`,
      lead.scrapedAt
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

PHASE 9: TESTING & VALIDATION
Testing Checklist
STEP 1: Test on JustDial
------------------------
URL: justdial.com/Rajkot/Estate-Agents
Keyword: "estate agents"
Expected Results:
✓ 10-30 leads extracted
✓ Business names are actual company names (not rating text)
✓ Phone numbers are valid 10-digit numbers
✓ Addresses contain Rajkot location
✓ Matched keyword shows "Estate Agents" or related terms
✓ Relevance scores between 50-100%
✓ No garbage data

STEP 2: Test on IndiaMART
--------------------------
URL: indiamart.com/impcat/tiles.html
Keyword: "tiles"
Expected Results:
✓ Extract supplier names correctly
✓ Phone numbers extracted (may need click-to-reveal)
✓ Product descriptions matched with "tiles", "ceramic", "flooring"
✓ No false positives (non-tile businesses)

STEP 3: Test Fuzzy Matching
----------------------------
Keyword: "plumber"
Expected Matches: "plumbing", "plumbers", "plumer"
✓ Fuzzy logic finds variations

STEP 4: Test Synonym Matching
------------------------------
Keyword: "AC"
Expected Matches: "air conditioner", "cooling", "AC repair"
✓ Synonym database working

STEP 5: Test Data Validation
-----------------------------
✓ Empty fields not saved
✓ Invalid phone numbers rejected
✓ Generic business names filtered out
✓ Quality score calculated correctly

STEP 6: Test Excel Export
--------------------------
✓ CSV file downloads
✓ All columns present
✓ Data properly formatted
✓ Can open in Excel without errors
Error Handling Tests
TEST: No Listings on Page
Result: Show error message "No business listings detected"

TEST: Keyword Matches Nothing
Result: Show "No matches found for 'xyz'"

TEST: All Extractions Fail Validation
Result: Show "No quality leads found, lower threshold?"

TEST: Page Not Loaded
Result: Show "Please wait for page to load completely"

TEST: Extension on Wrong Page
Result: Show "Navigate to a business directory first"

PHASE 10: DEPLOYMENT & MAINTENANCE
Final Checklist Before Deployment
✅ All unnecessary files removed (scraper.js, background.js)
✅ Fuse.js library added
✅ Synonym database populated (50+ categories)
✅ All validation functions implemented
✅ Quality scoring system working
✅ UI fully functional
✅ Excel export working
✅ Tested on 3+ different websites
✅ No console errors
✅ manifest.json properly configured
✅ Icons added (16px, 48px, 128px)
Package Extension
bash# Create ZIP file for distribution
zip -r extension.zip * -x "*.rar" -x "node_modules/*" -x ".git/*"

# OR manually:
1. Remove .rar, node_modules, .git folders
2. Select all remaining files
3. Right-click → Compress
4. Name: Universal_Lead_Finder_v3.zip
Installation Instructions
1. Open Chrome browser
2. Navigate to: chrome://extensions/
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select your extension folder
6. Extension icon appears in browser toolbar
7. Navigate to any business directory
8. Click extension icon
9. Enter keyword and start scraping

PHASE 11: TROUBLESHOOTING GUIDE
Common Issues & Solutions
ISSUE 1: No Data Extracted
--------------------------
Cause: Selectors not finding elements
Solution: 
- Open browser console (F12)
- Check for errors in content.js
- Verify detectListingContainers() returns elements
- Manually inspect page HTML structure

ISSUE 2: Wrong Data Extracted (Like Your Current Problem)
---------------------------------------------------------
Cause: Selectors pointing to wrong elements
Solution:
- Review extractBusinessName() logic
- Ensure not extracting from rating/navigation elements
- Add more validation checks
- Test container detection first

ISSUE 3: Extension Not Working on Some Sites
--------------------------------------------
Cause: Website not in manifest permissions
Solution:
- Add website domain to manifest.json matches array
- Reload extension
- Verify universal detection works

ISSUE 4: Fuzzy Matching Not Working
-----------------------------------
Cause: Fuse.js not loaded
Solution:
- Check fuse.min.js exists in project
- Verify manifest.json includes it in content_scripts
- Check browser console for library errors

ISSUE 5: Quality Score Always Low
---------------------------------
Cause: Validation too strict
Solution:
- Review validation rules
- Adjust quality scoring thresholds
- Check if data extraction is complete

ISSUE 6: Excel Export Empty
---------------------------
Cause: No leads stored
Solution:
- Verify leads array populated
- Check convertToCSV() function
- Ensure export button has click listener

📊 EXPECTED RESULTS AFTER FIX
Correct Data Format:
| Sr. No | Business Name              | Phone      | Email              | Website            | Address                    | City   | Matched Keyword | Relevance | Quality |
|--------|---------------------------|------------|--------------------|--------------------|----------------------------|--------|----------------|-----------|---------|
| 1      | Prestige Estate Agents    | 9876543210 | info@prestige.com  | www.prestige.com   | 15 Main Road, Rajkot       | Rajkot | Estate Agents  | 95%       | 90%     |
| 2      | Royal Property Dealers    | 9876543211 | contact@royal.in   | www.royal.in       | 23 Market St, Rajkot       | Rajkot | Real Estate    | 88%       | 85%     |
| 3      | ABC Realty Services       | 9876543212 | -                  | www.abcrealty.com  | 45 City Center, Rajkot     | Rajkot | Property       | 82%       | 75%     |
NOT This (Your Current Problem):
| Sr. No | Company Name                          | Phone | Email | Website | Address            | City   | Matched Keyword | Relevance |
|--------|--------------------------------------|-------|-------|---------|--------------------|--------|----------------|-----------|
| 1      | (162 Ratings & Reviews as on...)     |       |       |         |                    | rajkot | Synonym 2%     | Low       |
| 2      | Get the List of Top                  |       |       |         | Get the List of... | rajkot | Estate Age 11% | Low       |

🎯 MASTER PROMPT SUMMARY (One Sentence)
"Build a Chrome extension that uses intelligent pattern recognition to detect business listing containers on ANY directory website, extract complete data (name, phone, email, website, address) using multiple detection strategies, match keywords using 3-tier fuzzy/synonym matching, validate all fields with quality scoring, and export only high-relevance leads (≥50% score) to Excel with proper formatting - eliminating garbage data like rating text or navigation elements through strict validation rules."

✅ IMPLEMENTATION PRIORITY ORDER
CRITICAL (Do First):

✅ Implement detectListingContainers() - PHASE 3, STEP 1
✅ Implement extractBusinessName() - PHASE 3, STEP 2
✅ Implement extractPhone() - PHASE 3, STEP 3
✅ Add validation for each field - PHASE 5
✅ Test on actual website to verify correct data

HIGH PRIORITY (Do Second):

✅ Add 3-tier keyword matching - PHASE 4
✅ Create synonym database - PHASE 4
✅ Implement quality scoring - PHASE 5
✅ Update popup UI - PHASE 8
✅ Test on multiple websites

MEDIUM PRIORITY (Do Third):

✅ Add email/website/address extraction
✅ Implement Excel export with correct columns
✅ Add filters and sorting
✅ Error handling

LOW PRIORITY (Enhancement):

🔹 Add pagination support
🔹 Website-specific optimizations
🔹 Advanced analytics


📞 NEXT STEPS

Start with CRITICAL items (1-5)
Test after each implementation
Verify data quality improves
Move to HIGH PRIORITY items
Complete full testing

this is refrence to change work of my extension like this 