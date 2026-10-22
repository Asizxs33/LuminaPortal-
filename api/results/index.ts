import {snapshot} from '../_lib/history';
import {isStaff} from '../_lib/permissions';
import { secure } from '../_lib/secure';
import { hideReview } from '../_lib/exams';
import { submitExam } from '../_lib/submit-exam';
import type { VercelRequest, VercelResponse } from '../_lib/http';
import { Pool } from '../_lib/db';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { session } from '../_lib/session';
import { gradeChoice } from '../_lib/grading';
const pool=new Pool({connectionTimeoutMillis:10000,connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});
async function handler(req:VercelRequest,res:VercelResponse) {
 if(req.method==='OPTIONS')return res.status(200).end();
 const user=session(req);if(!user)return res.status(401).json({error:'Кіру қажет.'});
 try {
  if(req.method==='POST') {
   const {test_id,submission_id,attempt_token,answers={},code_answers={},code_proofs={},time_spent=0}=req.body||{};
   if(!test_id || typeof submission_id!=='string' || submission_id.length>100) return res.status(400).json({error:'Жарамсыз әрекет.'});
   let attempt:any;try{attempt=jwt.verify(attempt_token,process.env.JWT_SECRET!);}catch{return res.status(400).json({error:'Тест сессиясы жарамсыз. Тестті қайта ашыңыз.'});}
   if(attempt.purpose!=='attempt'||String(attempt.user_id)!==String(user.id)||attempt.test_id!==test_id)return res.status(403).end();
   const test=(await pool.query('SELECT * FROM tests WHERE id=$1',[test_id])).rows[0];
   if(!test)return res.status(404).end();
   if(test.exam_mode){if(!attempt.exam_attempt_id)return res.status(400).json({error:'Емтиханды қайта ашыңыз.'});return await submitExam(pool,req,res,user,attempt,test);}
   const existing=await pool.query('SELECT * FROM results WHERE user_id=$1 AND submission_id=$2',[user.id,submission_id]);
   if(existing.rows[0])return res.json(existing.rows[0]);
   const questions=await pool.query('SELECT * FROM questions WHERE test_id=$1 AND id=ANY($2::int[])',[test_id,attempt.question_ids]);
   const options=await pool.query('SELECT * FROM options WHERE question_id=ANY($1::int[])',[attempt.question_ids]);
   const review=attempt.question_ids.map((qid:number)=>{
    const q=questions.rows.find(q=>q.id===qid);
    if(!q)throw Error('Question changed');
    if(q.type!=='CODE')return gradeChoice(q,options.rows.filter(o=>o.question_id===qid),answers[qid]);
    let correct=false;try{const proof:any=jwt.verify(code_proofs[qid],process.env.JWT_SECRET!);correct=proof.purpose==='code-grade'&&String(proof.user_id)===String(user.id)&&proof.question_id===qid&&proof.passed&&proof.code_hash===createHash('sha256').update(code_answers[qid]||'').digest('hex');}catch{}
    return {question_id:qid,type:'CODE',text:q.text,selected:code_answers[qid]||null,correct:'Код барлық тексеру мысалдарынан өтуі керек.',is_correct:!!correct};
   });
   const score=review.filter((q:any)=>q.is_correct).length;
   const result=await pool.query(`INSERT INTO results(user_id,test_id,score,total,time_spent,review,submission_id) VALUES($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT(user_id,submission_id) WHERE submission_id IS NOT NULL DO UPDATE SET submission_id=EXCLUDED.submission_id RETURNING *`,[user.id,test_id,score,review.length,Math.max(0,Math.floor(Number(time_spent)||0)),JSON.stringify(review),submission_id]);
   return res.status(201).json(result.rows[0]);
  }
  if(req.method==='GET') {
   if(req.query.audit_test && isStaff(user.role))return res.json((await pool.query('SELECT a.id,a.user_id,u.name,a.started_at,a.deadline,a.finished,a.events FROM exam_attempts a JOIN users u ON u.id=a.user_id WHERE a.test_id=$1 ORDER BY a.started_at DESC',[req.query.audit_test])).rows);
   if(req.query.id) {
    const result=await pool.query('SELECT r.*,t.title AS test_title,t.subject,t.passing_score,t.exam_mode,t.answers_released FROM results r JOIN tests t ON t.id=r.test_id WHERE r.id=$1 AND (r.user_id=$2 OR $3 OR (t.created_by=$2 AND $4))',[req.query.id,user.id,user.role==='admin',user.role==='teacher']);
    return res.status(result.rows[0]?200:404).json(result.rows[0]?hideReview(result.rows[0],!isStaff(user.role)&&result.rows[0].exam_mode&&!result.rows[0].answers_released):{error:'Нәтиже табылмады.'});
   }
   if(!isStaff(user.role))return res.status(403).end();
   return res.json((await pool.query('SELECT r.id,r.user_id,r.test_id,r.score,r.total,r.time_spent,r.completed_at,u.name AS student_name,u.email,t.title AS test_title,t.subject,t.passing_score FROM results r JOIN users u ON r.user_id=u.id JOIN tests t ON r.test_id=t.id WHERE ($1::boolean OR t.created_by=$2) ORDER BY r.completed_at DESC',[user.role==='admin',user.id])).rows);
  }
  if(req.method==='DELETE' && isStaff(user.role)) {
   const {ids}=req.body||{};if(!Array.isArray(ids)||!ids.length)return res.status(400).end();
   const c=await pool.connect();try{await c.query('BEGIN');const affected=(await c.query('SELECT DISTINCT r.test_id FROM results r JOIN tests t ON t.id=r.test_id WHERE r.id=ANY($1::int[]) AND ($2::boolean OR t.created_by=$3)',[ids,user.role==='admin',user.id])).rows;for(const row of affected)await snapshot(c,row.test_id,user,'results.delete');const deleted=await c.query('DELETE FROM results r USING tests t WHERE r.test_id=t.id AND r.id=ANY($1::int[]) AND ($2::boolean OR t.created_by=$3) RETURNING r.id',[ids,user.role==='admin',user.id]);await c.query('COMMIT');return res.json({success:true,deleted_count:deleted.rowCount});}catch{await c.query('ROLLBACK');throw Error('Delete failed');}finally{c.release();}
  }
  return res.status(405).end();
 }catch{return res.status(500).json({error:'Нәтижені сақтау немесе оқу мүмкін болмады. Жауаптарыңыз құрылғыда сақталған.'});}
}

export default secure(handler, 'results/index.ts');
