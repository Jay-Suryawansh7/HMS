const { db } = require('../config/dbConfigPg');
const { tenants } = require('../db/publicSchema');
const { eq } = require('drizzle-orm');
const redisClient = require('../config/redisClient');

const tenantMiddleware = async (req, res, next) => {
    try {
        // 1. Extract Tenant ID (from header or subdomain)
        // For this implementation, we'll look for 'x-tenant-id' header (UUID)
        // In a real app, we might parse the hostname (subdomain.domain.com)
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId) {
            // If no tenant ID, we assume it's a public request or admin request
            // We don't set tenant context.
            return next();
        }

        // 2. Check Cache
        const cacheKey = `tenant:${tenantId}:db_name`;
        let dbName = await redisClient.get(cacheKey);

        if (!dbName) {
            // 3. Fetch from DB
            const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

            if (tenant.length === 0) {
                return res.status(404).json({ message: 'Tenant not found' });
            }

            dbName = tenant[0].dbName;

            // Cache it
            await redisClient.set(cacheKey, dbName, { EX: 3600 }); // 1 hour
        }

        // 4. Attach to Request
        req.tenantId = tenantId;
        req.tenantDbName = dbName;

        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = tenantMiddleware;
