import { secure } from '../_lib/secure';
import { passwordReset } from '../_lib/password-reset';
import type { VercelRequest, VercelResponse } from '../_lib/http';
import { Pool } from '../_lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
});

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    if (action === 'forgot-password' || action === 'reset-password') {
        try { return await passwordReset(req, res, pool); } catch { return res.status(503).json({error:'Қызмет уақытша қолжетімсіз. Кейінірек қайталаңыз.'}); }
    }

    if (action === 'login' && req.method === 'POST') {
        const { email, password } = req.body || {};
        if (typeof email!=='string'||email.length>254||typeof password!=='string'||password.length>128||!password) return res.status(400).json({ error: 'Email and password required' });
        try {
            const normalizedEmail = String(email).trim().toLowerCase();
            const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL', [normalizedEmail]);
            const user = rows[0];
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            );
            return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (err: any) {
            console.error('Login error:', err.message);
            return res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
        }
    }

    if (action === 'register' && req.method === 'POST') {
        const { name, email, password, role = 'student', group_name } = req.body || {};
        if (typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<10||Buffer.byteLength(password,'utf8')>72||typeof name!=='string'||!name.trim()||name.length>120) return res.status(400).json({ error: 'Name, email and password required' });
        try {
            const normalizedEmail = String(email).trim().toLowerCase();
            const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
            if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });
            const password_hash = await bcrypt.hash(password, 10);
            const { rows } = await pool.query(
                'INSERT INTO users (name, email, password_hash, role, group_name) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
                [name, normalizedEmail, password_hash, 'student', group_name || null]
            );
            return res.status(201).json({ user: rows[0] });
        } catch (err: any) {
            console.error('Register error:', err.message);
            return res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
        }
    }

    if (action === 'me' && req.method === 'GET') {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
        try {
            const decoded: any = jwt.verify(auth.slice(7), process.env.JWT_SECRET!);
            const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1 AND deleted_at IS NULL', [decoded.id]);
            if (!rows[0]) return res.status(404).json({ error: 'User not found' });
            return res.json(rows[0]);
        } catch {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    return res.status(404).json({ error: 'Endpoint not found' });
}

export default secure(handler, 'auth/[action].ts');
