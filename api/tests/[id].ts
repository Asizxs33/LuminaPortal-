import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
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
            options: optionsRes.rows.filter((o: any) => o.question_id === q.id),
        }));

        res.json({ ...testRes.rows[0], questions: questionsWithOptions });
    } catch (err: any) {
        console.error('Test detail error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
