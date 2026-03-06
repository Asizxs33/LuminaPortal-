import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { cors } from '../../../_lib/cors';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { userId } = req.query;

    try {
        const { rows } = await pool.query(
            `SELECT r.*, t.title as test_title FROM results r
             JOIN tests t ON r.test_id = t.id
             WHERE r.user_id = $1 ORDER BY r.completed_at DESC`,
            [userId]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
