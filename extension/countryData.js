/**
 * Lead Scraper Pro - Global Country Data
 * Includes postal code formats, states/provinces, and validation rules.
 */

export const COUNTRY_DATA = {
    "IN": {
        name: "India",
        phoneCode: "+91",
        phoneRegex: /^(\+91[-.\s]?)?[6-9]\d{9}$/,
        postalRegex: /^[0-9]{6}$/,
        postalFormat: "XXXXXX",
        subdivisions: [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
            "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
            "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
            "Uttarakhand", "West Bengal", "Andaman & Nicobar Islands", "Chandigarh", 
            "Dadra & Nagar Haveli", "Daman & Diu", "Lakshadweep", "Delhi", "Puducherry"
        ],
        currency: "INR",
        currencySymbol: "₹"
    },
    "US": {
        name: "United States",
        phoneCode: "+1",
        phoneRegex: /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
        postalRegex: /^[0-9]{5}(-[0-9]{4})?$/,
        postalFormat: "XXXXX or XXXXX-XXXX",
        subdivisions: [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
            "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
            "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
            "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
            "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
            "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
            "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
            "Wisconsin", "Wyoming", "DC"
        ],
        currency: "USD",
        currencySymbol: "$"
    },
    "GB": {
        name: "United Kingdom",
        phoneCode: "+44",
        phoneRegex: /^(\+44[-.\s]?)?(\(0\))?[0-9]{10,11}$/,
        postalRegex: /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i,
        postalFormat: "SW1A 1AA",
        subdivisions: ["England", "Scotland", "Wales", "Northern Ireland"],
        currency: "GBP",
        currencySymbol: "£"
    },
    "CA": {
        name: "Canada",
        phoneCode: "+1",
        phoneRegex: /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
        postalRegex: /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/i,
        postalFormat: "A1A 1A1",
        subdivisions: [
            "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", 
            "Nova Scotia", "New Brunswick", "Prince Edward Island", "Newfoundland & Labrador", 
            "Yukon", "Northwest Territories", "Nunavut"
        ],
        currency: "CAD",
        currencySymbol: "$"
    },
    "DE": {
        name: "Germany",
        phoneCode: "+49",
        phoneRegex: /^(\+49[-.\s]?)?(\(0\))?[0-9]{3,5}[-.\s]?[0-9]{4,9}$/,
        postalRegex: /^[0-9]{5}$/,
        postalFormat: "XXXXX",
        subdivisions: [
            "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", 
            "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", 
            "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
        ],
        currency: "EUR",
        currencySymbol: "€"
    }
};

export const getCountryByCode = (code) => COUNTRY_DATA[code.toUpperCase()];

export const getAllCountries = () => Object.entries(COUNTRY_DATA).map(([code, data]) => ({
    code,
    name: data.name
}));
