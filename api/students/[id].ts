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
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
            if (!rows[0]) return res.status(404).json({ error: 'User not found' });
            return res.json({ success: true, deleted_id: rows[0].id });
        } catch (err: any) {
            console.error('Delete User Error:', err.message);
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'PATCH') {
        const { role } = req.body || {};
        if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

        try {
            const { rows } = await pool.query(
                'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
                [role, id]
            );
            if (!rows[0]) return res.status(404).json({ error: 'User not found' });
            res.json(rows[0]);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
