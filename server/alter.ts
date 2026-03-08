import fs from 'fs';
import path from 'path';

// Fix env BEFORE importing db
const envPath = path.resolve('../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#]+?)=(.+)$/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim().replace('\r', '');
    }
});

import { pool } from './db.js';

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS initial_code TEXT,
            ADD COLUMN IF NOT EXISTS test_cases JSONB;
        `);
        console.log("Migration complete: added initial_code and test_cases to questions.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

migrate();
