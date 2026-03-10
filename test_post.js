require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testPost() {
    try {
        const testId = uuidv4();
        console.log('Generated testId:', testId);

        // Exact same query as api/tests/index.ts
        const res = await pool.query(
            'INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score, is_published) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            [testId, 'Test Debug', 'Math', 'Debugging 500 error', 30, 70, false]
        );

        console.log("Success:", res.rows[0]);

        // Now delete the test to clean up
        await pool.query('DELETE FROM tests WHERE id = $1', [testId]);
        console.log("Cleaned up");
    } catch (err) {
        console.error("DB Error:", err.message);
        console.error(err);
    } finally {
        pool.end();
    }
}

testPost();
