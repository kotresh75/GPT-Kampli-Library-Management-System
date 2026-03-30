const express = require('express');
const router = express.Router();
const coverService = require('../services/imageService');

// POST /api/covers/download - Download and store a cover image locally
router.post('/download', async (req, res) => {
    const { imageUrl, isbn } = req.body;

    if (!imageUrl || !isbn) {
        return res.status(400).json({ error: 'Missing imageUrl or isbn' });
    }

    try {
        const localPath = await coverService.downloadAndStoreCover(imageUrl, isbn);
        if (localPath) {
            res.json({ success: true, localPath });
        } else {
            res.json({ success: false, localPath: null, message: 'Failed to download cover image' });
        }
    } catch (err) {
        console.error('[CoverRoute] Download error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/covers/download-batch - Download multiple covers at once
router.post('/download-batch', async (req, res) => {
    const { items } = req.body; // Array of { imageUrl, isbn }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing or empty items array' });
    }

    const results = [];
    for (const item of items) {
        if (item.imageUrl && item.isbn) {
            const localPath = await coverService.downloadAndStoreCover(item.imageUrl, item.isbn);
            results.push({ isbn: item.isbn, localPath, success: !!localPath });
        } else {
            results.push({ isbn: item.isbn || 'unknown', localPath: null, success: false });
        }
    }

    res.json({ results });
});

module.exports = router;
