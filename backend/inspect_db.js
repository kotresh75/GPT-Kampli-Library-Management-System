const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Adjusted path since we are running from backend/
const dbPath = path.resolve(__dirname, '../DB/lms.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("--- Inspecting Departments ---");
db.all("SELECT id, name, code FROM departments", [], (err, depts) => {
    if (err) console.error(err);
    else console.table(depts);

    console.log("\n--- Inspecting Books (First 5) ---");
    db.all("SELECT isbn, title, dept_id, category FROM books LIMIT 5", [], (err, books) => {
        if (err) console.error(err);
        else console.table(books);

        // Check for specific mismatch matches
        if (books.length > 0 && depts.length > 0) {
            const sample = books[0];
            console.log("\n--- Checking Link for First Book ---");
            console.log(`Book Dept ID: '${sample.dept_id}'`);

            const match = depts.find(d => d.id === sample.dept_id);
            console.log("Match found in Departments?", match ? "YES" : "NO");
            if (match) console.log("Matched Dept:", match);
            else {
                // Check if it matches by name (category)
                const nameMatch = depts.find(d => d.name === sample.category);
                console.log(`Book Category: '${sample.category}'`);
                console.log("Match found by Name?", nameMatch ? "YES" : "NO");
            }
        }
    });
});
