import { snapshot } from '../_lib/history';
import { secure } from '../_lib/secure';
import type { VercelRequest, VercelResponse } from '../_lib/http';
import { Pool } from '../_lib/db';
import { session } from '../_lib/session';
const pool = new Pool({connectionTimeoutMillis:10000,connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});
async function handler(req:VercelRequest,res:VercelResponse) {
  if(req.method==='OPTIONS') return res.status(200).end();
  const user=session(req);
  if(!user) return res.status(401).json({error:'Кіру қажет.'});
  if(user.role!=='admin') return res.status(403).json({error:'Мұғалім рұқсаты қажет.'});
  const client=await pool.connect();
  try {
    if(req.method==='DELETE') {
      const result=await client.query('DELETE FROM questions WHERE id=$1 RETURNING id',[req.query.id]);
      return res.status(result.rowCount?200:404).json({success:!!result.rowCount});
    }
    if(!['POST','PATCH'].includes(req.method||'')) return res.status(405).end();
    const {text,type='MULTIPLE_CHOICE',options,initial_code,test_cases,test_id,image_url}=req.body||{};
    if(!text?.trim() || !test_id || !['MULTIPLE_CHOICE','CODE'].includes(type)) return res.status(400).json({error:'Сұрақ мәтіні мен тест қажет.'});
    if(type==='MULTIPLE_CHOICE' && (!Array.isArray(options)||options.length<2||options.some(o=>!o.text?.trim())||options.filter(o=>o.is_correct===true).length!==1)) return res.status(400).json({error:'Кемінде 2 жауап және бір дұрыс жауап белгілеңіз.'});
    if(type==='CODE' && (!Array.isArray(test_cases)||!test_cases.length||test_cases.some(t=>typeof t.expected_output!=='string'))) return res.status(400).json({error:'Код сұрағына тексеру мысалын қосыңыз.'});
    await client.query('BEGIN');
    const args=[test_id,text.trim(),type,initial_code||null,test_cases?JSON.stringify(test_cases):null,image_url||null];
    const saved=req.method==='POST'
      ? await client.query('INSERT INTO questions(test_id,text,type,initial_code,test_cases,image_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',args)
      : await client.query('UPDATE questions SET text=$2,type=$3,initial_code=$4,test_cases=$5,image_url=$6 WHERE test_id=$1 AND id=$7 RETURNING *',[...args,req.query.id]);
    if(!saved.rows[0]) {await client.query('ROLLBACK');return res.status(404).json({error:'Сұрақ табылмады.'});}
    const id=saved.rows[0].id;
    if(req.method==='PATCH') await client.query('DELETE FROM options WHERE question_id=$1',[id]);
    if(type==='MULTIPLE_CHOICE') for(const option of options) await client.query('INSERT INTO options(question_id,text,is_correct) VALUES($1,$2,$3)',[id,option.text.trim(),option.is_correct===true]);
    if(req.method==='POST')await snapshot(client,String(test_id),user,'questions.create');
    await client.query('COMMIT');
    return res.status(req.method==='POST'?201:200).json(saved.rows[0]);
  } catch { await client.query('ROLLBACK');return res.status(500).json({error:'Сұрақ сақталмады. Қайта көріңіз.'}); }
  finally { client.release(); }
}

export default secure(handler, 'questions/index.ts');
