import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { gradeChoice } from './grading';
import { hideReview } from './exams';

export async function submitExam(pool:any, req:any, res:any, user:any, token:any, test:any) {
 const c=await pool.connect();
 try {
  await c.query('BEGIN');
  const a=(await c.query('SELECT *,NOW() AS server_now FROM exam_attempts WHERE id=$1 AND user_id=$2 AND test_id=$3 FOR UPDATE',[token.exam_attempt_id,user.id,test.id])).rows[0];
  if(!a){await c.query('ROLLBACK');return res.status(400).json({error:'Емтихан сессиясы табылмады.'});}
  const existing=(await c.query('SELECT * FROM results WHERE user_id=$1 AND submission_id=$2',[user.id,a.id])).rows[0];
  const hidden=user.role!=='admin'&&!test.answers_released;
  if(existing){await c.query('COMMIT');return res.json(hideReview(existing,hidden));}
  const active=new Date(a.deadline)>new Date(a.server_now)&&!test.answers_released;
  const answers=active?(req.body.answers||{}):a.answers;
  const codes=active?(req.body.code_answers||{}):a.code_answers;
  const proofs=active?(req.body.code_proofs||{}):a.code_proofs;
  const review=a.questions.map((q:any)=>{
   if(q.type!=='CODE')return gradeChoice(q,q.options,answers[q.id]);
   let correct=false;
   try{const p:any=jwt.verify(proofs[q.id],process.env.JWT_SECRET!);correct=p.purpose==='code-grade'&&String(p.user_id)===String(user.id)&&p.question_id===q.id&&p.passed&&p.code_hash===createHash('sha256').update(codes[q.id]||'').digest('hex');}catch{}
   return {question_id:q.id,type:q.type,text:q.text,selected:codes[q.id]||null,correct:'Код барлық тексерулерден өтуі керек.',is_correct:!!correct};
  });
  const elapsed=Math.max(0,Math.floor((Math.min(new Date(a.server_now).getTime(),new Date(a.deadline).getTime())-new Date(a.started_at).getTime())/1000));
  const result=(await c.query('INSERT INTO results(user_id,test_id,score,total,time_spent,review,submission_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[user.id,test.id,review.filter((r:any)=>r.is_correct).length,review.length,elapsed,JSON.stringify(review),a.id])).rows[0];
  await c.query('UPDATE exam_attempts SET finished=true WHERE id=$1',[a.id]);
  await c.query('COMMIT');return res.status(201).json(hideReview(result,hidden));
 }catch{await c.query('ROLLBACK');return res.status(500).json({error:'Нәтиже сақталмады. Қайта жіберіңіз.'});}finally{c.release();}
}
