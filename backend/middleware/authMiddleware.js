const jwt = require('jsonwebtoken');

// Reuse secret from authController (Ideally should be in env/config)
const JWT_SECRET = 'gptk_lms_secret_temporary_key';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Fallback on query param for downloads/exports
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        // Proceed without user (guest/unauthenticated) or strictly 401?
        // For strict API routes, we usually want 401.
        // But for some public getters, maybe not.
        // Let's implement strict verification.
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Token' });
        }

        req.user = decoded; // { id, email, role, iat, exp }
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'Admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access Denied: Admins Only' });
        }
    });
};

// Optional: specific staff permission check
const verifyStaff = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && (req.user.role === 'Staff' || req.user.role === 'Admin')) {
            next();
        } else {
            res.status(403).json({ message: 'Access Denied: Staff/Admin Only' });
        }
    });
};


module.exports = {
    verifyToken,
    verifyAdmin,
    verifyStaff
};
