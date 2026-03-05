import { Router } from 'express';
import { sql } from '../db.js';

const router = Router();

// GET /api/students — all users (students + admins) with stats
router.get('/', async (_req, res) => {
  try {
    const students = await sql`
      SELECT 
        u.id, u.name, u.email, u.group_name, u.role, u.created_at,
        COUNT(r.id)::int AS tests_completed,
        COALESCE(ROUND(AVG(r.score::float / NULLIF(r.total, 0) * 100)), 0)::int AS avg_score
      FROM users u
      LEFT JOIN results r ON r.user_id = u.id
      GROUP BY u.id, u.name, u.email, u.group_name, u.role, u.created_at
      ORDER BY u.name
    `;
    res.json(students);
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, name, email, group_name, role, created_at FROM users WHERE id = ${req.params.id}
    `;
    if (!user) return res.status(404).json({ error: 'User not found' });
    const results = await sql`
      SELECT r.*, t.title as test_title FROM results r
      JOIN tests t ON r.test_id = t.id
      WHERE r.user_id = ${req.params.id}
      ORDER BY r.completed_at DESC
    `;
    res.json({ ...user, results });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/students/:id/role — change user role (admin only)
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "student" or "admin"' });
    }
    const [updated] = await sql`
      UPDATE users SET role = ${role} WHERE id = ${req.params.id}
      RETURNING id, name, email, role
    `;
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
