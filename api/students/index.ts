import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization required' });
        return false;
    }

    try {
        const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'fallback_secret') as { role?: string };
        if (decoded.role !== 'admin') {
            res.status(403).json({ error: 'Admin access required' });
            return false;
        }
        return true;
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
        return false;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!requireAdmin(req, res)) return;

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
