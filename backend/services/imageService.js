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
const UPLOADS_DIR = path.join(userDataPath, 'Uploads');

// Subdirectory constants
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');
const STUDENTS_DIR = path.join(UPLOADS_DIR, 'students');
const SIGNATURES_DIR = path.join(UPLOADS_DIR, 'signatures');
const ICONS_DIR = path.join(UPLOADS_DIR, 'icons');

// Ensure all directories exist
[COVERS_DIR, STUDENTS_DIR, SIGNATURES_DIR, ICONS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ─── Generic Helpers ─────────────────────────────────────────────────────────

/**
 * Make a string safe for use as filename
 */
function safeName(name) {
    return String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Save base64 data:image string as WebP file
 * @param {string} base64Data - data:image/...;base64,... string
 * @param {string} subDir - 'students' | 'signatures' | 'covers'
 * @param {string} filename - name without extension
 * @param {object} opts - { maxWidth: 300, quality: 75 }
 * @returns {Promise<string|null>} relative path like 'students/xxx.webp'
 */
async function saveBase64AsWebP(base64Data, subDir, filename, opts = {}) {
    if (!base64Data || !filename) return null;

    const { maxWidth = 400, quality = 80 } = opts;
    const safeFilename = safeName(filename);
    const targetDir = path.join(UPLOADS_DIR, subDir);
    const outputPath = path.join(targetDir, `${safeFilename}.webp`);
    const relativePath = `${subDir}/${safeFilename}.webp`;

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
        // Strip data URI prefix: data:image/png;base64,xxxx → xxxx
        let rawBase64 = base64Data;
        if (rawBase64.includes(',')) {
            rawBase64 = rawBase64.split(',')[1];
        }

        const buffer = Buffer.from(rawBase64, 'base64');

        await sharp(buffer)
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality, effort: 4 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`[ImageService] Saved ${relativePath} (${(stats.size / 1024).toFixed(1)} KB)`);
        return relativePath;

    } catch (err) {
        console.error(`[ImageService] Failed to save ${relativePath}:`, err.message);
        if (fs.existsSync(outputPath)) {
            try { fs.unlinkSync(outputPath); } catch (e) { }
        }
        return null;
    }
}

/**
 * Save a raw Buffer as WebP file (for multer/binary uploads — no base64 overhead)
 * @param {Buffer} buffer - Raw image buffer from multer
 * @param {string} subDir - 'students' | 'signatures' | 'covers' | 'icons'
 * @param {string} filename - name without extension
 * @param {object} opts - { maxWidth: 400, quality: 80 }
 * @returns {Promise<string|null>} relative path like 'students/xxx.webp'
 */
async function saveBufferAsWebP(buffer, subDir, filename, opts = {}) {
    if (!buffer || !filename) return null;

    const { maxWidth = 400, quality = 80 } = opts;
    const safeFilename = safeName(filename);
    const targetDir = path.join(UPLOADS_DIR, subDir);
    const outputPath = path.join(targetDir, `${safeFilename}.webp`);
    const relativePath = `${subDir}/${safeFilename}.webp`;

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
        await sharp(buffer)
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality, effort: 4 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`[ImageService] Saved ${relativePath} (${(stats.size / 1024).toFixed(1)} KB)`);
        return relativePath;

    } catch (err) {
        console.error(`[ImageService] Failed to save ${relativePath}:`, err.message);
        if (fs.existsSync(outputPath)) {
            try { fs.unlinkSync(outputPath); } catch (e) { }
        }
        return null;
    }
}

/**
 * Delete an image file by subDir + filename
 */
function deleteImageFile(subDir, filename) {
    if (!filename) return;
    const safeFilename = safeName(filename);
    const filePath = path.join(UPLOADS_DIR, subDir, `${safeFilename}.webp`);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`[ImageService] Deleted ${subDir}/${safeFilename}.webp`);
        } catch (err) {
            console.error(`[ImageService] Failed to delete ${subDir}/${safeFilename}.webp:`, err.message);
        }
    }
}

/**
 * Delete an image file by its relative path (e.g. 'students/172CS23021.webp')
 */
function deleteByRelativePath(relativePath) {
    if (!relativePath) return;
    const filePath = path.join(UPLOADS_DIR, relativePath);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`[ImageService] Deleted ${relativePath}`);
        } catch (err) {
            console.error(`[ImageService] Failed to delete ${relativePath}:`, err.message);
        }
    }
}

/**
 * Delete all files in a subdirectory
 */
function clearDirectory(subDir) {
    const dir = path.join(UPLOADS_DIR, subDir);
    if (!fs.existsSync(dir)) return 0;
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const file of files) {
        try {
            fs.unlinkSync(path.join(dir, file));
            count++;
        } catch (e) { }
    }
    console.log(`[ImageService] Cleared ${count} files from ${subDir}/`);
    return count;
}

/**
 * Get all files in a subdirectory for backup
 * @returns {Array<{filename, data: base64}>}
 */
function getFilesForBackup(subDir) {
    const dir = path.join(UPLOADS_DIR, subDir);
    const files = [];
    if (!fs.existsSync(dir)) return files;

    for (const file of fs.readdirSync(dir)) {
        if (file.endsWith('.webp')) {
            const filePath = path.join(dir, file);
            const data = fs.readFileSync(filePath).toString('base64');
            files.push({ filename: file, data });
        }
    }
    return files;
}

/**
 * Restore files from backup data to a subdirectory
 */
function restoreFilesFromBackup(subDir, files) {
    if (!Array.isArray(files) || files.length === 0) return 0;

    const dir = path.join(UPLOADS_DIR, subDir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let restored = 0;
    for (const file of files) {
        if (file.filename && file.data) {
            try {
                fs.writeFileSync(path.join(dir, file.filename), Buffer.from(file.data, 'base64'));
                restored++;
            } catch (err) {
                console.error(`[ImageService] Failed to restore ${subDir}/${file.filename}:`, err.message);
            }
        }
    }
    console.log(`[ImageService] Restored ${restored} files to ${subDir}/`);
    return restored;
}

// ─── Book Cover Specific ─────────────────────────────────────────────────────

/**
 * Download an image from URL and convert to WebP format
 * @returns {Promise<string|null>} relative path (covers/<isbn>.webp)
 */
async function downloadAndStoreCover(imageUrl, isbn) {
    if (!imageUrl || !isbn) return null;

    const safeIsbn = safeName(isbn);
    const outputPath = path.join(COVERS_DIR, `${safeIsbn}.webp`);
    const relativePath = `covers/${safeIsbn}.webp`;

    if (fs.existsSync(outputPath)) return relativePath;

    try {
        const imageBuffer = await fetchImageBuffer(imageUrl);
        if (!imageBuffer || imageBuffer.length === 0) {
            console.warn(`[ImageService] Empty response for cover ${isbn}`);
            return null;
        }

        await sharp(imageBuffer)
            .resize(300, null, { withoutEnlargement: true, fit: 'inside' })
            .webp({ quality: 75, effort: 4 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`[ImageService] Saved ${relativePath} (${(stats.size / 1024).toFixed(1)} KB)`);
        return relativePath;

    } catch (err) {
        console.error(`[ImageService] Failed to download cover for ${isbn}:`, err.message);
        if (fs.existsSync(outputPath)) {
            try { fs.unlinkSync(outputPath); } catch (e) { }
        }
        return null;
    }
}

function fetchImageBuffer(url, redirectCount = 0) {
    if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));

    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const request = client.get(url, { timeout: 15000 }, (response) => {
            if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
                let redirectUrl = response.headers.location;
                if (redirectUrl.startsWith('/')) {
                    const parsed = new URL(url);
                    redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
                }
                return resolve(fetchImageBuffer(redirectUrl, redirectCount + 1));
            }
            if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`));

            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        });

        request.on('error', reject);
        request.on('timeout', () => { request.destroy(); reject(new Error('Request timed out')); });
    });
}

function deleteCoverFile(isbn) {
    deleteImageFile('covers', isbn);
}

// ─── Convenience Aliases ─────────────────────────────────────────────────────

function getAllCoversForBackup() { return getFilesForBackup('covers'); }
function restoreCoversFromBackup(covers) { return restoreFilesFromBackup('covers', covers); }

module.exports = {
    // Generic
    saveBase64AsWebP,
    saveBufferAsWebP,
    deleteImageFile,
    deleteByRelativePath,
    clearDirectory,
    getFilesForBackup,
    restoreFilesFromBackup,
    safeName,
    // Book covers
    downloadAndStoreCover,
    deleteCoverFile,
    getAllCoversForBackup,
    restoreCoversFromBackup,
    // Paths
    UPLOADS_DIR,
    COVERS_DIR,
    STUDENTS_DIR,
    SIGNATURES_DIR,
    ICONS_DIR
};
