/**
 * Enforces strict DD/MM/YYYY format for dates in the application.
 * @param {string|Date} date - The date to format
 * @param {boolean} includeTime - Whether to include time (HH:MM)
 * @returns {string} - Formatted date string or '-' if invalid
 */
export const formatDate = (date, includeTime = false) => {
    if (!date) return '-';

    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();

        let dateStr = `${day}/${month}/${year}`;

        if (includeTime) {
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            dateStr += ` ${hours}:${minutes}`;
        }

        return dateStr;
    } catch (e) {
        return '-';
    }
};

/**
 * Returns current date in YYYY-MM-DD format for HTML input[type="date"]
 * @returns {string}
 */
export const getTodayForInput = () => {
    return new Date().toISOString().split('T')[0];
};
