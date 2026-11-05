import jwt from 'jsonwebtoken';
import {createHash,randomUUID} from 'node:crypto';
import {isStaff,ownsTest} from './permissions';
import {gradeChoice} from './grading';

export const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export class DesktopError extends Error {constructor(public status:number,message:string){super(message);}}
export async function exportDesktop(pool:any,actor:any,id:string){
 if(!isStaff(actor.role)||!await ownsTest(pool,actor,id))throw new DesktopError(403,'Тек өз тестіңізді жүктей аласыз.');
 const c=await pool.connect();
 try{
  await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const source=(await c.query('SELECT * FROM tests WHERE id=$1',[id])).rows[0];
  if(!source)throw new DesktopError(404,'Тест табылмады.');
  const variants=(await c.query('SELECT * FROM tests WHERE language_group=$1 ORDER BY language',[source.language_group])).rows;
  const tests=[];
  for(const t of variants){
   if(actor.role!=='admin'&&t.created_by!==actor.id)throw new DesktopError(403,'Бұл нұсқаны жүктеуге рұқсат жоқ.');
   const questions=(await c.query('SELECT * FROM questions WHERE test_id=$1 ORDER BY order_index,id',[t.id])).rows;
   if(!questions.length)throw new DesktopError(422,'Барлық тіл нұсқаларына сұрақ қосыңыз.');
   if(questions.length>5000)throw new DesktopError(422,'Бір нұсқада 5000 сұрақтан артық болмауы керек.');
   if(questions.some((q:any)=>q.type==='CODE'||q.image_url))throw new DesktopError(422,'Қазір бағдарламаға тек суретсіз таңдау сұрақтары жүктеледі. Код пен сурет бар тестті сайтта өткізіңіз.');
   const options=(await c.query('SELECT o.* FROM options o JOIN questions q ON q.id=o.question_id WHERE q.test_id=$1 ORDER BY o.id',[t.id])).rows;
   const bank=questions.map((q:any)=>({id:q.id,text:q.text,type:q.type,options:options.filter((o:any)=>o.question_id===q.id).map((o:any)=>({id:o.id,text:o.text,is_correct:o.is_correct}))}));
   if(bank.some((q:any)=>q.options.length<2||q.options.filter((o:any)=>o.is_correct).length!==1))throw new DesktopError(422,'Әр сұрақта кемінде екі нұсқа және бір дұрыс жауап болуы керек.');
   tests.push({id:t.id,title:t.title,subject:t.subject||'',language:t.language,round:t.round_number,duration_minutes:t.duration_minutes,passing_score:t.passing_score,questions_per_attempt:t.questions_per_attempt,questions:bank});
  }
  const data={id:randomUUID(),exported_at:new Date().toISOString(),tests};
  if(Buffer.byteLength(JSON.stringify(data))>4_000_000)throw new DesktopError(413,'Тест файлы тым үлкен.');
  const proof=jwt.sign({purpose:'desktop-package',hash:digest(data)},process.env.JWT_SECRET!,{algorithm:'HS256',expiresIn:'180d'});
  await c.query('COMMIT');return {format:'lumina-test',version:1,package:data,proof};
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}

export function gradeDesktop(body:any){
 const {file,test_id,question_ids,answers,submission_id,time_spent}=body||{};
 if(file?.format!=='lumina-test'||file.version!==1||typeof file.proof!=='string'||!file.package||Buffer.byteLength(JSON.stringify(file.package))>4_000_000)throw new DesktopError(400,'Тест файлы жарамсыз.');
 let proof:any;try{proof=jwt.verify(file.proof,process.env.JWT_SECRET!,{algorithms:['HS256']});}catch{throw new DesktopError(400,'Файлдың қолтаңбасы жарамсыз немесе мерзімі өткен.');}
 if(proof.purpose!=='desktop-package'||proof.hash!==digest(file.package))throw new DesktopError(400,'Тест файлы өзгертілген.');
 const test=file.package.tests.find((t:any)=>t.id===test_id);
 if(!test||!Array.isArray(question_ids)||!question_ids.length||new Set(question_ids).size!==question_ids.length||!answers||typeof answers!=='object'||Array.isArray(answers)||typeof submission_id!=='string'||!/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(submission_id)||!Number.isSafeInteger(time_spent)||time_spent<0||time_spent>test.duration_minutes*60)throw new DesktopError(400,'Жауаптар жарамсыз.');
 const count=test.questions_per_attempt===0?test.questions.length:Math.min(test.questions_per_attempt,test.questions.length);
 if(question_ids.length!==count)throw new DesktopError(400,'Сұрақтар саны сәйкес емес.');
 const review=question_ids.map((id:any)=>{const q=test.questions.find((q:any)=>q.id===id);if(!q)throw new DesktopError(400,'Бөгде сұрақ.');return gradeChoice(q,q.options,answers[id]);});
 return {test,review,score:review.filter((q:any)=>q.is_correct).length,submission_id,time_spent};
}

export async function importDesktop(pool:any,actor:any,body:any){
 if(actor.role!=='student')throw new DesktopError(403,'Нәтижені студент өз аккаунтына жібереді.');
 const graded=gradeDesktop(body);
 const c=await pool.connect();
 try{
  await c.query('BEGIN');
  const student=(await c.query('SELECT email FROM users WHERE id=$1 AND deleted_at IS NULL',[actor.id])).rows[0];
  if(!student||typeof body.student_email!=='string'||student.email.toLowerCase()!==body.student_email.trim().toLowerCase())throw new DesktopError(403,'Файлдағы студенттің аккаунтына кіріңіз.');
  const test=(await c.query('SELECT id FROM tests WHERE id=$1 FOR KEY SHARE',[graded.test.id])).rows[0];
  if(!test)throw new DesktopError(404,'Тест сайтта табылмады.');
  const result=(await c.query(`INSERT INTO results(user_id,test_id,score,total,time_spent,review,submission_id,source)
   VALUES($1,$2,$3,$4,$5,$6,$7,'desktop_offline') ON CONFLICT(user_id,submission_id) WHERE submission_id IS NOT NULL DO UPDATE SET submission_id=EXCLUDED.submission_id RETURNING *`,[actor.id,graded.test.id,graded.score,graded.review.length,graded.time_spent,JSON.stringify(graded.review),`desktop:${graded.submission_id}`])).rows[0];
  await c.query('COMMIT');return {id:result.id,score:result.score,total:result.total,source:result.source};
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
