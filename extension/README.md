# Lead Scraper Pro - Universal Business Lead Scraper

A high-speed, lightweight Chrome Extension (Manifest V3) designed to extract business leads from ANY directory or listing website globally. Using advanced heuristics and structured data extraction, it adapts to any website structure without manual configuration.

## 🚀 Features

- **Universal Detection**: Auto-detects business card containers and data fields (Phone, Email, Address, Website) on any website.
- **Structured Data Support**: Extracts high-fidelity data from JSON-LD and Schema.org Microdata.
- **Global Extraction**: Robust extraction of international phone formats and addresses.
- **Intelligent Keyword Matching**: Fuzzy and partial matching to ensure lead relevance.
- **Smart Pagination**: Handles "Next" buttons, numbered pagination, and infinite scrolling automatically.
- **Excel Export**: Clean, formatted exports with deduplication and data normalization.
- **Multi-language UI**: Automatically adapts to your browser language.

## 📁 Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the `/extension` folder.

## 🛠️ Tech Stack

- **Manifest V3**: Secure and modern extension architecture.
- **Vanilla JavaScript ES6+**: High performance with zero heavy frameworks.
- **SheetJS (XLSX)**: Reliable Excel export with Unicode support.
- **Heuristic Engine**: Custom DOM analysis algorithms for universal support.

## ⚖️ Ethical Scraping

This tool is designed for ethical data collection. Users are responsible for complying with the target website's Terms of Service and local privacy laws (e.g., GDPR).

## 📄 License

MIT
