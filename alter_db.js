require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("Adding initial_code...");
        await pool.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS initial_code TEXT;');

        console.log("Adding test_cases...");
        await pool.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS test_cases JSONB;');

        console.log("Columns added successfully!");
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        pool.end();
    }
}

main();
