import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function fixAll() {
  const adminHash = await bcrypt.hash('admin123', 10);
  
  await sql`UPDATE users SET password_hash = ${adminHash} WHERE role = 'admin'`;
  console.log('✅ All admin accounts reset to: admin123');

  // Verify
  const users = await sql`SELECT email, password_hash FROM users WHERE role = 'admin'` as any[];
  for (const u of users) {
    const ok = await bcrypt.compare('admin123', u.password_hash);
    console.log(`  ${u.email}: bcrypt verify = ${ok}`);
  }
}

fixAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
