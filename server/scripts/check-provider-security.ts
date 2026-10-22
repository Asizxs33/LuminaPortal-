// Isolated database fixtures, stubbed providers: no paid AI or compiler requests.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import dotenv from 'dotenv';
import {Pool} from 'pg';
import jwt from 'jsonwebtoken';

async function main() {
 dotenv.config({path:'.env.local',quiet:true});
 const db=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});
 process.env.OPENAI_API_KEY='isolated-provider-stub';
 const {default:mentor}=await import('../../api/mentor/hint');
 const {default:execute}=await import('../../api/execute');
 const {boundedJson}=await import('../../api/_lib/bounded-json');
 const users:number[]=[];const testId=randomUUID();let count=0,calls=0;
 const realFetch=globalThis.fetch;
 let providerMode='ok';
 globalThis.fetch=async()=>{
  calls++;
  await new Promise(r=>setTimeout(r,40));
  if(providerMode==='error')return new Response('{}',{status:503});
  if(providerMode==='large')return new Response('x'.repeat(256001));
  return new Response(JSON.stringify({choices:[{message:{content:'Stub hint'}}],status:'0',program_output:'2'}));
 };
 async function call(handler:any,userId:number,role:string,body:any){
  const token=jwt.sign({id:userId,role},process.env.JWT_SECRET!,{algorithm:'HS256',expiresIn:'5m'});
  const req={method:'POST',headers:{authorization:`Bearer ${token}`},query:{},body};
  const res:any={statusCode:200,headersSent:false,setHeader(){},status(n:number){this.statusCode=n;return this;},json(data:any){this.data=data;this.headersSent=true;return this;},end(){this.headersSent=true;return this;}};
  await handler(req,res);return res;
 }
 const check=(value:unknown,label:string)=>{assert.ok(value,label);count++;};
 try{
  for(const role of ['student','teacher']){
   users.push((await db.query('INSERT INTO users(name,email,password_hash,role,coins) VALUES($1,$2,$3,$4,10) RETURNING id',['Provider QA',randomUUID()+'@example.invalid','unused',role])).rows[0].id);
  }
  await db.query('INSERT INTO tests(id,title,subject,duration_minutes,passing_score,is_published,exam_mode,created_by) VALUES($1,$2,$3,10,50,true,false,$4)',[testId,'Provider QA','QA',users[1]]);
  const q=(await db.query('INSERT INTO questions(test_id,type,text,order_index,test_cases) VALUES($1,$2,$3,0,$4) RETURNING id',[testId,'CODE','Print 2',JSON.stringify([{input:'',expected_output:'2'}])])).rows[0].id;
  const hintBody={test_id:testId,questionText:'Help with this code',userCode:'print(2)'};
  const concurrent=await Promise.all([call(mentor,users[0],'student',hintBody),call(mentor,users[0],'student',hintBody)]);
  check(concurrent.filter(r=>r.statusCode===200).length===1,'Only one concurrent debit succeeds');
  check(concurrent.filter(r=>r.statusCode===403).length===1,'Insufficient balance denies second request');
  check(calls===1,'Denied debit never calls AI provider');
  check((await db.query('SELECT coins FROM users WHERE id=$1',[users[0]])).rows[0].coins===0,'Balance stays non-negative');
  await db.query('UPDATE users SET coins=10 WHERE id=$1',[users[0]]);providerMode='error';
  check((await call(mentor,users[0],'student',hintBody)).statusCode===500,'Provider failure reported');
  check((await db.query('SELECT coins FROM users WHERE id=$1',[users[0]])).rows[0].coins===10,'Provider failure rolls back debit');
  providerMode='ok';calls=0;
  const codeBody={test_id:testId,question_id:q,language:'python',code:'print(2)'};
  check((await call(execute,users[0],'student',codeBody)).statusCode===403,'Unassigned question denied');
  await db.query('INSERT INTO test_question_assignments(user_id,test_id,question_id) VALUES($1,$2,$3)',[users[0],testId,q]);
  await db.query('UPDATE tests SET is_published=false WHERE id=$1',[testId]);
  check((await call(execute,users[0],'student',codeBody)).statusCode===403,'Closed test denied');
  await db.query('UPDATE tests SET is_published=true WHERE id=$1',[testId]);
  check((await call(execute,users[0],'student',{...codeBody,code:'x'.repeat(50001)})).statusCode===400,'Oversized code denied');
  check(calls===0,'Rejected executions never call compiler');
  const success=await call(execute,users[0],'student',codeBody);
  check(success.statusCode===200&&success.data.status==='PASSED','Assigned published code runs');
  check(!!success.data.proof,'Successful run retains grading proof');
  providerMode='error';check((await call(execute,users[0],'student',codeBody)).statusCode===502,'Compiler failure handled');
  providerMode='large';check((await call(execute,users[0],'student',codeBody)).statusCode===500,'Oversized compiler response rejected');
  await assert.rejects(boundedJson(new Response('x'.repeat(11)),10),/too large/);count++;
  console.log(`PASS: ${count} provider security checks; AI/compiler calls were stubbed.`);
 }finally{
  globalThis.fetch=realFetch;
  const c=await db.connect();try{
   await c.query('BEGIN');await c.query("SET LOCAL app.maintenance_user_purge='on'");
   await c.query('DELETE FROM tests WHERE id=$1',[testId]);
   await c.query('DELETE FROM test_history WHERE test_id=$1',[testId]);
   await c.query('DELETE FROM security_rate_limits WHERE key=ANY($1::text[])',[users.flatMap(id=>[`operation:execute.ts:${id}`,`operation:mentor/hint.ts:${id}`])]);
   await c.query("DELETE FROM users WHERE id=ANY($1::int[]) AND email LIKE '%@example.invalid'",[users]);
   await c.query('DELETE FROM security_events WHERE actor_id=ANY($1::int[]) OR target_id=ANY($2::text[])',[users,[testId,...users.map(String)]]);
   await c.query('COMMIT');console.log('Isolated QA fixtures removed.');
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await db.end();}
 }
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error.message);process.exit(1);});
