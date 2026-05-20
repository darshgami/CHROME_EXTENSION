/**
 * Lead Scraper Pro - Debug and Status Logger
 * Tracks execution details and transmits them to the active UI.
 */

export const debugLogger = {
    logs: [],
    maxLogs: 200,

    /**
     * Write a log entry.
     * @param {string} message 
     * @param {'info'|'success'|'warning'|'error'} level 
     */
    log(message, level = 'info') {
        const entry = {
            id: Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            timestamp: new Date().toISOString(),
            timeLabel: new Date().toLocaleTimeString(),
            message,
            level
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        console.log(`[LSP-${level.toUpperCase()}] ${message}`);

        // Broadcast to popup if extension environment allows
        try {
            chrome.runtime.sendMessage({
                type: 'LOG_MESSAGE',
                payload: entry
            }).catch(() => {
                // Ignore errors from receiver not active (e.g. popup closed)
            });
        } catch (e) {
            // Ignore context errors
        }

        return entry;
    },

    getLogs() {
        return this.logs;
    },

    clearLogs() {
        this.logs = [];
        try {
            chrome.runtime.sendMessage({ type: 'CLEAR_LOGS' }).catch(() => {});
        } catch (e) {}
    }
};
