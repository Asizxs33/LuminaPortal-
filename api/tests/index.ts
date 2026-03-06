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
        if (req.method === 'GET') {
            const { rows } = await pool.query(`
                SELECT t.*, COUNT(q.id)::int AS question_count
                FROM tests t LEFT JOIN questions q ON q.test_id = t.id
                WHERE t.published = true
                GROUP BY t.id ORDER BY t.created_at DESC
            `);
            return res.json(rows);
        }
        if (req.method === 'POST') {
            const { title, description, duration_minutes, published = false } = req.body || {};
            if (!title) return res.status(400).json({ error: 'Title required' });
            const { rows } = await pool.query(
                'INSERT INTO tests (title, description, duration_minutes, published) VALUES ($1,$2,$3,$4) RETURNING *',
                [title, description, duration_minutes || 30, published]
            );
            return res.status(201).json(rows[0]);
        }
        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Tests error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
