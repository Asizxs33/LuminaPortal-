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
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;

    try {
        if (req.method === 'DELETE') {
            const { rows } = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);
            if (!rows[0]) return res.status(404).json({ error: 'Question not found' });
            return res.json({ success: true, deleted_id: rows[0].id });
        }
    } catch (err: any) {
        console.error('Question delete error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
