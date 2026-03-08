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

    try {
        const { rows } = await pool.query(`
            SELECT t.*, COUNT(q.id)::int AS question_count
            FROM tests t LEFT JOIN questions q ON q.test_id = t.id
            GROUP BY t.id ORDER BY t.created_at DESC
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
