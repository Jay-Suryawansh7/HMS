const jwt = require('jsonwebtoken');

const platformAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        if (decoded.type !== 'PLATFORM_ADMIN') {
            return res.status(403).json({ message: 'Access denied: Platform Admin only' });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        console.error('Platform auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = platformAuthMiddleware;
