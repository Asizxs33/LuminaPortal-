const fs=require('node:fs');const path=require('node:path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const {Pool}=require('pg');
(async()=>{const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});try{await p.query(fs.readFileSync(path.resolve(__dirname,'../migrations/20261105-desktop.sql'),'utf8'));console.log('Desktop source column added; existing results retained.');}finally{await p.end();}})().catch(()=>{console.error('Desktop migration failed.');process.exitCode=1;});
