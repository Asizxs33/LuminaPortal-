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

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { rows } = await pool.query(
                'SELECT id, name, email, group_name, role, created_at FROM users WHERE id = $1', [id]
            );
            if (!rows[0]) return res.status(404).json({ error: 'User not found' });
            const results = await pool.query(
                `SELECT r.*, t.title as test_title FROM results r
                 JOIN tests t ON r.test_id = t.id
                 WHERE r.user_id = $1 ORDER BY r.completed_at DESC`, [id]
            );
            res.json({ ...rows[0], results: results.rows });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
