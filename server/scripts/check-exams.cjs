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
    console.log(method,path.replace(/[0-9a-f]{8}-[0-9a-f-]+/g,'fixture'));
    const response = await fetch(base + path, { method, signal:AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
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
    const begun=await call(`/api/tests/${testId}`,student.token,'POST',{action:'begin'});
    assert.equal(begun.status,200);const attempt=begun.data;
    assert.equal(attempt.questions.length,2);
    assert(attempt.questions.every(q=>q.options.every(o=>!('is_correct' in o))));
    const resumed=(await call(`/api/tests/${testId}`,student.token,'POST',{action:'begin'})).data;
    assert.equal(resumed.exam_attempt_id,attempt.exam_attempt_id);
    assert.equal(resumed.deadline,attempt.deadline);
    assert.deepEqual(resumed.questions,attempt.questions);
    assert.equal((await call(`/api/tests/${testId}`,student.token)).data.questions.length,0);
    assert.equal((await call('/api/mentor/hint',student.token,'POST',{test_id:testId,questionText:'help',userId:student.id})).status,403);
    assert.equal((await call(`/api/results?audit_test=${testId}`,student.token)).status,403);
    const answers=Object.fromEntries(attempt.questions.map(q=>[q.id,q.options.find(o=>o.text==='Correct').id]));
    await call(`/api/tests/${testId}`,student.token,'POST',{action:'save',answers});
    await call(`/api/tests/${testId}`,student.token,'POST',{action:'event',kind:'fullscreen_exit',event_id:'qa-event'});
    await call(`/api/tests/${testId}`,student.token,'POST',{action:'event',kind:'fullscreen_exit',event_id:'qa-event'});
    const audit=(await call(`/api/results?audit_test=${testId}`,admin.token)).data;
    assert.equal(audit[0].events.length,1);
    await pool.query("UPDATE exam_attempts SET deadline=NOW()-INTERVAL '1 second' WHERE id=$1",[attempt.exam_attempt_id]);
    const late=await call(`/api/tests/${testId}`,student.token,'POST',{action:'save',answers:{}});
    assert.deepEqual(late.data.answers,answers);
    const body={test_id:testId,submission_id:attempt.exam_attempt_id,attempt_token:attempt.attempt_token,answers:{},time_spent:999999};
    const result=await call('/api/results',student.token,'POST',body);
    assert.equal(result.status,201);assert.equal(result.data.score,2);assert.equal(result.data.review,null);assert.equal(result.data.review_locked,true);
    assert(result.data.time_spent<999999);
    assert.equal((await call('/api/results',student.token,'POST',body)).data.id,result.data.id);
    assert.equal((await call(`/api/results?id=${result.data.id}`,student.token)).data.review,null);
    assert.equal((await call('/api/mentor/hint',student.token,'POST',{result_id:result.data.id,question_id:'1'})).status,403);
    assert.equal((await call('/api/mentor/hint',other.token,'POST',{result_id:result.data.id,question_id:'1'})).status,403);
    assert.equal((await call(`/api/results?id=${result.data.id}`,admin.token)).data.review.length,2);
    const second=(await call(`/api/tests/${testId}`,other.token,'POST',{action:'begin'})).data;
    for(let i=0;i<3;i++){
      if(i)await pool.query("UPDATE exam_attempts SET events=(SELECT jsonb_agg(e || jsonb_build_object('at',NOW()-INTERVAL '5 seconds')) FROM jsonb_array_elements(events) e) WHERE id=$1",[second.exam_attempt_id]);
      const event=(await call(`/api/tests/${testId}`,other.token,'POST',{action:'event',kind:'hidden',event_id:`event-${i}`})).data;
      if(i===2)assert(event.deadline<=event.server_now);
    }
    assert.equal((await call(`/api/tests/${testId}`,admin.token,'PATCH',{exam_mode:false})).status,409);
    assert.equal((await call(`/api/tests/${testId}`,student.token,'PATCH',{answers_released:true})).status,403);
    assert.equal((await call(`/api/tests/${testId}`,admin.token,'PATCH',{answers_released:true})).status,200);
    assert.equal((await call(`/api/results?id=${result.data.id}`,student.token)).data.review.length,2);
    console.log('PASS: persistent deadline/order, late-answer rejection, hidden review, mentor block, audit authorization/deduplication, three-event deadline, teacher release.');
  } finally {
    if (testId) await pool.query('DELETE FROM tests WHERE id=$1', [testId]);
    if (users.length) await purgeFixtureUsers(users.map(u => u.id));
    if(testId)await pool.query('DELETE FROM test_history WHERE test_id=$1',[testId]);
    if(users.length)await pool.query('DELETE FROM security_events WHERE target_id=ANY($1::text[]) OR actor_id=ANY($2::int[])',[users.map(u=>String(u.id)),users.map(u=>u.id)]);
    await pool.end();
  }
}
main().catch(error => { console.error('Learning check failed:', error.message); process.exitCode = 1; });
