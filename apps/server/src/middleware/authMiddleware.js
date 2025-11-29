const jwt = require('jsonwebtoken');
const { db } = require('../config/dbConfigPg');
const { tenants } = require('../db/publicSchema');
const { eq } = require('drizzle-orm');
const redisClient = require('../config/redisClient');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.userId = decoded.userId;
        req.hospitalId = decoded.hospitalId;
        req.userRole = decoded.role;
        req.tenantId = decoded.tenantId;

        // Resolve Tenant DB Name
        if (req.tenantId) {
            const cacheKey = `tenant:${req.tenantId}:db_name`;
            let dbName = await redisClient.get(cacheKey);

            if (!dbName) {
                const tenantResult = await db.select().from(tenants).where(eq(tenants.id, req.tenantId)).limit(1);
                if (tenantResult.length > 0) {
                    dbName = tenantResult[0].dbName;
                    await redisClient.set(cacheKey, dbName, { EX: 3600 });
                }
            }

            if (dbName) {
                req.tenantDbName = dbName;
            }
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
