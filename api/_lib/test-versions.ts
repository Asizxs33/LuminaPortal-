import {randomUUID} from 'node:crypto';
import {snapshot} from './history';

export const sharedAdminTest = "(t.created_by IS NULL OR EXISTS(SELECT 1 FROM users owner WHERE owner.id=t.created_by AND owner.role='admin'))";
export async function canReadTest(db:any,actor:{id:number;role:string},id:unknown) {
 if(actor.role==='admin')return true;
 if(actor.role!=='teacher'||typeof id!=='string')return false;
 return !!(await db.query(`SELECT 1 FROM tests t WHERE t.id=$1 AND (t.created_by=$2 OR ${sharedAdminTest})`,[id,actor.id])).rowCount;
}
export function testSettings(body:any) {
 const count=Number(body.questions_per_attempt??50),language=body.language??'kk';
 if(!Number.isInteger(count)||count<0||count>5000||!['kk','ru','en'].includes(language))throw Error('invalid_test_settings');
 return {count,language};
}
// A new ID per language and round keeps all previous attempts/results immutable.
export async function createRetake(pool:any,id:string,actor:any) {
 const c=await pool.connect();
 try {
  await c.query('BEGIN');
  const source=(await c.query('SELECT * FROM tests WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(!source)throw Error('not_found');
  const variants=(await c.query('SELECT * FROM tests WHERE language_group=$1 ORDER BY id FOR UPDATE',[source.language_group])).rows;
  if(actor.role!=='admin'&&variants.some((t:any)=>t.created_by!==actor.id))throw Error('forbidden');
  const group=randomUUID();let selected:any;
  for(const test of variants){
   const newId=randomUUID();
   const copy=(await c.query(`INSERT INTO tests(id,title,subject,description,duration_minutes,passing_score,is_published,exam_mode,answers_released,created_by,questions_per_attempt,language,language_group,round_number,previous_test_id)
    VALUES($1,$2,$3,$4,$5,$6,false,$7,false,$8,$9,$10,$11,$12,$13) RETURNING *`,[newId,test.title,test.subject,test.description,test.duration_minutes,test.passing_score,test.exam_mode,actor.id,test.questions_per_attempt,test.language,group,test.round_number+1,test.id])).rows[0];
   const questions=(await c.query('SELECT * FROM questions WHERE test_id=$1 ORDER BY order_index,id',[test.id])).rows;
   for(const q of questions){
    const newQuestion=(await c.query('INSERT INTO questions(test_id,text,type,order_index,test_cases,initial_code,image_url) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',[newId,q.text,q.type,q.order_index,q.test_cases?JSON.stringify(q.test_cases):null,q.initial_code,q.image_url])).rows[0];
    await c.query('INSERT INTO options(question_id,text,is_correct) SELECT $1,text,is_correct FROM options WHERE question_id=$2',[newQuestion.id,q.id]);
   }
   await snapshot(c,newId,actor,'tests.retake');
   if(test.id===id)selected=copy;
  }
  await c.query('COMMIT');return selected;
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
