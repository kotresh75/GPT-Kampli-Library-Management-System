const getISTDate = () => {
    const now = new Date();
    // To get a Date object that prints IST time when toISOString() is called,
    // we must shift the underlying UTC timestamp by +5 hours 30 minutes.
    // Note: This creates a "fake" UTC date that looks like IST.
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
};

const getISTISOString = () => {
    // Returns YYYY-MM-DDTHH:mm:ss.sss with NO 'Z' at the end, implies Local/IST
    // Or we can return YYYY-MM-DDTHH:mm:ss.sss+05:30
    // SQLite doesn't natively parse timezone offsets well in standard functions, 
    // it prefers 'YYYY-MM-DD HH:MM:SS'. 

    const date = getISTDate();
    return date.toISOString().replace('Z', '+05:30');
};

const getSQLiteISTTimestamp = () => {
    // Returns 'YYYY-MM-DD HH:MM:SS' in IST
    const date = getISTDate();
    const iso = date.toISOString(); // 2023-10-27T10:30:00.000Z (where time is actually IST value)
    return iso.replace('T', ' ').substring(0, 19);
};

module.exports = {
    getISTDate,
    getISTISOString,
    getSQLiteISTTimestamp
};
