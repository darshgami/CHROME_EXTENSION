/**
 * Lead Scraper Pro - Excel Exporter
 * Generates formatted spreadsheet sheets using SheetJS (XLSX).
 */

export const excelExport = {
    /**
     * Download leads array as an Excel file.
     * @param {Object[]} leads 
     * @param {string} filename 
     */
    export(leads, filename = 'leads_export.xlsx') {
        const globalXlsx = window.XLSX;
        
        if (!globalXlsx) {
            console.error('SheetJS (XLSX) library not loaded. Falling back to CSV export.');
            return false;
        }

        const worksheetData = leads.map((lead, index) => ({
            "Sr. No": index + 1,
            "Company Name": lead.name,
            "Phone": lead.phone,
            "Email": lead.email,
            "Website": lead.website,
            "Address": lead.address,
            "City": lead.city,
            "Postal Code": lead.postalCode,
            "Matched Keyword": lead.matchedKeyword || 'N/A',
            "Relevance Score": `${lead.relevanceScore || 0}%`,
            "Confidence": lead.confidenceRating || 'Low',
            "Scraped At": lead.timestamp
        }));

        const worksheet = globalXlsx.utils.json_to_sheet(worksheetData);
        const workbook = globalXlsx.utils.book_new();
        globalXlsx.utils.book_append_sheet(workbook, worksheet, "Leads");

        // Style the headers (if styling extensions are available in SheetJS build)
        const range = globalXlsx.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = globalXlsx.utils.encode_col(C) + "1";
            if (!worksheet[address]) continue;
            worksheet[address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "6366F1" } } // Brand indigo color
            };
        }

        const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
        globalXlsx.writeFile(workbook, finalFilename);
        return true;
    }
};
