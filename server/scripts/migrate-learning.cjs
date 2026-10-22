const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const {Pool}=require('pg');
async function main(){
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required');
 const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
 try{await pool.query(fs.readFileSync(path.resolve(__dirname,'../migrations/20261022-learning.sql'),'utf8'));console.log('Learning migration applied.');}finally{await pool.end();}
}
main().catch(()=>{console.error('Migration failed; inspect database connectivity and permissions.');process.exitCode=1;});
