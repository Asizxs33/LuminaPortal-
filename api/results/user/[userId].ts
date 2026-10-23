import { secure } from '../../_lib/secure';
import { session } from '../../_lib/session';
import type { VercelRequest, VercelResponse } from '../../_lib/http';
import { Pool } from '../../_lib/db';

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
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { userId } = req.query;
    const user=session(req);
    if(!user)return res.status(401).json({error:'Кіру қажет.'});
    if(user.role!=='admin'&&String(user.id)!==String(userId))return res.status(403).end();

    try {
        const { rows } = await pool.query(
            `SELECT r.id,r.user_id,r.test_id,r.score,r.total,r.completed_at,r.time_spent, t.title as test_title, t.subject, t.passing_score,t.language,t.round_number FROM results r
             JOIN tests t ON r.test_id = t.id
             WHERE r.user_id = $1 ORDER BY r.completed_at DESC`,
            [userId]
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
    }
}

export default secure(handler, 'results/user/[userId].ts');
