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
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { rows } = await pool.query(`
            SELECT u.id, u.name, u.email, u.group_name, u.role, u.created_at,
                COUNT(r.id)::int AS tests_completed,
                COALESCE(ROUND(AVG(r.score::float / NULLIF(r.total, 0) * 100)), 0)::int AS avg_score
            FROM users u
            LEFT JOIN results r ON r.user_id = u.id
            GROUP BY u.id, u.name, u.email, u.group_name, u.role, u.created_at
            ORDER BY u.name
        `);
        res.json(rows);
    } catch (err: any) {
        console.error('Students error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
