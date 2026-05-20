/**
 * Lead Scraper Pro - Excel Exporter
 * Uses SheetJS (XLSX)
 */

export const exporter = {
    async exportToExcel(leads, filename) {
        if (typeof XLSX === 'undefined') {
            console.error('XLSX library not loaded');
            return;
        }

        const worksheetData = leads.map((lead, index) => ({
            "Sr.No": index + 1,
            "Company Name": lead.name,
            "Address": lead.address,
            "City": lead.city,
            "State": lead.state,
            "Country": lead.country,
            "Postal Code": lead.postalCode,
            "Phone": lead.phone,
            "Email": lead.email,
            "Website": lead.website,
            "Scraped At": lead.timestamp
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

        // Style the header
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!worksheet[address]) continue;
            worksheet[address].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "EFEFEF" } }
            };
        }

        XLSX.writeFile(workbook, filename || `Leads_Export_${new Date().getTime()}.xlsx`);
    }
};
