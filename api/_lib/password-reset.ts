import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Pool } from './db';
import type { VercelRequest, VercelResponse } from './http';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export async function passwordReset(req: VercelRequest, res: VercelResponse, pool: Pool) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.query.action === 'forgot-password') {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.APP_URL) return res.status(503).json({ error: 'Құпиясөзді қалпына келтіру әзірге қосылмаған. Әкімшіге хабарласыңыз.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email мекенжайын тексеріңіз.' });
    const message = 'Егер осы email тіркелген болса, қалпына келтіру сілтемесі жіберіледі. Спам қалтасын да тексеріңіз.';
    const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(email)=$1 AND deleted_at IS NULL', [email]);
    if (!rows[0]) return res.json({ message });
    const token = randomBytes(32).toString('hex');
    const inserted = await pool.query(`INSERT INTO password_reset_requests(user_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 minutes')
      ON CONFLICT(user_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,requested_at=NOW(),expires_at=EXCLUDED.expires_at
      WHERE password_reset_requests.requested_at < NOW()-INTERVAL '5 minutes' RETURNING user_id`, [rows[0].id,digest(token)]);
    if (!inserted.rowCount) return res.json({ message });
    const link = new URL('/reset-password', process.env.APP_URL);
    link.searchParams.set('token', token);
    const sent = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: 'LuminaPortal — құпиясөзді қалпына келтіру', text: `Құпиясөзді өзгерту үшін сілтемені ашыңыз (30 минут жарамды):\n${link}\n\nСұрауды сіз жібермесеңіз, бұл хатты елемеңіз.` }) });
    if (!sent.ok) {
      await pool.query('DELETE FROM password_reset_requests WHERE user_id=$1 AND token_hash=$2', [rows[0].id,digest(token)]);
      return res.status(503).json({ error: 'Хатты жіберу мүмкін болмады. Кейінірек қайталаңыз.' });
    }
    return res.json({ message });
  }
  const { token, password } = req.body || {};
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || typeof password !== 'string' || password.length < 10 || password.length > 72) return res.status(400).json({ error: 'Сілтемені тексеріңіз. Құпиясөз 10–72 таңбадан тұруы керек.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT user_id FROM password_reset_requests WHERE token_hash=$1 AND expires_at>NOW() FOR UPDATE', [digest(token)]);
    if (!found.rows[0]) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Сілтеменің мерзімі аяқталған немесе ол қолданылған. Жаңа сілтеме сұраңыз.' }); }
    await client.query('UPDATE users SET password_hash=$1 WHERE id=$2 AND deleted_at IS NULL', [await bcrypt.hash(password, 12), found.rows[0].user_id]);
    await client.query('DELETE FROM password_reset_requests WHERE user_id=$1', [found.rows[0].user_id]);
    await client.query('COMMIT');
    return res.json({ message: 'Құпиясөз жаңартылды. Жаңа құпиясөзбен кіріңіз.' });
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
