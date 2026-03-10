import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

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

    try {
        if (req.method === 'GET') {
            const { rows } = await pool.query(`
                SELECT t.*, COUNT(q.id)::int AS question_count
                FROM tests t LEFT JOIN questions q ON q.test_id = t.id
                WHERE t.is_published = true
                GROUP BY t.id ORDER BY t.created_at DESC
            `);
            return res.json(rows);
        }
        if (req.method === 'POST') {
            const { title, subject, description, duration_minutes, is_published = false } = req.body || {};
            if (!title) return res.status(400).json({ error: 'Title required' });

            const testId = uuidv4();
            const { rows } = await pool.query(
                'INSERT INTO tests (id, title, subject, description, duration_minutes, is_published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
                [testId, title, subject || 'General', description || '', duration_minutes || 30, is_published]
            );
            return res.status(201).json(rows[0]);
        }
        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Tests error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
