function seedProfileIcons() {
    db.get("SELECT count(*) as count FROM profile_icons", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log("Seeding profile icons into database...");
            const fs = require('fs');
            const path = require('path');

            // Look for icons in frontend/public/profile-icons relative to backend
            // Dev: ../frontend/public/profile-icons
            // Prod: process.resourcesPath/app/frontend/build/profile-icons (Typical electron)

            let iconsDir = path.join(__dirname, '..', 'frontend', 'public', 'profile-icons');

            // Adjust for production build structure if needed
            if (!fs.existsSync(iconsDir)) {
                // Try alternate path for packaged app
                iconsDir = path.join(process.resourcesPath, 'app', 'build', 'profile-icons');
            }

            if (fs.existsSync(iconsDir)) {
                const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.png'));
                const insert = db.prepare("INSERT INTO profile_icons (name, data) VALUES (?, ?)");

                let count = 0;
                files.forEach(file => {
                    try {
                        const filePath = path.join(iconsDir, file);
                        const data = fs.readFileSync(filePath);
                        const base64 = `data:image/png;base64,${data.toString('base64')}`;
                        insert.run(file, base64);
                        count++;
                    } catch (e) {
                        console.error(`Failed to seed icon ${file}:`, e);
                    }
                });

                insert.finalize();
                console.log(`Seeded ${count} profile icons.`);
            } else {
                console.warn("Profile icons directory not found for seeding:", iconsDir);
            }
        }
    });
}
