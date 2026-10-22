// Local API integration check. Creates and removes only isolated QA fixtures.
const assert = require('node:assert/strict');
const { randomUUID, randomBytes, createHash } = require('node:crypto');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local', quiet: true });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const base = 'http://127.0.0.1:4189';
async function purgeFixtureUsers(ids){const c=await pool.connect();try{await c.query('BEGIN');await c.query("SET LOCAL app.maintenance_user_purge='on'");await c.query("DELETE FROM users WHERE id=ANY($1::int[]) AND email LIKE '%@example.invalid'",[ids]);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
async function main() {
  const users = []; let testId;
  const call = async (path, token, method = 'GET', body) => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const text = await response.text();
    return { status: response.status, data: text ? JSON.parse(text) : null };
  };
  try {
    for (const role of ['admin', 'student', 'student']) {
      const row = (await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id', ['QA learning check', `qa-${randomUUID()}@example.invalid`, 'unused-fixture-password', role])).rows[0];
      users.push({ id: row.id, token: jwt.sign({ id: row.id, role }, process.env.JWT_SECRET, { expiresIn: '10m' }) });
    }
    const [admin, student, other] = users;
    assert.equal((await call('/api/questions', null, 'POST', {})).status, 401);
    assert.equal((await call('/api/questions', student.token, 'POST', {})).status, 403);
    const created = await call('/api/tests', admin.token, 'POST', { title: 'QA isolated learning check', subject: 'QA', duration_minutes: 10, passing_score: 50 });
    assert.equal(created.status, 201); testId = created.data.id;
    assert.equal((await call(`/api/tests/${testId}`, student.token)).status, 403);
    for (let i = 0; i < 2; i++) {
      const q = await call('/api/questions', admin.token, 'POST', { test_id: testId, text: `QA ${i}`, options: [{ text: 'Correct', is_correct: true }, { text: 'Incorrect', is_correct: false }] });
      assert.equal(q.status, 201);
      assert.equal((await call(`/api/questions?id=${q.data.id}`, admin.token, 'PATCH', { test_id: testId, text: `QA edited ${i}`, options: [{ text: 'Correct', is_correct: true }, { text: 'Incorrect', is_correct: false }] })).status, 200);
    }
    await call(`/api/tests/${testId}`, admin.token, 'PATCH', { published: true });
    await call(`/api/tests/${testId}`, admin.token, 'PATCH', {exam_mode:false});
    const attempt = (await call(`/api/tests/${testId}?forAttempt=true`, student.token)).data;
    assert.equal(attempt.questions.length, 2);
    assert(attempt.questions.every(q => q.options.every(o => !('is_correct' in o))));
    const answers = Object.fromEntries(attempt.questions.map((q, i) => [q.id, q.options.find(o => o.text === (i ? 'Incorrect' : 'Correct')).id]));
    const body = { test_id: testId, submission_id: randomUUID(), attempt_token: attempt.attempt_token, answers, score: 999, total: 999, time_spent: 5 };
    const result = await call('/api/results', student.token, 'POST', body);
    assert.equal(result.status, 201); assert.equal(result.data.score, 1); assert.equal(result.data.total, 2); assert.equal(result.data.review.length, 2);
    assert.equal((await call('/api/results', student.token, 'POST', body)).data.id, result.data.id);
    assert.equal((await call(`/api/results?id=${result.data.id}`, other.token)).status, 404);
    assert.equal((await call(`/api/results?id=${result.data.id}`, student.token)).status, 200);
    assert.equal((await call(`/api/results/user/${student.id}`, other.token)).status, 403);
    const resetToken = randomBytes(32).toString('hex');
    await pool.query("INSERT INTO password_reset_requests(user_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '5 minutes')", [student.id, createHash('sha256').update(resetToken).digest('hex')]);
    const resetBody = { token: resetToken, password: randomBytes(18).toString('hex') };
    assert.equal((await call('/api/auth/reset-password', null, 'POST', resetBody)).status, 200);
    assert.equal((await call('/api/auth/reset-password', null, 'POST', resetBody)).status, 400);
    console.log('PASS: question editing, hidden answers, server grading, duplicate submission, access control, one-use password reset.');
  } finally {
    if (testId) await pool.query('DELETE FROM tests WHERE id=$1', [testId]);
    if (users.length) await purgeFixtureUsers(users.map(u => u.id));
    await pool.end();
  }
}
main().catch(error => { console.error('Learning check failed:', error.message); process.exitCode = 1; });
