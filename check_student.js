const db = require('./backend/db');

const regNo = '172CS23021';

console.log(`Checking for student: ${regNo}`);

db.get('SELECT * FROM students WHERE register_number = ?', [regNo], (err, row) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("Student Found:", row);
    }
});
