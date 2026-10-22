import { session } from '../_lib/session';
import { secure } from '../_lib/secure';
import type { VercelRequest, VercelResponse } from '../_lib/http';
import { Pool } from '../_lib/db';
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

function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization required' });
        return false;
    }

    try {
        const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { role?: string };
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

async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!requireAdmin(req, res)) return;

    const { id } = req.query;
    if (typeof id !== "string" || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return res.status(400).json({error:"Invalid user ID"});
    if (['DELETE','PATCH'].includes(req.method||'')) {
      const actor=session(req);
      if(String(actor?.id)===String(id))return res.status(409).json({error:'Өз аккаунтыңызды өшіру немесе рөліңізді төмендету мүмкін емес.'});
    }

    if (req.method === 'GET') {
        try {
            const { rows } = await pool.query(
                'SELECT id, name, email, group_name, role, created_at FROM users WHERE id = $1 AND deleted_at IS NULL', [id]
            );
            if (!rows[0]) return res.status(404).json({ error: 'Active student not found or action not allowed' });
            const results = await pool.query(
                `SELECT r.*, t.title as test_title FROM results r
                 JOIN tests t ON r.test_id = t.id
                 WHERE r.user_id = $1 ORDER BY r.completed_at DESC`, [id]
            );
            res.json({ ...rows[0], results: results.rows });
        } catch (err: any) {
            res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { rows } = await pool.query("UPDATE users SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL AND role='student' RETURNING id", [id]);
            if (!rows[0]) return res.status(404).json({ error: 'Active student not found or action not allowed' });
            return res.json({ success: true, deleted_id: rows[0].id, archived: true });
        } catch (err: any) {
            console.error('Delete User Error:', err.message);
            res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
        }
    } else if (req.method === 'PATCH') {
        const { role } = req.body || {};
        if (!['student', 'teacher', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

        try {
            const { rows } = await pool.query(
                'UPDATE users SET role = $1, tokens_valid_after=now() WHERE id = $2 AND deleted_at IS NULL RETURNING id, name, email, role',
                [role, id]
            );
            if (!rows[0]) return res.status(404).json({ error: 'Active student not found or action not allowed' });
            res.json(rows[0]);
        } catch (err: any) {
            res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

export default secure(handler, 'students/[id].ts');
