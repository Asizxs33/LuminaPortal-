import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// POST /api/results - save a test result
router.post('/', async (req, res) => {
    try {
        const { user_id, test_id, score, total } = req.body;
        if (!user_id || !test_id || score === undefined || !total) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get passing score for this test
        const [test] = await sql`SELECT passing_score FROM tests WHERE id = ${test_id}`;
        const passing_score = test?.passing_score ?? 70;
        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= passing_score;

        const [result] = await sql`
      INSERT INTO results (user_id, test_id, score, total, passed)
      VALUES (${user_id}, ${test_id}, ${score}, ${total}, ${passed})
      RETURNING *
    `;
        res.json(result);
    } catch (err) {
        console.error('Save result error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/results/user/:userId - get student's results
router.get('/user/:userId', async (req, res) => {
    try {
        const results = await sql`
      SELECT r.*, t.title as test_title, t.subject, t.passing_score
      FROM results r
      JOIN tests t ON r.test_id = t.id
      WHERE r.user_id = ${req.params.userId}
      ORDER BY r.completed_at DESC
    `;
        res.json(results);
    } catch (err) {
        console.error('Get user results error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/results - all results (admin analytics)
router.get('/', async (_req, res) => {
    try {
        const results = await sql`
      SELECT 
        r.*,
        u.name as student_name,
        u.group_name,
        t.title as test_title,
        t.subject,
        ROUND(r.score::float / NULLIF(r.total, 0) * 100)::int AS percentage
      FROM results r
      JOIN users u ON r.user_id = u.id
      JOIN tests t ON r.test_id = t.id
      ORDER BY r.completed_at DESC
      LIMIT 100
    `;
        res.json(results);
    } catch (err) {
        console.error('Get all results error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
