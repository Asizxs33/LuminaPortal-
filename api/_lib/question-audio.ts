import {createHash} from 'node:crypto';
import jwt from 'jsonwebtoken';
import type {Pool} from './db';
import type {VercelRequest, VercelResponse} from './http';

export function audioKey(language: string, text: string) {
  return createHash('sha256').update(JSON.stringify([language, text])).digest('hex');
}

export function audioLabel(index: number) {
  return `Жауап нұсқасы ${String.fromCharCode(65 + index)}.`;
}

export async function questionAudio(pool: Pool, req: VercelRequest, res: VercelResponse, actor: {id: number}) {
  const {attempt_token, question_id, option_ids} = req.body ?? {};
  if (typeof attempt_token !== 'string' || !Number.isSafeInteger(question_id) || !Array.isArray(option_ids)
    || option_ids.length > 20 || option_ids.some(id => !Number.isSafeInteger(id)) || new Set(option_ids).size !== option_ids.length) {
    return res.status(400).end();
  }
  let token;
  try {
    token = jwt.verify(attempt_token, process.env.JWT_SECRET!, {algorithms: ['HS256']});
  } catch {
    return res.status(403).end();
  }
  const testId = req.query.id;
  if (typeof token === 'string' || token.purpose !== 'attempt' || token.user_id !== actor.id
    || token.test_id !== testId || !Array.isArray(token.question_ids) || !token.question_ids.includes(question_id)) {
    return res.status(403).end();
  }

  const test = (await pool.query('SELECT language, exam_mode, is_published, answers_released FROM tests WHERE id=$1', [testId])).rows[0];
  if (!test || !test.is_published || test.answers_released) return res.status(403).end();
  if (test.language !== 'kk') return res.status(404).end();
  let question: {text: string; options: {id: number; text: string}[] } | undefined;
  if (test.exam_mode) {
    if (typeof token.exam_attempt_id !== 'string') return res.status(403).end();
    const attempt = (await pool.query(
      'SELECT questions FROM exam_attempts WHERE id=$1 AND user_id=$2 AND test_id=$3 AND NOT finished AND deadline>NOW()',
      [token.exam_attempt_id, actor.id, testId],
    )).rows[0];
    if (!attempt) return res.status(403).end();
    question = attempt.questions.find((item: {id: number}) => item.id === question_id);
  } else {
    if (token.exam_attempt_id) return res.status(403).end();
    const row = (await pool.query('SELECT text FROM questions WHERE id=$1 AND test_id=$2', [question_id, testId])).rows[0];
    if (row) {
      const options = await pool.query('SELECT id,text FROM options WHERE question_id=$1', [question_id]);
      question = {...row, options: options.rows} as typeof question;
    }
  }
  if (!question || option_ids.length !== question.options.length) return res.status(404).end();
  const options = option_ids.map(id => question!.options.find(option => option.id === id));
  if (options.some(option => !option)) return res.status(404).end();
  const keys = [question.text, ...options.flatMap((option, i) => [audioLabel(i), option!.text])].map(text => audioKey(test.language, text));

  // No provider call is made during a test. A cache miss falls back to the device voice.
  const records = await pool.query('SELECT hash, audio FROM question_audio WHERE hash=ANY($1::text[])', [keys]).catch(error => {
    if (error.code === '42P01') return null;
    throw error;
  });
  if (!records) return res.status(404).end();
  const clips = new Map<string, Buffer>(records.rows.map(row => [row.hash, row.audio]));
  if (keys.some(key => !clips.has(key))) return res.status(404).end();
  if (keys.reduce((size, key) => size + clips.get(key)!.length, 0) > 2_500_000) return res.status(413).end();
  return res.json({clips: keys.map(key => clips.get(key)!.toString('base64'))});
}
