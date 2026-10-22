import { Pool as PgPool, PoolConfig } from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';
export const requestActor = new AsyncLocalStorage<{id:number;name:string}>();
// Every acquired connection gets an explicit actor, including anonymous/system work.
export class Pool {
 private pool: PgPool;
 constructor(config:PoolConfig){this.pool=new PgPool({...config,connectionTimeoutMillis:10000,max:5});}
 async connect(){const c=await this.pool.connect();try{const a=requestActor.getStore();await c.query("SELECT set_config('app.actor_id',$1,false),set_config('app.actor_name',$2,false),set_config('app.action','',false)",[a?String(a.id):'',a?.name||'System']);return c;}catch(e){c.release();throw e;}}
 async query(text:string,values?:any[]){const c=await this.connect();try{return await c.query(text,values);}finally{c.release();}}
 async end(){return this.pool.end();}
}
