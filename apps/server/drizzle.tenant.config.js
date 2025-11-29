import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/tenantSchema.js",
    out: "./drizzle/tenant",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.PG_HOST || "localhost",
        user: process.env.PG_USER || "postgres",
        password: process.env.PG_PASSWORD || "postgrespassword",
        database: process.env.PG_DATABASE || "hms_master",
        port: Number(process.env.PG_PORT) || 5432,
        ssl: false,
    },
});
