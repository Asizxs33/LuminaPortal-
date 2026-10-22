const assert=require('node:assert/strict');const crypto=require('node:crypto');const {Pool}=require('pg');const jwt=require('jsonwebtoken');const bcrypt=require('bcryptjs');
require('dotenv').config({path:require('node:path').resolve(__dirname,'../../.env.local'),quiet:true});
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});const base='http://127.0.0.1:4189';const users=[],tests=[];let checks=0;
const token=u=>jwt.sign({id:u.id,role:u.role},process.env.JWT_SECRET,{algorithm:'HS256',expiresIn:'10m'});
async function call(u,path,method='GET',body){const r=await fetch(base+path,{method,headers:{...(u?{Authorization:'Bearer '+token(u)}:{}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});const data=await r.json().catch(()=>null);return {status:r.status,data};}
function expect(r,status,label){assert.equal(r.status,status,label);checks++;}
(async()=>{try{
 const password=await bcrypt.hash(crypto.randomUUID(),4);
 for(const role of ['teacher','teacher','student','admin']){const row=(await pool.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,role',['Role QA',crypto.randomUUID()+'@teacher-qa.invalid',password,role])).rows[0];users.push(row);}
 const [a,b,student,admin]=users;
 expect(await call(null,'/api/tests','POST',{title:'Unauthorized'}),401,'anonymous create');
 expect(await call(student,'/api/tests','POST',{title:'Student create'}),403,'student create');
 const created=await call(a,'/api/tests','POST',{title:'Teacher permission QA',subject:'QA',duration_minutes:10,passing_score:60});expect(created,201,'teacher create');tests.push(created.data.id);const id=created.data.id;
 assert.equal(created.data.created_by,a.id);checks++;
 expect(await call(a,`/api/tests/${id}`),200,'own bank');expect(await call(b,`/api/tests/${id}`),403,'foreign bank');
 const list=await call(a,'/api/tests?all=true');expect(list,200,'own test list');assert(list.data.every(t=>t.created_by===a.id));checks++;
 const question={test_id:id,type:'MULTIPLE_CHOICE',text:'QA question',options:[{text:'A',is_correct:true},{text:'B',is_correct:false}]};
 const q=await call(a,'/api/questions','POST',question);expect(q,201,'own question create');
 expect(await call(b,'/api/questions','POST',question),403,'foreign question create');expect(await call(b,`/api/questions?id=${q.data.id}`,'DELETE'),403,'foreign question delete');
 expect(await call(a,`/api/questions?id=${q.data.id}`,'PATCH',{...question,text:'Updated QA question'}),200,'own question edit');
 expect(await call(a,`/api/tests/${id}`,'PATCH',{published:true}),200,'own publish');expect(await call(b,`/api/tests/${id}`,'PATCH',{published:false}),403,'foreign publish');
 expect(await call(a,`/api/tests/${id}`,'DELETE'),403,'teacher cannot delete own test');
 expect(await call(a,'/api/students'),403,'teacher cannot list users');expect(await call(a,`/api/students/${student.id}`,'DELETE'),403,'teacher cannot delete student');expect(await call(a,`/api/students/${student.id}`,'PATCH',{role:'admin'}),403,'teacher cannot grant role');
 expect(await call(a,'/api/admin/users/grant-coins','POST',{userId:student.id,amount:1}),403,'teacher cannot grant coins');expect(await call(a,'/api/tests?history=true'),403,'teacher cannot read backups');expect(await call(a,'/api/tests?history=true','POST',{action:'backup'}),403,'teacher cannot create global backups');
 const r=(await pool.query('INSERT INTO results(user_id,test_id,score,total,time_spent,review) VALUES($1,$2,1,1,5,$3) RETURNING id',[student.id,id,JSON.stringify([{question_id:q.data.id,text:'QA',selected:'A',correct:'A',is_correct:true}])])).rows[0];
 const ownResults=await call(a,'/api/results');expect(ownResults,200,'teacher results');assert(ownResults.data.some(x=>x.id===r.id));checks++;
 const foreignResults=await call(b,'/api/results');expect(foreignResults,200,'other teacher results');assert(!foreignResults.data.some(x=>x.id===r.id));checks++;
 expect(await call(a,`/api/results?id=${r.id}`),200,'own result details');expect(await call(b,`/api/results?id=${r.id}`),404,'foreign result details');expect(await call(b,`/api/results?audit_test=${id}`),403,'foreign audit');
 expect(await call(b,'/api/results','DELETE',{ids:[r.id]}),403,'foreign result delete');expect(await call(student,'/api/results','DELETE',{ids:[r.id]}),403,'student result delete');expect(await call(a,'/api/results','DELETE',{ids:[r.id]}),200,'own result delete');
 const archive=(await pool.query("SELECT snapshot FROM test_history WHERE test_id=$1 AND action='results.delete' ORDER BY id DESC LIMIT 1",[id])).rows[0];assert(archive.snapshot.results.some(x=>x.id===r.id));checks++;
 expect(await call(admin,`/api/students/${student.id}`,'PATCH',{role:'teacher'}),200,'admin assigns teacher');expect(await call(student,'/api/auth/me'),401,'old role session revoked');
 const fresh={id:student.id,role:'teacher'};await new Promise(resolve=>setTimeout(resolve,1100));expect(await call(fresh,'/api/auth/me'),200,'new teacher session');
 expect(await call(a,`/api/questions?id=${q.data.id}`,'DELETE'),200,'own question delete');
 console.log(`Teacher permissions: ${checks} checks passed.`);
}finally{
 const c=await pool.connect();try{await c.query('BEGIN');await c.query("SET LOCAL app.maintenance_user_purge='on'");const ids=users.map(u=>u.id);if(tests.length)await c.query('DELETE FROM tests WHERE id=ANY($1::text[])',[tests]);await c.query('DELETE FROM test_history WHERE test_id=ANY($1::text[]) OR actor_id=ANY($2::int[])',[tests,ids]);if(ids.length){await c.query('DELETE FROM users WHERE id=ANY($1::int[])',[ids]);await c.query('DELETE FROM security_events WHERE actor_id=ANY($1::int[]) OR target_id=ANY($2::text[])',[ids,ids.map(String)]);}await c.query('COMMIT');console.log('Isolated QA users and tests removed.');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}
}})().catch(e=>{console.error('Teacher permission checks failed:',e.message);process.exitCode=1});
