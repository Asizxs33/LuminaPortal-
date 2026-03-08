import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// GET /api/tests - all published tests
router.get('/', async (_req, res) => {
    try {
        const tests = await sql`
      SELECT t.*, COUNT(q.id)::int AS question_count
      FROM tests t
      LEFT JOIN questions q ON q.test_id = t.id
      WHERE t.is_published = true
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
        res.json(tests);
    } catch (err) {
        console.error('Get tests error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/tests/all - all tests including unpublished (admin)
router.get('/all', async (_req, res) => {
    try {
        const tests = await sql`
      SELECT t.*, COUNT(q.id)::int AS question_count
      FROM tests t
      LEFT JOIN questions q ON q.test_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
        res.json(tests);
    } catch (err) {
        console.error('Get all tests error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/tests/:id - get test with questions and options
router.get('/:id', async (req, res) => {
    try {
        const [test] = await sql`SELECT * FROM tests WHERE id = ${req.params.id}`;
        if (!test) return res.status(404).json({ error: 'Test not found' });

        const questions = await sql`
      SELECT * FROM questions WHERE test_id = ${req.params.id} ORDER BY order_index
    `;

        const questionsWithOptions = await Promise.all(
            questions.map(async (q: any) => {
                const options = await sql`SELECT * FROM options WHERE question_id = ${q.id} ORDER BY id`;
                return { ...q, options };
            })
        );

        res.json({ ...test, questions: questionsWithOptions });
    } catch (err) {
        console.error('Get test error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tests - create test (admin)
router.post('/', async (req, res) => {
    try {
        const { id, title, subject, description, duration_minutes, passing_score } = req.body;
        const [test] = await sql`
      INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score)
      VALUES (${id}, ${title}, ${subject}, ${description}, ${duration_minutes || 30}, ${passing_score || 70})
      RETURNING *
    `;
        res.json(test);
    } catch (err) {
        console.error('Create test error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/tests/:id/publish - toggle publish status (admin)
router.patch('/:id/publish', async (req, res) => {
    try {
        const { is_published } = req.body;
        const [test] = await sql`
      UPDATE tests SET is_published = ${is_published}, published = ${is_published}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
        if (!test) return res.status(404).json({ error: 'Test not found' });
        res.json(test);
    } catch (err) {
        console.error('Publish test error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/tests/:id - delete test (admin)
router.delete('/:id', async (req, res) => {
    try {
        await sql`DELETE FROM tests WHERE id = ${req.params.id}`;
        res.json({ success: true });
    } catch (err) {
        console.error('Delete test error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
