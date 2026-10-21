import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization required' });
    }

    try {
        const userId = req.query.userId || req.body?.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'fallback_secret') as { id?: number; role?: string };
        if (decoded.role !== 'admin' && String(decoded.id) !== String(userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { rows } = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({ coins: rows[0].coins });
    } catch (err: any) {
        if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Coins API error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
