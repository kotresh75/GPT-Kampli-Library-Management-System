const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/reports/circulation?period=30days',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Response Body:", JSON.stringify(json, null, 2));
        } catch (e) {
            console.log("Raw Response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
