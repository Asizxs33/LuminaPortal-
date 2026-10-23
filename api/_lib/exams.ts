import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Pool } from './db';

export async function examAction(pool: Pool, req: any, res: any, actor: any) {
  const test = (await pool.query('SELECT * FROM tests WHERE id=$1', [req.query.id])).rows[0];
  if (!test) return res.status(403).json({error:'Тест жабық.'});
  if (!test.exam_mode) return res.status(400).json({error:'Бұл жаттығу режимі.'});
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serializes creation, saves and events for the same student and test.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${actor.id}:${test.id}`]);
    let attempt = (await client.query('SELECT * FROM exam_attempts WHERE user_id=$1 AND test_id=$2 FOR UPDATE', [actor.id,test.id])).rows[0];
    if (!attempt && req.body.action === 'begin' && !test.answers_released && (test.is_published || actor.role==='admin')) {
      const questions = (await client.query('SELECT * FROM questions WHERE test_id=$1 ORDER BY RANDOM() LIMIT NULLIF($2,0)',[test.id,test.questions_per_attempt])).rows;
      if (!questions.length) { await client.query('ROLLBACK'); return res.status(400).json({error:'Сұрақтар жоқ.'}); }
      const options = (await client.query('SELECT * FROM options WHERE question_id=ANY($1::int[]) ORDER BY RANDOM()',[questions.map(q=>q.id)])).rows;
      const snapshot = questions.map(q=>({...q,options:options.filter(o=>o.question_id===q.id)}));
      attempt = (await client.query("INSERT INTO exam_attempts(id,user_id,test_id,deadline,questions) VALUES($1,$2,$3,NOW()+($4 * INTERVAL '1 minute'),$5) RETURNING *",[randomUUID(),actor.id,test.id,test.duration_minutes,JSON.stringify(snapshot)])).rows[0];
    }
    if (!attempt) { await client.query('ROLLBACK'); return res.status(409).json({error:'Емтихан аяқталған немесе басталмаған.'}); }
    const now = new Date((await client.query('SELECT NOW() AS now')).rows[0].now).getTime();
    const active = !attempt.finished && !test.answers_released && new Date(attempt.deadline).getTime()>now;
    if (req.body.action === 'event' && active) {
      const {event_id,kind}=req.body;
      if (typeof event_id !== 'string' || event_id.length>100 || !['window_blur','hidden','fullscreen_exit','fullscreen_unavailable'].includes(kind)) { await client.query('ROLLBACK'); return res.status(400).end(); }
      const events=attempt.events;
      const previous=events[events.length-1];
      if (!events.some((e:any)=>e.id===event_id) && events.length<100 && (!previous || now-new Date(previous.at).getTime()>2000)) {
        events.push({id:event_id,kind,at:new Date(now).toISOString()});
        const count=events.filter((e:any)=>e.kind!=='fullscreen_unavailable').length;
        attempt=(await client.query('UPDATE exam_attempts SET events=$1,deadline=CASE WHEN $2 THEN NOW() ELSE deadline END WHERE id=$3 RETURNING *',[JSON.stringify(events),count>=3,attempt.id])).rows[0];
      }
    }
    if (req.body.action==='save' && active) {
      attempt=(await client.query('UPDATE exam_attempts SET answers=$1,code_answers=$2,code_proofs=$3 WHERE id=$4 RETURNING *',[JSON.stringify(req.body.answers||{}),JSON.stringify(req.body.code_answers||{}),JSON.stringify(req.body.code_proofs||{}),attempt.id])).rows[0];
    }
    await client.query('COMMIT');
    const token=jwt.sign({purpose:'attempt',user_id:actor.id,test_id:test.id,question_ids:attempt.questions.map((q:any)=>q.id),exam_attempt_id:attempt.id},process.env.JWT_SECRET!,{expiresIn:'7d'});
    return res.json({...test,questions:attempt.questions.map(({test_cases,...q}:any)=>({...q,options:q.options.map(({is_correct,...o}:any)=>o)})),attempt_token:token,exam_attempt_id:attempt.id,server_now:now,deadline:test.answers_released?now:new Date(attempt.deadline).getTime(),started_at:new Date(attempt.started_at).getTime(),answers:attempt.answers,code_answers:attempt.code_answers,code_proofs:attempt.code_proofs,events:attempt.events,finished:attempt.finished});
  } catch { await client.query('ROLLBACK');return res.status(500).json({error:'Емтиханды сақтау мүмкін болмады.'}); }
  finally {client.release();}
}

export function hideReview(result:any, hidden:boolean) {
  return hidden ? {...result,review:null,review_locked:true} : result;
}
