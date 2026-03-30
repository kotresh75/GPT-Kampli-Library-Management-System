const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Compute writable path using same logic as db.js (avoids circular dependency)
const isDev = process.env.NODE_ENV !== 'production' && !process.resourcesPath?.includes('app.asar');
const userDataPath = process.env.USER_DATA_PATH || (isDev
    ? path.resolve(__dirname, '..', '..')
    : path.join(process.env.APPDATA || process.env.HOME, 'GPTK Library Manager'));
const COVERS_DIR = path.join(userDataPath, 'Uploads', 'covers');
if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
}

/**
 * Download an image from URL and convert to WebP format
 * Stores in Uploads/covers/<isbn>.webp
 * @param {string} imageUrl - External image URL
 * @param {string} isbn - Book ISBN (used as filename)
 * @returns {Promise<string|null>} - Relative path (covers/<isbn>.webp) or null on failure
 */
async function downloadAndStoreCover(imageUrl, isbn) {
    if (!imageUrl || !isbn) return null;

    // Clean ISBN for safe filename
    const safeIsbn = String(isbn).replace(/[^a-zA-Z0-9_-]/g, '_');
    const outputPath = path.join(COVERS_DIR, `${safeIsbn}.webp`);
    const relativePath = `covers/${safeIsbn}.webp`;

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
        return relativePath;
    }

    try {
        const imageBuffer = await fetchImageBuffer(imageUrl);
        if (!imageBuffer || imageBuffer.length === 0) {
            console.warn(`[CoverService] Empty response for ${isbn}`);
            return null;
        }

        // Convert to WebP with optimized settings
        await sharp(imageBuffer)
            .resize(300, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({
                quality: 75,
                effort: 4
            })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`[CoverService] Saved ${relativePath} (${(stats.size / 1024).toFixed(1)} KB)`);
        return relativePath;

    } catch (err) {
        console.error(`[CoverService] Failed to download/convert cover for ${isbn}:`, err.message);
        // Clean up partial file
        if (fs.existsSync(outputPath)) {
            try { fs.unlinkSync(outputPath); } catch (e) { }
        }
        return null;
    }
}

/**
 * Fetch image buffer from URL (follows redirects up to 5 times)
 */
function fetchImageBuffer(url, redirectCount = 0) {
    if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));

    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const request = client.get(url, { timeout: 15000 }, (response) => {
            // Handle redirects
            if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
                let redirectUrl = response.headers.location;
                if (redirectUrl.startsWith('/')) {
                    const parsed = new URL(url);
                    redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
                }
                return resolve(fetchImageBuffer(redirectUrl, redirectCount + 1));
            }

            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP ${response.statusCode}`));
            }

            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        });

        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timed out'));
        });
    });
}

/**
 * Delete cover image file for a given ISBN
 */
function deleteCoverFile(isbn) {
    if (!isbn) return;
    const safeIsbn = String(isbn).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(COVERS_DIR, `${safeIsbn}.webp`);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`[CoverService] Deleted cover for ${isbn}`);
        } catch (err) {
            console.error(`[CoverService] Failed to delete cover for ${isbn}:`, err.message);
        }
    }
}

/**
 * Get all cover files for backup (returns array of { filename, data: base64 })
 */
function getAllCoversForBackup() {
    const covers = [];
    if (!fs.existsSync(COVERS_DIR)) return covers;

    const files = fs.readdirSync(COVERS_DIR);
    for (const file of files) {
        if (file.endsWith('.webp')) {
            const filePath = path.join(COVERS_DIR, file);
            const data = fs.readFileSync(filePath).toString('base64');
            covers.push({ filename: file, data });
        }
    }
    return covers;
}

/**
 * Restore cover files from backup data
 * @param {Array<{filename: string, data: string}>} covers - Array of cover objects with base64 data
 */
function restoreCoversFromBackup(covers) {
    if (!Array.isArray(covers) || covers.length === 0) return 0;

    // Ensure directory exists
    if (!fs.existsSync(COVERS_DIR)) {
        fs.mkdirSync(COVERS_DIR, { recursive: true });
    }

    let restored = 0;
    for (const cover of covers) {
        if (cover.filename && cover.data) {
            try {
                const filePath = path.join(COVERS_DIR, cover.filename);
                fs.writeFileSync(filePath, Buffer.from(cover.data, 'base64'));
                restored++;
            } catch (err) {
                console.error(`[CoverService] Failed to restore ${cover.filename}:`, err.message);
            }
        }
    }
    console.log(`[CoverService] Restored ${restored} cover images from backup`);
    return restored;
}

module.exports = {
    downloadAndStoreCover,
    deleteCoverFile,
    getAllCoversForBackup,
    restoreCoversFromBackup,
    COVERS_DIR
};
