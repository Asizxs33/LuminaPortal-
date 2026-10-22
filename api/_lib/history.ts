import {randomUUID} from 'node:crypto';
import {Pool, requestActor} from './db';
export async function snapshot(c:any,id:string,actor:any,action:string){
 const test=(await c.query('SELECT * FROM tests WHERE id=$1 FOR UPDATE',[id])).rows[0];
 if(!test)throw Error('missing');
 const questions=(await c.query("SELECT to_jsonb(q)||jsonb_build_object('options',COALESCE((SELECT jsonb_agg(to_jsonb(o)) FROM options o WHERE o.question_id=q.id),'[]'::jsonb)) AS data FROM questions q WHERE test_id=$1 ORDER BY id",[id])).rows.map((r:any)=>r.data);
 const results=(await c.query('SELECT * FROM results WHERE test_id=$1',[id])).rows;
 return (await c.query('INSERT INTO test_history(test_id,title,action,actor_id,actor_name,snapshot) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[id,test.title,action,actor.id,requestActor.getStore()?.name||actor.name||String(actor.id),JSON.stringify({test,questions,results})])).rows[0];
}
export async function history(pool:Pool,req:any,res:any,actor:any){
 if(actor?.role!=='admin')return res.status(403).end();
 if(req.method==='GET'){
  if(req.query.snapshot){const row=(await pool.query("SELECT id,title,action,actor_name,created_at,snapshot->'results' AS results,jsonb_array_length(snapshot->'questions') AS question_count FROM test_history WHERE id=$1",[req.query.snapshot])).rows[0];return res.status(row?200:404).json(row||{});}
  const before=Number(req.query.before)||Number.MAX_SAFE_INTEGER;
  return res.json({history:(await pool.query("SELECT id,test_id,title,action,actor_name,created_at,jsonb_array_length(snapshot->'questions') AS question_count,jsonb_array_length(snapshot->'results') AS result_count FROM test_history WHERE id<$1 ORDER BY id DESC LIMIT 50",[before])).rows,events:(await pool.query('SELECT * FROM security_events ORDER BY id DESC LIMIT 30')).rows});
 }
 if(req.method!=='POST')return res.status(405).end();
 const c=await pool.connect();try{
  await c.query('BEGIN');
  if(req.body.action==='backup'){
   const ids=(await c.query('SELECT id FROM tests ORDER BY id')).rows;
   for(const {id} of ids)await snapshot(c,id,actor,'backup.manual');
   await c.query('COMMIT');return res.json({count:ids.length});
  }
  if(req.body.action!=='restore') {await c.query('ROLLBACK');return res.status(400).end();}
  const saved=(await c.query('SELECT snapshot FROM test_history WHERE id=$1',[req.body.snapshot_id])).rows[0];
  if(!saved){await c.query('ROLLBACK');return res.status(404).end();}
  const {test,questions}=saved.snapshot;const id=randomUUID();
  await c.query('INSERT INTO tests(id,title,subject,description,duration_minutes,passing_score,is_published,exam_mode,answers_released) VALUES($1,$2,$3,$4,$5,$6,false,$7,false)',[id,`${test.title} — қалпына келтірілген`,test.subject,test.description,test.duration_minutes,test.passing_score,test.exam_mode??true]);
  for(const q of questions){
   const row=(await c.query('INSERT INTO questions(test_id,text,type,initial_code,test_cases,image_url,order_index) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',[id,q.text,q.type,q.initial_code,JSON.stringify(q.test_cases),q.image_url,q.order_index])).rows[0];
   for(const o of q.options||[])await c.query('INSERT INTO options(question_id,text,is_correct) VALUES($1,$2,$3)',[row.id,o.text,o.is_correct]);
  }
  await snapshot(c,id,actor,`restore.from.${req.body.snapshot_id}`);
  await c.query('COMMIT');return res.json({id});
 }catch{await c.query('ROLLBACK');return res.status(500).json({error:'Қалпына келтіру орындалмады. Деректер өзгертілмеді.'});}finally{c.release();}
}
