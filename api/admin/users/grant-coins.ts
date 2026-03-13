import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ error: 'Internal server error' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Verify Admin role
        if (!decoded.role || decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Admin access required.' });
        }

        const { userId, amount } = req.body;
        
        if (!userId || typeof amount !== 'number') {
            return res.status(400).json({ error: 'Missing required fields: userId and amount' });
        }

        // Add coins to user
        const result = await pool.query(
            'UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING id, name, coins',
            [amount, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        return res.status(200).json({ 
            message: 'Монеты успешно добавлены', 
            user: result.rows[0] 
        });

    } catch (error) {
        console.error('Error granting coins:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
