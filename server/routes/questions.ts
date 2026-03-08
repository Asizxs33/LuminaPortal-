import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// POST /api/questions - Create a new question
router.post('/', async (req, res) => {
    try {
        const { test_id, type, text, options, initial_code, test_cases, order_index } = req.body;

        if (!test_id || !type || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [question] = await sql`
            INSERT INTO questions (test_id, type, text, initial_code, test_cases, order_index)
            VALUES (${test_id}, ${type}, ${text}, ${initial_code || null}, ${test_cases ? JSON.stringify(test_cases) : null}, ${order_index || 0})
            RETURNING *
        `;

        if (type === 'MULTIPLE_CHOICE' && options && options.length > 0) {
            for (const opt of options) {
                await sql`
                    INSERT INTO options (question_id, text, is_correct)
                    VALUES (${question.id}, ${opt.text}, ${opt.is_correct})
                `;
            }
        }

        res.json(question);
    } catch (err) {
        console.error('Create question error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', async (req, res) => {
    try {
        // Options cascade or delete manually if no cascade set
        await sql`DELETE FROM options WHERE question_id = ${req.params.id}`;
        await sql`DELETE FROM questions WHERE id = ${req.params.id}`;
        
        res.json({ success: true });
    } catch (err) {
        console.error('Delete question error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
