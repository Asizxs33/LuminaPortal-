// Encrypted, consistent logical data backup. Never prints secrets or row values.
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const {Pool}=require('pg');
require('dotenv').config({path:'.env.local',quiet:true});
const args=process.argv.slice(2);const mode=args[0]||'create';
const key=Buffer.from(process.env.BACKUP_ENCRYPTION_KEY||'','hex');
const quote=s=>'"'+s.replaceAll('"','""')+'"';
const connect=url=>new Pool({connectionString:url,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:15000,max:1});
async function read(file){const data=JSON.parse(await fs.readFile(file,'utf8'));const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(data.iv,'hex'));decipher.setAuthTag(Buffer.from(data.tag,'hex'));const payload=JSON.parse(Buffer.concat([decipher.update(Buffer.from(data.data,'base64')),decipher.final()]).toString());if(payload.version!==1)throw Error('Unsupported backup');return payload;}
async function main(){
 if(key.length!==32)throw Error('BACKUP_ENCRYPTION_KEY must contain 64 hexadecimal characters');
 if(mode==='verify'){const p=await read(args[1]);
  if(args.includes('--roundtrip')){const pool=connect(process.env.DATABASE_URL),c=await pool.connect();try{await c.query('BEGIN');
   for(const t of p.tables){
    const temp='backup_check_'+crypto.randomBytes(6).toString('hex');
    await c.query(`CREATE TEMP TABLE ${quote(temp)} (LIKE public.${quote(t.name)} INCLUDING DEFAULTS) ON COMMIT DROP`);
    if(t.rows.length)await c.query(`INSERT INTO ${quote(temp)} SELECT * FROM jsonb_populate_recordset(NULL::public.${quote(t.name)},$1::jsonb)`,[JSON.stringify(t.rows)]);
    const count=Number((await c.query(`SELECT count(*) FROM ${quote(temp)}`)).rows[0].count);
    if(count!==t.rows.length)throw Error('Roundtrip row count mismatch');
    // PostgreSQL JSONB comparison checks every column value, irrespective of row order.
    const mismatch=(await c.query(`SELECT count(*) FROM ((SELECT to_jsonb(r) AS value FROM ${quote(temp)} r EXCEPT SELECT to_jsonb(r) FROM jsonb_populate_recordset(NULL::public.${quote(t.name)},$1::jsonb) r) UNION ALL (SELECT to_jsonb(r) FROM jsonb_populate_recordset(NULL::public.${quote(t.name)},$1::jsonb) r EXCEPT SELECT to_jsonb(r) FROM ${quote(temp)} r)) differences`,[JSON.stringify(t.rows)])).rows[0].count;
    if(Number(mismatch))throw Error('Roundtrip content mismatch');
   }await c.query('ROLLBACK');console.log('Roundtrip restored every table into isolated temporary tables; all values matched.');
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}}
  console.log(`Backup authenticated: ${p.tables.length} tables, ${p.tables.reduce((n,t)=>n+t.rows.length,0)} rows. Created ${p.created_at}`);return;}
 if(mode==='restore'){
  if(args[2]!=='--confirm-empty-target'||!process.env.RESTORE_DATABASE_URL||process.env.RESTORE_DATABASE_URL===process.env.DATABASE_URL)throw Error('Use a separate empty migrated target and --confirm-empty-target');
  const payload=await read(args[1]);const pool=connect(process.env.RESTORE_DATABASE_URL);const c=await pool.connect();
  try{await c.query('BEGIN');
   for(const t of payload.tables){if(Number((await c.query(`SELECT count(*) FROM public.${quote(t.name)}`)).rows[0].count))throw Error('Target must be empty');}
   for(const t of payload.tables)await c.query(`ALTER TABLE public.${quote(t.name)} DISABLE TRIGGER USER`);
   const pending=[...payload.tables],done=new Set();
   while(pending.length){const i=pending.findIndex(t=>t.dependencies.every(d=>d===t.name||done.has(d)||!payload.tables.some(x=>x.name===d)));if(i<0)throw Error('Cyclic dependencies require manual recovery');const t=pending.splice(i,1)[0];
    if(t.rows.length)await c.query(`INSERT INTO public.${quote(t.name)} SELECT * FROM jsonb_populate_recordset(NULL::public.${quote(t.name)}, $1::jsonb)`,[JSON.stringify(t.rows)]);done.add(t.name);
   }
   // Restored sessions must be reauthenticated; one-time reset links expire.
   await c.query('UPDATE users SET tokens_valid_after=now()');await c.query('DELETE FROM password_reset_requests');
   for(const t of payload.tables)for(const col of t.serials){await c.query("SELECT setval(pg_get_serial_sequence($1,$2),GREATEST(COALESCE((SELECT max("+quote(col)+") FROM public."+quote(t.name)+"),0),1),true)",['public.'+t.name,col]);}
   for(const t of payload.tables)await c.query(`ALTER TABLE public.${quote(t.name)} ENABLE TRIGGER USER`);
   await c.query('COMMIT');console.log('Data restored into separate target. Validate before switching traffic.');
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}return;
 }
 if(mode!=='create')throw Error('Usage: backup.cjs create | verify FILE | restore FILE --confirm-empty-target');
 const pool=connect(process.env.DATABASE_URL);const c=await pool.connect();let payload;
 try{await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const names=(await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows;
  const tables=[];
  for(const {tablename:name} of names){const rows=(await c.query(`SELECT * FROM public.${quote(name)}`)).rows;
   const dependencies=(await c.query("SELECT DISTINCT parent.relname AS table_name FROM pg_constraint fk JOIN pg_class child ON child.oid=fk.conrelid JOIN pg_namespace ns ON ns.oid=child.relnamespace JOIN pg_class parent ON parent.oid=fk.confrelid WHERE fk.contype='f' AND ns.nspname='public' AND child.relname=$1",[name])).rows.map(r=>r.table_name);
   const serials=(await c.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_default LIKE 'nextval%'",[name])).rows.map(r=>r.column_name);
   tables.push({name,rows,dependencies,serials});
  }payload={version:1,created_at:new Date().toISOString(),tables};await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const encrypted=Buffer.concat([cipher.update(JSON.stringify(payload)),cipher.final()]);
 const folder=path.resolve('backups');await fs.mkdir(folder,{recursive:true});const file=path.join(folder,`lumina-${new Date().toISOString().replace(/[:.]/g,'-')}.enc.json`);
 await fs.writeFile(file,JSON.stringify({version:1,iv:iv.toString('hex'),tag:cipher.getAuthTag().toString('hex'),data:encrypted.toString('base64')}),{flag:'wx',mode:0o600});
 await read(file);console.log(`Encrypted backup saved and authenticated: ${file}`);
}
main().catch(e=>{console.error('Backup operation failed:',e.message);process.exitCode=1;});
