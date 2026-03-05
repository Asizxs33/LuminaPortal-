import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { cors } from '../../_lib/cors.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;

    try {
        const testRes = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
        if (!testRes.rows[0]) return res.status(404).json({ error: 'Test not found' });

        const questions = await pool.query(
            'SELECT * FROM questions WHERE test_id = $1 ORDER BY id', [id]
        );
        const optionsRes = await pool.query(
            `SELECT o.* FROM options o
             JOIN questions q ON o.question_id = q.id
             WHERE q.test_id = $1`, [id]
        );

        const questionsWithOptions = questions.rows.map(q => ({
            ...q,
            options: optionsRes.rows.filter(o => o.question_id === q.id),
        }));

        res.json({ ...testRes.rows[0], questions: questionsWithOptions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
