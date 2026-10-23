const fs=require('node:fs');const path=require('node:path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const {Pool}=require('pg');
(async()=>{const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});try{await p.query(fs.readFileSync(path.resolve(__dirname,'../migrations/20261023-test-versions.sql'),'utf8'));console.log('Test versions migration applied; existing attempts and results retained.');}finally{await p.end();}})().catch(()=>{console.error('Test versions migration failed.');process.exitCode=1;});
