/**
 * Migration Script: Base64 Images → WebP Files
 * 
 * Converts existing base64-encoded images in the SQLite database
 * to optimized WebP files on disk:
 *   - Student photos → Uploads/students/<register_no>.webp
 *   - HOD signatures → Uploads/signatures/hod_<dept_name>.webp
 *   - Principal signature → Uploads/signatures/principal.webp
 * 
 * DB columns are updated to store relative file paths instead of raw base64.
 * Idempotent: skips records already migrated (path starts with subdir/).
 * 
 * Usage: node backend/scripts/migrateImages.js
 */

const path = require('path');
const db = require('../db');
const imageService = require('../services/imageService');

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function runExec(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

async function migrateStudentPhotos() {
    console.log('\n── Migrating Student Photos ──');
    const students = await runQuery(
        "SELECT id, register_number, profile_image FROM students WHERE profile_image IS NOT NULL AND profile_image != ''"
    );

    let migrated = 0, skipped = 0, failed = 0;

    for (const student of students) {
        // Skip if already migrated (path looks like 'students/xxx.webp')
        if (student.profile_image.startsWith('students/')) {
            skipped++;
            continue;
        }

        // Must be base64 data
        if (!student.profile_image.startsWith('data:image/')) {
            console.warn(`  [SKIP] Student ${student.register_number}: not base64 or path`);
            skipped++;
            continue;
        }

        try {
            const relativePath = await imageService.saveBase64AsWebP(
                student.profile_image, 'students', student.register_number,
                { maxWidth: 400, quality: 80 }
            );

            if (relativePath) {
                await runExec(
                    "UPDATE students SET profile_image = ? WHERE id = ?",
                    [relativePath, student.id]
                );
                migrated++;
                console.log(`  ✔ ${student.register_number} → ${relativePath}`);
            } else {
                failed++;
                console.error(`  ✖ ${student.register_number}: conversion returned null`);
            }
        } catch (err) {
            failed++;
            console.error(`  ✖ ${student.register_number}: ${err.message}`);
        }
    }

    console.log(`  Result: ${migrated} migrated, ${skipped} skipped, ${failed} failed (total: ${students.length})`);
}

async function migrateHodSignatures() {
    console.log('\n── Migrating HOD Signatures ──');
    const departments = await runQuery(
        "SELECT id, name, hod_signature FROM departments WHERE hod_signature IS NOT NULL AND hod_signature != ''"
    );

    let migrated = 0, skipped = 0, failed = 0;

    for (const dept of departments) {
        if (dept.hod_signature.startsWith('signatures/')) {
            skipped++;
            continue;
        }

        if (!dept.hod_signature.startsWith('data:image/')) {
            console.warn(`  [SKIP] Dept ${dept.name}: not base64 or path`);
            skipped++;
            continue;
        }

        try {
            const relativePath = await imageService.saveBase64AsWebP(
                dept.hod_signature, 'signatures', 'hod_' + dept.name,
                { maxWidth: 600, quality: 85 }
            );

            if (relativePath) {
                await runExec(
                    "UPDATE departments SET hod_signature = ? WHERE id = ?",
                    [relativePath, dept.id]
                );
                migrated++;
                console.log(`  ✔ ${dept.name} → ${relativePath}`);
            } else {
                failed++;
                console.error(`  ✖ ${dept.name}: conversion returned null`);
            }
        } catch (err) {
            failed++;
            console.error(`  ✖ ${dept.name}: ${err.message}`);
        }
    }

    console.log(`  Result: ${migrated} migrated, ${skipped} skipped, ${failed} failed (total: ${departments.length})`);
}

async function migratePrincipalSignature() {
    console.log('\n── Migrating Principal Signature ──');
    const rows = await runQuery(
        "SELECT key, value FROM system_settings WHERE key = 'principal_signature' AND value IS NOT NULL AND value != ''"
    );

    if (rows.length === 0) {
        console.log('  No principal signature found in settings.');
        return;
    }

    const row = rows[0];

    if (row.value.startsWith('signatures/')) {
        console.log('  Already migrated — skipping.');
        return;
    }

    if (!row.value.startsWith('data:image/')) {
        console.warn('  Value is not base64 — skipping.');
        return;
    }

    try {
        const relativePath = await imageService.saveBase64AsWebP(
            row.value, 'signatures', 'principal',
            { maxWidth: 600, quality: 85 }
        );

        if (relativePath) {
            await runExec(
                "UPDATE system_settings SET value = ? WHERE key = 'principal_signature'",
                [relativePath]
            );
            console.log(`  ✔ principal → ${relativePath}`);
        } else {
            console.error('  ✖ Conversion returned null');
        }
    } catch (err) {
        console.error(`  ✖ ${err.message}`);
    }
}

async function main() {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  Base64 → WebP Migration Script           ║');
    console.log('╚═══════════════════════════════════════════╝');

    try {
        // Wait for DB to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        await migrateStudentPhotos();
        await migrateHodSignatures();
        await migratePrincipalSignature();

        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
    }

    process.exit(0);
}

main();
