import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

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

    try {
        const userId = req.query.userId || req.body?.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const { rows } = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({ coins: rows[0].coins });
    } catch (err: any) {
        console.error('Coins API error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
