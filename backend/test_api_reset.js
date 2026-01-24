const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const SYSTEM_EMAIL = 'system@library.com';
const SYSTEM_PASS = 'password123';
const TARGET_ID = 'SYSTEM'; // Try to reset system's own password as a test, or a dummy ID

async function runTest() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: SYSTEM_EMAIL,
            password: SYSTEM_PASS
        });
        const token = loginRes.data.token;
        console.log("Login Successful. Token received.");

        // 2. Reset Password
        console.log(`Attempting reset for ID: ${TARGET_ID}`);
        try {
            const resetRes = await axios.post(`${BASE_URL}/staff/${TARGET_ID}/reset-password`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("Reset Response:", resetRes.status, resetRes.data);
        } catch (err) {
            if (err.response) {
                console.error("Reset Failed with Status:", err.response.status);
                console.error("Data:", err.response.data);
            } else {
                console.error("Network/Other Error:", err.message);
            }
        }

    } catch (err) {
        console.error("Setup Failed:", err.message);
        if (err.response) console.error("Login Data:", err.response.data);
    }
}

runTest();
