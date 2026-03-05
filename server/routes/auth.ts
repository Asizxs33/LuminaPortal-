import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/register (for seeding)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, group_name } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const result = await sql`
      INSERT INTO users (name, email, password, role, group_name)
      VALUES (${name}, ${email}, ${hash}, ${role || 'student'}, ${group_name || null})
      RETURNING id, name, email, role
    `;
        res.json(result[0]);
    } catch (err: any) {
        if (err.message?.includes('unique')) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/me - verify token
router.get('/me', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
        res.json({ id: payload.id, email: payload.email, role: payload.role });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
