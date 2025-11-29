const { pgTable, text, varchar, timestamp, pgEnum } = require('drizzle-orm/pg-core');

// Enums (Public Schema)
const statusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE', 'PENDING', 'VERIFIED']);

// --- Public Schema Tables ---

const tenants = pgTable('tenants', {
    id: text('id').primaryKey(), // UUID
    hospitalName: varchar('hospital_name', { length: 255 }).notNull(),
    subdomain: varchar('subdomain', { length: 255 }).notNull().unique(),
    dbName: varchar('db_name', { length: 255 }).notNull(), // Schema name in PG
    licenseKey: varchar('license_key', { length: 255 }),
    status: statusEnum('status').default('PENDING'),
    address: text('address'),
    contact: varchar('contact', { length: 50 }),
    adminEmail: varchar('admin_email', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
});

const platformUsers = pgTable('platform_users', {
    id: text('id').primaryKey(), // UUID
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('SUPER_ADMIN'),
    createdAt: timestamp('created_at').defaultNow(),
});

module.exports = {
    tenants,
    statusEnum,
    platformUsers
};
