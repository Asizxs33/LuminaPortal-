import {canReadTest} from './test-versions';
import type {VercelRequest,VercelResponse} from './http';
import {Pool} from 'pg';
import jwt from 'jsonwebtoken';
import {createHash} from 'node:crypto';
import {isStaff,ownsTest} from './permissions';
import {requestActor} from './db';
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:10000,max:3});
export function secure(handler:(req:VercelRequest,res:VercelResponse)=>any, route:string){return async(req:VercelRequest,res:VercelResponse)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method==='OPTIONS')return res.status(204).end();
 try{
 if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32)return res.status(503).json({error:'Қызмет уақытша қолжетімсіз.'});
 const publicAuth=route==='auth/[action].ts' && ['login','register','forgot-password','reset-password'].includes(String(req.query.action));
 if(publicAuth){
  if(req.method!=='POST')return res.status(405).end();
  const email=String(req.body?.email||'').trim().toLowerCase();
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  for(const [scope,value,limit] of [['ip',ip,80],['account',email||ip,15]] as const){
   const key=createHash('sha256').update(`${req.query.action}:${scope}:${value}`).digest('hex');
   const row=(await pool.query("INSERT INTO security_rate_limits(key,hits,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN security_rate_limits.expires_at<now() THEN 1 ELSE security_rate_limits.hits+1 END,expires_at=CASE WHEN security_rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE security_rate_limits.expires_at END RETURNING hits",[key])).rows[0];
   if(row.hits>limit){res.setHeader('Retry-After','900');return res.status(429).json({error:'Тым көп әрекет. 15 минуттан кейін қайталаңыз.'});}
  }
  return await handler(req,res);
 }
 const auth=req.headers.authorization;
 if(!auth?.startsWith('Bearer '))return res.status(401).end();
 let claims:any;try{claims=jwt.verify(auth.slice(7),process.env.JWT_SECRET,{algorithms:['HS256']});}catch{return res.status(401).end();}
 if(!Number.isInteger(claims.id)||!Number.isInteger(claims.exp)||claims.purpose)return res.status(401).end();
 const user=(await pool.query('SELECT id,name,role,tokens_valid_after FROM users WHERE id=$1 AND deleted_at IS NULL',[claims.id])).rows[0];
 if(!user||user.role!==claims.role||(user.tokens_valid_after&&(!claims.iat||claims.iat*1000<=new Date(user.tokens_valid_after).getTime())))return res.status(401).json({error:'Қайта кіріңіз.'});
 const adminOnly=route.startsWith('students/')||route.startsWith('admin/')||(route==='tests/index.ts'&&req.query.history==='true')||(route==='tests/[id].ts'&&req.method==='DELETE');
 if(adminOnly&&user.role!=='admin')return res.status(403).end();
 const staffOnly=route==='questions/index.ts'||(route.startsWith('tests/')&&req.method==='PATCH')||(route==='tests/index.ts'&&req.method==='POST')||(route==='results/index.ts'&&req.method==='DELETE');
 if(staffOnly&&!isStaff(user.role))return res.status(403).end();
 if(user.role==='teacher'){
  if(route==='tests/[id].ts'&&['GET','PATCH'].includes(req.method||'')&&!await (req.method==='GET'?canReadTest:ownsTest)(pool,user,req.query.id))return res.status(403).end();
  if(route==='questions/index.ts'){
   const existing=['PATCH','DELETE'].includes(req.method||'')?(await pool.query('SELECT test_id FROM questions WHERE id=$1',[req.query.id])).rows[0]:null;
   if((['PATCH','DELETE'].includes(req.method||'')&&!await ownsTest(pool,user,existing?.test_id))||(req.method!=='DELETE'&&!await ownsTest(pool,user,req.body?.test_id)))return res.status(403).end();
  }
  if(route==='results/index.ts'&&req.query.audit_test&&!await canReadTest(pool,user,req.query.audit_test))return res.status(403).end();
  if(route==='results/index.ts'&&req.method==='DELETE'){
   const ids=req.body?.ids;
   if(!Array.isArray(ids)||!ids.length||ids.some(id=>!Number.isSafeInteger(id)||id<1))return res.status(400).end();
   const allowed=await pool.query('SELECT r.id FROM results r JOIN tests t ON t.id=r.test_id WHERE r.id=ANY($1::int[]) AND t.created_by=$2',[ids,user.id]);
   if(allowed.rowCount!==new Set(ids).size)return res.status(403).end();
  }
 }
 if(req.method==='POST' && (route==='execute.ts'||route==='mentor/hint.ts'||(route==='tests/index.ts'&&req.query.history==='true'))){
  const key=`operation:${route}:${user.id}`;
  const limit=route==='execute.ts'?30:10;
  const row=(await pool.query("INSERT INTO security_rate_limits(key,hits,expires_at) VALUES($1,1,now()+interval '1 minute') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN security_rate_limits.expires_at<now() THEN 1 ELSE security_rate_limits.hits+1 END,expires_at=CASE WHEN security_rate_limits.expires_at<now() THEN now()+interval '1 minute' ELSE security_rate_limits.expires_at END RETURNING hits",[key])).rows[0];
  if(row.hits>limit){res.setHeader('Retry-After','60');return res.status(429).json({error:'Сұраулар тым жиі. Бір минут күтіңіз.'});}
 }
 return await requestActor.run(user,()=>handler(req,res));
 }catch{if(!res.headersSent)return res.status(503).json({error:'Қызмет уақытша қолжетімсіз. Қайта көріңіз.'});}
};}
