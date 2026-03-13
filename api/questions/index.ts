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

    try {
        if (req.method === 'POST') {
            const { type, text, options, initial_code, test_cases, test_id, image_url } = req.body || {};
            if (!test_id || !text) return res.status(400).json({ error: 'test_id and text required' });

            // Insert matching the potentially new columns for CODE questions
            const qType = type || 'MULTIPLE_CHOICE';

            const { rows } = await pool.query(
                `INSERT INTO questions (test_id, text, type, initial_code, test_cases, image_url) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [
                    test_id,
                    text,
                    qType,
                    initial_code || null,
                    test_cases ? JSON.stringify(test_cases) : null,
                    image_url || null
                ]
            );

            const questionId = rows[0].id;

            // If options exist, insert them
            if (options && Array.isArray(options) && options.length > 0) {
                for (const opt of options) {
                    await pool.query(
                        'INSERT INTO options (question_id, text, is_correct) VALUES ($1, $2, $3)',
                        [questionId, opt.text, opt.is_correct || false]
                    );
                }
            }

            return res.status(201).json(rows[0]);
        } else if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Question ID required' });
            
            const { rows } = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);
            if (!rows[0]) return res.status(404).json({ error: 'Question not found' });
            return res.json({ success: true, deleted_id: rows[0].id });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Questions API error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
