import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { cors } from '../_lib/cors';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST') {
            const { user_id, test_id, score, total, time_spent } = req.body || {};
            if (!user_id || !test_id) return res.status(400).json({ error: 'user_id and test_id required' });
            const { rows } = await pool.query(
                'INSERT INTO results (user_id, test_id, score, total, time_spent) VALUES ($1,$2,$3,$4,$5) RETURNING *',
                [user_id, test_id, score || 0, total || 0, time_spent || 0]
            );
            return res.status(201).json(rows[0]);
        }
        if (req.method === 'GET') {
            const { rows } = await pool.query(`
                SELECT r.*, u.name as user_name, u.email, t.title as test_title
                FROM results r
                JOIN users u ON r.user_id = u.id
                JOIN tests t ON r.test_id = t.id
                ORDER BY r.completed_at DESC
            `);
            return res.json(rows);
        }
        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Results error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
