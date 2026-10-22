const fs=require('node:fs');const path=require('node:path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const {Pool}=require('pg');
(async()=>{const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});try{await p.query(fs.readFileSync(path.resolve(__dirname,'../migrations/20261023-teacher-role.sql'),'utf8'));console.log('Teacher role migration applied. Existing users and tests unchanged.');}finally{await p.end();}})().catch(()=>{console.error('Teacher migration failed.');process.exitCode=1;});
