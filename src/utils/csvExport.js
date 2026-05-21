/**
 * Lead Scraper Pro - CSV Exporter
 * Generates and downloads standard CSV sheets.
 */

import { dedupe } from './dedupe.js';

export const csvExport = {
    /**
     * Download leads array as a CSV file.
     * @param {Object[]} leads 
     * @param {string} filename 
     */
    // export(leads, filename, options)
    // options: { skipDedupe: boolean }
    export(leads, filename = 'leads_export.csv', options = {}) {
        const { skipDedupe = false } = options;

        let toExport = leads || [];
        if (!skipDedupe) {
            try {
                toExport = dedupe.filterDuplicates(toExport);
            } catch (e) {
                // If dedupe fails for any reason, fall back to original list
                console.error('Dedupe failed during CSV export:', e);
                toExport = leads || [];
            }
        }
        const headers = [
            "Company Name", 
            "Phone", 
            "Email", 
            "Website", 
            "Address", 
            "City", 
            "Postal Code", 
            "Matched Keyword",
            "Relevance Score", 
            "Confidence Rating", 
            "Scraped At"
        ];

        const rows = toExport.map(lead => [
            lead.name || '',
            lead.phone || '',
            lead.email || '',
            lead.website || '',
            lead.address || '',
            lead.city || '',
            lead.postalCode || '',
            lead.matchedKeyword || '',
            lead.relevanceScore || 0,
            lead.confidenceRating || 'Low',
            lead.timestamp || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => {
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(','))
        ].join('\n');

        // Add Unicode BOM for proper Excel compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
};
