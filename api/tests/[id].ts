import {createRetake} from '../_lib/test-versions';
import {isStaff} from '../_lib/permissions';
import { secure } from '../_lib/secure';
import { examAction } from '../_lib/exams';
import { session } from '../_lib/session';
import type { VercelRequest, VercelResponse } from '../_lib/http';
import { Pool } from '../_lib/db';
import jwt from 'jsonwebtoken';

const pool = new Pool({connectionTimeoutMillis:10000,
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
});

function setCors(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}



function shuffled<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

async function handler(req: VercelRequest, res: VercelResponse) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const actor = session(req);
    if (!actor) return res.status(401).json({error:'Кіру қажет.'});
    if (req.method !== 'GET' && req.method !== 'POST' && !isStaff(actor.role)) return res.status(403).json({error:'Мұғалім рұқсаты қажет.'});

    try {
        if (req.method === 'POST') return await examAction(pool,req,res,actor);
        if (req.method === 'GET') {
            const testRes = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
            if (!testRes.rows[0]) return res.status(404).json({ error: 'Test not found' });

            if (!testRes.rows[0].is_published && !testRes.rows[0].answers_released && !isStaff(actor.role)) return res.status(403).json({error:'Тест жабық.'});
            const info=testRes.rows[0];
            const variants=(await pool.query('SELECT id,language,is_published FROM tests WHERE language_group=$1 AND (is_published=true OR $2) ORDER BY language',[info.language_group,isStaff(actor.role)])).rows;
            info.variants=variants;
            info.can_manage=actor.role==='admin'||(actor.role==='teacher'&&info.created_by===actor.id);
            const bank=Number((await pool.query('SELECT COUNT(*) FROM questions WHERE test_id=$1',[id])).rows[0].count);
            const perAttempt=info.questions_per_attempt===0?bank:Math.min(info.questions_per_attempt,bank);
            info.bank_question_count=bank;
            if(req.query.summary==='true')return res.json({...info,question_count:perAttempt});
            // A student keeps the same random set after refreshing or reopening a test.
            // Tests with fewer than 50 questions simply use every available question.
            let questionIds: number[] | null = null;
            const auth = req.headers.authorization;
            if (auth?.startsWith('Bearer ')) {
                try {
                    const user = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { id: number; role?: string };
                    if (user.role === 'student') {
                        await pool.query(`
                            CREATE TABLE IF NOT EXISTS test_question_assignments (
                                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                                test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
                                question_id INT REFERENCES questions(id) ON DELETE CASCADE,
                                created_at TIMESTAMP DEFAULT NOW(),
                                PRIMARY KEY (user_id, test_id, question_id)
                            )
                        `);
                        const assigned = await pool.query(
                            'SELECT question_id FROM test_question_assignments WHERE user_id = $1 AND test_id = $2',
                            [user.id, id],
                        );
                        if (assigned.rows.length > 0) {
                            questionIds = assigned.rows.map(row => row.question_id);
                        } else {
                            const selected = await pool.query(
                                'SELECT id FROM questions WHERE test_id = $1 ORDER BY RANDOM() LIMIT $2',
                                [id, perAttempt],
                            );
                            questionIds = selected.rows.map(row => row.id);
                            if (questionIds.length > 0) {
                                await pool.query(
                                    'INSERT INTO test_question_assignments (user_id, test_id, question_id) SELECT $1, $2, UNNEST($3::int[]) ON CONFLICT DO NOTHING',
                                    [user.id, id, questionIds],
                                );
                            }
                        }
                    }
                } catch {
                    // The endpoint remains readable for admins and legacy clients.
                }
            }

            // The test-taking screen always requests a 50-question attempt. The
            // editor intentionally omits this flag and continues to show the full bank.
            if(testRes.rows[0].exam_mode && !isStaff(actor.role)) return res.json({...testRes.rows[0],questions:[],question_count:perAttempt});
            const isAttempt = req.query.forAttempt === 'true';
            const questions = questionIds
                ? await pool.query('SELECT * FROM questions WHERE id = ANY($1::int[])', [questionIds])
                : isAttempt
                    ? await pool.query('SELECT * FROM questions WHERE test_id = $1 ORDER BY RANDOM() LIMIT $2', [id, perAttempt])
                    : await pool.query('SELECT * FROM questions WHERE test_id = $1 ORDER BY id', [id]);
            const optionsRes = await pool.query(
                `SELECT o.* FROM options o
                 JOIN questions q ON o.question_id = q.id
                 WHERE q.test_id = $1`, [id]
            );

            const questionsWithOptions = questions.rows.map(q => ({
                ...q,
                options: shuffled(optionsRes.rows.filter((o: any) => o.question_id === q.id)),
            }));

            const ordered = (questionIds || isAttempt) ? shuffled(questionsWithOptions) : questionsWithOptions;
            const attempt = isAttempt ? jwt.sign({ purpose:'attempt', user_id:actor.id, test_id:id, question_ids:ordered.map(q=>q.id) }, process.env.JWT_SECRET!, {expiresIn:'7d'}) : undefined;
            const visible = (!isStaff(actor.role) || isAttempt) ? ordered.map(q=>({...q,options:q.options.map(({is_correct,...option})=>option)})) : ordered;
            return res.json({ ...testRes.rows[0], questions:visible, attempt_token:attempt });
        }

        if (req.method === 'PATCH') {
            if(req.body?.action==='retake')return res.status(201).json(await createRetake(pool,String(id),actor));
            if (req.body?.answers_released === true) {
              await pool.query('UPDATE tests SET answers_released=true,is_published=false WHERE id=$1',[id]);
              await pool.query('UPDATE exam_attempts SET deadline=LEAST(deadline,NOW()) WHERE test_id=$1',[id]);
              return res.json({success:true});
            }
            if (typeof req.body?.exam_mode === 'boolean') {
              const changed=await pool.query('UPDATE tests SET exam_mode=$1 WHERE id=$2 AND NOT EXISTS(SELECT 1 FROM exam_attempts WHERE test_id=$2) RETURNING *',[req.body.exam_mode,id]);
              return res.status(changed.rows.length?200:409).json(changed.rows[0]||{error:'Басталған емтихан режимін өзгертуге болмайды.'});
            }
            const { published } = req.body || {};
            if (typeof published !== 'boolean') {
                return res.status(400).json({ error: 'published boolean is required' });
            }
            const { rows } = await pool.query(
                'UPDATE tests SET is_published = $1 WHERE id = $2 RETURNING *',
                [published, id]
            );
            if (!rows[0]) return res.status(404).json({ error: 'Test not found' });
            return res.json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { rows } = await pool.query('DELETE FROM tests WHERE id = $1 RETURNING id', [id]);
            if (!rows[0]) return res.status(404).json({ error: 'Test not found' });
            return res.json({ success: true, deleted_id: rows[0].id });
        }
    } catch (err: any) {
        console.error('Test operation error:', err.message);
        res.status(500).json({ error: 'Қызмет қатесі. Қайта көріңіз.' });
    }
}

export default secure(handler, 'tests/[id].ts');
