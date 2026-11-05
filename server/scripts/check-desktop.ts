import 'dotenv/config';
import dotenv from 'dotenv';import {Pool} from 'pg';import jwt from 'jsonwebtoken';import {randomUUID} from 'node:crypto';import assert from 'node:assert/strict';import fs from 'node:fs';
import {exportDesktop,gradeDesktop,importDesktop,digest,DesktopError} from '../../api/_lib/desktop';
dotenv.config({path:'.env.local',quiet:true});
const db=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});const users:any[]=[],ids:string[]=[];let checks=0;
const ok=(condition:any,label:string)=>{assert.ok(condition,label);checks++;};
async function rejected(fn:()=>any,status:number){await assert.rejects(fn,(e:any)=>e instanceof DesktopError&&e.status===status);checks++;}
async function run(){try{
 for(const role of ['admin','teacher','student'])users.push((await db.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,role,email',['Desktop QA',randomUUID()+'@example.invalid','unused',role])).rows[0]);
 const [admin,teacher,student]=users,group=randomUUID();
 for(const language of ['kk','ru']){const id=randomUUID();ids.push(id);await db.query('INSERT INTO tests(id,title,subject,created_by,language,language_group,duration_minutes,passing_score,questions_per_attempt) VALUES($1,$2,$3,$4,$5,$6,10,50,2)',[id,'Lumina — пробный тест','Информатика',admin.id,language,group]);for(let i=1;i<=4;i++){const q=(await db.query('INSERT INTO questions(test_id,text,type) VALUES($1,$2,$3) RETURNING id',[id,language==='kk'?`Екілік жүйенің негізі қандай? (${i})`:`Какое основание у двоичной системы? (${i})`,'single'])).rows[0];await db.query("INSERT INTO options(question_id,text,is_correct) VALUES($1,'2',true),($1,'10',false),($1,'16',false)",[q.id]);}}
 await rejected(()=>exportDesktop(db,student,ids[0]),403);await rejected(()=>exportDesktop(db,teacher,ids[0]),403);
 const file=await exportDesktop(db,admin,ids[0]);ok(file.package.tests.length===2,'Bilingual export');ok(file.package.tests.every(t=>t.questions.length===4),'Entire bank exported');
 // A safe, artificial sample for visual testing; it is not submitted to production.
 fs.mkdirSync('marketing-assets',{recursive:true});fs.writeFileSync('marketing-assets/desktop-demo.lumina-test',JSON.stringify(file));
 const t=file.package.tests[0];const qs=t.questions.slice(0,2);const submission={file,test_id:t.id,question_ids:qs.map(q=>q.id),answers:Object.fromEntries(qs.map(q=>[q.id,q.options.find(o=>o.is_correct)!.id])),submission_id:randomUUID(),time_spent:12,student_email:student.email};
 ok(gradeDesktop({...submission,score:9999}).score===2,'Score recomputed from signed snapshot');
 const corrupt=structuredClone(submission);corrupt.file.package.tests[0].questions[0].options[0].is_correct=false;await rejected(async()=>gradeDesktop(corrupt),400);
 const otherProof={...submission,file:{...file,proof:jwt.sign({purpose:'attempt',hash:digest(file.package)},process.env.JWT_SECRET!)}};await rejected(async()=>gradeDesktop(otherProof),400);
 await rejected(async()=>gradeDesktop({...submission,file:{...file,proof:jwt.sign({purpose:'desktop-package',hash:digest(file.package)},process.env.JWT_SECRET!,{expiresIn:-1})}}),400);
 await rejected(async()=>gradeDesktop({...submission,question_ids:[qs[0].id,qs[0].id]}),400);
 await rejected(async()=>gradeDesktop({...submission,question_ids:[qs[0].id]}),400);
 await rejected(async()=>gradeDesktop({...submission,question_ids:[qs[0].id,-1]}),400);
 await rejected(async()=>gradeDesktop({...submission,time_spent:601}),400);
 await rejected(()=>importDesktop(db,teacher,submission),403);
 await rejected(()=>importDesktop(db,student,{...submission,student_email:'other@example.invalid'}),403);
 const first=await importDesktop(db,student,submission);ok(first.score===2&&first.total===2&&first.source==='desktop_offline','Offline result recorded and labelled');
 const duplicate=await importDesktop(db,student,submission);ok(duplicate.id===first.id,'Repeat upload is idempotent');
 const second=await importDesktop(db,student,{...submission,submission_id:randomUUID(),answers:{}});ok(second.id!==first.id&&second.score===0,'New attempt saved independently');
 ok((await db.query('SELECT count(*)::int n FROM results WHERE user_id=$1',[student.id])).rows[0].n===2,'Both results retained');
 await db.query("UPDATE questions SET text='Updated later' WHERE test_id=$1",[t.id]);ok(gradeDesktop(submission).review[0].text!=='Updated later','Offline review uses exported snapshot');
 await db.query("UPDATE questions SET type='CODE' WHERE id=$1",[qs[0].id]);await rejected(()=>exportDesktop(db,admin,t.id),422);
 console.log(`${checks} desktop integration checks passed; only isolated QA fixtures used.`);
 }finally{const c=await db.connect();try{await c.query('BEGIN');await c.query("SET LOCAL app.maintenance_user_purge='on'");await c.query('DELETE FROM results WHERE user_id=ANY($1::int[])',[users.map(u=>u.id)]);await c.query('DELETE FROM tests WHERE id=ANY($1::text[])',[ids]);await c.query('DELETE FROM test_history WHERE test_id=ANY($1::text[])',[ids]);await c.query("DELETE FROM users WHERE id=ANY($1::int[]) AND email LIKE '%@example.invalid'",[users.map(u=>u.id)]);await c.query('DELETE FROM security_events WHERE actor_id=ANY($1::int[]) OR target_id=ANY($2::text[])',[users.map(u=>u.id),ids]);await c.query('COMMIT');console.log('Isolated desktop fixtures removed.');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await db.end();}}}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
