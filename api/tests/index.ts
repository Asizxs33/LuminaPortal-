import { history, snapshot } from '../_lib/history';
import { secure } from '../_lib/secure';
import { session } from '../_lib/session';
import type { VercelRequest, VercelResponse } from '../_lib/http';
import { Pool } from '../_lib/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as mammoth from 'mammoth';

const pool = new Pool({connectionTimeoutMillis:10000,
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
});

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

type ImportedQuestion = { text: string; options: { text: string; is_correct: boolean }[] };

function clean(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

export function parseQuestions(rawText: string): ImportedQuestion[] {
    // This is the format used by the supplied АКТ question bank: every question
    // is followed by <variant> tags and the first variant is the correct answer.
    const taggedBlocks = [...rawText.matchAll(/<question>\s*([\s\S]*?)(?=<question>|$)/gi)];
    if (taggedBlocks.length > 0) {
        return taggedBlocks.map(match => {
            const block = match[1];
            const firstVariantAt = block.search(/<variant>/i);
            const options = [...block.matchAll(/<variant>\s*([\s\S]*?)(?=<variant>|$)/gi)]
                .map((variant, index) => ({ text: clean(variant[1]), is_correct: index === 0 }))
                .filter(option => option.text);
            return { text: clean(firstVariantAt === -1 ? block : block.slice(0, firstVariantAt)), options };
        }).filter(question => question.text && question.options.length >= 2);
    }

    const lines = rawText.replace(/\r/g, '').split('\n').map(clean).filter(Boolean);
    const questions: ImportedQuestion[] = [];
    let current: ImportedQuestion | null = null;
    let answerLetter: string | null = null;
    const finish = () => {
        if (!current) return;
        if (answerLetter) {
            const answerIndex = answerLetter.charCodeAt(0) - 65;
            if (current.options[answerIndex]) current.options[answerIndex].is_correct = true;
        }
        if (current.text && current.options.length >= 2 && current.options.filter(option => option.is_correct).length === 1) questions.push(current);
        current = null;
        answerLetter = null;
    };
    for (const line of lines) {
        const question = line.match(/^(?:вопрос\s*)?(\d{1,4})\s*[.)、:-]\s*(.+)$/i);
        const answer = line.match(/^(?:жауап|ответ|дұрыс\s*жауап|правильный\s*ответ)\s*[:：-]\s*([A-DА-Г])\b/i);
        const option = line.match(/^\s*([*+✓✔]?)\s*([A-DА-Г])\s*[.)、:-]\s*(.+)$/i);
        if (question) {
            finish();
            current = { text: question[2], options: [] };
        } else if (current && answer) {
            const letters: Record<string, string> = { А: 'A', Б: 'B', В: 'C', Г: 'D' };
            answerLetter = letters[answer[1].toUpperCase()] || answer[1].toUpperCase();
        } else if (current && option) {
            current.options.push({ text: option[3].replace(/^\s*[*+✓✔]\s*/, ''), is_correct: Boolean(option[1]) || /\s[*✓✔]$/.test(option[3]) });
        } else if (current && current.options.length === 0) {
            current.text = `${current.text} ${line}`;
        }
    }
    finish();
    return questions;
}

async function importWordTest(req: VercelRequest, res: VercelResponse) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization required' });
    let user: { role?: string };
    try {
        user = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { role?: string };
    } catch {
        return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    if (user.role !== 'admin') return res.status(403).json({ error: 'Only administrators can import tests' });
    const { fileBase64, fileName, title, subject, duration_minutes, passing_score } = req.body || {};
    if (!fileBase64 || !fileName || !title || !subject) return res.status(400).json({ error: 'File, title and subject are required' });
    if (!/\.docx$/i.test(fileName)) return res.status(400).json({ error: 'Only .docx Word files are supported' });
    if (!Number.isInteger(Number(duration_minutes ?? 30)) || Number(duration_minutes ?? 30)<1 || Number(duration_minutes ?? 30)>300 || !Number.isInteger(Number(passing_score ?? 70)) || Number(passing_score ?? 70)<0 || Number(passing_score ?? 70)>100) return res.status(400).json({error:'Уақыт 1–300 минут, өту шегі 0–100% болуы керек.'});
    const buffer = Buffer.from(String(fileBase64).replace(/^data:.*;base64,/, ''), 'base64');
    if (buffer.length > 4 * 1024 * 1024) return res.status(413).json({ error: 'The Word file must be smaller than 4 MB' });
    const extracted = await mammoth.extractRawText({ buffer });
    const questions = parseQuestions(extracted.value);
    if (questions.length === 0) return res.status(422).json({ error: 'Questions were not recognized. Use numbered questions, A-D options, and mark the correct answer.' });

    const detected = [...extracted.value.matchAll(/<question>/gi)].length || extracted.value.split(/\r?\n/).filter(line => /^(?:вопрос\s*)?\d{1,4}\s*[.)、:-]\s*.+/i.test(line.trim())).length;
    const report = { recognized: questions.length, skipped: Math.max(0, detected - questions.length), warnings: [ ...(extracted.value.includes('<variant>') ? ['Тегтер форматында бірінші жауап дұрыс деп қабылданды. Жариялау алдында тексеріңіз.'] : []), ...extracted.messages.map(m => m.message) ], sample: questions.slice(0, 3).map(q => q.text) };
    if (req.body.previewOnly) return res.json({ report });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const testId = crypto.randomUUID();
        const test = await client.query(
            'INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score, is_published) VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING *',
            [testId, title.trim(), subject.trim(), `Imported from ${fileName}`, Number(duration_minutes) || 30, Number(passing_score ?? 70)],
        );
        for (const [index, question] of questions.entries()) {
            const inserted = await client.query('INSERT INTO questions (test_id, text, type, order_index) VALUES ($1,$2,$3,$4) RETURNING id', [testId, question.text, 'MULTIPLE_CHOICE', index]);
            for (const option of question.options) await client.query('INSERT INTO options (question_id, text, is_correct) VALUES ($1,$2,$3)', [inserted.rows[0].id, option.text, option.is_correct]);
        }
        await snapshot(client,testId,session(req),'tests.import');
        await client.query('COMMIT');
        return res.status(201).json({ ...test.rows[0], imported_questions: questions.length, report });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = session(req);
    if(req.query.history==='true') return history(pool,req,res,user);
    if ((req.method !== 'GET' || req.query.all === 'true') && user?.role !== 'admin') return res.status(user ? 403 : 401).json({error:'Мұғалім ретінде кіріңіз.'});
    try {
        if (req.method === 'GET') {
            const { all } = req.query;
            let queryStr = `
                SELECT t.*, COUNT(q.id)::int AS question_count
                FROM tests t LEFT JOIN questions q ON q.test_id = t.id
                WHERE t.is_published = true
                GROUP BY t.id ORDER BY t.created_at DESC
            `;

            if (all === 'true') {
                queryStr = `
                    SELECT t.*, COUNT(q.id)::int AS question_count
                    FROM tests t LEFT JOIN questions q ON q.test_id = t.id
                    GROUP BY t.id ORDER BY t.created_at DESC
                `;
            }
            const { rows } = await pool.query(queryStr);
            return res.json(rows);
        }
        if (req.method === 'POST') {
            if (req.body?.fileBase64) return await importWordTest(req, res);
            const { title, subject, description, duration_minutes, passing_score, is_published = false } = req.body || {};
            if (!Number.isInteger(Number(duration_minutes ?? 30)) || Number(duration_minutes ?? 30)<1 || Number(duration_minutes ?? 30)>300 || !Number.isInteger(Number(passing_score ?? 70)) || Number(passing_score ?? 70)<0 || Number(passing_score ?? 70)>100) return res.status(400).json({error:'Уақыт 1–300 минут, өту шегі 0–100% болуы керек.'});
            if (!title) return res.status(400).json({ error: 'Title required' });

            const testId = crypto.randomUUID();
            const { rows } = await pool.query(
                'INSERT INTO tests (id, title, subject, description, duration_minutes, passing_score, is_published) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
                [testId, title, subject || 'General', description || '', duration_minutes || 30, passing_score ?? 70, is_published]
            );
            return res.status(201).json(rows[0]);
        }
        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Tests error:', err.message);
        res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
    }
}

export default secure(handler, 'tests/index.ts');
