const assert=require('node:assert/strict');const {randomUUID,createHash}=require('node:crypto');const {Pool}=require('pg');const jwt=require('jsonwebtoken');require('dotenv').config({path:'.env.local',quiet:true});
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},connectionTimeoutMillis:15000});
const userIds=[],testIds=[];let baseline;const rateEmail=randomUUID()+'@example.invalid';const rateKey=createHash('sha256').update('login:account:'+rateEmail).digest('hex');
const call=async(path,token,method='GET',body)=>{const r=await fetch('http://127.0.0.1:4189'+path,{method,signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const t=await r.text();return {status:r.status,data:t?JSON.parse(t):null};};
async function purgeFixtureUsers(ids){const c=await pool.connect();try{await c.query('BEGIN');await c.query("SET LOCAL app.maintenance_user_purge='on'");await c.query("DELETE FROM users WHERE id=ANY($1::int[]) AND email LIKE '%@example.invalid'",[ids]);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
async function main(){try{
 baseline=(await pool.query('SELECT COALESCE(max(id),0) AS id FROM security_events')).rows[0].id;
 for(const role of ['admin','student']){const u=(await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id',['QA security',randomUUID()+'@example.invalid','unused',role])).rows[0];userIds.push(u.id);}
 const [admin,student]=userIds.map((id,i)=>jwt.sign({id,role:i?'student':'admin'},process.env.JWT_SECRET,{expiresIn:'10m'}));

 const target='/api/students/'+userIds[1];
 for(const method of ['GET','PATCH','DELETE']){
  assert.equal((await call(target,null,method,method==='PATCH'?{role:'admin'}:undefined)).status,401);
  assert.equal((await call(target,student,method,method==='PATCH'?{role:'admin'}:undefined)).status,403);
  assert.equal((await call(target,'invalid-token',method,method==='PATCH'?{role:'admin'}:undefined)).status,401);
 }
 await assert.rejects(pool.query('DELETE FROM users WHERE id=$1',[userIds[1]]),e=>e.code==='42501');
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM users WHERE id=$1',[userIds[1]])).rows[0].n,1);
 assert.equal((await call('/api/tests?history=true',null)).status,401);
 assert.equal((await call('/api/tests?history=true',student)).status,403);
 const created=await call('/api/tests',admin,'POST',{title:'QA recovery',subject:'QA',duration_minutes:20,passing_score:50});assert.equal(created.status,201);const id=created.data.id;testIds.push(id);
 const q=await call('/api/questions',admin,'POST',{test_id:id,text:'Recovery question',type:'MULTIPLE_CHOICE',options:[{text:'Yes',is_correct:true},{text:'No',is_correct:false}]});assert.equal(q.status,201);
 assert.equal((await call('/api/tests/'+id,admin,'PATCH',{published:true})).status,200);
 const history=await call('/api/tests?history=true',admin);assert.equal(history.status,200);
 const version=history.data.history.find(r=>r.test_id===id&&r.question_count===1);assert.ok(version);assert.equal(version.actor_name,'QA security');
 assert.equal((await call('/api/tests/'+id,admin,'DELETE')).status,200);
 const archived=await call('/api/tests?history=true',admin);assert.ok(archived.data.history.some(r=>r.test_id===id&&r.action==='tests.delete'));
 const restored=await call('/api/tests?history=true',admin,'POST',{action:'restore',snapshot_id:version.id});assert.equal(restored.status,200);testIds.push(restored.data.id);
 const copy=await call('/api/tests/'+restored.data.id,admin);assert.equal(copy.data.is_published,false);assert.equal(copy.data.questions.length,1);assert.equal(copy.data.questions[0].options.length,2);
 assert.equal((await call('/api/tests?history=true',student,'POST',{action:'restore',snapshot_id:version.id})).status,403);

 await pool.query('INSERT INTO results(user_id,test_id,score,total) VALUES($1,$2,0,1)',[userIds[1],restored.data.id]);
 const archivedUser=await call(target,admin,'DELETE');assert.equal(archivedUser.status,200);assert.equal(archivedUser.data.archived,true);
 assert.ok((await pool.query('SELECT deleted_at FROM users WHERE id=$1',[userIds[1]])).rows[0].deleted_at);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM results WHERE user_id=$1',[userIds[1]])).rows[0].n,1);
 assert.equal((await call('/api/auth/me',student)).status,401);
 await pool.query('UPDATE users SET deleted_at=NULL,tokens_valid_after=NULL WHERE id=$1',[userIds[1]]);
 await pool.query('UPDATE users SET tokens_valid_after=NULL WHERE id=$1',[userIds[1]]);
 assert.equal((await call('/api/students/'+userIds[0],admin,'DELETE')).status,409);
 await pool.query("UPDATE users SET role='student' WHERE id=$1",[userIds[0]]);
 assert.equal((await call('/api/tests?history=true',admin)).status,401);
 await pool.query('UPDATE users SET tokens_valid_after=now() WHERE id=$1',[userIds[1]]);
 assert.equal((await call('/api/auth/me',student)).status,401);
 assert.equal((await call('/api/auth/register',null,'POST',{name:'X',email:'bad',password:'123'})).status,400);
 await pool.query("INSERT INTO security_rate_limits(key,hits,expires_at) VALUES($1,15,now()+interval '15 minutes')",[rateKey]);
 assert.equal((await call('/api/auth/login',null,'POST',{email:rateEmail,password:'not-a-real-password'})).status,429);
 console.log('PASS: unauthenticated/student/forged-token deletion blocked, database hard-delete denied, account archival preserves results, archived session rejected; authorization, actor audit, delete snapshot, exact question/options restore to draft, stale-role and revoked-token rejection, self-deletion guard, password validation.');
 }finally{for(const id of testIds)await pool.query('DELETE FROM tests WHERE id=$1',[id]);await pool.query('DELETE FROM test_history WHERE test_id=ANY($1::text[])',[testIds]);await purgeFixtureUsers(userIds);await pool.query('DELETE FROM security_events WHERE id>$1 AND (target_id=ANY($2::text[]) OR actor_id=ANY($3::int[]))',[baseline,userIds.map(String),userIds]);await pool.query('DELETE FROM security_rate_limits WHERE key=$1',[rateKey]);await pool.end();}}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
