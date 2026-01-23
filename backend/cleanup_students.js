const http = require('http');

async function deleteAll() {
    console.log("Fetching all students...");

    // 1. Fetch All IDs
    const fetchReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/students?limit=10000&idsOnly=true',
        method: 'GET'
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            const ids = json.data.map(s => s.id);
            console.log(`Found ${ids.length} students. Deleting...`);

            if (ids.length === 0) return;

            // 2. Bulk Delete
            const delReq = http.request({
                hostname: 'localhost',
                port: 3001,
                path: '/api/students/bulk-delete',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, (res) => {
                let respData = '';
                res.on('data', c => respData += c);
                res.on('end', () => console.log("Delete Response:", respData));
            });

            delReq.write(JSON.stringify({ ids }));
            delReq.end();
        });
    });

    fetchReq.end();
}

deleteAll();
