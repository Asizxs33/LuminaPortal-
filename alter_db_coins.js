require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("Adding image_url...");
        await pool.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;');

        console.log("Adding coins to users...");
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 100;');
        
        // Ensure existing users get 100 coins
        await pool.query('UPDATE users SET coins = 100 WHERE coins IS NULL;');

        console.log("Columns added successfully!");
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        pool.end();
    }
}

main();
