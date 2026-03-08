import { pool } from '../db.js';

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS initial_code TEXT,
            ADD COLUMN IF NOT EXISTS test_cases JSONB;
        `);
        console.log("Migration complete: added initial_code and test_cases to questions.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

migrate();
