import API_BASE from '../config/apiConfig';

/**
 * Get the display URL for a book cover image.
 * - If book has a local path (starts with 'covers/'), serve from local uploads
 * - Otherwise use the external URL as-is (backward compatible)
 * - Returns null if no image available
 */
export const getBookCoverUrl = (book) => {
    const img = book?.cover_image || book?.cover_image_url;
    if (!img || img.trim() === '') return null;
    if (img.startsWith('covers/')) return `${API_BASE}/uploads/${img}`;
    return img;
};

/**
 * Get the display URL for a student profile photo.
 * - Local path (starts with 'students/') → serve from /uploads/
 * - Base64 data → return as-is (backward compatible)
 * - Returns null if no image
 */
export const getStudentPhotoUrl = (student) => {
    const img = student?.profile_image;
    if (!img || img.trim() === '') return null;
    if (img.startsWith('students/')) return `${API_BASE}/uploads/${img}`;
    if (img.startsWith('data:image/')) return img; // legacy base64
    return null;
};

/**
 * Get the display URL for a signature image (HOD or Principal).
 * - Local path (starts with 'signatures/') → serve from /uploads/
 * - Base64 data → return as-is (backward compatible)
 * - Returns null if no image
 */
export const getSignatureUrl = (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) return null;
    if (value.startsWith('signatures/')) return `${API_BASE}/uploads/${value}`;
    if (value.startsWith('data:image/')) return value; // legacy base64
    return null;
};

/**
 * Get the display URL for a profile icon.
 * - Local path (starts with 'icons/') → serve from /uploads/
 * - Legacy path (starts with '/profile-icons/') → serve from public folder
 * - Base64 data → return as-is (backward compatible)
 * - Returns null if no icon
 */
export const getProfileIconUrl = (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) return null;
    if (value.startsWith('icons/')) return `${API_BASE}/uploads/${value}`;
    if (value.startsWith('/profile-icons/')) return value; // legacy public path
    if (value.startsWith('data:image/')) return value; // legacy base64
    return null;
};

/**
 * Download a cover image via the backend and get the local path
 * @param {string} imageUrl - External image URL to download
 * @param {string} isbn - Book ISBN for filename
 * @returns {Promise<string|null>} - Local relative path or null
 */
export const downloadCoverImage = async (imageUrl, isbn) => {
    if (!imageUrl || !isbn) return null;
    try {
        const res = await fetch(`${API_BASE}/api/covers/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl, isbn })
        });
        const data = await res.json();
        return data.success ? data.localPath : null;
    } catch (err) {
        console.error(`[ImageUtils] Failed to download cover for ${isbn}:`, err);
        return null;
    }
};
