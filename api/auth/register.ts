import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { cors } from '../_lib/cors.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, password, role = 'student', group_name } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password required' });

    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });

        const password_hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, group_name) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
            [name, email, password_hash, role, group_name || null]
        );
        res.status(201).json({ user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
